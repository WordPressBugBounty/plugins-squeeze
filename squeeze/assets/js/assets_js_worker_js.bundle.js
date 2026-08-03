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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _jsquash_avif__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jsquash/avif */ \"./node_modules/@jsquash/avif/decode.js\");\n/* harmony import */ var _jsquash_avif__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @jsquash/avif */ \"./node_modules/@jsquash/avif/encode.js\");\n/* harmony import */ var _jsquash_webp__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @jsquash/webp */ \"./node_modules/@jsquash/webp/decode.js\");\n/* harmony import */ var _jsquash_webp__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @jsquash/webp */ \"./node_modules/@jsquash/webp/encode.js\");\n/* harmony import */ var _jsquash_jpeg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @jsquash/jpeg */ \"./node_modules/@jsquash/jpeg/decode.js\");\n/* harmony import */ var _jsquash_jpeg__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @jsquash/jpeg */ \"./node_modules/@jsquash/jpeg/encode.js\");\n/* harmony import */ var _jsquash_png__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @jsquash/png */ \"./node_modules/@jsquash/png/decode.js\");\n/* harmony import */ var _jsquash_png__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @jsquash/png */ \"./node_modules/@jsquash/png/encode.js\");\n/* harmony import */ var _jsquash_resize__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @jsquash/resize */ \"./node_modules/@jsquash/resize/index.js\");\n// Description: Web Worker for image compression\n\n\n\n\n\n//import optimise from '@jsquash/oxipng/optimise';\n\n\n\"use strict\";\n\nlet options; // plugin options\n\n// RPC stands for Remote Procedure Call.\n// It’s a fancy name for \"calling a function that runs somewhere else, as if it was local\".\n\n//This is a MessagePort object used to communicate with the main thread.\n//It’s initially null and must be assigned from the outside when the main thread sends it to this worker via postMessage(..., [port]).\nlet rpcPort = null;    // will be set when main thread transfers a MessagePort\n\n//Just a sequential number to ensure that every request has a unique ID, even if multiple requests happen at the same timestamp.\nlet rpcCounter = 1;\n\n// makes unique ID for each RPC call\n// example: 1633036800000-abc123-1\nfunction makeId() {\n  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${rpcCounter++}`;\n}\n\n/**\n * Call main thread to run imageCompression(...) there.\n * imageCompression function cannot be called directly from the worker. - causing error on mobile\n * - fileOrArrayBuffer: Blob or ArrayBuffer\n * - mime: e.g. 'image/png' or 'image/jpeg'\n * - options: options to pass to imageCompression\n * Returns: Promise<ArrayBuffer> (compressed image as ArrayBuffer)\n */\nfunction compressOnMainThread(fileOrArrayBuffer, mime = 'image/png', options = {}) {\n\n  //If rpcPort hasn’t been set yet, reject the Promise immediately.\n  //This prevents trying to send messages when there’s no communication channel.\n  if (!rpcPort) {\n    return Promise.reject(new Error('No RPC port available to main thread. Ensure main thread transferred a MessagePort.'));\n  }\n\n  return new Promise((resolve, reject) => {\n    const id = makeId();\n\n    // Listen for messages from the main thread\n    function onMsg(ev) {\n      const d = ev.data;\n      if (!d || d.id !== id) return; // ignores unrelated messages by checking d.id.\n      rpcPort.removeEventListener('message', onMsg); // Removes the event listener (avoids memory leaks).\n      if (d.ok) resolve(d.arrayBuffer); // Resolves with the compressed image data if d.ok is true.\n      else reject(d.error || new Error('Compression failed on main thread')); // Rejects if there was an error.\n    }\n\n    rpcPort.addEventListener('message', onMsg);\n\n    // In some cases (like MessageChannel in a worker), you must call .start() to begin receiving messages.\n    // In others, it’s automatic — hence the try/catch.\n    try { rpcPort.start(); } catch (e) { /* start may be no-op */ }\n\n    // Transfer ArrayBuffer if present for zero-copy\n    if (fileOrArrayBuffer instanceof ArrayBuffer) {\n      // It’s transferable, meaning ownership moves to the main thread without copying.\n      // Faster and memory-efficient.\n      rpcPort.postMessage({ id, action: 'imageCompression', fileOrArrayBuffer, mime, options }, [fileOrArrayBuffer]);\n    } else {\n      // Blob cannot be transferred, post it as-is (main thread will accept)\n      rpcPort.postMessage({ id, action: 'imageCompression', fileOrArrayBuffer, mime, options });\n    }\n  });\n}\n\n/**\n * Decode image buffer and return image data\n * @param {string} sourceType  - avif, jpeg, png, webp\n * @param {object} fileBuffer - The ArrayBuffer object is used to represent a generic raw binary data buffer.\n * @returns {object | Error} - Image data object or throws an Error\n */\nconst decode = async (sourceType, fileBuffer) => {\n  switch (sourceType) {\n    case 'avif':\n      return await _jsquash_avif__WEBPACK_IMPORTED_MODULE_0__[\"default\"](fileBuffer);\n    case 'jpeg':\n      return await _jsquash_jpeg__WEBPACK_IMPORTED_MODULE_1__[\"default\"](fileBuffer);\n    case 'png':\n      return await _jsquash_png__WEBPACK_IMPORTED_MODULE_2__[\"default\"](fileBuffer);\n    case 'webp':\n      return await _jsquash_webp__WEBPACK_IMPORTED_MODULE_3__[\"default\"](fileBuffer);\n    default:\n      throw new Error(`Unknown source type: ${sourceType}`);\n  }\n}\n\n/**\n * \n * @param {string} outputType - avif, jpeg, png, webp \n * @param {object} imageData - Image data object after decoding\n * @returns {ArrayBuffer | false} - Compressed image buffer or false if error\n */\nconst encode = async (outputType, imageData) => {\n  try {\n    switch (outputType) {\n      case 'avif':\n        const avifOptions = {}\n        for (const [key, value] of Object.entries(options)) {\n          if (key.includes('avif')) {\n            const keyName = key.replace('avif_', '')\n            avifOptions[keyName] = value\n          }\n        }\n        return await _jsquash_avif__WEBPACK_IMPORTED_MODULE_4__[\"default\"](imageData, avifOptions);\n      case 'jpeg':\n        const jpegOptions = {}\n        for (const [key, value] of Object.entries(options)) {\n          if (key.includes('jpeg')) {\n            const keyName = key.replace('jpeg_', '')\n            jpegOptions[keyName] = value\n          }\n        }\n        return await _jsquash_jpeg__WEBPACK_IMPORTED_MODULE_5__[\"default\"](imageData, jpegOptions);\n      case 'png':\n        const pngOptions = {}\n        for (const [key, value] of Object.entries(options)) {\n          if (key.includes('png')) {\n            const keyName = key.replace('png_', '')\n            pngOptions[keyName] = value\n          }\n        }\n        return await _jsquash_png__WEBPACK_IMPORTED_MODULE_6__[\"default\"](imageData, pngOptions);\n      case 'webp':\n        const webpOptions = {}\n        for (const [key, value] of Object.entries(options)) {\n          if (key.includes('webp')) {\n            const keyName = key.replace('webp_', '')\n            webpOptions[keyName] = value\n          }\n        }\n        return await _jsquash_webp__WEBPACK_IMPORTED_MODULE_7__[\"default\"](imageData, webpOptions);\n      default:\n        throw new Error(`Unknown output type: ${outputType}`);\n    }\n  } catch (error) {\n    //console.error(error)\n    throw new Error(`Error encoding image: ${error.message}`)\n  }\n\n}\n\n/**\n * Convert image buffer from one format to another\n * @param {string} sourceType - avif, jpeg, png, webp\n * @param {string} outputType - avif, jpeg, png, webp\n * @param {object} fileBuffer - The ArrayBuffer object is used to represent a generic raw binary data buffer.\n * @returns {Promise} - Compressed image buffer or false if error\n */\nconst convert = async (sourceType, outputType, fileBuffer, resizeOptions) => {\n  try {\n    //console.log(`Converting from ${sourceType} to ${outputType}`);\n    if (outputType === 'png') {\n\n      \n      return fileBuffer;\n\n    }\n\n    //*\n    if (sourceType === 'jpeg') {\n      fileBuffer = await compressOnMainThread(\n        fileBuffer,\n        'image/jpeg',\n        {useWebWorker: true}\n      );\n    }\n    //*/\n\n    const imageData = await decode(sourceType, fileBuffer);\n\n    \n    return encode(outputType, imageData);\n  } catch (error) {\n    console.error('Error during image processing:', error);\n    throw new Error('Failed to process image, check the console for more information. ' + error);\n  }\n}\n\n/**\n * Convert Blob to base64 encoded image string\n * @param {object} blob - The Blob object represents a blob, which is a file-like object of immutable, raw data.\n * @returns {Promise<string>} - Base64 encoded image string\n */\nconst blobToBase64 = (blob) => {\n  return new Promise((resolve, _) => {\n    const reader = new FileReader();\n    reader.onloadend = () => resolve(reader.result);\n    reader.readAsDataURL(blob);\n  });\n}\n\nconst showOutput = async (imageBuffer, outputType) => {\n  if (!imageBuffer) {\n    return false;\n  }\n  const imageBlob = new Blob([imageBuffer], { type: `image/${outputType}` });\n  const base64String = await blobToBase64(imageBlob);\n\n  return base64String;\n}\n\nconst fetchImageBuffer = async (url, name, mime, outputType) => {\n  const response = await fetch(url);\n  if (!response.ok) {\n    return false;\n  }\n\n  const blob = await response.blob();\n\n  if (outputType === 'png') {\n    // For PNG, we need to return blob\n    return blob;\n  }\n\n  const metadata = {\n    type: mime\n  }\n\n  const imageObj = new File([blob], name, metadata);\n  const fileBuffer = await imageObj.arrayBuffer();\n\n  return fileBuffer;\n}\n\n/**\n * Compresses a JPEG image.\n * @param {Object} params - The parameters for compression.\n * @param {string} params.sourceType - The source type of the image.\n * @param {string} params.outputType - The desired output type.\n * @param {Object} params.resizeOptions - The options for resizing the image.\n * @returns {Promise<string>} - The base64 encoded compressed image.\n */\nconst compressJPEG = async ({ fileBuffer, sourceType, outputType, resizeOptions }) => {\n  //*\n  const imageBuffer = await convert(sourceType, outputType, fileBuffer, resizeOptions);\n  const base64 = await showOutput(imageBuffer, outputType);\n\n  return base64;\n  //*/\n\n  /*\n  const browserImageCompressionOptions = {\n    maxSizeMB: Number.POSITIVE_INFINITY,\n    maxWidthOrHeight: Number.POSITIVE_INFINITY,\n    initialQuality: 0.81,\n    useWebWorker: true,\n  }\n\n  try {\n    // Use main thread to run imageCompression to avoid \"Image\" missing in worker on iOS\n    const compressedFileBuffer = await compressOnMainThread(\n      fileBuffer,\n      'image/jpeg',\n      browserImageCompressionOptions\n    );\n\n    const imageBuffer = await convert('jpeg', outputType, compressedFileBuffer, resizeOptions);\n    const base64 = await showOutput(imageBuffer, outputType);\n    return base64;\n  } catch (error) {\n    console.error(error);\n    throw new Error('Failed to process JPEG, check the console for more information.');\n  }\n  //*/\n}\n\n/**\n * Compresses a PNG image.\n * @param {Object} params - The parameters for compression.\n * @param {string} params.outputType - The desired output type.\n * @param {Object} params.resizeOptions - The options for resizing the image.\n * @returns {Promise<string>} - The base64 encoded compressed image.\n */\nconst compressPNG = async ({ fileBuffer, outputType, resizeOptions }) => {\n  const pngOptions = {};\n  for (const [key, value] of Object.entries(options)) {\n    if (key.includes('png')) {\n      const keyName = key.replace('png_', '');\n      pngOptions[keyName] = value;\n    }\n  }\n  \n  const browserImageCompressionOptions = {\n    maxSizeMB: Number.POSITIVE_INFINITY,\n    maxWidthOrHeight: Number.POSITIVE_INFINITY,\n    initialQuality: pngOptions?.quality,\n    useWebWorker: true,\n  }\n\n  //if (fileBuffer instanceof ArrayBuffer) { // for thumbnails\n    //fileBuffer = new Blob([fileBuffer], { type: 'image/png' });\n  //}\n\n  try {\n    // Use main thread to run imageCompression to avoid \"Image\" missing in worker on iOS\n    const compressedFileBuffer = await compressOnMainThread(\n      fileBuffer,\n      'image/png',\n      browserImageCompressionOptions\n    );\n\n    const imageBuffer = await convert('png', outputType, compressedFileBuffer, resizeOptions);\n    const base64 = await showOutput(imageBuffer, outputType);\n    return base64;\n  } catch (error) {\n    console.error(error);\n    throw new Error('Failed to process PNG, check the console for more information.');\n  }\n}\n\n/**\n * Compresses a WEBP image.\n * @param {Object} params - The parameters for compression.\n * @param {string} params.sourceType - The source type of the image.\n * @param {string} params.outputType - The desired output type.\n * @param {Object} params.resizeOptions - The options for resizing the image.\n * @returns {Promise<string>} - The base64 encoded compressed image.\n */\nconst compressWEBP = async ({ fileBuffer, sourceType, outputType, resizeOptions }) => {\n\n  const imageBuffer = await convert(sourceType, outputType, fileBuffer, resizeOptions);\n  const base64 = await showOutput(imageBuffer, outputType);\n\n  return base64;\n}\n\n/**\n * Compresses an AVIF image.\n * @param {Object} params - The parameters for compression.\n * @param {string} params.sourceType - The source type of the image.\n * @param {string} params.outputType - The desired output type.\n * @param {Object} params.resizeOptions - The options for resizing the image.\n * @returns {Promise<string>} - The base64 encoded compressed image.\n */\nconst compressAVIF = async ({ fileBuffer, sourceType, outputType, resizeOptions }) => {\n\n  const imageBuffer = await convert(sourceType, outputType, fileBuffer, resizeOptions);\n  const base64 = await showOutput(imageBuffer, outputType);\n\n  return base64;\n}\n\n\n\n// get proportional dimensions for thumbnail\n// based on original image dimensions and thumbnail size name\nconst getThumbnailDimensions = (thumbnailDimensions, originalImageDimensions) => {\n  const { width: originalWidth, height: originalHeight } = originalImageDimensions;\n  const aspectRatioHeight = originalHeight / originalWidth;\n  const aspectRatioWidth = originalWidth / originalHeight;\n  let sizeWidth, sizeHeight;\n\n  thumbnailDimensions.width = thumbnailDimensions.width === 0 ? 9999 : thumbnailDimensions.width;\n  thumbnailDimensions.height = thumbnailDimensions.height === 0 ? 9999 : thumbnailDimensions.height;\n  \n  if (originalWidth > originalHeight) {\n    sizeWidth = thumbnailDimensions.width;\n    sizeHeight = Math.round((originalHeight / originalWidth) * sizeWidth);\n  }\n  else {\n    sizeHeight = thumbnailDimensions.height;\n    sizeWidth = Math.round((originalWidth / originalHeight) * sizeHeight);\n  }\n\n  // Ensure both dimensions are within the max values\n  if (sizeWidth > thumbnailDimensions.width) {\n    sizeWidth = thumbnailDimensions.width;\n    sizeHeight = thumbnailDimensions.width * aspectRatioHeight;\n  }\n\n  if (sizeHeight > thumbnailDimensions.height) {\n    sizeHeight = thumbnailDimensions.height;\n    sizeWidth = thumbnailDimensions.height / aspectRatioWidth;\n  }\n  return { width: sizeWidth, height: sizeHeight };\n}\n\nconst getImageDimensions = async (file) => {\n  let blob;\n  if (file instanceof Blob) {\n    blob = file;\n  } else if (file instanceof ArrayBuffer) {\n    blob = new Blob([file]);\n  } else {\n    throw new Error('Unsupported file type for getImageDimensions');\n  }\n  const bitmap = await createImageBitmap(blob);\n  return { width: bitmap.width, height: bitmap.height };\n}\n\nconst compressAndAssign = async (compressFunction, { url, fetchUrl, name, sourceType, outputType, mime, isPreview, file }) => {\n\n  //console.log('Compressing image:', name, sourceType, outputType);\n\n  // fetchUrl is a same-origin proxy URL used when the image is served from a\n  // cross-origin CDN (e.g. WP Offload Media → GCS/S3).  The original url is kept\n  // for reference but the actual fetch uses the proxy to avoid CORS errors.\n  const effectiveUrl = fetchUrl || url;\n\n  if (!effectiveUrl && !file) {\n    return '';\n  }\n\n  let fileBuffer;\n\n  if (effectiveUrl) {\n    fileBuffer = await fetchImageBuffer(effectiveUrl, name, mime, outputType);\n  } else if (file) {\n    // If file is provided, use it directly\n    fileBuffer = await file.arrayBuffer();\n  }\n\n  if (!fileBuffer || fileBuffer.byteLength === 0) {\n    throw new Error(`Fetched image from ${effectiveUrl} is empty.`);\n  }\n\n  // Reject clearly when the on-disk bytes are not a decodable JPEG/PNG/WebP/AVIF.\n  if (fileBuffer instanceof ArrayBuffer && fileBuffer.byteLength >= 3) {\n    const magic = Array.from(new Uint8Array(fileBuffer.slice(0, 8))).map(b => b.toString(16).padStart(2, '0')).join(' ');\n    const looksJpeg = magic.startsWith('ff d8 ff');\n    const looksPng = magic.startsWith('89 50 4e 47');\n    const looksWebp = magic.startsWith('52 49 46 46');\n    const looksAvif = magic.includes('66 74 79 70'); // ftyp\n    const ok =\n      (sourceType === 'jpeg' && looksJpeg) ||\n      (sourceType === 'png' && looksPng) ||\n      (sourceType === 'webp' && looksWebp) ||\n      (sourceType === 'avif' && looksAvif) ||\n      (outputType === 'png' && (looksPng || looksJpeg || looksWebp));\n    if (!ok && (sourceType === 'jpeg' || sourceType === 'png' || sourceType === 'webp' || sourceType === 'avif')) {\n      throw new Error(\n        `The source image could not be decoded (file is not a valid ${sourceType.toUpperCase()}; magic=${magic}). Restore from a Squeeze backup if available.`\n      );\n    }\n  }\n\n  const resizeOptions =  {};\n  let base64;\n\n  if (compressFunction === compressPNG) {\n    base64 = await compressFunction({ fileBuffer, outputType, resizeOptions });\n  } else {\n    base64 = await compressFunction({ fileBuffer, sourceType, outputType, resizeOptions, file });\n  }\n\n  return base64;\n}\n\nconst compressAndAssignThumbs = async (compressFunction, { name, sourceType, outputType, mime, sizes, isAllSizes = false, file, originalResize = {} }, skipFull = false) => {\n  const compressThumbs = options.compress_thumbs;\n  const base64Sizes = {}\n  const deleteSizes = []\n  let imageDimensions;\n\n  if (!sizes) {\n    return { base64Sizes, deleteSizes };\n  }\n\n  if (file) {\n    imageDimensions = await getImageDimensions(file);\n  }\n\n  for (const [key, value] of Object.entries(sizes)) {\n    if (skipFull && key === 'full') { // skip full size if no scaled image\n      continue;\n    }\n\n    //console.log('Processing size:', key, value);\n\n    const sizeURL = value.url;\n    // fetchUrl is a same-origin proxy URL injected by squeeze.js when sizeURL is cross-origin.\n    // We use it for the actual fetch to avoid CORS errors (e.g. WP Offload Media → GCS/S3),\n    // but return sizeURL in the results so PHP can still derive the correct filename.\n    const sizeFetchURL = value.fetchUrl || sizeURL;\n    const sizeWidth = value.width;\n    const sizeHeight = value.height;\n    const sizeCrop = value.crop || false;\n    let sizeBase64;\n    let fileBuffer;\n\n    // After resizing the original, thumbs that are >= the new original in either\n    // dimension are useless — flag them for deletion (even if not in compress_thumbs).\n    \n\n    if (!(key in compressThumbs) && !isAllSizes) {\n      continue;\n    }\n\n    const resizeOptions =  {};\n\n    if (sizeFetchURL) {\n      fileBuffer = await fetchImageBuffer(sizeFetchURL, name, mime, outputType);\n    } else if (file) {\n      // this method is used for squeezing thumbnails before generating them, so we need to calculate dimensions based on original image\n      const sizeDimensions = getThumbnailDimensions({width: sizeWidth, height: sizeHeight}, imageDimensions);\n      //console.log('sizeDimensions', sizeDimensions, sizeWidth, sizeHeight, imageDimensions);\n\n      // If file is provided, use it directly\n      const fileObj = new File([file], name, { type: mime });\n      fileBuffer = await fileObj.arrayBuffer();\n      resizeOptions['needResize'] = true;\n      resizeOptions['fitMethod'] = 'contain';\n      resizeOptions['width'] = sizeCrop ? sizeWidth : Math.round(sizeDimensions.width);\n      resizeOptions['height'] = sizeCrop ? sizeHeight : Math.round(sizeDimensions.height);\n    }\n\n    if (!fileBuffer || fileBuffer.byteLength === 0) {\n      console.warn(`Fetched image from ${sizeURL} is empty.`)\n      continue;\n    }\n\n    if (compressFunction === compressPNG) {\n      sizeBase64 = await compressFunction({ fileBuffer, outputType, resizeOptions });\n    } else {\n      sizeBase64 = await compressFunction({ fileBuffer, sourceType, outputType, mime, resizeOptions });\n    }\n\n    Object.assign(base64Sizes, { [key]: { 'url': sizeURL, 'base64': sizeBase64, 'width': resizeOptions['width'] ?? sizeWidth, 'height': resizeOptions['height'] ?? sizeHeight } });\n    \n  }\n\n  return { base64Sizes, deleteSizes };\n}\n\nonmessage = async function (e) {\n  if (e.ports && e.ports[0]) {\n    rpcPort = e.ports[0];\n    try { rpcPort.start(); } catch (err) { /* some browsers require start() */ }\n  }\n\n  const action = e.data.action;\n\n  if (action === 'compress') {\n\n    //console.log('Worker: Message received from main script', JSON.stringify(e.data, null, 2));\n    const { format, url, fetchUrl, name, sourceType, outputType, mime, sizes, skipFull, isPreview, file, base64Compressed, base64WebpCompressed, type } = e.data;\n    options = e.data.options;\n\n    try {\n      let base64 = base64Compressed || ''; // base64Compressed is used for already compressed image, e.g. during image upload\n      let base64Webp = base64WebpCompressed || '';\n      let base64Sizes, base64SizesWebp;\n      let deleteSizes = [];\n      // fetchUrl is a same-origin proxy URL for the main image (cross-origin CDN compat).\n      const effectiveUrl = fetchUrl || url;\n      const base64Args = { url, fetchUrl, name, sourceType, outputType, mime, isPreview, file };\n      // Compute post-resize original dimensions once (premium max_width/max_height).\n      const originalResize =  {};\n      const base64SizesArgs = { name, sourceType, outputType, mime, sizes, file, originalResize };\n\n      switch (format) {\n        case 'avif':\n          base64 = base64 ? base64Compressed : await compressAndAssign(compressAVIF, base64Args);\n          ({ base64Sizes, deleteSizes } = await compressAndAssignThumbs(compressAVIF, base64SizesArgs, skipFull));\n          break;\n        case 'jpeg':\n          if ( options.direct_webp ) {\n            base64Args.outputType = 'webp';\n            base64SizesArgs.outputType = 'webp';\n            //base64SizesArgs.isAllSizes = true; // to convert all sizes to webp\n            base64 = base64 ? base64Compressed : await compressAndAssign(compressJPEG, base64Args);\n            ({ base64Sizes, deleteSizes } = await compressAndAssignThumbs(compressJPEG, base64SizesArgs, skipFull));\n          } else {\n            base64 = base64 ? base64Compressed : await compressAndAssign(compressJPEG, base64Args); // take compressed image if available (e.g. during image upload)\n            ({ base64Sizes, deleteSizes } = await compressAndAssignThumbs(compressJPEG, base64SizesArgs, skipFull));\n\n            if (options.auto_webp) {\n              base64Args.outputType = 'webp';\n              base64SizesArgs.outputType = 'webp';\n              base64SizesArgs.isAllSizes = true; // to convert all sizes to webp\n              base64Webp = base64Webp ? base64WebpCompressed : await compressAndAssign(compressJPEG, base64Args);\n              ({ base64Sizes: base64SizesWebp } = await compressAndAssignThumbs(compressJPEG, base64SizesArgs, skipFull));\n            }\n          }\n\n          break;\n        case 'png':\n          if ( options.direct_webp ) {\n            base64Args.outputType = 'webp';\n            base64SizesArgs.outputType = 'webp';\n            //base64SizesArgs.isAllSizes = true; // to compress all sizes to webp\n            base64 = base64 ? base64Compressed : await compressAndAssign(compressPNG, base64Args);\n            ({ base64Sizes, deleteSizes } = await compressAndAssignThumbs(compressPNG, base64SizesArgs, skipFull));\n          } else {\n            base64 = base64 ? base64Compressed : await compressAndAssign(compressPNG, base64Args); // take compressed image if available (e.g. during image upload)\n            ({ base64Sizes, deleteSizes } = await compressAndAssignThumbs(compressPNG, base64SizesArgs, skipFull));\n\n            if (options.auto_webp) {\n              base64Args.outputType = 'webp';\n              base64SizesArgs.outputType = 'webp';\n              base64SizesArgs.isAllSizes = true; // to compress all sizes to webp\n              base64Webp = base64Webp ? base64WebpCompressed : await compressAndAssign(compressPNG, base64Args);\n              ({ base64Sizes: base64SizesWebp } = await compressAndAssignThumbs(compressPNG, base64SizesArgs, skipFull));\n            }\n          }\n          \n          break;\n        case 'webp':\n          base64 = base64 ? base64Compressed : await compressAndAssign(compressWEBP, base64Args);\n          ({ base64Sizes, deleteSizes } = await compressAndAssignThumbs(compressWEBP, base64SizesArgs, skipFull));\n          break;\n      }\n\n      postMessage({\n        'base64': base64,\n        'base64Sizes': base64Sizes,\n        'base64Webp': base64Webp,\n        'base64SizesWebp': base64SizesWebp,\n        \n        'isDirectWebp': options.direct_webp,\n      });\n    } catch (error) {\n      console.error(error);\n      postMessage({\n        'error': error\n      });\n    }\n  }\n}\n\n//# sourceURL=webpack:///./assets/js/worker.js?");

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