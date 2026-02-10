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

/***/ "./assets/js/squeeze.js":
/*!******************************!*\
  !*** ./assets/js/squeeze.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ SQUEEZE)\n/* harmony export */ });\n/* harmony import */ var _jsquash_avif__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jsquash/avif */ \"./node_modules/@jsquash/avif/decode.js\");\n/* harmony import */ var _jsquash_avif__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @jsquash/avif */ \"./node_modules/@jsquash/avif/encode.js\");\n/* harmony import */ var _jsquash_webp__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @jsquash/webp */ \"./node_modules/@jsquash/webp/decode.js\");\n/* harmony import */ var _jsquash_webp__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @jsquash/webp */ \"./node_modules/@jsquash/webp/encode.js\");\n/* harmony import */ var _jsquash_jpeg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @jsquash/jpeg */ \"./node_modules/@jsquash/jpeg/decode.js\");\n/* harmony import */ var _jsquash_jpeg__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @jsquash/jpeg */ \"./node_modules/@jsquash/jpeg/encode.js\");\n/* harmony import */ var _jsquash_png__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @jsquash/png */ \"./node_modules/@jsquash/png/decode.js\");\n/* harmony import */ var _jsquash_png__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @jsquash/png */ \"./node_modules/@jsquash/png/encode.js\");\n/* harmony import */ var _jsquash_oxipng_optimise__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @jsquash/oxipng/optimise */ \"./node_modules/@jsquash/oxipng/optimise.js\");\n/* harmony import */ var _jsquash_resize__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @jsquash/resize */ \"./node_modules/@jsquash/resize/index.js\");\n\r\n\r\n\r\n\r\n\r\n\r\nconst { __ } = wp.i18n; // Import __() from wp.i18n\r\n\r\nclass SQUEEZE {\r\n\r\n  constructor(squeeze) {\r\n    this.options = JSON.parse(squeeze.options); // plugin options\r\n    this.nonce = squeeze.nonce; // nonce\r\n    this.ajaxUrl = squeeze.ajaxUrl; // ajax url\r\n    //this.worker = new Worker(`${squeeze.pluginUrl}assets/js/worker.js`); // worker url\r\n    this.worker = new Worker(new URL(/* worker import */ __webpack_require__.p + __webpack_require__.u(\"assets_js_squeeze_js-assets_js_worker_js\"), __webpack_require__.b), {type: undefined}); // worker url\r\n  }\r\n\r\n  /**\r\n   * Decode image buffer and return image data\r\n   * @param {string} sourceType  - avif, jpeg, png, webp\r\n   * @param {object} fileBuffer - The ArrayBuffer object is used to represent a generic raw binary data buffer.\r\n   * @returns {object | Error} - Image data object or throws an Error\r\n   */\r\n  decode = async (sourceType, fileBuffer) => {\r\n    switch (sourceType) {\r\n      case 'avif':\r\n        return await _jsquash_avif__WEBPACK_IMPORTED_MODULE_0__[\"default\"](fileBuffer);\r\n      case 'jpeg':\r\n        return await _jsquash_jpeg__WEBPACK_IMPORTED_MODULE_1__[\"default\"](fileBuffer);\r\n      case 'png':\r\n        return await _jsquash_png__WEBPACK_IMPORTED_MODULE_2__[\"default\"](fileBuffer);\r\n      case 'webp':\r\n        return await _jsquash_webp__WEBPACK_IMPORTED_MODULE_3__[\"default\"](fileBuffer);\r\n      default:\r\n        throw new Error(`Unknown source type: ${sourceType}`);\r\n    }\r\n  }\r\n\r\n  /**\r\n   * \r\n   * @param {string} outputType - avif, jpeg, png, webp \r\n   * @param {object} imageData - Image data object after decoding\r\n   * @returns {ArrayBuffer | false} - Compressed image buffer or false if error\r\n   */\r\n  encode = async (outputType, imageData) => {\r\n    try {\r\n      switch (outputType) {\r\n        case 'avif':\r\n          const avifOptions = {}\r\n          for (const [key, value] of Object.entries(this.options)) {\r\n            if (key.includes('avif')) {\r\n              const keyName = key.replace('avif_', '')\r\n              avifOptions[keyName] = value\r\n            }\r\n          }\r\n          return await _jsquash_avif__WEBPACK_IMPORTED_MODULE_4__[\"default\"](imageData, avifOptions);\r\n        case 'jpeg':\r\n          const jpegOptions = {}\r\n          for (const [key, value] of Object.entries(this.options)) {\r\n            if (key.includes('jpeg')) {\r\n              const keyName = key.replace('jpeg_', '')\r\n              jpegOptions[keyName] = value\r\n            }\r\n          }\r\n          return await _jsquash_jpeg__WEBPACK_IMPORTED_MODULE_5__[\"default\"](imageData, jpegOptions);\r\n        case 'png':\r\n          const pngOptions = {}\r\n          for (const [key, value] of Object.entries(this.options)) {\r\n            if (key.includes('png')) {\r\n              const keyName = key.replace('png_', '')\r\n              pngOptions[keyName] = value\r\n            }\r\n          }\r\n          return await _jsquash_png__WEBPACK_IMPORTED_MODULE_6__[\"default\"](imageData, pngOptions);\r\n        case 'webp':\r\n          const webpOptions = {}\r\n          for (const [key, value] of Object.entries(this.options)) {\r\n            if (key.includes('webp')) {\r\n              const keyName = key.replace('webp_', '')\r\n              webpOptions[keyName] = value\r\n            }\r\n          }\r\n          return await _jsquash_webp__WEBPACK_IMPORTED_MODULE_7__[\"default\"](imageData, webpOptions);\r\n        default:\r\n          throw new Error(`Unknown output type: ${outputType}`);\r\n      }\r\n    } catch (error) {\r\n      //console.error(error)\r\n      throw new Error(`Error encoding image: ${error.message}`)\r\n    }\r\n\r\n  }\r\n\r\n  /**\r\n   * Convert image buffer from one format to another\r\n   * @param {string} sourceType - avif, jpeg, png, webp\r\n   * @param {string} outputType - avif, jpeg, png, webp\r\n   * @param {object} fileBuffer - The ArrayBuffer object is used to represent a generic raw binary data buffer.\r\n   * @returns {Promise} - Compressed image buffer or false if error\r\n   */\r\n  convert = async (sourceType, outputType, fileBuffer, resizeOptions, pngOptions = {}) => {\r\n    try {\r\n      if (outputType === 'png') { // TBD: https://github.com/jamsinclair/jSquash/tree/main/packages/oxipng#activate-multithreading\r\n        \r\n        fileBuffer = await (0,_jsquash_oxipng_optimise__WEBPACK_IMPORTED_MODULE_8__[\"default\"])(fileBuffer, pngOptions);\r\n        \r\n        \r\n        return fileBuffer;\r\n        \r\n      }\r\n\r\n      const imageData = await this.decode(sourceType, fileBuffer);\r\n\r\n      \r\n      return this.encode(outputType, imageData);\r\n    } catch (error) {\r\n      console.error('Error during image processing:', error);\r\n      throw new Error('Failed to process image, check the console for more information.');\r\n    }\r\n  }\r\n\r\n  /**\r\n   * Convert Blob to base64 encoded image string\r\n   * @param {object} blob - The Blob object represents a blob, which is a file-like object of immutable, raw data.\r\n   * @returns {Promise<string>} - Base64 encoded image string\r\n   */\r\n  blobToBase64 = (blob) => {\r\n    return new Promise((resolve, _) => {\r\n      const reader = new FileReader();\r\n      reader.onloadend = () => resolve(reader.result);\r\n      reader.readAsDataURL(blob);\r\n    });\r\n  }\r\n\r\n  showOutput = async (imageBuffer, outputType) => {\r\n    if (!imageBuffer) {\r\n      return false;\r\n    }\r\n    const imageBlob = new Blob([imageBuffer], { type: `image/${outputType}` });\r\n    const base64String = await this.blobToBase64(imageBlob);\r\n\r\n    return base64String;\r\n  }\r\n\r\n  /**\r\n   * Compresses a JPEG image.\r\n   * @param {Object} params - The parameters for compression.\r\n   * @param {string} params.url - The URL of the image.\r\n   * @param {string} params.name - The name of the image file.\r\n   * @param {string} params.sourceType - The source type of the image.\r\n   * @param {string} params.outputType - The desired output type.\r\n   * @param {string} params.mime - The MIME type of the image.\r\n   * @param {Object} params.resizeOptions - The options for resizing the image.\r\n   * @returns {Promise<string>} - The base64 encoded compressed image.\r\n   */\r\n  compressJPEG = async ({ url, name, sourceType, outputType, mime, resizeOptions }) => {\r\n    const response = await fetch(url);\r\n    const blob = await response.blob();\r\n    const metadata = {\r\n      type: mime\r\n    };\r\n    const imageObj = new File([blob], name, metadata);\r\n    const fileBuffer = await imageObj.arrayBuffer();\r\n    const imageBuffer = await this.convert(sourceType, outputType, fileBuffer, resizeOptions);\r\n    const base64 = await this.showOutput(imageBuffer, outputType);\r\n\r\n    return base64;\r\n  }\r\n\r\n  /**\r\n   * Compresses a PNG image.\r\n   * @param {Object} params - The parameters for compression.\r\n   * @param {string} params.url - The URL of the image.\r\n   * @param {Object} params.options - The options for PNG compression.\r\n   * @param {string} params.outputType - The desired output type.\r\n   * @param {Object} params.resizeOptions - The options for resizing the image.\r\n   * @returns {Promise<string>} - The base64 encoded compressed image.\r\n   */\r\n  compressPNG = async ({ url, outputType, resizeOptions }) => {\r\n    const pngOptions = {};\r\n    for (const [key, value] of Object.entries(this.options)) {\r\n      if (key.includes('png')) {\r\n        const keyName = key.replace('png_', '');\r\n        pngOptions[keyName] = value;\r\n      }\r\n    }\r\n    const fileBuffer = await fetch(url).then(res => res.arrayBuffer());\r\n    const imageBuffer = await this.convert(outputType, outputType, fileBuffer, resizeOptions, pngOptions);\r\n    const base64 = await this.showOutput(imageBuffer, outputType);\r\n\r\n    return base64;\r\n  }\r\n\r\n  /**\r\n   * Compresses a WEBP image.\r\n   * @param {Object} params - The parameters for compression.\r\n   * @param {string} params.url - The URL of the image.\r\n   * @param {string} params.name - The name of the image file.\r\n   * @param {string} params.sourceType - The source type of the image.\r\n   * @param {string} params.outputType - The desired output type.\r\n   * @param {string} params.mime - The MIME type of the image.\r\n   * @param {Object} params.resizeOptions - The options for resizing the image.\r\n   * @returns {Promise<string>} - The base64 encoded compressed image.\r\n   */\r\n  compressWEBP = async ({ url, name, sourceType, outputType, mime, resizeOptions }) => {\r\n    const webpResponse = await fetch(url);\r\n    const webpBlob = await webpResponse.blob();\r\n    const webpMetadata = {\r\n      type: mime\r\n    };\r\n    const webpImageObj = new File([webpBlob], name, webpMetadata);\r\n    const fileBuffer = await webpImageObj.arrayBuffer();\r\n    const imageBuffer = await this.convert(sourceType, outputType, fileBuffer, resizeOptions);\r\n    const base64 = await this.showOutput(imageBuffer, outputType);\r\n\r\n    return base64;\r\n  }\r\n\r\n  /**\r\n   * Compresses an AVIF image.\r\n   * @param {Object} params - The parameters for compression.\r\n   * @param {string} params.url - The URL of the image.\r\n   * @param {string} params.name - The name of the image file.\r\n   * @param {string} params.sourceType - The source type of the image.\r\n   * @param {string} params.outputType - The desired output type.\r\n   * @param {string} params.mime - The MIME type of the image.\r\n   * @param {Object} params.resizeOptions - The options for resizing the image.\r\n   * @returns {Promise<string>} - The base64 encoded compressed image.\r\n   */\r\n  compressAVIF = async ({ url, name, sourceType, outputType, mime, resizeOptions }) => {\r\n    const avifResponse = await fetch(url);\r\n    const avifBlob = await avifResponse.blob();\r\n    const avifMetadata = {\r\n      type: mime\r\n    };\r\n    const avifImageObj = new File([avifBlob], name, avifMetadata);\r\n    const fileBuffer = await avifImageObj.arrayBuffer();\r\n    const imageBuffer = await this.convert(sourceType, outputType, fileBuffer, resizeOptions);\r\n    const base64 = await this.showOutput(imageBuffer, outputType);\r\n\r\n    return base64;\r\n  }\r\n\r\n  \r\n\r\n  compressAndAssign = async (compressFunction, { url, name, sourceType, outputType, mime }) => {\r\n\r\n    const resizeOptions =  {};\r\n    let base64;\r\n\r\n    if (compressFunction === this.compressPNG) {\r\n      base64 = await compressFunction({ url, outputType, resizeOptions });\r\n    } else {\r\n      base64 = await compressFunction({ url, name, sourceType, outputType, mime, resizeOptions });\r\n    }\r\n\r\n    return base64;\r\n  }\r\n\r\n  compressAndAssignThumbs = async (compressFunction, { name, sourceType, outputType, mime, sizes }, skipFull = false) => {\r\n    const compressThumbs = this.options.compress_thumbs;\r\n    const base64Sizes = {}\r\n\r\n    if (!sizes) {\r\n      return base64Sizes;\r\n    }\r\n\r\n    for (const [key, value] of Object.entries(sizes)) {\r\n      if (!(key in compressThumbs)) {\r\n        continue;\r\n      }\r\n\r\n      if (skipFull && key === 'full') { // skip full size if no scaled image\r\n        continue;\r\n      }\r\n\r\n      const sizeURL = value.url;\r\n      const sizeWidth = value.width;\r\n      const sizeHeight = value.height;\r\n      const sizeName = `${name}-${sizeWidth}x${sizeHeight}`;\r\n      let sizeBase64;\r\n\r\n      if (compressFunction === this.compressPNG) {\r\n        sizeBase64 = await compressFunction({ url: sizeURL, outputType });\r\n      } else {\r\n        sizeBase64 = await compressFunction({ url: sizeURL, name: sizeName, sourceType, outputType, mime });\r\n      }\r\n\r\n      Object.assign(base64Sizes, { [key]: { 'url': sizeURL, 'base64': sizeBase64 } });\r\n    }\r\n\r\n    return base64Sizes;\r\n  }\r\n\r\n  timeoutCompress = (ms, promise) => {\r\n    return new Promise((resolve, reject) => {\r\n      const timeoutId = setTimeout(() => {\r\n        reject(new Error(__('Request timed out.', 'squeeze')));\r\n      }, ms);\r\n\r\n      promise.then(\r\n        (res) => {\r\n          clearTimeout(timeoutId);\r\n          resolve(res);\r\n        },\r\n        (err) => {\r\n          clearTimeout(timeoutId);\r\n          reject(err);\r\n        }\r\n      );\r\n    });\r\n  }\r\n\r\n  handleCompress = async ( attachment ) => {\r\n    const attachmentData = attachment.attributes;\r\n    const url = attachmentData?.originalImageURL ?? attachmentData.url;\r\n    const mime = attachmentData.mime;\r\n    const name = attachmentData.name;\r\n    const filename = attachmentData?.originalImageName ?? attachmentData.filename;\r\n    const attachmentID = attachmentData.id;\r\n    const sizes = attachmentData.sizes;\r\n    const format = mime.split(\"/\")[1];\r\n    const sourceType = format;\r\n    const outputType = format;\r\n    const skipFull = attachmentData.originalImageName === undefined ? true : false;\r\n    const timeout = parseInt(this.options.timeout) * 1000; // convert to milliseconds\r\n\r\n    //console.log(attachmentData, 'attachmentData')\r\n\r\n    let base64;\r\n    let base64Sizes = {};\r\n\r\n    this.worker.postMessage({\r\n      action: 'compress',\r\n      format,\r\n      url,\r\n      name,\r\n      sourceType,\r\n      outputType,\r\n      mime,\r\n      sizes,\r\n      resizeOptions,\r\n      timeout\r\n    });\r\n\r\n    return new Promise((resolve, reject) => {\r\n      this.worker.onmessage = (event) => {\r\n        if (event.data.error) {\r\n          reject(new Error(event.data.error));\r\n        } else {\r\n          resolve(event.data);\r\n        }\r\n      };\r\n\r\n      this.worker.onerror = (error) => {\r\n        reject(new Error(`Worker error: ${error.message}`));\r\n      };\r\n    });\r\n\r\n    /*\r\n    try {\r\n      switch (format) {\r\n        case 'avif':\r\n          base64 = await this.timeoutCompress(timeout, this.compressAndAssign(this.compressAVIF, { url, name, sourceType, outputType, mime, sizes }));\r\n          base64Sizes = await this.timeoutCompress(timeout, this.compressAndAssignThumbs(this.compressAVIF, { name, sourceType, outputType, mime, sizes }, skipFull));\r\n          break;\r\n        case 'jpeg':\r\n          base64 = await this.timeoutCompress(timeout, this.compressAndAssign(this.compressJPEG, { url, name, sourceType, outputType, mime, sizes }));\r\n          base64Sizes = await this.timeoutCompress(timeout, this.compressAndAssignThumbs(this.compressJPEG, { name, sourceType, outputType, mime, sizes }, skipFull));\r\n          break;\r\n        case 'png':\r\n          base64 = await  this.timeoutCompress(timeout, this.compressAndAssign(this.compressPNG, { url, name, sourceType, outputType, mime, sizes }));\r\n          base64Sizes = await  this.timeoutCompress(timeout, this.compressAndAssignThumbs(this.compressPNG, { name, sourceType, outputType, mime, sizes }, skipFull));\r\n          break;\r\n        case 'webp':\r\n          base64 = await this.timeoutCompress(timeout, this.compressAndAssign(this.compressWEBP, { url, name, sourceType, outputType, mime, sizes }));\r\n          base64Sizes = await this.timeoutCompress(timeout, this.compressAndAssignThumbs(this.compressWEBP, { name, sourceType, outputType, mime, sizes }, skipFull));\r\n          break;\r\n      }\r\n\r\n      return {\r\n        'base64': base64,\r\n        'base64Sizes': base64Sizes\r\n      }\r\n    } catch (error) {\r\n      throw new Error(`Compression failed: ${error.message}`);\r\n    }\r\n    //*/\r\n\r\n  }\r\n\r\n  handleUpload = async ({ attachment, base64, type = 'uncompressed', mediaIDs = [] }) => {\r\n\r\n    const attachmentData = attachment.attributes;\r\n    const url = attachmentData?.originalImageURL ?? attachmentData.url;\r\n    const mime = attachmentData.mime;\r\n    const filename = attachmentData?.originalImageName ?? attachmentData.filename;\r\n    const attachmentID = attachmentData.id;\r\n    const format = mime.split(\"/\")[1];\r\n\r\n    //console.log(attachmentData, 'attachmentData')\r\n\r\n    const data = {\r\n      action: 'squeeze_update_attachment',\r\n      _ajax_nonce: this.nonce,\r\n      filename: filename,\r\n      type: 'image',\r\n      format: format,\r\n      base64: base64.base64,\r\n      base64Sizes: base64.base64Sizes,\r\n      attachmentID: attachmentID,\r\n      url: url,\r\n      process: type,\r\n    }\r\n\r\n    //console.log(data, 'squeeze_update_attachment')\r\n\r\n    const uploadResponse = await jQuery.ajax({\r\n      url: this.ajaxUrl, // + '111',\r\n      type: 'POST',\r\n      data: data,\r\n    });\r\n\r\n    if (type === 'uncompressed' || type === 'all' || type === 'path') {\r\n      uploadResponse['mediaIDs'] = mediaIDs;\r\n    }\r\n\r\n    return uploadResponse;\r\n\r\n  }\r\n\r\n  handleBulkUpload = async (type = 'uncompressed', mediaIDs = []) => {\r\n    let currentID;\r\n    let attachment;\r\n\r\n    switch (type) {\r\n      case 'all':\r\n      case 'uncompressed':\r\n        currentID = mediaIDs[0];\r\n        break;\r\n      case 'path':\r\n        currentID = mediaIDs[0]?.filename;\r\n        break;\r\n      default:\r\n        currentID = 0;\r\n        break;\r\n    }\r\n\r\n    if (type === 'path') {\r\n\r\n      attachment = {\r\n        attributes: {\r\n          url: mediaIDs[0].url,\r\n          mime: mediaIDs[0].mime,\r\n          name: mediaIDs[0].name,\r\n          filename: mediaIDs[0].filename,\r\n          id: mediaIDs[0].id,\r\n        }\r\n      }\r\n\r\n    } else {\r\n\r\n      const attachmentResponse = await this.getAttachment(currentID);\r\n      const attachmentData = attachmentResponse.data;\r\n      attachment = {\r\n        attributes: {\r\n          url: attachmentData.url,\r\n          mime: attachmentData.mime,\r\n          name: attachmentData.name,\r\n          filename: attachmentData.filename,\r\n          id: attachmentData.id,\r\n          sizes: attachmentData.sizes,\r\n        }\r\n      }\r\n\r\n    }\r\n\r\n    mediaIDs.shift();\r\n\r\n    const mediaType = attachment.attributes.mime.split(\"/\")[0];\r\n    const mediaSubType = attachment.attributes.mime.split(\"/\")[1];\r\n\r\n    if (!this.maybeCompressAttachment(mediaType, mediaSubType)) {\r\n      return {\r\n        'mediaIDs': mediaIDs,\r\n        'data': __('Skipped', 'squeeze')\r\n      }\r\n    }\r\n\r\n    const compressData = await this.handleCompress( attachment );\r\n    const uploadData = await this.handleUpload({ attachment: attachment, base64: compressData, type: type, mediaIDs: mediaIDs })\r\n\r\n    return uploadData;\r\n\r\n\r\n  }\r\n\r\n  maybeCompressAttachment = (attachmentType, attachmentSubType) => {\r\n    const allowedMimeTypes = ['jpeg', 'png', 'webp', 'avif'];\r\n    const isImage = attachmentType === 'image' && allowedMimeTypes.includes(attachmentSubType)\r\n\r\n    if (isImage) {\r\n      return true;\r\n    }\r\n\r\n    return false;\r\n  }\r\n\r\n  handleRestore = async (attachmentID) => {\r\n    const data = {\r\n      action: 'squeeze_restore_attachment',\r\n      _ajax_nonce: this.nonce,\r\n      attachmentID: attachmentID,\r\n    };\r\n\r\n    const response = await jQuery.ajax({\r\n      url: this.ajaxUrl,\r\n      type: 'POST',\r\n      data: data,\r\n    });\r\n\r\n    return response;\r\n  };\r\n\r\n  // Get list of attachments by path\r\n  getAttachmentsByPath = async (path) => {\r\n\r\n    const data = {\r\n      action: 'squeeze_get_attachment_by_path',\r\n      path: path,\r\n      _ajax_nonce: this.nonce,\r\n    }\r\n\r\n    const response = jQuery.ajax({\r\n      url: this.ajaxUrl,\r\n      type: 'POST',\r\n      data: data,\r\n    });\r\n\r\n    return response;\r\n  }\r\n\r\n  getAttachment = async (attachmentID) => {\r\n    const data = {\r\n      action: 'squeeze_get_attachment',\r\n      _ajax_nonce: this.nonce,\r\n      attachmentID: attachmentID,\r\n    }\r\n\r\n    const response = jQuery.ajax({\r\n      url: this.ajaxUrl,\r\n      type: 'POST',\r\n      data: data,\r\n    });\r\n\r\n    return response;\r\n  }\r\n\r\n\r\n}\n\n//# sourceURL=webpack:///./assets/js/squeeze.js?");

/***/ }),

/***/ "./assets/js/worker.js":
/*!*****************************!*\
  !*** ./assets/js/worker.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _squeeze_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./squeeze.js */ \"./assets/js/squeeze.js\");\n// Description: Web Worker for image compression\r\n\r\n\r\nconst { __ } = wp.i18n; // Import __() from wp.i18n\r\n\r\nonmessage = async function(e) {\r\n  console.log('Worker: Message received from main script', e.data);\r\n  const Squeze = new _squeeze_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](squeezeOptions);\r\n  const { format, url, name, sourceType, outputType, mime, sizes, skipFull, timeout } = e.data;\r\n\r\n  try {\r\n    let base64, base64Sizes;\r\n\r\n    switch (format) {\r\n      case 'avif':\r\n        base64 = await timeoutCompress(timeout, Squeze.compressAndAssign(compressAVIF, { url, name, sourceType, outputType, mime, sizes }));\r\n        base64Sizes = await timeoutCompress(timeout, compressAndAssignThumbs(compressAVIF, { name, sourceType, outputType, mime, sizes }, skipFull));\r\n        break;\r\n      case 'jpeg':\r\n        base64 = await timeoutCompress(timeout, compressAndAssign(compressJPEG, { url, name, sourceType, outputType, mime, sizes }));\r\n        base64Sizes = await timeoutCompress(timeout, compressAndAssignThumbs(compressJPEG, { name, sourceType, outputType, mime, sizes }, skipFull));\r\n        break;\r\n      case 'png':\r\n        base64 = await timeoutCompress(timeout, compressAndAssign(compressPNG, { url, name, sourceType, outputType, mime, sizes }));\r\n        base64Sizes = await timeoutCompress(timeout, compressAndAssignThumbs(compressPNG, { name, sourceType, outputType, mime, sizes }, skipFull));\r\n        break;\r\n      case 'webp':\r\n        base64 = await timeoutCompress(timeout, compressAndAssign(compressWEBP, { url, name, sourceType, outputType, mime, sizes }));\r\n        base64Sizes = await timeoutCompress(timeout, compressAndAssignThumbs(compressWEBP, { name, sourceType, outputType, mime, sizes }, skipFull));\r\n        break;\r\n    }\r\n\r\n    postMessage({\r\n      'base64': base64,\r\n      'base64Sizes': base64Sizes\r\n    });\r\n  } catch (error) {\r\n    console.error('Worker: Error', error);\r\n    postMessage({\r\n      'error': error\r\n    });\r\n  }\r\n}\n\n//# sourceURL=webpack:///./assets/js/worker.js?");

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
/******/ 		var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_jsquash_avif_decode_js-node_modules_jsquash_avif_encode_js-node_modules_-29c710"], () => (__webpack_require__("./assets/js/worker.js")))
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
/******/ 			"assets_js_squeeze_js-assets_js_worker_js": 1
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
/******/ 			return __webpack_require__.e("vendors-node_modules_jsquash_avif_decode_js-node_modules_jsquash_avif_encode_js-node_modules_-29c710").then(next);
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