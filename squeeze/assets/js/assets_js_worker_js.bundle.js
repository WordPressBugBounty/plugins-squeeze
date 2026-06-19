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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _jsquash_avif__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jsquash/avif */ \"./node_modules/@jsquash/avif/decode.js\");\n/* harmony import */ var _jsquash_avif__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @jsquash/avif */ \"./node_modules/@jsquash/avif/encode.js\");\n/* harmony import */ var _jsquash_webp__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @jsquash/webp */ \"./node_modules/@jsquash/webp/decode.js\");\n/* harmony import */ var _jsquash_webp__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @jsquash/webp */ \"./node_modules/@jsquash/webp/encode.js\");\n/* harmony import */ var _jsquash_jpeg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @jsquash/jpeg */ \"./node_modules/@jsquash/jpeg/decode.js\");\n/* harmony import */ var _jsquash_jpeg__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @jsquash/jpeg */ \"./node_modules/@jsquash/jpeg/encode.js\");\n/* harmony import */ var _jsquash_png__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @jsquash/png */ \"./node_modules/@jsquash/png/decode.js\");\n/* harmony import */ var _jsquash_png__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @jsquash/png */ \"./node_modules/@jsquash/png/encode.js\");\n/* harmony import */ var _jsquash_resize__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @jsquash/resize */ \"./node_modules/@jsquash/resize/index.js\");\n// Description: Web Worker for image compression\r\n\r\n\r\n\r\n\r\n\r\n//import optimise from '@jsquash/oxipng/optimise';\r\n\r\n\r\n\"use strict\";\r\n\r\nlet options; // plugin options\r\n\r\n// RPC stands for Remote Procedure Call.\r\n// It’s a fancy name for \"calling a function that runs somewhere else, as if it was local\".\r\n\r\n//This is a MessagePort object used to communicate with the main thread.\r\n//It’s initially null and must be assigned from the outside when the main thread sends it to this worker via postMessage(..., [port]).\r\nlet rpcPort = null;    // will be set when main thread transfers a MessagePort\r\n\r\n//Just a sequential number to ensure that every request has a unique ID, even if multiple requests happen at the same timestamp.\r\nlet rpcCounter = 1;\r\n\r\n// makes unique ID for each RPC call\r\n// example: 1633036800000-abc123-1\r\nfunction makeId() {\r\n  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${rpcCounter++}`;\r\n}\r\n\r\n/**\r\n * Call main thread to run imageCompression(...) there.\r\n * imageCompression function cannot be called directly from the worker. - causing error on mobile\r\n * - fileOrArrayBuffer: Blob or ArrayBuffer\r\n * - mime: e.g. 'image/png' or 'image/jpeg'\r\n * - options: options to pass to imageCompression\r\n * Returns: Promise<ArrayBuffer> (compressed image as ArrayBuffer)\r\n */\r\nfunction compressOnMainThread(fileOrArrayBuffer, mime = 'image/png', options = {}) {\r\n\r\n  //If rpcPort hasn’t been set yet, reject the Promise immediately.\r\n  //This prevents trying to send messages when there’s no communication channel.\r\n  if (!rpcPort) {\r\n    return Promise.reject(new Error('No RPC port available to main thread. Ensure main thread transferred a MessagePort.'));\r\n  }\r\n\r\n  return new Promise((resolve, reject) => {\r\n    const id = makeId();\r\n\r\n    // Listen for messages from the main thread\r\n    function onMsg(ev) {\r\n      const d = ev.data;\r\n      if (!d || d.id !== id) return; // ignores unrelated messages by checking d.id.\r\n      rpcPort.removeEventListener('message', onMsg); // Removes the event listener (avoids memory leaks).\r\n      if (d.ok) resolve(d.arrayBuffer); // Resolves with the compressed image data if d.ok is true.\r\n      else reject(d.error || new Error('Compression failed on main thread')); // Rejects if there was an error.\r\n    }\r\n\r\n    rpcPort.addEventListener('message', onMsg);\r\n\r\n    // In some cases (like MessageChannel in a worker), you must call .start() to begin receiving messages.\r\n    // In others, it’s automatic — hence the try/catch.\r\n    try { rpcPort.start(); } catch (e) { /* start may be no-op */ }\r\n\r\n    // Transfer ArrayBuffer if present for zero-copy\r\n    if (fileOrArrayBuffer instanceof ArrayBuffer) {\r\n      // It’s transferable, meaning ownership moves to the main thread without copying.\r\n      // Faster and memory-efficient.\r\n      rpcPort.postMessage({ id, action: 'imageCompression', fileOrArrayBuffer, mime, options }, [fileOrArrayBuffer]);\r\n    } else {\r\n      // Blob cannot be transferred, post it as-is (main thread will accept)\r\n      rpcPort.postMessage({ id, action: 'imageCompression', fileOrArrayBuffer, mime, options });\r\n    }\r\n  });\r\n}\r\n\r\n/**\r\n * Decode image buffer and return image data\r\n * @param {string} sourceType  - avif, jpeg, png, webp\r\n * @param {object} fileBuffer - The ArrayBuffer object is used to represent a generic raw binary data buffer.\r\n * @returns {object | Error} - Image data object or throws an Error\r\n */\r\nconst decode = async (sourceType, fileBuffer) => {\r\n  switch (sourceType) {\r\n    case 'avif':\r\n      return await _jsquash_avif__WEBPACK_IMPORTED_MODULE_0__[\"default\"](fileBuffer);\r\n    case 'jpeg':\r\n      return await _jsquash_jpeg__WEBPACK_IMPORTED_MODULE_1__[\"default\"](fileBuffer);\r\n    case 'png':\r\n      return await _jsquash_png__WEBPACK_IMPORTED_MODULE_2__[\"default\"](fileBuffer);\r\n    case 'webp':\r\n      return await _jsquash_webp__WEBPACK_IMPORTED_MODULE_3__[\"default\"](fileBuffer);\r\n    default:\r\n      throw new Error(`Unknown source type: ${sourceType}`);\r\n  }\r\n}\r\n\r\n/**\r\n * \r\n * @param {string} outputType - avif, jpeg, png, webp \r\n * @param {object} imageData - Image data object after decoding\r\n * @returns {ArrayBuffer | false} - Compressed image buffer or false if error\r\n */\r\nconst encode = async (outputType, imageData) => {\r\n  try {\r\n    switch (outputType) {\r\n      case 'avif':\r\n        const avifOptions = {}\r\n        for (const [key, value] of Object.entries(options)) {\r\n          if (key.includes('avif')) {\r\n            const keyName = key.replace('avif_', '')\r\n            avifOptions[keyName] = value\r\n          }\r\n        }\r\n        return await _jsquash_avif__WEBPACK_IMPORTED_MODULE_4__[\"default\"](imageData, avifOptions);\r\n      case 'jpeg':\r\n        const jpegOptions = {}\r\n        for (const [key, value] of Object.entries(options)) {\r\n          if (key.includes('jpeg')) {\r\n            const keyName = key.replace('jpeg_', '')\r\n            jpegOptions[keyName] = value\r\n          }\r\n        }\r\n        return await _jsquash_jpeg__WEBPACK_IMPORTED_MODULE_5__[\"default\"](imageData, jpegOptions);\r\n      case 'png':\r\n        const pngOptions = {}\r\n        for (const [key, value] of Object.entries(options)) {\r\n          if (key.includes('png')) {\r\n            const keyName = key.replace('png_', '')\r\n            pngOptions[keyName] = value\r\n          }\r\n        }\r\n        return await _jsquash_png__WEBPACK_IMPORTED_MODULE_6__[\"default\"](imageData, pngOptions);\r\n      case 'webp':\r\n        const webpOptions = {}\r\n        for (const [key, value] of Object.entries(options)) {\r\n          if (key.includes('webp')) {\r\n            const keyName = key.replace('webp_', '')\r\n            webpOptions[keyName] = value\r\n          }\r\n        }\r\n        return await _jsquash_webp__WEBPACK_IMPORTED_MODULE_7__[\"default\"](imageData, webpOptions);\r\n      default:\r\n        throw new Error(`Unknown output type: ${outputType}`);\r\n    }\r\n  } catch (error) {\r\n    //console.error(error)\r\n    throw new Error(`Error encoding image: ${error.message}`)\r\n  }\r\n\r\n}\r\n\r\n/**\r\n * Convert image buffer from one format to another\r\n * @param {string} sourceType - avif, jpeg, png, webp\r\n * @param {string} outputType - avif, jpeg, png, webp\r\n * @param {object} fileBuffer - The ArrayBuffer object is used to represent a generic raw binary data buffer.\r\n * @returns {Promise} - Compressed image buffer or false if error\r\n */\r\nconst convert = async (sourceType, outputType, fileBuffer, resizeOptions) => {\r\n  try {\r\n    //console.log(`Converting from ${sourceType} to ${outputType}`);\r\n    if (outputType === 'png') {\r\n\r\n      \r\n      return fileBuffer;\r\n\r\n    }\r\n\r\n    //*\r\n    if (sourceType === 'jpeg') {\r\n      fileBuffer = await compressOnMainThread(\r\n        fileBuffer,\r\n        'image/jpeg',\r\n        {useWebWorker: true}\r\n      );\r\n    }\r\n    //*/\r\n\r\n    const imageData = await decode(sourceType, fileBuffer);\r\n\r\n    \r\n    return encode(outputType, imageData);\r\n  } catch (error) {\r\n    console.error('Error during image processing:', error);\r\n    throw new Error('Failed to process image, check the console for more information. ' + error);\r\n  }\r\n}\r\n\r\n/**\r\n * Convert Blob to base64 encoded image string\r\n * @param {object} blob - The Blob object represents a blob, which is a file-like object of immutable, raw data.\r\n * @returns {Promise<string>} - Base64 encoded image string\r\n */\r\nconst blobToBase64 = (blob) => {\r\n  return new Promise((resolve, _) => {\r\n    const reader = new FileReader();\r\n    reader.onloadend = () => resolve(reader.result);\r\n    reader.readAsDataURL(blob);\r\n  });\r\n}\r\n\r\nconst showOutput = async (imageBuffer, outputType) => {\r\n  if (!imageBuffer) {\r\n    return false;\r\n  }\r\n  const imageBlob = new Blob([imageBuffer], { type: `image/${outputType}` });\r\n  const base64String = await blobToBase64(imageBlob);\r\n\r\n  return base64String;\r\n}\r\n\r\nconst fetchImageBuffer = async (url, name, mime, outputType) => {\r\n  const response = await fetch(url);\r\n  if (!response.ok) {\r\n    return false;\r\n  }\r\n\r\n  const blob = await response.blob();\r\n\r\n  if (outputType === 'png') {\r\n    // For PNG, we need to return blob\r\n    return blob;\r\n  }\r\n\r\n  const metadata = {\r\n    type: mime\r\n  }\r\n\r\n  const imageObj = new File([blob], name, metadata);\r\n  const fileBuffer = await imageObj.arrayBuffer();\r\n\r\n  return fileBuffer;\r\n}\r\n\r\n/**\r\n * Compresses a JPEG image.\r\n * @param {Object} params - The parameters for compression.\r\n * @param {string} params.sourceType - The source type of the image.\r\n * @param {string} params.outputType - The desired output type.\r\n * @param {Object} params.resizeOptions - The options for resizing the image.\r\n * @returns {Promise<string>} - The base64 encoded compressed image.\r\n */\r\nconst compressJPEG = async ({ fileBuffer, sourceType, outputType, resizeOptions }) => {\r\n  //*\r\n  const imageBuffer = await convert(sourceType, outputType, fileBuffer, resizeOptions);\r\n  const base64 = await showOutput(imageBuffer, outputType);\r\n\r\n  return base64;\r\n  //*/\r\n\r\n  /*\r\n  const browserImageCompressionOptions = {\r\n    maxSizeMB: Number.POSITIVE_INFINITY,\r\n    maxWidthOrHeight: Number.POSITIVE_INFINITY,\r\n    initialQuality: 0.81,\r\n    useWebWorker: true,\r\n  }\r\n\r\n  try {\r\n    // Use main thread to run imageCompression to avoid \"Image\" missing in worker on iOS\r\n    const compressedFileBuffer = await compressOnMainThread(\r\n      fileBuffer,\r\n      'image/jpeg',\r\n      browserImageCompressionOptions\r\n    );\r\n\r\n    const imageBuffer = await convert('jpeg', outputType, compressedFileBuffer, resizeOptions);\r\n    const base64 = await showOutput(imageBuffer, outputType);\r\n    return base64;\r\n  } catch (error) {\r\n    console.error(error);\r\n    throw new Error('Failed to process JPEG, check the console for more information.');\r\n  }\r\n  //*/\r\n}\r\n\r\n/**\r\n * Compresses a PNG image.\r\n * @param {Object} params - The parameters for compression.\r\n * @param {string} params.outputType - The desired output type.\r\n * @param {Object} params.resizeOptions - The options for resizing the image.\r\n * @returns {Promise<string>} - The base64 encoded compressed image.\r\n */\r\nconst compressPNG = async ({ fileBuffer, outputType, resizeOptions }) => {\r\n  const pngOptions = {};\r\n  for (const [key, value] of Object.entries(options)) {\r\n    if (key.includes('png')) {\r\n      const keyName = key.replace('png_', '');\r\n      pngOptions[keyName] = value;\r\n    }\r\n  }\r\n  \r\n  const browserImageCompressionOptions = {\r\n    maxSizeMB: Number.POSITIVE_INFINITY,\r\n    maxWidthOrHeight: Number.POSITIVE_INFINITY,\r\n    initialQuality: pngOptions?.quality,\r\n    useWebWorker: true,\r\n  }\r\n\r\n  //if (fileBuffer instanceof ArrayBuffer) { // for thumbnails\r\n    //fileBuffer = new Blob([fileBuffer], { type: 'image/png' });\r\n  //}\r\n\r\n  try {\r\n    // Use main thread to run imageCompression to avoid \"Image\" missing in worker on iOS\r\n    const compressedFileBuffer = await compressOnMainThread(\r\n      fileBuffer,\r\n      'image/png',\r\n      browserImageCompressionOptions\r\n    );\r\n\r\n    const imageBuffer = await convert('png', outputType, compressedFileBuffer, resizeOptions);\r\n    const base64 = await showOutput(imageBuffer, outputType);\r\n    return base64;\r\n  } catch (error) {\r\n    console.error(error);\r\n    throw new Error('Failed to process PNG, check the console for more information.');\r\n  }\r\n}\r\n\r\n/**\r\n * Compresses a WEBP image.\r\n * @param {Object} params - The parameters for compression.\r\n * @param {string} params.sourceType - The source type of the image.\r\n * @param {string} params.outputType - The desired output type.\r\n * @param {Object} params.resizeOptions - The options for resizing the image.\r\n * @returns {Promise<string>} - The base64 encoded compressed image.\r\n */\r\nconst compressWEBP = async ({ fileBuffer, sourceType, outputType, resizeOptions }) => {\r\n\r\n  const imageBuffer = await convert(sourceType, outputType, fileBuffer, resizeOptions);\r\n  const base64 = await showOutput(imageBuffer, outputType);\r\n\r\n  return base64;\r\n}\r\n\r\n/**\r\n * Compresses an AVIF image.\r\n * @param {Object} params - The parameters for compression.\r\n * @param {string} params.sourceType - The source type of the image.\r\n * @param {string} params.outputType - The desired output type.\r\n * @param {Object} params.resizeOptions - The options for resizing the image.\r\n * @returns {Promise<string>} - The base64 encoded compressed image.\r\n */\r\nconst compressAVIF = async ({ fileBuffer, sourceType, outputType, resizeOptions }) => {\r\n\r\n  const imageBuffer = await convert(sourceType, outputType, fileBuffer, resizeOptions);\r\n  const base64 = await showOutput(imageBuffer, outputType);\r\n\r\n  return base64;\r\n}\r\n\r\n\r\n\r\n// get proportional dimensions for thumbnail\r\n// based on original image dimensions and thumbnail size name\r\nconst getThumbnailDimensions = (thumbnailDimensions, originalImageDimensions) => {\r\n  const { width: originalWidth, height: originalHeight } = originalImageDimensions;\r\n  const aspectRatioHeight = originalHeight / originalWidth;\r\n  const aspectRatioWidth = originalWidth / originalHeight;\r\n  let sizeWidth, sizeHeight;\r\n\r\n  thumbnailDimensions.width = thumbnailDimensions.width === 0 ? 9999 : thumbnailDimensions.width;\r\n  thumbnailDimensions.height = thumbnailDimensions.height === 0 ? 9999 : thumbnailDimensions.height;\r\n  \r\n  if (originalWidth > originalHeight) {\r\n    sizeWidth = thumbnailDimensions.width;\r\n    sizeHeight = Math.round((originalHeight / originalWidth) * sizeWidth);\r\n  }\r\n  else {\r\n    sizeHeight = thumbnailDimensions.height;\r\n    sizeWidth = Math.round((originalWidth / originalHeight) * sizeHeight);\r\n  }\r\n\r\n  // Ensure both dimensions are within the max values\r\n  if (sizeWidth > thumbnailDimensions.width) {\r\n    sizeWidth = thumbnailDimensions.width;\r\n    sizeHeight = thumbnailDimensions.width * aspectRatioHeight;\r\n  }\r\n\r\n  if (sizeHeight > thumbnailDimensions.height) {\r\n    sizeHeight = thumbnailDimensions.height;\r\n    sizeWidth = thumbnailDimensions.height / aspectRatioWidth;\r\n  }\r\n  return { width: sizeWidth, height: sizeHeight };\r\n}\r\n\r\nconst getImageDimensions = async (file) => {\r\n  let blob;\r\n  if (file instanceof Blob) {\r\n    blob = file;\r\n  } else if (file instanceof ArrayBuffer) {\r\n    blob = new Blob([file]);\r\n  } else {\r\n    throw new Error('Unsupported file type for getImageDimensions');\r\n  }\r\n  const bitmap = await createImageBitmap(blob);\r\n  return { width: bitmap.width, height: bitmap.height };\r\n}\r\n\r\nconst compressAndAssign = async (compressFunction, { url, fetchUrl, name, sourceType, outputType, mime, isPreview, file }) => {\r\n\r\n  //console.log('Compressing image:', name, sourceType, outputType);\r\n\r\n  // fetchUrl is a same-origin proxy URL used when the image is served from a\r\n  // cross-origin CDN (e.g. WP Offload Media → GCS/S3).  The original url is kept\r\n  // for reference but the actual fetch uses the proxy to avoid CORS errors.\r\n  const effectiveUrl = fetchUrl || url;\r\n\r\n  if (!effectiveUrl && !file) {\r\n    return '';\r\n  }\r\n\r\n  let fileBuffer;\r\n\r\n  if (effectiveUrl) {\r\n    fileBuffer = await fetchImageBuffer(effectiveUrl, name, mime, outputType);\r\n  } else if (file) {\r\n    // If file is provided, use it directly\r\n    fileBuffer = await file.arrayBuffer();\r\n  }\r\n\r\n  if (!fileBuffer || fileBuffer.byteLength === 0) {\r\n    throw new Error(`Fetched image from ${effectiveUrl} is empty.`);\r\n  }\r\n\r\n  const resizeOptions =  {};\r\n  let base64;\r\n\r\n  if (compressFunction === compressPNG) {\r\n    base64 = await compressFunction({ fileBuffer, outputType, resizeOptions });\r\n  } else {\r\n    base64 = await compressFunction({ fileBuffer, sourceType, outputType, resizeOptions, file });\r\n  }\r\n\r\n  return base64;\r\n}\r\n\r\nconst compressAndAssignThumbs = async (compressFunction, { name, sourceType, outputType, mime, sizes, isAllSizes = false, file }, skipFull = false) => {\r\n  const compressThumbs = options.compress_thumbs;\r\n  const base64Sizes = {}\r\n  let imageDimensions;\r\n\r\n  if (!sizes) {\r\n    return base64Sizes;\r\n  }\r\n\r\n  if (file) {\r\n    imageDimensions = await getImageDimensions(file);\r\n  }\r\n\r\n  for (const [key, value] of Object.entries(sizes)) {\r\n    if (!(key in compressThumbs) && !isAllSizes) {\r\n      continue;\r\n    }\r\n\r\n    if (skipFull && key === 'full') { // skip full size if no scaled image\r\n      continue;\r\n    }\r\n\r\n    //console.log('Processing size:', key, value);\r\n\r\n    const sizeURL = value.url;\r\n    // fetchUrl is a same-origin proxy URL injected by squeeze.js when sizeURL is cross-origin.\r\n    // We use it for the actual fetch to avoid CORS errors (e.g. WP Offload Media → GCS/S3),\r\n    // but return sizeURL in the results so PHP can still derive the correct filename.\r\n    const sizeFetchURL = value.fetchUrl || sizeURL;\r\n    const sizeWidth = value.width;\r\n    const sizeHeight = value.height;\r\n    const sizeCrop = value.crop || false;\r\n    let sizeBase64;\r\n    let fileBuffer;\r\n    //const resizeOptions = {};\r\n    const resizeOptions =  {};\r\n\r\n    if (resizeOptions?.needResize) {\r\n      continue;\r\n    }\r\n\r\n    if (sizeFetchURL) {\r\n      fileBuffer = await fetchImageBuffer(sizeFetchURL, name, mime, outputType);\r\n    } else if (file) {\r\n      // this method is used for squeezing thumbnails before generating them, so we need to calculate dimensions based on original image\r\n      const sizeDimensions = getThumbnailDimensions({width: sizeWidth, height: sizeHeight}, imageDimensions);\r\n      //console.log('sizeDimensions', sizeDimensions, sizeWidth, sizeHeight, imageDimensions);\r\n\r\n      // If file is provided, use it directly\r\n      const fileObj = new File([file], name, { type: mime });\r\n      fileBuffer = await fileObj.arrayBuffer();\r\n      resizeOptions['needResize'] = true;\r\n      resizeOptions['fitMethod'] = 'contain';\r\n      resizeOptions['width'] = sizeCrop ? sizeWidth : Math.round(sizeDimensions.width);\r\n      resizeOptions['height'] = sizeCrop ? sizeHeight : Math.round(sizeDimensions.height);\r\n    }\r\n\r\n    if (!fileBuffer || fileBuffer.byteLength === 0) {\r\n      console.warn(`Fetched image from ${sizeURL} is empty.`)\r\n      continue;\r\n    }\r\n\r\n    if (compressFunction === compressPNG) {\r\n      sizeBase64 = await compressFunction({ fileBuffer, outputType, resizeOptions });\r\n    } else {\r\n      sizeBase64 = await compressFunction({ fileBuffer, sourceType, outputType, mime, resizeOptions });\r\n    }\r\n\r\n    Object.assign(base64Sizes, { [key]: { 'url': sizeURL, 'base64': sizeBase64, 'width': resizeOptions['width'] ?? sizeWidth, 'height': resizeOptions['height'] ?? sizeHeight } });\r\n    \r\n  }\r\n\r\n  return base64Sizes;\r\n}\r\n\r\nonmessage = async function (e) {\r\n  if (e.ports && e.ports[0]) {\r\n    rpcPort = e.ports[0];\r\n    try { rpcPort.start(); } catch (err) { /* some browsers require start() */ }\r\n  }\r\n\r\n  const action = e.data.action;\r\n\r\n  if (action === 'compress') {\r\n\r\n    //console.log('Worker: Message received from main script', JSON.stringify(e.data, null, 2));\r\n    const { format, url, fetchUrl, name, sourceType, outputType, mime, sizes, skipFull, isPreview, file, base64Compressed, base64WebpCompressed, type } = e.data;\r\n    options = e.data.options;\r\n\r\n    try {\r\n      let base64 = base64Compressed || ''; // base64Compressed is used for already compressed image, e.g. during image upload\r\n      let base64Webp = base64WebpCompressed || '';\r\n      let base64Sizes, base64SizesWebp;\r\n      // fetchUrl is a same-origin proxy URL for the main image (cross-origin CDN compat).\r\n      const base64Args = { url, fetchUrl, name, sourceType, outputType, mime, isPreview, file };\r\n      const base64SizesArgs = { name, sourceType, outputType, mime, sizes, file };\r\n\r\n      switch (format) {\r\n        case 'avif':\r\n          base64 = base64 ? base64Compressed : await compressAndAssign(compressAVIF, base64Args);\r\n          base64Sizes = await compressAndAssignThumbs(compressAVIF, base64SizesArgs, skipFull);\r\n          break;\r\n        case 'jpeg':\r\n          if ( options.direct_webp && type !== 'path' ) {\r\n            base64Args.outputType = 'webp';\r\n            base64SizesArgs.outputType = 'webp';\r\n            //base64SizesArgs.isAllSizes = true; // to convert all sizes to webp\r\n            base64 = base64 ? base64Compressed : await compressAndAssign(compressJPEG, base64Args);\r\n            base64Sizes = await compressAndAssignThumbs(compressJPEG, base64SizesArgs, skipFull);\r\n          } else {\r\n            base64 = base64 ? base64Compressed : await compressAndAssign(compressJPEG, base64Args); // take compressed image if available (e.g. during image upload)\r\n            base64Sizes = await compressAndAssignThumbs(compressJPEG, base64SizesArgs, skipFull);\r\n\r\n            if (options.auto_webp) {\r\n              base64Args.outputType = 'webp';\r\n              base64SizesArgs.outputType = 'webp';\r\n              base64SizesArgs.isAllSizes = true; // to convert all sizes to webp\r\n              base64Webp = base64Webp ? base64WebpCompressed : await compressAndAssign(compressJPEG, base64Args);\r\n              base64SizesWebp = await compressAndAssignThumbs(compressJPEG, base64SizesArgs, skipFull);\r\n            }\r\n          }\r\n\r\n          break;\r\n        case 'png':\r\n          if ( options.direct_webp && type !== 'path' ) {\r\n            base64Args.outputType = 'webp';\r\n            base64SizesArgs.outputType = 'webp';\r\n            //base64SizesArgs.isAllSizes = true; // to compress all sizes to webp\r\n            base64 = base64 ? base64Compressed : await compressAndAssign(compressPNG, base64Args);\r\n            base64Sizes = await compressAndAssignThumbs(compressPNG, base64SizesArgs, skipFull);\r\n          } else {\r\n            base64 = base64 ? base64Compressed : await compressAndAssign(compressPNG, base64Args); // take compressed image if available (e.g. during image upload)\r\n            base64Sizes = await compressAndAssignThumbs(compressPNG, base64SizesArgs, skipFull);\r\n\r\n            if (options.auto_webp) {\r\n              base64Args.outputType = 'webp';\r\n              base64SizesArgs.outputType = 'webp';\r\n              base64SizesArgs.isAllSizes = true; // to compress all sizes to webp\r\n              base64Webp = base64Webp ? base64WebpCompressed : await compressAndAssign(compressPNG, base64Args);\r\n              base64SizesWebp = await compressAndAssignThumbs(compressPNG, base64SizesArgs, skipFull);\r\n            }\r\n          }\r\n          \r\n          break;\r\n        case 'webp':\r\n          base64 = base64 ? base64Compressed : await compressAndAssign(compressWEBP, base64Args);\r\n          base64Sizes = await compressAndAssignThumbs(compressWEBP, base64SizesArgs, skipFull);\r\n          break;\r\n      }\r\n\r\n      postMessage({\r\n        'base64': base64,\r\n        'base64Sizes': base64Sizes,\r\n        'base64Webp': base64Webp,\r\n        'base64SizesWebp': base64SizesWebp,\r\n        'isDirectWebp': options.direct_webp,\r\n      });\r\n    } catch (error) {\r\n      console.error(error);\r\n      postMessage({\r\n        'error': error\r\n      });\r\n    }\r\n  }\r\n}\n\n//# sourceURL=webpack:///./assets/js/worker.js?");

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
/******/ 		var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_jsquash_avif_decode_js-node_modules_jsquash_avif_encode_js-node_modules_-88b2ac"], () => (__webpack_require__("./assets/js/worker.js")))
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
/******/ 	/* webpack/runtime/startup chunk dependencies */
/******/ 	(() => {
/******/ 		var next = __webpack_require__.x;
/******/ 		__webpack_require__.x = () => {
/******/ 			return __webpack_require__.e("vendors-node_modules_jsquash_avif_decode_js-node_modules_jsquash_avif_encode_js-node_modules_-88b2ac").then(next);
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