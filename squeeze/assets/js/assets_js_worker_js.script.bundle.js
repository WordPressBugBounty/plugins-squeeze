/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./assets/js/worker.js":
/*!*****************************!*\
  !*** ./assets/js/worker.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _jsquash_avif__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @jsquash/avif */ \"./node_modules/@jsquash/avif/decode.js\");\n/* harmony import */ var _jsquash_avif__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @jsquash/avif */ \"./node_modules/@jsquash/avif/encode.js\");\n/* harmony import */ var _jsquash_webp__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @jsquash/webp */ \"./node_modules/@jsquash/webp/decode.js\");\n/* harmony import */ var _jsquash_webp__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @jsquash/webp */ \"./node_modules/@jsquash/webp/encode.js\");\n/* harmony import */ var _jsquash_jpeg__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @jsquash/jpeg */ \"./node_modules/@jsquash/jpeg/decode.js\");\n/* harmony import */ var _jsquash_jpeg__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @jsquash/jpeg */ \"./node_modules/@jsquash/jpeg/encode.js\");\n/* harmony import */ var _jsquash_png__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @jsquash/png */ \"./node_modules/@jsquash/png/decode.js\");\n/* harmony import */ var _jsquash_png__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @jsquash/png */ \"./node_modules/@jsquash/png/encode.js\");\n/* harmony import */ var _jsquash_resize__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @jsquash/resize */ \"./node_modules/@jsquash/resize/index.js\");\n/* harmony import */ var browser_image_compression__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! browser-image-compression */ \"./node_modules/browser-image-compression/dist/browser-image-compression.mjs\");\n// Description: Web Worker for image compression\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\"use strict\";\r\n\r\nlet options; // plugin options\r\n\r\n/**\r\n   * Decode image buffer and return image data\r\n   * @param {string} sourceType  - avif, jpeg, png, webp\r\n   * @param {object} fileBuffer - The ArrayBuffer object is used to represent a generic raw binary data buffer.\r\n   * @returns {object | Error} - Image data object or throws an Error\r\n   */\r\nconst decode = async (sourceType, fileBuffer) => {\r\n  switch (sourceType) {\r\n    case 'avif':\r\n      return await _jsquash_avif__WEBPACK_IMPORTED_MODULE_1__[\"default\"](fileBuffer);\r\n    case 'jpeg':\r\n      return await _jsquash_jpeg__WEBPACK_IMPORTED_MODULE_2__[\"default\"](fileBuffer);\r\n    case 'png':\r\n      return await _jsquash_png__WEBPACK_IMPORTED_MODULE_3__[\"default\"](fileBuffer);\r\n    case 'webp':\r\n      return await _jsquash_webp__WEBPACK_IMPORTED_MODULE_4__[\"default\"](fileBuffer);\r\n    default:\r\n      throw new Error(`Unknown source type: ${sourceType}`);\r\n  }\r\n}\r\n\r\n/**\r\n * \r\n * @param {string} outputType - avif, jpeg, png, webp \r\n * @param {object} imageData - Image data object after decoding\r\n * @returns {ArrayBuffer | false} - Compressed image buffer or false if error\r\n */\r\nconst encode = async (outputType, imageData) => {\r\n  try {\r\n    switch (outputType) {\r\n      case 'avif':\r\n        const avifOptions = {}\r\n        for (const [key, value] of Object.entries(options)) {\r\n          if (key.includes('avif')) {\r\n            const keyName = key.replace('avif_', '')\r\n            avifOptions[keyName] = value\r\n          }\r\n        }\r\n        return await _jsquash_avif__WEBPACK_IMPORTED_MODULE_5__[\"default\"](imageData, avifOptions);\r\n      case 'jpeg':\r\n        const jpegOptions = {}\r\n        for (const [key, value] of Object.entries(options)) {\r\n          if (key.includes('jpeg')) {\r\n            const keyName = key.replace('jpeg_', '')\r\n            jpegOptions[keyName] = value\r\n          }\r\n        }\r\n        return await _jsquash_jpeg__WEBPACK_IMPORTED_MODULE_6__[\"default\"](imageData, jpegOptions);\r\n      case 'png':\r\n        const pngOptions = {}\r\n        for (const [key, value] of Object.entries(options)) {\r\n          if (key.includes('png')) {\r\n            const keyName = key.replace('png_', '')\r\n            pngOptions[keyName] = value\r\n          }\r\n        }\r\n        return await _jsquash_png__WEBPACK_IMPORTED_MODULE_7__[\"default\"](imageData, pngOptions);\r\n      case 'webp':\r\n        const webpOptions = {}\r\n        for (const [key, value] of Object.entries(options)) {\r\n          if (key.includes('webp')) {\r\n            const keyName = key.replace('webp_', '')\r\n            webpOptions[keyName] = value\r\n          }\r\n        }\r\n        return await _jsquash_webp__WEBPACK_IMPORTED_MODULE_8__[\"default\"](imageData, webpOptions);\r\n      default:\r\n        throw new Error(`Unknown output type: ${outputType}`);\r\n    }\r\n  } catch (error) {\r\n    //console.error(error)\r\n    throw new Error(`Error encoding image: ${error.message}`)\r\n  }\r\n\r\n}\r\n\r\n/**\r\n * Convert image buffer from one format to another\r\n * @param {string} sourceType - avif, jpeg, png, webp\r\n * @param {string} outputType - avif, jpeg, png, webp\r\n * @param {object} fileBuffer - The ArrayBuffer object is used to represent a generic raw binary data buffer.\r\n * @returns {Promise} - Compressed image buffer or false if error\r\n */\r\nconst convert = async (sourceType, outputType, fileBuffer, resizeOptions, pngOptions = {}) => {\r\n  try {\r\n    if (outputType === 'png') { // TBD: https://github.com/jamsinclair/jSquash/tree/main/packages/oxipng#activate-multithreading\r\n\r\n      //fileBuffer = await optimise(fileBuffer, pngOptions);\r\n\r\n      \r\n      return fileBuffer;\r\n\r\n    }\r\n\r\n    const imageData = await decode(sourceType, fileBuffer);\r\n\r\n    \r\n    return encode(outputType, imageData);\r\n  } catch (error) {\r\n    console.error('Error during image processing:', error);\r\n    throw new Error('Failed to process image, check the console for more information.');\r\n  }\r\n}\r\n\r\n/**\r\n * Convert Blob to base64 encoded image string\r\n * @param {object} blob - The Blob object represents a blob, which is a file-like object of immutable, raw data.\r\n * @returns {Promise<string>} - Base64 encoded image string\r\n */\r\nconst blobToBase64 = (blob) => {\r\n  return new Promise((resolve, _) => {\r\n    const reader = new FileReader();\r\n    reader.onloadend = () => resolve(reader.result);\r\n    reader.readAsDataURL(blob);\r\n  });\r\n}\r\n\r\nconst showOutput = async (imageBuffer, outputType) => {\r\n  if (!imageBuffer) {\r\n    return false;\r\n  }\r\n  const imageBlob = new Blob([imageBuffer], { type: `image/${outputType}` });\r\n  const base64String = await blobToBase64(imageBlob);\r\n\r\n  return base64String;\r\n}\r\n\r\n/**\r\n * Compresses a JPEG image.\r\n * @param {Object} params - The parameters for compression.\r\n * @param {string} params.url - The URL of the image.\r\n * @param {string} params.name - The name of the image file.\r\n * @param {string} params.sourceType - The source type of the image.\r\n * @param {string} params.outputType - The desired output type.\r\n * @param {string} params.mime - The MIME type of the image.\r\n * @param {Object} params.resizeOptions - The options for resizing the image.\r\n * @returns {Promise<string>} - The base64 encoded compressed image.\r\n */\r\nconst compressJPEG = async ({ url, name, sourceType, outputType, mime, resizeOptions }) => {\r\n  const response = await fetch(url);\r\n  const blob = await response.blob();\r\n  const metadata = {\r\n    type: mime\r\n  };\r\n  const imageObj = new File([blob], name, metadata);\r\n  const fileBuffer = await imageObj.arrayBuffer();\r\n  const imageBuffer = await convert(sourceType, outputType, fileBuffer, resizeOptions);\r\n  const base64 = await showOutput(imageBuffer, outputType);\r\n\r\n  return base64;\r\n}\r\n\r\n/**\r\n * Compresses a PNG image.\r\n * @param {Object} params - The parameters for compression.\r\n * @param {string} params.url - The URL of the image.\r\n * @param {Object} params.options - The options for PNG compression.\r\n * @param {string} params.outputType - The desired output type.\r\n * @param {Object} params.resizeOptions - The options for resizing the image.\r\n * @returns {Promise<string>} - The base64 encoded compressed image.\r\n */\r\nconst compressPNG = async ({ url, outputType, resizeOptions }) => {\r\n  const pngOptions = {};\r\n  for (const [key, value] of Object.entries(options)) {\r\n    if (key.includes('png')) {\r\n      const keyName = key.replace('png_', '');\r\n      pngOptions[keyName] = value;\r\n    }\r\n  }\r\n  /*\r\n  const fileBuffer = await fetch(url).then(res => res.arrayBuffer());\r\n  const imageBuffer = await convert(outputType, outputType, fileBuffer, resizeOptions, pngOptions);\r\n  const base64 = await showOutput(imageBuffer, outputType);\r\n\r\n  return base64;\r\n  //*/\r\n  const browserImageCompressionOptions = {\r\n    //maxSizeMB: 0.5,\r\n    maxWidthOrHeight: Number.POSITIVE_INFINITY,\r\n    initialQuality: pngOptions?.quality,\r\n    useWebWorker: false,\r\n  }\r\n  const imageFile = await fetch(url).then(res => res.blob());\r\n  try {\r\n    const compressedFile = await (0,browser_image_compression__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(imageFile, browserImageCompressionOptions);\r\n    const fileBuffer = await compressedFile.arrayBuffer();\r\n    const imageBuffer = await convert(outputType, outputType, fileBuffer, resizeOptions, pngOptions);\r\n    const base64 = await showOutput(imageBuffer, outputType);\r\n    //const base64 = await blobToBase64(compressedFile);\r\n    return base64;\r\n  } catch (error) {\r\n    console.log(error);\r\n  }\r\n}\r\n\r\n/**\r\n * Compresses a WEBP image.\r\n * @param {Object} params - The parameters for compression.\r\n * @param {string} params.url - The URL of the image.\r\n * @param {string} params.name - The name of the image file.\r\n * @param {string} params.sourceType - The source type of the image.\r\n * @param {string} params.outputType - The desired output type.\r\n * @param {string} params.mime - The MIME type of the image.\r\n * @param {Object} params.resizeOptions - The options for resizing the image.\r\n * @returns {Promise<string>} - The base64 encoded compressed image.\r\n */\r\nconst compressWEBP = async ({ url, name, sourceType, outputType, mime, resizeOptions }) => {\r\n  const webpResponse = await fetch(url);\r\n  const webpBlob = await webpResponse.blob();\r\n  const webpMetadata = {\r\n    type: mime\r\n  };\r\n  const webpImageObj = new File([webpBlob], name, webpMetadata);\r\n  const fileBuffer = await webpImageObj.arrayBuffer();\r\n  const imageBuffer = await convert(sourceType, outputType, fileBuffer, resizeOptions);\r\n  const base64 = await showOutput(imageBuffer, outputType);\r\n\r\n  return base64;\r\n}\r\n\r\n/**\r\n * Compresses an AVIF image.\r\n * @param {Object} params - The parameters for compression.\r\n * @param {string} params.url - The URL of the image.\r\n * @param {string} params.name - The name of the image file.\r\n * @param {string} params.sourceType - The source type of the image.\r\n * @param {string} params.outputType - The desired output type.\r\n * @param {string} params.mime - The MIME type of the image.\r\n * @param {Object} params.resizeOptions - The options for resizing the image.\r\n * @returns {Promise<string>} - The base64 encoded compressed image.\r\n */\r\nconst compressAVIF = async ({ url, name, sourceType, outputType, mime, resizeOptions }) => {\r\n  const avifResponse = await fetch(url);\r\n  const avifBlob = await avifResponse.blob();\r\n  const avifMetadata = {\r\n    type: mime\r\n  };\r\n  const avifImageObj = new File([avifBlob], name, avifMetadata);\r\n  const fileBuffer = await avifImageObj.arrayBuffer();\r\n  const imageBuffer = await convert(sourceType, outputType, fileBuffer, resizeOptions);\r\n  const base64 = await showOutput(imageBuffer, outputType);\r\n\r\n  return base64;\r\n}\r\n\r\n\r\n\r\nconst compressAndAssign = async (compressFunction, { url, name, sourceType, outputType, mime, isPreview }) => {\r\n\r\n  const resizeOptions =  {};\r\n  let base64;\r\n\r\n  if (compressFunction === compressPNG) {\r\n    base64 = await compressFunction({ url, outputType, resizeOptions });\r\n  } else {\r\n    base64 = await compressFunction({ url, name, sourceType, outputType, mime, resizeOptions });\r\n  }\r\n\r\n  return base64;\r\n}\r\n\r\nconst compressAndAssignThumbs = async (compressFunction, { name, sourceType, outputType, mime, sizes, isAllSizes = false }, skipFull = false) => {\r\n  const compressThumbs = options.compress_thumbs;\r\n  const base64Sizes = {}\r\n\r\n  if (!sizes) {\r\n    return base64Sizes;\r\n  }\r\n\r\n  for (const [key, value] of Object.entries(sizes)) {\r\n    if (!(key in compressThumbs) && !isAllSizes) {\r\n      continue;\r\n    }\r\n\r\n    if (skipFull && key === 'full') { // skip full size if no scaled image\r\n      continue;\r\n    }\r\n\r\n    const sizeURL = value.url;\r\n    const sizeWidth = value.width;\r\n    const sizeHeight = value.height;\r\n    const sizeName = `${name}-${sizeWidth}x${sizeHeight}`;\r\n    let sizeBase64;\r\n\r\n    if (compressFunction === compressPNG) {\r\n      sizeBase64 = await compressFunction({ url: sizeURL, outputType });\r\n    } else {\r\n      sizeBase64 = await compressFunction({ url: sizeURL, name: sizeName, sourceType, outputType, mime });\r\n    }\r\n\r\n    Object.assign(base64Sizes, { [key]: { 'url': sizeURL, 'base64': sizeBase64 } });\r\n  }\r\n\r\n  return base64Sizes;\r\n}\r\n\r\nonmessage = async function (e) {\r\n  //console.log('Worker: Message received from main script', e.data, );\r\n  const { format, url, name, sourceType, outputType, mime, sizes, skipFull, isPreview } = e.data;\r\n  options = e.data.options;\r\n  //console.log(options);\r\n\r\n  try {\r\n    let base64, base64Sizes, base64Webp, base64SizesWebp;\r\n\r\n    switch (format) {\r\n      case 'avif':\r\n        base64 = await compressAndAssign(compressAVIF, { url, name, sourceType, outputType, mime, isPreview });\r\n        base64Sizes = await compressAndAssignThumbs(compressAVIF, { name, sourceType, outputType, mime, sizes }, skipFull);\r\n        break;\r\n      case 'jpeg':\r\n        base64 = await compressAndAssign(compressJPEG, { url, name, sourceType, outputType, mime, isPreview });\r\n        base64Sizes = await compressAndAssignThumbs(compressJPEG, { name, sourceType, outputType, mime, sizes }, skipFull);\r\n        \r\n        if (options.auto_webp) {\r\n          base64Webp = await compressAndAssign(compressWEBP, { url, name, sourceType, outputType: 'webp', mime, isPreview });\r\n          base64SizesWebp = await compressAndAssignThumbs(compressWEBP, { name, sourceType, outputType: 'webp', mime, sizes, isAllSizes: true }, skipFull);\r\n        }\r\n\r\n        break;\r\n      case 'png':\r\n        base64 = await compressAndAssign(compressPNG, { url, name, sourceType, outputType, mime, isPreview });\r\n        base64Sizes = await compressAndAssignThumbs(compressPNG, { name, sourceType, outputType, mime, sizes }, skipFull);\r\n        \r\n        if (options.auto_webp) {\r\n          base64Webp = await compressAndAssign(compressWEBP, { url, name, sourceType, outputType: 'webp', mime, isPreview });\r\n          base64SizesWebp = await compressAndAssignThumbs(compressWEBP, { name, sourceType, outputType: 'webp', mime, sizes, isAllSizes: true }, skipFull);\r\n        }\r\n        \r\n        break;\r\n      case 'webp':\r\n        base64 = await compressAndAssign(compressWEBP, { url, name, sourceType, outputType, mime, isPreview });\r\n        base64Sizes = await compressAndAssignThumbs(compressWEBP, { name, sourceType, outputType, mime, sizes }, skipFull);\r\n        break;\r\n    }\r\n\r\n    postMessage({\r\n      'base64': base64,\r\n      'base64Sizes': base64Sizes,\r\n      'base64Webp': base64Webp,\r\n      'base64SizesWebp': base64SizesWebp\r\n    });\r\n  } catch (error) {\r\n    console.error(error);\r\n    postMessage({\r\n      'error': error\r\n    });\r\n  }\r\n}\n\n//# sourceURL=webpack:///./assets/js/worker.js?");

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
/******/ 	// the startup function
/******/ 	__webpack_require__.x = () => {
/******/ 		// Load entry module and return exports
/******/ 		// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 		var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_jsquash_avif_decode_js-node_modules_jsquash_avif_encode_js-node_modules_-515c76"], () => (__webpack_require__("./assets/js/worker.js")))
/******/ 		__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 		return __webpack_exports__;
/******/ 	};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
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
/******/ 		// This function allow to reference async chunks and sibling chunks for the entrypoint
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".script.bundle.js";
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
/******/ 	/* webpack/runtime/startup chunk dependencies */
/******/ 	(() => {
/******/ 		var next = __webpack_require__.x;
/******/ 		__webpack_require__.x = () => {
/******/ 			return __webpack_require__.e("vendors-node_modules_jsquash_avif_decode_js-node_modules_jsquash_avif_encode_js-node_modules_-515c76").then(next);
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// run startup
/******/ 	var __webpack_exports__ = __webpack_require__.x();
/******/ 	
/******/ })()
;