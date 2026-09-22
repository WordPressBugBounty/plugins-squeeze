/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./assets/js/memory.js":
/*!*****************************!*\
  !*** ./assets/js/memory.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MEGAPIXEL_LIMITS": () => (/* binding */ MEGAPIXEL_LIMITS),
/* harmony export */   "checkMegapixelLimit": () => (/* binding */ checkMegapixelLimit),
/* harmony export */   "computeContainResize": () => (/* binding */ computeContainResize),
/* harmony export */   "computePoolSize": () => (/* binding */ computePoolSize),
/* harmony export */   "formatOomMessage": () => (/* binding */ formatOomMessage),
/* harmony export */   "getMegapixelLimit": () => (/* binding */ getMegapixelLimit),
/* harmony export */   "getMemorySettings": () => (/* binding */ getMemorySettings),
/* harmony export */   "isLowMemoryDevice": () => (/* binding */ isLowMemoryDevice),
/* harmony export */   "isWasmOomError": () => (/* binding */ isWasmOomError),
/* harmony export */   "readImageDimensionsFromBuffer": () => (/* binding */ readImageDimensionsFromBuffer),
/* harmony export */   "shouldForceSingleThreadAvif": () => (/* binding */ shouldForceSingleThreadAvif)
/* harmony export */ });
/**
 * Device-memory heuristics for WASM compression concurrency and guards.
 * Pure functions — safe to unit-test without Web Workers.
 */

/** Soft megapixel caps by approximate device RAM (navigator.deviceMemory). */
const MEGAPIXEL_LIMITS = {
  low: 16, // <= 2 GB
  medium: 24, // <= 4 GB
  high: 40, // > 4 GB or unknown
};

/**
 * Cap bulk concurrency by available device memory, not raw CPU cores.
 * Image compression is memory-bound; unrestricted hardwareConcurrency
 * can spawn many WASM heaps and trigger OutOfMemory on low-RAM devices.
 *
 * @param {number|undefined} deviceMemory  navigator.deviceMemory (GB), or undefined
 * @param {number|undefined} hardwareConcurrency  navigator.hardwareConcurrency
 * @returns {number} pool size (>= 1)
 */
function computePoolSize(deviceMemory, hardwareConcurrency) {
  const cores = Math.max(1, Number(hardwareConcurrency) || 1);
  const gb = deviceMemory == null ? null : Number(deviceMemory);

  if (gb != null && !Number.isNaN(gb)) {
    if (gb <= 2) return 1;
    if (gb <= 4) return Math.min(cores, 2);
  }

  // Cap even on powerful machines — diminishing returns past a few parallel WASM jobs.
  return Math.min(cores, 4);
}

/**
 * @param {number|undefined} deviceMemory
 * @returns {boolean}
 */
function isLowMemoryDevice(deviceMemory) {
  const gb = deviceMemory == null ? null : Number(deviceMemory);
  return gb != null && !Number.isNaN(gb) && gb <= 2;
}

/**
 * Force single-threaded AVIF encode on low-RAM devices to avoid
 * pthread worker pools allocating extra contiguous WASM memory.
 *
 * @param {number|undefined} deviceMemory
 * @returns {boolean}
 */
function shouldForceSingleThreadAvif(deviceMemory) {
  return isLowMemoryDevice(deviceMemory);
}

/**
 * @param {number|undefined} deviceMemory
 * @returns {number} megapixel limit
 */
function getMegapixelLimit(deviceMemory) {
  const gb = deviceMemory == null ? null : Number(deviceMemory);
  if (gb != null && !Number.isNaN(gb)) {
    if (gb <= 2) return MEGAPIXEL_LIMITS.low;
    if (gb <= 4) return MEGAPIXEL_LIMITS.medium;
  }
  return MEGAPIXEL_LIMITS.high;
}

/**
 * @param {number} width
 * @param {number} height
 * @param {number} megapixelLimit
 * @returns {{ ok: boolean, megapixels: number, limit: number }}
 */
function checkMegapixelLimit(width, height, megapixelLimit) {
  const w = Number(width) || 0;
  const h = Number(height) || 0;
  const limit = Number(megapixelLimit) || MEGAPIXEL_LIMITS.high;
  const megapixels = (w * h) / 1e6;
  return {
    ok: megapixels <= limit,
    megapixels,
    limit,
  };
}

/**
 * Compute contain-fit dimensions for premium max width/height.
 * Mirrors worker getResizeOptions aspect-ratio logic.
 *
 * @param {number} sourceWidth
 * @param {number} sourceHeight
 * @param {number|string|undefined|null} maxWidth
 * @param {number|string|undefined|null} maxHeight
 * @returns {{ needResize: boolean, width: number, height: number, fitMethod: string }}
 */
function computeContainResize(sourceWidth, sourceHeight, maxWidth, maxHeight) {
  const sw = Number(sourceWidth) || 0;
  const sh = Number(sourceHeight) || 0;
  const mw = maxWidth ? Number(maxWidth) : 0;
  const mh = maxHeight ? Number(maxHeight) : 0;

  const result = {
    needResize: false,
    fitMethod: 'contain',
    width: sw,
    height: sh,
  };

  if (!sw || !sh || (!mw && !mh)) {
    return result;
  }

  const aspectRatioHeight = sh / sw;
  const aspectRatioWidth = sw / sh;
  let width = sw;
  let height = sh;
  let needResize = false;

  if (mw && width > mw) {
    width = mw;
    height = mw * aspectRatioHeight;
    needResize = true;
  }

  if (mh && height > mh) {
    height = mh;
    width = mh * aspectRatioWidth;
    needResize = true;
  }

  if (mw && width > mw) {
    width = mw;
    height = mw * aspectRatioHeight;
  }

  if (mh && height > mh) {
    height = mh;
    width = mh / aspectRatioWidth;
  }

  result.needResize = needResize;
  result.width = Math.max(1, Math.round(width));
  result.height = Math.max(1, Math.round(height));
  return result;
}

/**
 * Read width/height from compressed bytes without a full bitmap decode.
 * Supports JPEG, PNG, and lossless/simple WebP. Returns null if unknown.
 *
 * @param {ArrayBuffer|Uint8Array|Blob} input
 * @param {string} [sourceType]  jpeg|png|webp|avif
 * @returns {{ width: number, height: number }|null}
 */
function readImageDimensionsFromBuffer(input, sourceType = '') {
  let bytes;
  if (input instanceof Uint8Array) {
    bytes = input;
  } else if (input instanceof ArrayBuffer) {
    bytes = new Uint8Array(input);
  } else {
    return null;
  }
  if (bytes.byteLength < 10) return null;

  const type = String(sourceType || '').toLowerCase();

  // PNG: IHDR at byte 16
  if (type === 'png' || (bytes[0] === 0x89 && bytes[1] === 0x50)) {
    if (bytes.byteLength < 24) return null;
    const width = (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19];
    const height = (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23];
    if (width > 0 && height > 0) return { width, height };
  }

  // JPEG: scan for SOF0-SOF3 markers
  if (type === 'jpeg' || type === 'jpg' || (bytes[0] === 0xff && bytes[1] === 0xd8)) {
    let i = 2;
    while (i < bytes.length - 8) {
      if (bytes[i] !== 0xff) {
        i++;
        continue;
      }
      while (i < bytes.length && bytes[i] === 0xff) i++;
      if (i >= bytes.length) break;
      const marker = bytes[i++];
      if (marker === 0xd8 || marker === 0xd9) continue;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (i + 1 >= bytes.length) break;
      const len = (bytes[i] << 8) | bytes[i + 1];
      if (len < 2) break;
      // SOF0–SOF3, SOF5–SOF7, SOF9–SOF11, SOF13–SOF15 (skip DHT/DAC/JPG)
      if (
        marker >= 0xc0 && marker <= 0xcf &&
        marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc
      ) {
        const height = (bytes[i + 3] << 8) | bytes[i + 4];
        const width = (bytes[i + 5] << 8) | bytes[i + 6];
        if (width > 0 && height > 0) return { width, height };
      }
      i += len;
    }
  }

  // WebP: RIFF....WEBP
  if (
    type === 'webp' ||
    (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50)
  ) {
    // VP8X
    if (bytes[12] === 0x56 && bytes[13] === 0x50 && bytes[14] === 0x38 && bytes[15] === 0x58) {
      const width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16);
      const height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16);
      if (width > 0 && height > 0) return { width, height };
    }
    // VP8L
    if (bytes[12] === 0x56 && bytes[13] === 0x50 && bytes[14] === 0x38 && bytes[15] === 0x4c) {
      const b0 = bytes[21];
      const b1 = bytes[22];
      const b2 = bytes[23];
      const b3 = bytes[24];
      const width = 1 + ((b0) | ((b1 & 0x3f) << 8));
      const height = 1 + (((b1 & 0xc0) >> 6) | (b2 << 2) | ((b3 & 0xf) << 10));
      if (width > 0 && height > 0) return { width, height };
    }
    // VP8 lossy
    if (bytes[12] === 0x56 && bytes[13] === 0x50 && bytes[14] === 0x38 && bytes[15] === 0x20) {
      const width = (bytes[26] | (bytes[27] << 8)) & 0x3fff;
      const height = (bytes[28] | (bytes[29] << 8)) & 0x3fff;
      if (width > 0 && height > 0) return { width, height };
    }
  }

  return null;
}

/**
 * Detect WebAssembly / browser out-of-memory failures.
 *
 * @param {unknown} error
 * @returns {boolean}
 */
function isWasmOomError(error) {
  if (!error) return false;
  const name = error.name || '';
  const msg = String(error.message || error || '').toLowerCase();
  if (name === 'RangeError' && (msg.includes('memory') || msg.includes('wasm'))) {
    return true;
  }
  return (
    msg.includes('out of memory') ||
    msg.includes('cannot allocate wasm') ||
    msg.includes('outofmemory') ||
    msg.includes('array buffer allocation failed')
  );
}

/**
 * User-facing message for OOM / oversized-image failures.
 *
 * @param {unknown} error
 * @param {(s: string) => string} [translate]  optional i18n __()
 * @returns {string}
 */
function formatOomMessage(error, translate = (s) => s) {
  if (isWasmOomError(error)) {
    return translate(
      'Image too large for this device\'s available memory. Try reducing dimensions, squeezing one image at a time, or free some browser memory and retry.'
    );
  }
  return String(error?.message || error || translate('Compression failed.'));
}

/**
 * Snapshot of device memory settings to pass into the worker.
 *
 * @param {{ deviceMemory?: number, hardwareConcurrency?: number }} [nav]
 * @returns {{ deviceMemory: number|undefined, poolSize: number, forceSingleThreadAvif: boolean, megapixelLimit: number }}
 */
function getMemorySettings(nav = typeof navigator !== 'undefined' ? navigator : {}) {
  const deviceMemory = nav.deviceMemory;
  return {
    deviceMemory,
    poolSize: computePoolSize(deviceMemory, nav.hardwareConcurrency),
    forceSingleThreadAvif: shouldForceSingleThreadAvif(deviceMemory),
    megapixelLimit: getMegapixelLimit(deviceMemory),
  };
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".bundle.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/importScripts chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.b = self.location + "";
/******/ 		
/******/ 		// object to store loaded chunks
/******/ 		// "1" means "already loaded"
/******/ 		var installedChunks = {
/******/ 			"assets_js_worker_js": 1
/******/ 		};
/******/ 		
/******/ 		// importScripts chunk loading
/******/ 		var installChunk = (data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			for(var moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) runtime(__webpack_require__);
/******/ 			while(chunkIds.length)
/******/ 				installedChunks[chunkIds.pop()] = 1;
/******/ 			parentChunkLoadingFunction(data);
/******/ 		};
/******/ 		__webpack_require__.f.i = (chunkId, promises) => {
/******/ 			// "1" is the signal for "already loaded"
/******/ 			if(!installedChunks[chunkId]) {
/******/ 				if(true) { // all chunks have JS
/******/ 					importScripts(__webpack_require__.p + __webpack_require__.u(chunkId));
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunk"] = self["webpackChunk"] || [];
/******/ 		var parentChunkLoadingFunction = chunkLoadingGlobal.push.bind(chunkLoadingGlobal);
/******/ 		chunkLoadingGlobal.push = installChunk;
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*****************************!*\
  !*** ./assets/js/worker.js ***!
  \*****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _memory_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./memory.js */ "./assets/js/memory.js");
// Description: Web Worker for image compression



"use strict";

let options; // plugin options
let memorySettings = {
  forceSingleThreadAvif: false,
  megapixelLimit: (0,_memory_js__WEBPACK_IMPORTED_MODULE_0__.getMegapixelLimit)(undefined),
};
/** Last contain-fit resize computed in compressAndAssign (for thumb cleanup). */
let lastComputedResize = {};

// Lazy-loaded codec modules (loaded only when a job needs them).
const codecCache = {};
let avifSingleThreadModulePromise = null;

async function loadCodec(name) {
  if (!codecCache[name]) {
    switch (name) {
      case 'avif':
        codecCache[name] = __webpack_require__.e(/*! import() */ "vendors-node_modules_jsquash_avif_index_js").then(__webpack_require__.bind(__webpack_require__, /*! @jsquash/avif */ "./node_modules/@jsquash/avif/index.js"));
        break;
      case 'webp':
        codecCache[name] = __webpack_require__.e(/*! import() */ "vendors-node_modules_jsquash_webp_index_js").then(__webpack_require__.bind(__webpack_require__, /*! @jsquash/webp */ "./node_modules/@jsquash/webp/index.js"));
        break;
      case 'jpeg':
        codecCache[name] = __webpack_require__.e(/*! import() */ "vendors-node_modules_jsquash_jpeg_index_js").then(__webpack_require__.bind(__webpack_require__, /*! @jsquash/jpeg */ "./node_modules/@jsquash/jpeg/index.js"));
        break;
      case 'png':
        codecCache[name] = __webpack_require__.e(/*! import() */ "node_modules_jsquash_png_index_js").then(__webpack_require__.bind(__webpack_require__, /*! @jsquash/png */ "./node_modules/@jsquash/png/index.js"));
        break;
      case 'resize':
        codecCache[name] = __webpack_require__.e(/*! import() */ "vendors-node_modules_jsquash_resize_index_js").then(__webpack_require__.bind(__webpack_require__, /*! @jsquash/resize */ "./node_modules/@jsquash/resize/index.js")).then((m) => m.default || m);
        break;
      default:
        throw new Error(`Unknown codec: ${name}`);
    }
  }
  return codecCache[name];
}

/**
 * Single-threaded AVIF encoder path for low-RAM devices.
 * Bypasses @jsquash/avif's pthread (avif_enc_mt) build.
 */
async function encodeAvifSingleThread(imageData, avifOptions) {
  if (!avifSingleThreadModulePromise) {
    const [{ initEmscriptenModule }, { defaultOptions }, avifEnc] = await Promise.all([
      __webpack_require__.e(/*! import() */ "node_modules_jsquash_avif_utils_js").then(__webpack_require__.bind(__webpack_require__, /*! @jsquash/avif/utils.js */ "./node_modules/@jsquash/avif/utils.js")),
      __webpack_require__.e(/*! import() */ "node_modules_jsquash_avif_meta_js").then(__webpack_require__.bind(__webpack_require__, /*! @jsquash/avif/meta.js */ "./node_modules/@jsquash/avif/meta.js")),
      __webpack_require__.e(/*! import() */ "vendors-node_modules_jsquash_avif_codec_enc_avif_enc_js").then(__webpack_require__.bind(__webpack_require__, /*! @jsquash/avif/codec/enc/avif_enc.js */ "./node_modules/@jsquash/avif/codec/enc/avif_enc.js")),
    ]);
    avifSingleThreadModulePromise = initEmscriptenModule(avifEnc.default).then((module) => ({
      module,
      defaultOptions,
    }));
  }
  const { module, defaultOptions } = await avifSingleThreadModulePromise;
  const _options = { ...defaultOptions, ...avifOptions };
  const output = module.encode(imageData.data, imageData.width, imageData.height, _options);
  if (!output) {
    throw new Error('Encoding error.');
  }
  return output.buffer;
}

function wrapWorkerError(error) {
  if ((0,_memory_js__WEBPACK_IMPORTED_MODULE_0__.isWasmOomError)(error)) {
    return new Error((0,_memory_js__WEBPACK_IMPORTED_MODULE_0__.formatOomMessage)(error));
  }
  if (error instanceof Error) {
    return error;
  }
  return new Error(String(error?.message || error));
}

// RPC stands for Remote Procedure Call.
// It’s a fancy name for "calling a function that runs somewhere else, as if it was local".

//This is a MessagePort object used to communicate with the main thread.
//It’s initially null and must be assigned from the outside when the main thread sends it to this worker via postMessage(..., [port]).
let rpcPort = null;    // will be set when main thread transfers a MessagePort

//Just a sequential number to ensure that every request has a unique ID, even if multiple requests happen at the same timestamp.
let rpcCounter = 1;

// makes unique ID for each RPC call
// example: 1633036800000-abc123-1
function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${rpcCounter++}`;
}

/**
 * Call main thread to run imageCompression(...) there.
 * imageCompression function cannot be called directly from the worker. - causing error on mobile
 * - fileOrArrayBuffer: Blob or ArrayBuffer
 * - mime: e.g. 'image/png' or 'image/jpeg'
 * - options: options to pass to imageCompression
 * Returns: Promise<ArrayBuffer> (compressed image as ArrayBuffer)
 */
function compressOnMainThread(fileOrArrayBuffer, mime = 'image/png', options = {}) {

  //If rpcPort hasn’t been set yet, reject the Promise immediately.
  //This prevents trying to send messages when there’s no communication channel.
  if (!rpcPort) {
    return Promise.reject(new Error('No RPC port available to main thread. Ensure main thread transferred a MessagePort.'));
  }

  return new Promise((resolve, reject) => {
    const id = makeId();

    // Listen for messages from the main thread
    function onMsg(ev) {
      const d = ev.data;
      if (!d || d.id !== id) return; // ignores unrelated messages by checking d.id.
      rpcPort.removeEventListener('message', onMsg); // Removes the event listener (avoids memory leaks).
      if (d.ok) resolve(d.arrayBuffer); // Resolves with the compressed image data if d.ok is true.
      else reject(d.error || new Error('Compression failed on main thread')); // Rejects if there was an error.
    }

    rpcPort.addEventListener('message', onMsg);

    // In some cases (like MessageChannel in a worker), you must call .start() to begin receiving messages.
    // In others, it’s automatic — hence the try/catch.
    try { rpcPort.start(); } catch (e) { /* start may be no-op */ }

    // Transfer ArrayBuffer if present for zero-copy
    if (fileOrArrayBuffer instanceof ArrayBuffer) {
      // It’s transferable, meaning ownership moves to the main thread without copying.
      // Faster and memory-efficient.
      rpcPort.postMessage({ id, action: 'imageCompression', fileOrArrayBuffer, mime, options }, [fileOrArrayBuffer]);
    } else {
      // Blob cannot be transferred, post it as-is (main thread will accept)
      rpcPort.postMessage({ id, action: 'imageCompression', fileOrArrayBuffer, mime, options });
    }
  });
}

/**
 * Decode image buffer and return image data
 * @param {string} sourceType  - avif, jpeg, png, webp
 * @param {object} fileBuffer - The ArrayBuffer object is used to represent a generic raw binary data buffer.
 * @returns {object | Error} - Image data object or throws an Error
 */
const decode = async (sourceType, fileBuffer) => {
  switch (sourceType) {
    case 'avif': {
      const avif = await loadCodec('avif');
      return await avif.decode(fileBuffer);
    }
    case 'jpeg': {
      const jpeg = await loadCodec('jpeg');
      return await jpeg.decode(fileBuffer);
    }
    case 'png': {
      const png = await loadCodec('png');
      return await png.decode(fileBuffer);
    }
    case 'webp': {
      const webp = await loadCodec('webp');
      return await webp.decode(fileBuffer);
    }
    default:
      throw new Error(`Unknown source type: ${sourceType}`);
  }
}

/**
 * 
 * @param {string} outputType - avif, jpeg, png, webp 
 * @param {object} imageData - Image data object after decoding
 * @returns {ArrayBuffer | false} - Compressed image buffer or false if error
 */
const encode = async (outputType, imageData) => {
  try {
    switch (outputType) {
      case 'avif': {
        const avifOptions = {}
        for (const [key, value] of Object.entries(options)) {
          if (key.includes('avif')) {
            const keyName = key.replace('avif_', '')
            avifOptions[keyName] = value
          }
        }
        if (memorySettings.forceSingleThreadAvif) {
          return await encodeAvifSingleThread(imageData, avifOptions);
        }
        const avif = await loadCodec('avif');
        return await avif.encode(imageData, avifOptions);
      }
      case 'jpeg': {
        const jpegOptions = {}
        for (const [key, value] of Object.entries(options)) {
          if (key.includes('jpeg')) {
            const keyName = key.replace('jpeg_', '')
            jpegOptions[keyName] = value
          }
        }
        const jpeg = await loadCodec('jpeg');
        return await jpeg.encode(imageData, jpegOptions);
      }
      case 'png': {
        const pngOptions = {}
        for (const [key, value] of Object.entries(options)) {
          if (key.includes('png')) {
            const keyName = key.replace('png_', '')
            pngOptions[keyName] = value
          }
        }
        const png = await loadCodec('png');
        return await png.encode(imageData, pngOptions);
      }
      case 'webp': {
        const webpOptions = {}
        for (const [key, value] of Object.entries(options)) {
          if (key.includes('webp')) {
            const keyName = key.replace('webp_', '')
            webpOptions[keyName] = value
          }
        }
        const webp = await loadCodec('webp');
        return await webp.encode(imageData, webpOptions);
      }
      default:
        throw new Error(`Unknown output type: ${outputType}`);
    }
  } catch (error) {
    throw wrapWorkerError(error);
  }

}

/**
 * Convert image buffer from one format to another
 * @param {string} sourceType - avif, jpeg, png, webp
 * @param {string} outputType - avif, jpeg, png, webp
 * @param {object} fileBuffer - The ArrayBuffer object is used to represent a generic raw binary data buffer.
 * @returns {Promise} - Compressed image buffer or false if error
 */


const convert = async (sourceType, outputType, fileBuffer, resizeOptions) => {
  try {
    //console.log(`Converting from ${sourceType} to ${outputType}`);
    if (outputType === 'png') {

      
        return fileBuffer;
      

    }

    

    //*
    if (sourceType === 'jpeg') {
      fileBuffer = await compressOnMainThread(
        fileBuffer,
        'image/jpeg',
        {useWebWorker: true}
      );
    }
    //*/

    const imageData = await decode(sourceType, fileBuffer);
    return encode(outputType, imageData);
  } catch (error) {
    console.error('Error during image processing:', error);
    throw wrapWorkerError(error);
  }
}

/**
 * Convert Blob to base64 encoded image string
 * @param {object} blob - The Blob object represents a blob, which is a file-like object of immutable, raw data.
 * @returns {Promise<string>} - Base64 encoded image string
 */
const blobToBase64 = (blob) => {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

const showOutput = async (imageBuffer, outputType) => {
  if (!imageBuffer) {
    return false;
  }
  const imageBlob = new Blob([imageBuffer], { type: `image/${outputType}` });
  const base64String = await blobToBase64(imageBlob);

  return base64String;
}

const fetchImageBuffer = async (url, name, mime, outputType) => {
  const response = await fetch(url);
  if (!response.ok) {
    return false;
  }

  const blob = await response.blob();

  if (outputType === 'png') {
    // For PNG, we need to return blob
    return blob;
  }

  const metadata = {
    type: mime
  }

  const imageObj = new File([blob], name, metadata);
  const fileBuffer = await imageObj.arrayBuffer();

  return fileBuffer;
}

/**
 * Compresses a JPEG image.
 * @param {Object} params - The parameters for compression.
 * @param {string} params.sourceType - The source type of the image.
 * @param {string} params.outputType - The desired output type.
 * @param {Object} params.resizeOptions - The options for resizing the image.
 * @returns {Promise<string>} - The base64 encoded compressed image.
 */
const compressJPEG = async ({ fileBuffer, sourceType, outputType, resizeOptions }) => {
  //*
  const imageBuffer = await convert(sourceType, outputType, fileBuffer, resizeOptions);
  const base64 = await showOutput(imageBuffer, outputType);

  return base64;
  //*/

  /*
  const browserImageCompressionOptions = {
    maxSizeMB: Number.POSITIVE_INFINITY,
    maxWidthOrHeight: Number.POSITIVE_INFINITY,
    initialQuality: 0.81,
    useWebWorker: true,
  }

  try {
    // Use main thread to run imageCompression to avoid "Image" missing in worker on iOS
    const compressedFileBuffer = await compressOnMainThread(
      fileBuffer,
      'image/jpeg',
      browserImageCompressionOptions
    );

    const imageBuffer = await convert('jpeg', outputType, compressedFileBuffer, resizeOptions);
    const base64 = await showOutput(imageBuffer, outputType);
    return base64;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to process JPEG, check the console for more information.');
  }
  //*/
}

/**
 * Compresses a PNG image.
 * @param {Object} params - The parameters for compression.
 * @param {string} params.outputType - The desired output type.
 * @param {Object} params.resizeOptions - The options for resizing the image.
 * @returns {Promise<string>} - The base64 encoded compressed image.
 */
const compressPNG = async ({ fileBuffer, outputType, resizeOptions }) => {
  const pngOptions = {};
  for (const [key, value] of Object.entries(options)) {
    if (key.includes('png')) {
      const keyName = key.replace('png_', '');
      pngOptions[keyName] = value;
    }
  }
  
  const browserImageCompressionOptions = {
    maxSizeMB: Number.POSITIVE_INFINITY,
    maxWidthOrHeight: Number.POSITIVE_INFINITY,
    initialQuality: pngOptions?.quality,
    useWebWorker: true,
  }

  //if (fileBuffer instanceof ArrayBuffer) { // for thumbnails
    //fileBuffer = new Blob([fileBuffer], { type: 'image/png' });
  //}

  try {
    // Use main thread to run imageCompression to avoid "Image" missing in worker on iOS
    const compressedFileBuffer = await compressOnMainThread(
      fileBuffer,
      'image/png',
      browserImageCompressionOptions
    );

    const imageBuffer = await convert('png', outputType, compressedFileBuffer, resizeOptions);
    const base64 = await showOutput(imageBuffer, outputType);
    return base64;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to process PNG, check the console for more information.');
  }
}

/**
 * Compresses a WEBP image.
 * @param {Object} params - The parameters for compression.
 * @param {string} params.sourceType - The source type of the image.
 * @param {string} params.outputType - The desired output type.
 * @param {Object} params.resizeOptions - The options for resizing the image.
 * @returns {Promise<string>} - The base64 encoded compressed image.
 */
const compressWEBP = async ({ fileBuffer, sourceType, outputType, resizeOptions }) => {

  const imageBuffer = await convert(sourceType, outputType, fileBuffer, resizeOptions);
  const base64 = await showOutput(imageBuffer, outputType);

  return base64;
}

/**
 * Compresses an AVIF image.
 * @param {Object} params - The parameters for compression.
 * @param {string} params.sourceType - The source type of the image.
 * @param {string} params.outputType - The desired output type.
 * @param {Object} params.resizeOptions - The options for resizing the image.
 * @returns {Promise<string>} - The base64 encoded compressed image.
 */
const compressAVIF = async ({ fileBuffer, sourceType, outputType, resizeOptions }) => {

  const imageBuffer = await convert(sourceType, outputType, fileBuffer, resizeOptions);
  const base64 = await showOutput(imageBuffer, outputType);

  return base64;
}



// get proportional dimensions for thumbnail
// based on original image dimensions and thumbnail size name
const getThumbnailDimensions = (thumbnailDimensions, originalImageDimensions) => {
  const { width: originalWidth, height: originalHeight } = originalImageDimensions;
  const aspectRatioHeight = originalHeight / originalWidth;
  const aspectRatioWidth = originalWidth / originalHeight;
  let sizeWidth, sizeHeight;

  thumbnailDimensions.width = thumbnailDimensions.width === 0 ? 9999 : thumbnailDimensions.width;
  thumbnailDimensions.height = thumbnailDimensions.height === 0 ? 9999 : thumbnailDimensions.height;
  
  if (originalWidth > originalHeight) {
    sizeWidth = thumbnailDimensions.width;
    sizeHeight = Math.round((originalHeight / originalWidth) * sizeWidth);
  }
  else {
    sizeHeight = thumbnailDimensions.height;
    sizeWidth = Math.round((originalWidth / originalHeight) * sizeHeight);
  }

  // Ensure both dimensions are within the max values
  if (sizeWidth > thumbnailDimensions.width) {
    sizeWidth = thumbnailDimensions.width;
    sizeHeight = thumbnailDimensions.width * aspectRatioHeight;
  }

  if (sizeHeight > thumbnailDimensions.height) {
    sizeHeight = thumbnailDimensions.height;
    sizeWidth = thumbnailDimensions.height / aspectRatioWidth;
  }
  return { width: sizeWidth, height: sizeHeight };
}

const getImageDimensions = async (file) => {
  let blob;
  if (file instanceof Blob) {
    blob = file;
  } else if (file instanceof ArrayBuffer) {
    blob = new Blob([file]);
  } else {
    throw new Error('Unsupported file type for getImageDimensions');
  }
  const bitmap = await createImageBitmap(blob);
  const dims = { width: bitmap.width, height: bitmap.height };
  try { bitmap.close(); } catch (e) { /* ignore */ }
  return dims;
}

const compressAndAssign = async (compressFunction, { url, fetchUrl, name, sourceType, outputType, mime, isPreview, file }) => {

  //console.log('Compressing image:', name, sourceType, outputType);

  // fetchUrl is a same-origin proxy URL used when the image is served from a
  // cross-origin CDN (e.g. WP Offload Media → GCS/S3).  The original url is kept
  // for reference but the actual fetch uses the proxy to avoid CORS errors.
  const effectiveUrl = fetchUrl || url;

  if (!effectiveUrl && !file) {
    return '';
  }

  let fileBuffer;

  if (effectiveUrl) {
    fileBuffer = await fetchImageBuffer(effectiveUrl, name, mime, outputType);
  } else if (file) {
    // If file is provided, use it directly
    fileBuffer = await file.arrayBuffer();
  }

  if (!fileBuffer || fileBuffer.byteLength === 0) {
    throw new Error(`Fetched image from ${effectiveUrl} is empty.`);
  }

  // Reject clearly when the on-disk bytes are not a decodable JPEG/PNG/WebP/AVIF.
  if (fileBuffer instanceof ArrayBuffer && fileBuffer.byteLength >= 3) {
    const magic = Array.from(new Uint8Array(fileBuffer.slice(0, 8))).map(b => b.toString(16).padStart(2, '0')).join(' ');
    const looksJpeg = magic.startsWith('ff d8 ff');
    const looksPng = magic.startsWith('89 50 4e 47');
    const looksWebp = magic.startsWith('52 49 46 46');
    const looksAvif = magic.includes('66 74 79 70'); // ftyp
    const ok =
      (sourceType === 'jpeg' && looksJpeg) ||
      (sourceType === 'png' && looksPng) ||
      (sourceType === 'webp' && looksWebp) ||
      (sourceType === 'avif' && looksAvif) ||
      (outputType === 'png' && (looksPng || looksJpeg || looksWebp));
    if (!ok && (sourceType === 'jpeg' || sourceType === 'png' || sourceType === 'webp' || sourceType === 'avif')) {
      throw new Error(
        `The source image could not be decoded (file is not a valid ${sourceType.toUpperCase()}; magic=${magic}). Restore from a Squeeze backup if available.`
      );
    }
  }

  // When premium max width/height will downscale, megapixel guard uses *post-resize*
  // size. Prefer header dimensions so we never full-decode just to probe size.
  let resizeOptions = {};
  try {
    let dims = null;
    if (fileBuffer instanceof ArrayBuffer) {
      dims = (0,_memory_js__WEBPACK_IMPORTED_MODULE_0__.readImageDimensionsFromBuffer)(fileBuffer, sourceType);
    } else if (fileBuffer instanceof Blob) {
      const ab = await fileBuffer.arrayBuffer();
      dims = (0,_memory_js__WEBPACK_IMPORTED_MODULE_0__.readImageDimensionsFromBuffer)(ab, sourceType);
      // Keep ArrayBuffer for faster later paths when we had a Blob.
      fileBuffer = ab;
    }
    if (!dims) {
      const dimsBlob = fileBuffer instanceof Blob
        ? fileBuffer
        : new Blob([fileBuffer], { type: mime || `image/${sourceType}` });
      dims = await getImageDimensions(dimsBlob);
    }

    

    lastComputedResize = resizeOptions;

    const checkWidth = resizeOptions.needResize ? resizeOptions.width : dims.width;
    const checkHeight = resizeOptions.needResize ? resizeOptions.height : dims.height;
    const check = (0,_memory_js__WEBPACK_IMPORTED_MODULE_0__.checkMegapixelLimit)(checkWidth, checkHeight, memorySettings.megapixelLimit);
    if (!check.ok) {
      console.warn(
        `Image is large for this device (${check.megapixels.toFixed(1)} MP > ${check.limit} MP soft limit). ` +
        `Attempting compression anyway — may fail on low-memory devices.`
      );
    }
  } catch (err) {
    // If dimension probing fails, fall back to URL-based resize probe when available.
    resizeOptions =  {};
    lastComputedResize = resizeOptions;
  }

  let base64;

  if (compressFunction === compressPNG) {
    base64 = await compressFunction({ fileBuffer, outputType, resizeOptions });
  } else {
    base64 = await compressFunction({ fileBuffer, sourceType, outputType, resizeOptions, file });
  }

  return base64;
}

const compressAndAssignThumbs = async (compressFunction, { name, sourceType, outputType, mime, sizes, isAllSizes = false, file, originalResize = {} }, skipFull = false) => {
  const compressThumbs = options.compress_thumbs;
  const base64Sizes = {}
  const deleteSizes = []
  let imageDimensions;

  if (!sizes) {
    return { base64Sizes, deleteSizes };
  }

  if (file) {
    imageDimensions = await getImageDimensions(file);
  }

  for (const [key, value] of Object.entries(sizes)) {
    if (skipFull && key === 'full') { // skip full size if no scaled image
      continue;
    }

    //console.log('Processing size:', key, value);

    const sizeURL = value.url;
    // fetchUrl is a same-origin proxy URL injected by squeeze.js when sizeURL is cross-origin.
    // We use it for the actual fetch to avoid CORS errors (e.g. WP Offload Media → GCS/S3),
    // but return sizeURL in the results so PHP can still derive the correct filename.
    const sizeFetchURL = value.fetchUrl || sizeURL;
    const sizeWidth = value.width;
    const sizeHeight = value.height;
    const sizeCrop = value.crop || false;
    let sizeBase64;
    let fileBuffer;

    // After resizing the original, thumbs that are >= the new original in either
    // dimension are useless — flag them for deletion (even if not in compress_thumbs).
    

    if (!(key in compressThumbs) && !isAllSizes) {
      continue;
    }

    const resizeOptions = originalResize?.needResize
      ? {}
      : ( {});

    if (sizeFetchURL) {
      fileBuffer = await fetchImageBuffer(sizeFetchURL, name, mime, outputType);
    } else if (file) {
      // this method is used for squeezing thumbnails before generating them, so we need to calculate dimensions based on original image
      const sizeDimensions = getThumbnailDimensions({width: sizeWidth, height: sizeHeight}, imageDimensions);
      //console.log('sizeDimensions', sizeDimensions, sizeWidth, sizeHeight, imageDimensions);

      // If file is provided, use it directly
      const fileObj = new File([file], name, { type: mime });
      fileBuffer = await fileObj.arrayBuffer();
      resizeOptions['needResize'] = true;
      resizeOptions['fitMethod'] = 'contain';
      resizeOptions['width'] = sizeCrop ? sizeWidth : Math.round(sizeDimensions.width);
      resizeOptions['height'] = sizeCrop ? sizeHeight : Math.round(sizeDimensions.height);
    }

    if (!fileBuffer || fileBuffer.byteLength === 0) {
      console.warn(`Fetched image from ${sizeURL} is empty.`)
      continue;
    }

    if (compressFunction === compressPNG) {
      sizeBase64 = await compressFunction({ fileBuffer, outputType, resizeOptions });
    } else {
      sizeBase64 = await compressFunction({ fileBuffer, sourceType, outputType, mime, resizeOptions });
    }

    Object.assign(base64Sizes, { [key]: { 'url': sizeURL, 'base64': sizeBase64, 'width': resizeOptions['width'] ?? sizeWidth, 'height': resizeOptions['height'] ?? sizeHeight } });
    
  }

  return { base64Sizes, deleteSizes };
}

onmessage = async function (e) {
  if (e.ports && e.ports[0]) {
    rpcPort = e.ports[0];
    try { rpcPort.start(); } catch (err) { /* some browsers require start() */ }
  }

  const action = e.data.action;

  if (action === 'compress') {

    //console.log('Worker: Message received from main script', JSON.stringify(e.data, null, 2));
    const { format, url, fetchUrl, name, sourceType, outputType, mime, sizes, skipFull, isPreview, file, base64Compressed, base64WebpCompressed, type, memory } = e.data;
    options = e.data.options;
    memorySettings = {
      forceSingleThreadAvif: !!(memory?.forceSingleThreadAvif),
      megapixelLimit: memory?.megapixelLimit ?? (0,_memory_js__WEBPACK_IMPORTED_MODULE_0__.getMegapixelLimit)(memory?.deviceMemory),
    };

    try {
      lastComputedResize = {};
      let base64 = base64Compressed || ''; // base64Compressed is used for already compressed image, e.g. during image upload
      let base64Webp = base64WebpCompressed || '';
      let base64Sizes, base64SizesWebp;
      let deleteSizes = [];
      // fetchUrl is a same-origin proxy URL for the main image (cross-origin CDN compat).
      const effectiveUrl = fetchUrl || url;
      const base64Args = { url, fetchUrl, name, sourceType, outputType, mime, isPreview, file };
      const base64SizesArgs = { name, sourceType, outputType, mime, sizes, file, originalResize: {} };

      const runThumbs = async (compressFn) => {
        // Prefer resize from compressAndAssign; if original was skipped (pre-compressed), probe via headers.
        if (
          (!lastComputedResize || !lastComputedResize.needResize && !lastComputedResize.width) &&
          !isPreview &&
          (options.max_width || options.max_height)
        ) {
          lastComputedResize =  {};
        }
        base64SizesArgs.originalResize = lastComputedResize || {};
        return compressAndAssignThumbs(compressFn, base64SizesArgs, skipFull);
      };

      switch (format) {
        case 'avif':
          base64 = base64 ? base64Compressed : await compressAndAssign(compressAVIF, base64Args);
          ({ base64Sizes, deleteSizes } = await runThumbs(compressAVIF));
          break;
        case 'jpeg':
          if ( options.direct_webp ) {
            base64Args.outputType = 'webp';
            base64SizesArgs.outputType = 'webp';
            //base64SizesArgs.isAllSizes = true; // to convert all sizes to webp
            base64 = base64 ? base64Compressed : await compressAndAssign(compressJPEG, base64Args);
            ({ base64Sizes, deleteSizes } = await runThumbs(compressJPEG));
          } else {
            base64 = base64 ? base64Compressed : await compressAndAssign(compressJPEG, base64Args); // take compressed image if available (e.g. during image upload)
            ({ base64Sizes, deleteSizes } = await runThumbs(compressJPEG));

            if (options.auto_webp) {
              base64Args.outputType = 'webp';
              base64SizesArgs.outputType = 'webp';
              base64SizesArgs.isAllSizes = true; // to convert all sizes to webp
              base64Webp = base64Webp ? base64WebpCompressed : await compressAndAssign(compressJPEG, base64Args);
              ({ base64Sizes: base64SizesWebp } = await runThumbs(compressJPEG));
            }
          }

          break;
        case 'png':
          if ( options.direct_webp ) {
            base64Args.outputType = 'webp';
            base64SizesArgs.outputType = 'webp';
            //base64SizesArgs.isAllSizes = true; // to compress all sizes to webp
            base64 = base64 ? base64Compressed : await compressAndAssign(compressPNG, base64Args);
            ({ base64Sizes, deleteSizes } = await runThumbs(compressPNG));
          } else {
            base64 = base64 ? base64Compressed : await compressAndAssign(compressPNG, base64Args); // take compressed image if available (e.g. during image upload)
            ({ base64Sizes, deleteSizes } = await runThumbs(compressPNG));

            if (options.auto_webp) {
              base64Args.outputType = 'webp';
              base64SizesArgs.outputType = 'webp';
              base64SizesArgs.isAllSizes = true; // to compress all sizes to webp
              base64Webp = base64Webp ? base64WebpCompressed : await compressAndAssign(compressPNG, base64Args);
              ({ base64Sizes: base64SizesWebp } = await runThumbs(compressPNG));
            }
          }
          
          break;
        case 'webp':
          base64 = base64 ? base64Compressed : await compressAndAssign(compressWEBP, base64Args);
          ({ base64Sizes, deleteSizes } = await runThumbs(compressWEBP));
          break;
      }

      postMessage({
        'base64': base64,
        'base64Sizes': base64Sizes,
        'base64Webp': base64Webp,
        'base64SizesWebp': base64SizesWebp,
        
        'isDirectWebp': options.direct_webp,
      });
    } catch (error) {
      console.error(error);
      const wrapped = wrapWorkerError(error);
      postMessage({
        'error': { name: wrapped.name, message: wrapped.message }
      });
    }
  }
}
})();

/******/ })()
;