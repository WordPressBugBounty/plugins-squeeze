"use strict";

import { maybeCompressAttachment, parseMimeType, base64ToFile } from "./helpers.js";

/** One successful patch per JS realm (per window / iframe). */
const PATCHED_KEY = "__squeezeVoxelCompatPatched";

const LOG_PREFIX = "[Squeeze · Voxel]";

function vxLog(...args) {
	console.info(LOG_PREFIX, ...args);
}

function vxWarn(...args) {
	console.warn(LOG_PREFIX, ...args);
}

/**
 * FormData from another window fails `instanceof FormData` in this window.
 *
 * @param {unknown} body
 * @returns {body is FormData}
 */
function isFormDataLike(body) {
	if (body == null || typeof body !== "object") {
		return false;
	}
	if (typeof FormData !== "undefined" && body instanceof FormData) {
		return true;
	}
	const o = /** @type {{ append?: unknown; entries?: unknown; delete?: unknown }} */ (body);
	return (
		typeof o.append === "function" &&
		typeof o.entries === "function" &&
		typeof o.delete === "function"
	);
}

/**
 * jQuery / some stacks pass a URL object to xhr.open(); we must not treat that as "".
 *
 * @param {unknown} url
 * @returns {string}
 */
function normalizeOpenUrl(url) {
	if (typeof url === "string") {
		return url;
	}
	if (url && typeof url === "object" && "href" in url) {
		return String(/** @type {{ href: string }} */ (url).href);
	}
	return String(url ?? "");
}

/**
 * URLs where Voxel may POST multipart `files[field][]` (create / edit post with uploads).
 * Do not match generic admin-ajax.php (heartbeat, etc.) — that only adds noise and work.
 *
 * @param {string} url
 * @returns {boolean}
 */
function looksLikeVoxelMultipartTarget(url) {
	const s = String(url || "");
	if (!s) {
		return false;
	}
	// Primary Voxel front-end AJAX: …?vx=1&action=…
	if (/[?&]vx=1(?:&|$)/.test(s)) {
		return true;
	}
	try {
		if (new URL(s, window.location.href).searchParams.get("vx") === "1") {
			return true;
		}
	} catch (e) {
		/* ignore */
	}
	// Rare: create_post via admin-ajax with multipart (not the usual Voxel ?vx=1 endpoint)
	if (s.includes("admin-ajax.php") && /[?&]action=create_post/.test(s)) {
		return true;
	}
	return false;
}

/**
 * @param {FormData | { entries: () => IterableIterator<[string, FormDataEntryValue]> }} formData
 * @returns {Array<[string, FormDataEntryValue]>}
 */
function snapshotFormDataEntries(formData) {
	return [...formData.entries()];
}

/**
 * True for File/Blob-like values that look like images (cross-realm safe).
 *
 * @param {unknown} v
 * @returns {boolean}
 */
function isImageFileLike(v) {
	if (v == null || typeof v !== "object") {
		return false;
	}
	const any = /** @type {{ name?: string; type?: string; size?: number }} */ (v);
	if (typeof any.size !== "number") {
		return false;
	}
	const type = typeof any.type === "string" ? any.type : "";
	if (type.startsWith("image/")) {
		return true;
	}
	if (type === "" && typeof any.name === "string" && /\.(jpe?g|png|gif|webp|avif)$/i.test(any.name)) {
		return true;
	}
	return false;
}

/**
 * @param {File | Blob} v
 * @param {string} key FormData key (for fallback filename)
 * @returns {File}
 */
function ensureFileForCompression(v, key) {
	if (typeof File !== "undefined" && v instanceof File) {
		return v;
	}
	const name =
		("name" in v && typeof /** @type {File} */ (v).name === "string" && /** @type {File} */ (v).name)
			? /** @type {File} */ (v).name
			: `upload-${key.replace(/[^\w.-]+/g, "_")}.jpg`;
	const type = v.type && v.type.length ? v.type : "image/jpeg";
	return new File([v], name, { type });
}

/**
 * @param {Array<[string, FormDataEntryValue]>} entries
 */
function formDataHasVoxelImageFiles(entries) {
	return entries.some(([k, v]) => /^files\[/i.test(k) && isImageFileLike(v));
}

/**
 * Compress a single image file when Squeeze on-upload rules allow it.
 *
 * @param {File} fileValue
 * @param {string} key FormData key or diagnostic label
 * @param {Record<string, unknown>} compressOptions
 * @param {object} squeeze window.Squeeze
 * @returns {Promise<{ out: File; metaSignal: boolean }>}
 */
async function compressOneVoxelImageIfNeeded(fileValue, key, compressOptions, squeeze) {
	const { type, subtype } = parseMimeType(fileValue);
	if (!maybeCompressAttachment(type, subtype, compressOptions)) {
		vxLog("file skipped (format/settings):", fileValue.name, fileValue.type);
		return { out: fileValue, metaSignal: false };
	}

	if (typeof squeeze.isExcludedByName === "function") {
		try {
			if (await squeeze.isExcludedByName(fileValue.name)) {
				vxLog("file skipped (exclusion list):", fileValue.name);
				return { out: fileValue, metaSignal: false };
			}
		} catch (e) {
			vxWarn("exclude check failed; continuing with compression:", fileValue.name, e);
		}
	}

	const inBytes = fileValue.size;
	try {
		vxLog("compressing:", fileValue.name, `(${inBytes} B in)`);
		const t0 = performance.now();
		const base64Obj = await squeeze.compressBeforeUpload(fileValue);
		if (!base64Obj?.base64) {
			vxWarn("compress returned no data; using original:", fileValue.name);
			return { out: fileValue, metaSignal: false };
		}
		const outFile = base64ToFile(base64Obj.base64, fileValue.name, fileValue.type);
		const ms = Math.round(performance.now() - t0);
		if (outFile.size > inBytes) {
			vxLog("compressed larger than original; using original:", fileValue.name, `(${inBytes} B vs ${outFile.size} B in ${ms} ms)`);
			return { out: fileValue, metaSignal: false };
		}
		vxLog("compressed:", fileValue.name, `(${inBytes} B → ${outFile.size} B in ${ms} ms)`);
		return { out: outFile, metaSignal: true };
	} catch (e) {
		vxWarn("compress failed; using original:", fileValue.name, e);
		return { out: fileValue, metaSignal: false };
	}
}

/**
 * Append signed markers so PHP can set squeeze_is_compressed on new attachments (Voxel bypasses wp AJAX squeeze).
 *
 * @param {FormData} newFd
 * @param {boolean} metaSignal
 * @param {object | null} squeeze
 */
function appendVoxelClientCompressedMarkers(newFd, metaSignal, squeeze) {
	if (!metaSignal || !squeeze?.nonce) {
		return;
	}
	newFd.append("_squeeze_voxel_client", "1");
	newFd.append("_squeeze_voxel_nonce", String(squeeze.nonce));
}

function logFormDataDiag(reqUrl, entries) {
	const rows = entries.map(([k, v]) => {
		if (v == null) {
			return { key: k, kind: "null" };
		}
		if (typeof v === "string") {
			return { key: k, kind: "string", len: v.length };
		}
		if (typeof File !== "undefined" && v instanceof File) {
			return { key: k, kind: "File", name: v.name, type: v.type, size: v.size };
		}
		if (typeof Blob !== "undefined" && v instanceof Blob) {
			return { key: k, kind: "Blob", type: v.type, size: v.size };
		}
		return { key: k, kind: typeof v };
	});
	vxLog("FormData POST (diagnostic — no image entries under files[…] matched for squeeze)", {
		url: reqUrl,
		entries: rows,
	});
}

/**
 * Observe jQuery AJAX (same path Voxel create-post uses) — helps if XHR prototype behaves unexpectedly.
 *
 * @param {typeof looksLikeVoxelMultipartTarget} urlTest
 */
function installJQueryVoxelProbe(urlTest) {
	const $ = window.jQuery;
	if (!$ || /** @type {{ __squeezeVoxelAjaxProbe?: boolean }} */ ($).__squeezeVoxelAjaxProbe) {
		return;
	}
	/** @type {{ __squeezeVoxelAjaxProbe?: boolean }} */ ($).__squeezeVoxelAjaxProbe = true;

	$(document).ajaxSend((_event, _jqXHR, settings) => {
		const u = String(settings.url || "");
		if (!urlTest(u)) {
			return;
		}
		const d = settings.data;
		const formLike = isFormDataLike(d);
		vxLog("jQuery ajaxSend (Voxel multipart)", {
			url: u,
			dataIsFormDataLike: formLike,
			dataType: d == null ? "null" : typeof d,
			constructor: d && d.constructor && d.constructor.name,
		});
		if (formLike) {
			try {
				const snap = snapshotFormDataEntries(/** @type {FormData} */ (d));
				vxLog("jQuery FormData snapshot", snap.map(([k, v]) => ({
					key: k,
					kind: v instanceof File ? "File" : v instanceof Blob ? "Blob" : typeof v,
					name: v && /** @type {File} */ (v).name,
					type: v && /** @type {Blob} */ (v).type,
					size: v && /** @type {Blob} */ (v).size,
				})));
			} catch (e) {
				vxWarn("jQuery FormData snapshot failed", e);
			}
		}
	});
	vxLog("jQuery ajaxSend probe installed (Voxel multipart URLs only).");
}

/**
 * Voxel file/gallery fields POST multipart FormData (files[field_key][]) to the Voxel AJAX URL,
 * bypassing wp.Uploader. Mirror Squeeze "on upload" behaviour by compressing image Files
 * before the request body is sent.
 *
 * @param {Record<string, unknown>} compressOptions Parsed squeezeOptions.options
 */
export function initVoxelUploadCompat(compressOptions) {
	if (typeof window === "undefined") {
		return;
	}

	const protoEarly = window.XMLHttpRequest?.prototype;
	if (protoEarly && /** @type {{ [k: string]: boolean }} */ (protoEarly)[PATCHED_KEY]) {
		return;
	}

	if (typeof Voxel_Config === "undefined") {
		vxLog("compat skipped: Voxel_Config is undefined (not a Voxel page or config not printed yet).");
		return;
	}
	if (!compressOptions?.auto_compress) {
		vxLog("compat skipped: Squeeze on upload (auto_compress) is off in settings.");
		return;
	}

	const XHR = window.XMLHttpRequest;
	const proto = XHR && XHR.prototype;
	if (!proto) {
		return;
	}

	const ajaxUrl = Voxel_Config.ajax_url || "";
	vxLog("init", { auto_compress: !!compressOptions.auto_compress, voxel_ajax_url: ajaxUrl });

	const origOpen = proto.open;
	const origSend = proto.send;

	/** @type {{ [k: string]: boolean }} */ (proto)[PATCHED_KEY] = true;

	proto.open = function (method, url, ...rest) {
		this.__squeezeRequestUrl = normalizeOpenUrl(url);
		return origOpen.call(this, method, url, ...rest);
	};

	proto.send = function (body) {
		const xhr = this;
		const reqUrl = xhr.__squeezeRequestUrl || "";

		if (!isFormDataLike(body)) {
			return origSend.call(xhr, body);
		}

		if (!looksLikeVoxelMultipartTarget(reqUrl)) {
			return origSend.call(xhr, body);
		}

		const squeeze = window.Squeeze;
		if (!squeeze || typeof squeeze.compressBeforeUpload !== "function") {
			vxWarn("XHR FormData-like body to Voxel AJAX but window.Squeeze.compressBeforeUpload missing; upload unchanged.");
			return origSend.call(xhr, body);
		}

		let snapshot;
		try {
			snapshot = snapshotFormDataEntries(/** @type {FormData} */ (body));
		} catch (e) {
			vxWarn("FormData.entries() failed; upload unchanged.", e);
			return origSend.call(xhr, body);
		}

		if (!formDataHasVoxelImageFiles(snapshot)) {
			if (looksLikeVoxelMultipartTarget(reqUrl)) {
				logFormDataDiag(reqUrl, snapshot);
			}
			return origSend.call(xhr, body);
		}

		vxLog("XHR intercept: compressing image file(s) before upload.", {
			method: "POST",
			url: reqUrl,
			file_keys: snapshot
				.filter(([k, v]) => /^files\[/i.test(k) && isImageFileLike(v))
				.map(([k, v]) => ({
					key: k,
					name: "name" in v ? /** @type {File} */ (v).name : "(blob)",
					type: /** @type {Blob} */ (v).type,
					size: /** @type {Blob} */ (v).size,
				})),
		});

		void (async () => {
			const t0 = performance.now();
			try {
				const newFd = await buildFormDataFromSnapshot(snapshot, compressOptions, squeeze);
				vxLog("XHR intercept: compression pass done in", Math.round(performance.now() - t0), "ms; sending request.");
				origSend.call(xhr, newFd);
			} catch (e) {
				vxWarn("XHR intercept failed; sending original FormData.", e);
				origSend.call(xhr, body);
			}
		})();
	};

	vxLog("XMLHttpRequest.send hook installed (Voxel multipart: ?vx=1 or admin-ajax create_post).");

	if (typeof window.fetch === "function") {
		const origFetch = window.fetch.bind(window);

		window.fetch = async function (input, init) {
			const url =
				typeof input === "string"
					? input
					: input instanceof Request
						? input.url
						: normalizeOpenUrl(input);

			const rawBody = init?.body;
			const body = isFormDataLike(rawBody) ? /** @type {FormData} */ (rawBody) : null;
			if (!body || !looksLikeVoxelMultipartTarget(url)) {
				return origFetch(input, init);
			}

			const squeeze = window.Squeeze;
			if (!squeeze || typeof squeeze.compressBeforeUpload !== "function") {
				return origFetch(input, init);
			}

			let snapshot;
			try {
				snapshot = snapshotFormDataEntries(body);
			} catch (e) {
				return origFetch(input, init);
			}

			if (!formDataHasVoxelImageFiles(snapshot)) {
				if (looksLikeVoxelMultipartTarget(String(url))) {
					logFormDataDiag(String(url), snapshot);
				}
				return origFetch(input, init);
			}

			vxLog("fetch intercept: compressing image file(s) before upload.", { url });

			const t0 = performance.now();
			try {
				const newFd = await buildFormDataFromSnapshot(snapshot, compressOptions, squeeze);
				vxLog("fetch intercept: compression pass done in", Math.round(performance.now() - t0), "ms.");
				const nextInit = init ? { ...init, body: newFd } : { body: newFd };
				return origFetch(input, nextInit);
			} catch (e) {
				vxWarn("fetch intercept failed; using original body.", e);
				return origFetch(input, init);
			}
		};

		vxLog("window.fetch hook installed for Voxel-style AJAX URLs.");
	}

	scheduleJQueryProbe(looksLikeVoxelMultipartTarget);
}

/**
 * jQuery may register after Squeeze (script order); retry briefly.
 *
 * @param {typeof looksLikeVoxelMultipartTarget} urlTest
 */
function scheduleJQueryProbe(urlTest) {
	if (window.jQuery) {
		installJQueryVoxelProbe(urlTest);
		return;
	}
	let tries = 0;
	const id = window.setInterval(() => {
		tries += 1;
		if (window.jQuery) {
			window.clearInterval(id);
			installJQueryVoxelProbe(urlTest);
		} else if (tries > 200) {
			window.clearInterval(id);
		}
	}, 50);
}

/**
 * @param {Array<[string, FormDataEntryValue]>} entries
 * @param {Record<string, unknown>} compressOptions
 * @param {object} squeeze Squeeze instance (window.Squeeze)
 */
async function buildFormDataFromSnapshot(entries, compressOptions, squeeze) {
	const newFd = new FormData();
	let metaSignal = false;

	for (const [key, value] of entries) {
		if (/^files\[/i.test(key) && isImageFileLike(value)) {
			const fileValue = ensureFileForCompression(/** @type {File | Blob} */ (value), key);
			const { out, metaSignal: m } = await compressOneVoxelImageIfNeeded(fileValue, key, compressOptions, squeeze);
			if (m) {
				metaSignal = true;
			}
			newFd.append(key, out, out.name);
			continue;
		}
		if (typeof File !== "undefined" && value instanceof File) {
			newFd.append(key, value, value.name);
		} else if (typeof Blob !== "undefined" && value instanceof Blob) {
			newFd.append(key, value);
		} else {
			newFd.append(key, value);
		}
	}

	appendVoxelClientCompressedMarkers(newFd, metaSignal, squeeze);
	return newFd;
}
