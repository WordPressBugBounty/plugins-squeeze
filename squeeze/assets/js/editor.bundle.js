/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./assets/js/handlers.js":
/*!*******************************!*\
  !*** ./assets/js/handlers.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "handleBulkButtonClick": () => (/* binding */ handleBulkButtonClick),
/* harmony export */   "handleBulkFromPage": () => (/* binding */ handleBulkFromPage),
/* harmony export */   "handleBulkToggle": () => (/* binding */ handleBulkToggle),
/* harmony export */   "handleButtonsClick": () => (/* binding */ handleButtonsClick),
/* harmony export */   "handleClosePathDialog": () => (/* binding */ handleClosePathDialog),
/* harmony export */   "handleCompressAfterUpload": () => (/* binding */ handleCompressAfterUpload),
/* harmony export */   "handleCompressBeforeUpload": () => (/* binding */ handleCompressBeforeUpload),
/* harmony export */   "handleDirectoryCheck": () => (/* binding */ handleDirectoryCheck),
/* harmony export */   "handleDirectoryClick": () => (/* binding */ handleDirectoryClick),
/* harmony export */   "handleDirectoryPathRestore": () => (/* binding */ handleDirectoryPathRestore),
/* harmony export */   "handleFetchImagesFromPage": () => (/* binding */ handleFetchImagesFromPage),
/* harmony export */   "handleMultiFileFormUpload": () => (/* binding */ handleMultiFileFormUpload),
/* harmony export */   "handleOnLeave": () => (/* binding */ handleOnLeave),
/* harmony export */   "handleRecursiveUpload": () => (/* binding */ handleRecursiveUpload),
/* harmony export */   "handleRestoreBtnClick": () => (/* binding */ handleRestoreBtnClick),
/* harmony export */   "handleSingleBtnClick": () => (/* binding */ handleSingleBtnClick)
/* harmony export */ });
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers.js */ "./assets/js/helpers.js");





const { __, sprintf } = wp.i18n; // Import __() from wp.i18n

const updateUI = (initId, response) => {
  const statusEl = _helpers_js__WEBPACK_IMPORTED_MODULE_0__.elements.postsFilterForm?.querySelector(`#post-${initId} .column-squeeze .squeeze_status`);
  if (statusEl) statusEl.innerHTML = response?.data?.message ?? response?.data ?? response;

  const gridItem = document.querySelector(`.media-frame.mode-grid .attachment[data-id="${initId}"]`);
  if (gridItem) {
    const centered = gridItem.querySelector('.centered');
    const progress = gridItem.querySelector('.media-progress-bar');
    if (centered) centered.style.display = 'block';
    if (progress) progress.remove();
    gridItem.classList.remove('uploading');
  }
};

const getTotalPages = (path) => {
  const selectors = {
    uncompressed: "input[name='squeeze_bulk_uncompressed_pages']",
    all: "input[name='squeeze_bulk_total_pages']"
  };
  const sel = selectors[path];
  const val = sel && document.querySelector(sel)?.value;
  return Number(val) || 1;
};

const checkPaused = (data, page) => {
  if (!_helpers_js__WEBPACK_IMPORTED_MODULE_0__.cachedMediaData.isPaused) return false;
  handleBulkPause(data, page);
  return true;
};

const logAndThumbnail = async (filename, response, wrapper) => {
  const isSuccess = response?.success !== false;
  const message = response?.data?.message ?? response?.data;

  await _helpers_js__WEBPACK_IMPORTED_MODULE_0__.logMessage(message, {
    mediaLogWrapper: wrapper,
    iconId: isSuccess ? 'check-mark-circle-icon' : 'ban-sign-icon',
    isSuccess
  });

  if (!isSuccess) {
    await _helpers_js__WEBPACK_IMPORTED_MODULE_0__.logMessage(__('Skipped — continuing with next image.', 'squeeze'), {
      mediaLogWrapper: wrapper,
      iconId: 'ban-sign-icon',
      isWarning: true
    });
  }

  const titleEl = wrapper?.querySelector('h3');
  if (titleEl && response?.data?.filename) {
    titleEl.textContent = `${__('Media', 'squeeze')} ${filename} (${response.data.filename}):`;
  }

  const thumbUrl = response?.data?.sizes?.thumbnail?.url || response?.data?.url || response?.url;
  if (thumbUrl) {
    const thumb = document.createElement('div');
    thumb.classList.add('media-log-thumbnail');
    thumb.innerHTML = `<img src="${thumbUrl}" alt="${filename}"/>`;
    wrapper?.appendChild(thumb);
  }
};

const handleDirectoryCheck = (event) => {
  _helpers_js__WEBPACK_IMPORTED_MODULE_0__.elements.savePathBtn.disabled = !_helpers_js__WEBPACK_IMPORTED_MODULE_0__.elements.dirContainer.querySelector("input[type='checkbox']:checked");
};

const handleClosePathDialog = (event) => {
  if (!event.target.contains(_helpers_js__WEBPACK_IMPORTED_MODULE_0__.elements.pathDialog)) return;
  _helpers_js__WEBPACK_IMPORTED_MODULE_0__.elements.pathDialog.close();
};

/**
 * Restore .bak sidecars in the Directory Squeeze selected folders (in-place).
 */
const handleDirectoryPathRestore = async (event) => {
  const path = _helpers_js__WEBPACK_IMPORTED_MODULE_0__.elements.pathInput?.value ?? '';

  if (path.replace(/\[\]/g, '').split(',').length === 0 || !path.replace(/\[\]/g, '').split(',')[0] || !path) {
    alert(__('Please enter a valid path!', 'squeeze'));
    return;
  }

  const confirmed = window.confirm(
    __('Restore all Squeeze .bak backups in the selected folders? Live files will be overwritten in place and .bak files will be deleted after a successful restore.', 'squeeze')
  );
  if (!confirmed) {
    return;
  }

  _helpers_js__WEBPACK_IMPORTED_MODULE_0__.disableBulkButtons();
  window.onbeforeunload = handleOnLeave;

  if (_helpers_js__WEBPACK_IMPORTED_MODULE_0__.elements.bulkLogInput) {
    _helpers_js__WEBPACK_IMPORTED_MODULE_0__.elements.bulkLogInput.innerHTML = '';
  }

  await _helpers_js__WEBPACK_IMPORTED_MODULE_0__.logMessage(__('Looking for .bak files in the selected folders…', 'squeeze'), {
    isStart: true,
    title: __('Restore', 'squeeze'),
  });

  try {
    const response = await window.Squeeze.restorePathBackups(path);

    if (!response?.success) {
      const errMsg = response?.data ?? __('Restore failed.', 'squeeze');
      await _helpers_js__WEBPACK_IMPORTED_MODULE_0__.logMessage(typeof errMsg === 'string' ? errMsg : String(errMsg), {
        iconId: 'ban-sign-icon',
        isWarning: true,
      });
      await _helpers_js__WEBPACK_IMPORTED_MODULE_0__.logMessage(__('Directory restore finished with errors.', 'squeeze'), {
        isEnd: true,
        title: __('Bulk restoring has been completed!', 'squeeze'),
      });
      _helpers_js__WEBPACK_IMPORTED_MODULE_0__.showPopupMessage({
        title: __('Restore failed', 'squeeze'),
        message: typeof errMsg === 'string' ? errMsg : __('Restore failed.', 'squeeze'),
        type: 'error',
      });
      return;
    }

    const results = response.data?.results ?? [];
    const summary = response.data?.summary ?? {};

    for (const item of results) {
      const label = item.bak
        ? (item.live ? `${item.bak} → ${item.live}` : item.bak)
        : (item.message || '');
      const mediaLogWrapper = await _helpers_js__WEBPACK_IMPORTED_MODULE_0__.logMessage(label, {
        isProgress: true,
        title: item.bak || __('Backup', 'squeeze'),
      });

      if (item.status === 'restored') {
        await _helpers_js__WEBPACK_IMPORTED_MODULE_0__.logMessage(item.message || __('Restored', 'squeeze'), {
          mediaLogWrapper,
          isSuccess: true,
        });
      } else if (item.status === 'skipped') {
        await _helpers_js__WEBPACK_IMPORTED_MODULE_0__.logMessage(item.message || __('Skipped', 'squeeze'), {
          mediaLogWrapper,
          iconId: 'ban-sign-icon',
          isWarning: true,
        });
      } else {
        await _helpers_js__WEBPACK_IMPORTED_MODULE_0__.logMessage(item.message || __('Failed', 'squeeze'), {
          mediaLogWrapper,
          iconId: 'ban-sign-icon',
          isWarning: true,
        });
      }
    }

    const restored = summary.restored ?? 0;
    const failed = summary.failed ?? 0;
    const skipped = summary.skipped ?? 0;
    const doneMsg = sprintf(
      /* translators: 1: restored count, 2: skipped count, 3: failed count */
      __('Restore finished: %1$d restored, %2$d skipped, %3$d failed.', 'squeeze'),
      restored,
      skipped,
      failed
    );

    await _helpers_js__WEBPACK_IMPORTED_MODULE_0__.logMessage(doneMsg, {
      isEnd: true,
      title: __('Bulk restoring has been completed!', 'squeeze'),
    });
    _helpers_js__WEBPACK_IMPORTED_MODULE_0__.showPopupMessage({
      title: __('Restore complete', 'squeeze'),
      message: doneMsg,
      type: failed > 0 ? 'error' : 'success',
    });
  } catch (error) {
    console.error(error);
    await _helpers_js__WEBPACK_IMPORTED_MODULE_0__.logMessage(error?.message ?? String(error), {
      iconId: 'ban-sign-icon',
      isWarning: true,
    });
    alert(__('An error has occured. Check the console for details.', 'squeeze'));
  } finally {
    window.onbeforeunload = null;
    _helpers_js__WEBPACK_IMPORTED_MODULE_0__.restoreBulkButtons();
  }
};

const handleBulkToggle = (event, process, mediaIDs, page = 1) => {
  const isPaused = event.target.dataset.running === 'true';

  event.target.dataset.running = isPaused ? 'false' : 'true';
  _helpers_js__WEBPACK_IMPORTED_MODULE_0__.updateButtonText(event.target, isPaused ? __('Resume bulk squeezing', 'squeeze') : __('Pause bulk squeezing', 'squeeze'), isPaused ? '#play-button-round-icon' : '#pause-button-icon');

  _helpers_js__WEBPACK_IMPORTED_MODULE_0__.cachedMediaData.isPaused = isPaused;
  _helpers_js__WEBPACK_IMPORTED_MODULE_0__.cachedMediaData.process = process;
  _helpers_js__WEBPACK_IMPORTED_MODULE_0__.cachedMediaData.mediaIDs = mediaIDs;
  _helpers_js__WEBPACK_IMPORTED_MODULE_0__.cachedMediaData.page = page;
  _helpers_js__WEBPACK_IMPORTED_MODULE_0__.cachedMediaData.target = event.target;

  //console.log('handleBulkToggle', cachedMediaData);

  return isPaused;
};

// Handle single compress button click
const handleSingleBtnClick = async (event, timeoutId) => {
  const attachmentID = event.target.dataset.attachment;
  const squeezeStatus = event.target.closest("td").querySelector(".squeeze_status");

  try {
    wp.media.attachment(attachmentID).fetch().then(async (data) => {
      const attachment = { attributes: data };

      let squeezeResponse = null;
      try {
        const compressData = await Squeeze.handleCompress(attachment);
        squeezeResponse = await Squeeze.handleUpload({ attachment, base64: compressData });

        squeezeStatus.innerHTML = squeezeResponse?.data?.message ?? squeezeResponse?.data ?? squeezeResponse;

        if (event.target.closest("td.field")) {
          const table = event.target.closest("td")?.querySelector(".squeeze_status .squeeze-comparison-table");
          if (table) {
            const td = document.createElement("td");
            td.classList.add("field");
            td.style.width = "100%";
            td.appendChild(table);
            event.target.closest("tr").appendChild(td);
          }
        }

        const compressedBytes = _helpers_js__WEBPACK_IMPORTED_MODULE_0__.getCompressedSizeFromSqueezeResponse(squeezeResponse);
        if (compressedBytes != null) {
          const humanReadable = _helpers_js__WEBPACK_IMPORTED_MODULE_0__.humanFileSize(compressedBytes, 0);
          _helpers_js__WEBPACK_IMPORTED_MODULE_0__.updateAttachmentFileSizeDisplay(event.target, {
            bytes: compressedBytes,
            humanReadable,
          });
          _helpers_js__WEBPACK_IMPORTED_MODULE_0__.syncAttachmentFileSizeModel(attachmentID, {
            bytes: compressedBytes,
            humanReadable,
          });
        }

        // Premium comparison preview listens and refreshes before/after labels.
        if (squeezeResponse?.success !== false) {
          document.dispatchEvent(new CustomEvent('squeeze:attachment-file-changed', {
            detail: {
              attachmentId: Number(attachmentID),
              beforeBytes: compressedBytes,
            },
          }));
        }
      } catch (error) {
        console.error(error);
        squeezeStatus.innerHTML = error?.message ?? error;
      } finally {
        // Always preserve the "Restore original" button so the user can still revert
        // after a failed squeeze (result larger than original) or a successful one.
        // The button is safe to keep visible: it only appears when a backup actually exists.
        event.target.closest("td")
          ?.querySelectorAll('button:not([name="squeeze_restore"])')
          .forEach(btn => btn.remove());
        window.onbeforeunload = null;
        if (timeoutId) clearTimeout(timeoutId);
      }
    });
  } catch (error) {
    console.error(error);
    squeezeStatus.innerHTML = error?.message ?? error;
    event.target.remove();
    window.onbeforeunload = null;
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const handleRestoreBtnClick = async (event) => {
  const attachmentID = event.target.dataset.attachment;
  const statusEl = event.target.closest("td").querySelector(".squeeze_status");

  event.target.disabled = true;
  statusEl.innerHTML = _helpers_js__WEBPACK_IMPORTED_MODULE_0__.squeezeLoadingAnimationHTML + __('Restoring the original image...', 'squeeze');

  // if still squeezing after 3 seconds, update the status message
  const timeoutId = _helpers_js__WEBPACK_IMPORTED_MODULE_0__.waitMessage(_helpers_js__WEBPACK_IMPORTED_MODULE_0__.squeezeLoadingAnimationHTML + __('Still restoring... Just need to regenerate thumbnails, please wait a moment.', 'squeeze'), statusEl);

  try {
    const response = await Squeeze.handleRestore(attachmentID);
    statusEl.innerHTML = response?.data?.message ?? response?.data ?? response;

    if (response?.success !== false) {
      await refreshAttachmentFileSizeAfterRestore(event.target, attachmentID, response);
      const restoredBytes = typeof response?.data?.filesize === 'number' ? response.data.filesize : null;
      document.dispatchEvent(new CustomEvent('squeeze:attachment-file-changed', {
        detail: {
          attachmentId: Number(attachmentID),
          beforeBytes: restoredBytes,
        },
      }));
    }
  } catch (error) {
    console.error(error);
    statusEl.innerHTML = error?.message ?? JSON.stringify(error, null, 2);
  } finally {
    // Re-enable whichever compress button is present (varies by prior state).
    event.target.closest('td')
      ?.querySelector(`[name='squeeze_compress_again'], [name='squeeze_compress_single']`)
      ?.removeAttribute('disabled');
    event.target.remove();
    window.onbeforeunload = null;
    if (timeoutId) clearTimeout(timeoutId);
  }
};

/**
 * Refresh modal/sidebar file-size after restore (response payload, Backbone fetch, or getAttachment).
 */
const refreshAttachmentFileSizeAfterRestore = async (contextEl, attachmentID, response = null) => {
  let bytes = typeof response?.data?.filesize === 'number' ? response.data.filesize : null;
  let humanReadable = response?.data?.filesizeHumanReadable || null;

  if (bytes == null && typeof wp !== 'undefined' && wp.media?.attachment) {
    try {
      const model = wp.media.attachment(attachmentID);
      if (model?.fetch) {
        await model.fetch();
        bytes = model.get('filesizeInBytes') ?? bytes;
        humanReadable = model.get('filesizeHumanReadable') || humanReadable;
      }
    } catch (err) {
      // Non-fatal — fall through to Squeeze.getAttachment.
    }
  }

  if (bytes == null && typeof Squeeze !== 'undefined' && Squeeze?.getAttachment) {
    try {
      const attachment = await Squeeze.getAttachment(attachmentID);
      bytes = attachment?.data?.sizes?.full?.filesize ?? null;
    } catch (err) {
      // Non-fatal — leave label unchanged if size cannot be resolved.
    }
  }

  if (bytes == null && !humanReadable) return false;

  humanReadable = humanReadable || _helpers_js__WEBPACK_IMPORTED_MODULE_0__.humanFileSize(bytes, 0);
  _helpers_js__WEBPACK_IMPORTED_MODULE_0__.updateAttachmentFileSizeDisplay(contextEl, { bytes, humanReadable });
  _helpers_js__WEBPACK_IMPORTED_MODULE_0__.syncAttachmentFileSizeModel(attachmentID, { bytes, humanReadable });
  return true;
};

const handleBulkButtonClick = async (event, process, mediaIDs, currentPage) => {
  if (mediaIDs.length === 0) return;

  const totalPages = getTotalPages(process);

  _helpers_js__WEBPACK_IMPORTED_MODULE_0__.disableBulkButtons();
  window.onbeforeunload = handleOnLeave;

  if (_helpers_js__WEBPACK_IMPORTED_MODULE_0__.cachedMediaData.process === process) {
    if (_helpers_js__WEBPACK_IMPORTED_MODULE_0__.cachedMediaData.mediaIDs/*.length > 0*/) {
      mediaIDs = _helpers_js__WEBPACK_IMPORTED_MODULE_0__.cachedMediaData.mediaIDs;
    }
    if (_helpers_js__WEBPACK_IMPORTED_MODULE_0__.cachedMediaData.page) {
      currentPage = _helpers_js__WEBPACK_IMPORTED_MODULE_0__.cachedMediaData.page;
    }
  }

  const isPaused = handleBulkToggle(event, process, mediaIDs, currentPage);
  if (isPaused) {
    _helpers_js__WEBPACK_IMPORTED_MODULE_0__.updateButtonText(event.target, __('Pausing...', 'squeeze'), '#pause-button-icon');
    return;
  }

  _helpers_js__WEBPACK_IMPORTED_MODULE_0__.hideBulkPausedBanner();
  event.target.disabled = false;
  _helpers_js__WEBPACK_IMPORTED_MODULE_0__.focusBulkAction(event.target);

  try {
    const finalResponse = await handleRecursiveUpload(process, mediaIDs, currentPage, true);

    if (finalResponse?.mediaIDs) {
      if (finalResponse.mediaIDs.length === 0 && finalResponse.page >= totalPages) {
        _helpers_js__WEBPACK_IMPORTED_MODULE_0__.logMessage(__('All images have been processed!', 'squeeze'), { isEnd: true });
        _helpers_js__WEBPACK_IMPORTED_MODULE_0__.showPopupMessage( {
          title: __('Squeezing complete', 'squeeze'),
          message: __('All images have been processed!', 'squeeze'),
          type: 'success'
        });
        window.onbeforeunload = null;
        _helpers_js__WEBPACK_IMPORTED_MODULE_0__.restoreBulkButtons();
      }
    }
  } catch (error) {
    console.error(error);
    _helpers_js__WEBPACK_IMPORTED_MODULE_0__.restoreBulkButtons();
    window.onbeforeunload = null;
    alert(__('An error has occured. Check the console for details.', 'squeeze'));
  }
};

const handleButtonsClick = async (event) => {
  const singleBtnName = 'squeeze_compress_single';
  const compressAgainBtnName = 'squeeze_compress_again';
  const restoreBtnName = 'squeeze_restore';
  //console.log(Squeeze?.options?.webp_quality)

  if (event.target.getAttribute("name") === singleBtnName || event.target.getAttribute("name") === compressAgainBtnName) {
    //console.log('Clicked compress button, WebP quality:', Squeeze?.options?.webp_quality);
    
    const statusEl = event.target.closest("td").querySelector(".squeeze_status");

    _helpers_js__WEBPACK_IMPORTED_MODULE_0__.disableAllButtons(event.target.closest("td").querySelectorAll(`button`));
    statusEl.innerHTML = _helpers_js__WEBPACK_IMPORTED_MODULE_0__.squeezeLoadingAnimationHTML + __('Squeezing...', 'squeeze');

    // if still squeezing after 5 seconds, update the status message
    const timeoutId = _helpers_js__WEBPACK_IMPORTED_MODULE_0__.waitMessage(
      _helpers_js__WEBPACK_IMPORTED_MODULE_0__.squeezeLoadingAnimationHTML + 
      __('Still squeezing... This may take a while depending on the image size.', 'squeeze'), 
      statusEl
    );

    window.onbeforeunload = handleOnLeave;
    handleSingleBtnClick(event, timeoutId);
  }

  if (event.target.getAttribute("name") === restoreBtnName) {
    _helpers_js__WEBPACK_IMPORTED_MODULE_0__.disableAllButtons(event.target.closest("td").querySelectorAll(`button`));
    window.onbeforeunload = handleOnLeave;
    handleRestoreBtnClick(event);
  }
}

const handleDirectoryClick = async (event) => {
  if (event.target !== event.currentTarget) return;

  const currentDir = event.target.closest(".directory-item");
  if (!currentDir || currentDir.classList.contains("directory-item--blocked")) return;

  const currentPath = currentDir.dataset.path;
  const parentPath = currentDir.dataset.parent;

  if (parentPath === '/' || currentDir.classList.contains("loading")) return;

  if (currentDir.classList.contains("loaded")) {
    currentDir.classList.toggle("opened");
    return;
  }

  currentDir.classList.add("loading");

  const subDirs = await Squeeze.getDirectories(currentPath);

  _helpers_js__WEBPACK_IMPORTED_MODULE_0__.renderDirectories(subDirs, currentDir, {
    handleDirectoryClick,
    handleDirectoryCheck
  });

  currentDir.classList.remove("loading");
  currentDir.classList.add("loaded", "opened");
}

/**
 * Hadnle warning on page leave
*/
const handleOnLeave = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get('page');
  const isUploadPage = window.location.href.includes('upload.php');
  const isMediaNewPage = window.location.href.includes('media-new.php');
  const isAttachmentPage = window.location.href.includes('post.php') && urlParams.get('action') === 'edit';

  if (page === 'squeeze-bulk' || isMediaNewPage || isAttachmentPage) {
    return __('Are you sure you want to leave this page? The squeezing process will be terminated!', 'squeeze');
  }
  if (isUploadPage) {
    return __('Are you sure you want to leave this page? The settings will not be saved!', 'squeeze');
  }
};

const handleBulkPause = (data, currentPage) => {
  window.onbeforeunload = null;
  _helpers_js__WEBPACK_IMPORTED_MODULE_0__.cachedMediaData.mediaIDs = data;
  _helpers_js__WEBPACK_IMPORTED_MODULE_0__.cachedMediaData.page = currentPage;

  if (_helpers_js__WEBPACK_IMPORTED_MODULE_0__.cachedMediaData.target) {
    _helpers_js__WEBPACK_IMPORTED_MODULE_0__.cachedMediaData.target.dataset.running = 'false';
    _helpers_js__WEBPACK_IMPORTED_MODULE_0__.cachedMediaData.target.disabled = false;
    _helpers_js__WEBPACK_IMPORTED_MODULE_0__.updateButtonText(_helpers_js__WEBPACK_IMPORTED_MODULE_0__.cachedMediaData.target, __('Resume bulk squeezing', 'squeeze'), '#play-button-round-icon');
  }

  _helpers_js__WEBPACK_IMPORTED_MODULE_0__.enableBulkButtonsOnPause(_helpers_js__WEBPACK_IMPORTED_MODULE_0__.cachedMediaData.target);
  _helpers_js__WEBPACK_IMPORTED_MODULE_0__.showBulkPausedBanner();
  _helpers_js__WEBPACK_IMPORTED_MODULE_0__.logMessage(__('Bulk squeezing has been paused!', 'squeeze'), { isPause: true });
};

const handleUpdateChart = (uncompressedImagesCount) => {
  const linearStats = document.querySelector(".squeeze-bulk-media-stats--linear");
  const squeezedImages = document.querySelector(".squeeze-bulk-media-stats-item-value");

  const imagesLeft = _helpers_js__WEBPACK_IMPORTED_MODULE_0__.cachedMediaData.totalImages - uncompressedImagesCount;
  const percentage = parseFloat((imagesLeft / _helpers_js__WEBPACK_IMPORTED_MODULE_0__.cachedMediaData.totalImages) * 100).toFixed(2);

  if (linearStats) {
    const pctEl = linearStats.querySelector(".squeeze-bulk-media-stats-chart-pct");
    if (pctEl) {
      pctEl.textContent = `${percentage}%`;
    }
    linearStats.style.setProperty("--squeeze-progress-pct", percentage);
    if (squeezedImages) {
      squeezedImages.textContent = `${imagesLeft} / ${_helpers_js__WEBPACK_IMPORTED_MODULE_0__.cachedMediaData.totalImages}`;
    }
    return;
  }

  const chartValue = document.querySelector(".squeeze-bulk-media-stats-chart-value > text");
  const chartBar = document.querySelector(".squeeze-bulk-media-stats-chart");

  if (!chartValue || !chartBar) return;

  const dasharray = percentage * 560 / 100;
  chartValue.textContent = `${percentage}%`;
  chartBar.style.setProperty("--squeeze-dasharray", dasharray);

  if (squeezedImages) {
    squeezedImages.textContent = `${imagesLeft} / ${_helpers_js__WEBPACK_IMPORTED_MODULE_0__.cachedMediaData.totalImages}`;
  }
};

const handleRecursiveUpload = async (path, data, currentPage, isUpdateChart = false) => {

  if (!Array.isArray(data)) return { success: false, data: 'No data provided!', mediaIDs: [] }; // when bulk directory path has no images

  const totalPages = getTotalPages(path);

  const noMoreImages = (page, message = __('No more images found!', 'squeeze')) => ({
    success: true,
    data: message,
    mediaIDs: [],
    page,
  });

  if (data.length === 0) {
    currentPage += 1;
    if (currentPage > totalPages || !_helpers_js__WEBPACK_IMPORTED_MODULE_0__.cachedMediaData.lastId) return noMoreImages(currentPage);

    const maybeGetNextMediaIDs = await Squeeze.getNextAttachments(currentPage, path, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.cachedMediaData.lastId);
    if (maybeGetNextMediaIDs.success && maybeGetNextMediaIDs.data.length > 0) {
      const nextMediaIDs = maybeGetNextMediaIDs.data;
      return handleRecursiveUpload(path, nextMediaIDs, currentPage, isUpdateChart);
    } else {
      return noMoreImages(currentPage);
    }
  }

  const initData = [...data];  // initial data

  const filename = data[0]?.filename ? data[0].filename : `ID #${data[0]}`;
  const mediaLogWrapper = await _helpers_js__WEBPACK_IMPORTED_MODULE_0__.logMessage(
    `${__('Start squeezing...', 'squeeze')}`, 
    { title: filename, isStart: true, iconId: 'lemon-dot-icon' }
  );
  _helpers_js__WEBPACK_IMPORTED_MODULE_0__.cachedMediaData.lastId = data[0] || 0; // update lastId to the last processed ID
  const stillWorkingTimeoutId = _helpers_js__WEBPACK_IMPORTED_MODULE_0__.waitBulkMessage(mediaLogWrapper, filename);

  try {
    const response = await Squeeze.handleBulkUpload(path, data);

    clearTimeout(stillWorkingTimeoutId);

    //console.log('handleRecursiveUpload response', response);

    await logAndThumbnail(filename, response, mediaLogWrapper);

    if (isUpdateChart && path !== 'all') {
      let uncompressedImagesCount = 0;
      if (path === 'uncompressed') {
        _helpers_js__WEBPACK_IMPORTED_MODULE_0__.cachedMediaData.uncompressedImages = _helpers_js__WEBPACK_IMPORTED_MODULE_0__.cachedMediaData.uncompressedImages - 1 || 0;
        uncompressedImagesCount = _helpers_js__WEBPACK_IMPORTED_MODULE_0__.cachedMediaData.uncompressedImages;
      } else if (path === 'path') {
        uncompressedImagesCount = response.mediaIDs.length;
      }
      handleUpdateChart(uncompressedImagesCount);
    }

    if (checkPaused(data, currentPage)) {
      return { success: false, data: 'Process has been paused!', mediaIDs: data, page: currentPage };
    }

    updateUI(initData[0], response);

    if (response.mediaIDs.length > 0) {
      return handleRecursiveUpload(path, response.mediaIDs, currentPage, isUpdateChart);
    } else {
      currentPage += 1;
      if (currentPage > totalPages) return { ...response, page: currentPage };

      const lastId = initData[initData.length - 1];
      const maybeGetNextMediaIDs = await Squeeze.getNextAttachments(currentPage, path, lastId);
      if (maybeGetNextMediaIDs.success && maybeGetNextMediaIDs.data.length > 0) {
        const nextMediaIDs = maybeGetNextMediaIDs.data;
        return handleRecursiveUpload(path, nextMediaIDs, currentPage, isUpdateChart);
      }
    }

    return response;

  } catch (error) {
    clearTimeout(stillWorkingTimeoutId);
    console.error(error);
    const errorMessage = error?.message ?? String(error);

    await _helpers_js__WEBPACK_IMPORTED_MODULE_0__.logMessage(errorMessage, { mediaLogWrapper, iconId: 'ban-sign-icon', isWarning: true });
    await _helpers_js__WEBPACK_IMPORTED_MODULE_0__.logMessage(__('Skipped — continuing with next image.', 'squeeze'), {
      mediaLogWrapper,
      iconId: 'ban-sign-icon',
      isWarning: true
    });

    const failedItem = initData[0];
    const remainingIDs = data.filter((item) => item !== failedItem);

    if (remainingIDs.length > 0) {
      return handleRecursiveUpload(path, remainingIDs, currentPage, isUpdateChart);
    } else {
      currentPage += 1;
      if (currentPage > totalPages) return { success: false, data: error, mediaIDs: [], page: currentPage };

      const lastId = initData[initData.length - 1];
      const maybeGetNextMediaIDs = await Squeeze.getNextAttachments(currentPage, path, lastId);
      if (maybeGetNextMediaIDs.success && maybeGetNextMediaIDs.data.length > 0) {
        const nextMediaIDs = maybeGetNextMediaIDs.data;
        return handleRecursiveUpload(path, nextMediaIDs, currentPage, isUpdateChart);
      }
    }
  }
}



/**
 * Handles the compression of image before upload using Squeeze.
 * It compresses only the original image, not the thumbnails.
 * 
 * @param {object} up - The plupload instance
 * @param {object} pluploadFile - The file to be compressed
 * @param {object} compressOptions - The compression options object
 * @returns {boolean} - Returns false to prevent further processing of the file
 */
const handleCompressBeforeUpload = async (up, pluploadFile, compressOptions) => {
  //*
  if (!_helpers_js__WEBPACK_IMPORTED_MODULE_0__.isSqueezeAvailable()) return;

  if (_helpers_js__WEBPACK_IMPORTED_MODULE_0__.isFileAlreadyProcessed(pluploadFile)) return;
  if (!_helpers_js__WEBPACK_IMPORTED_MODULE_0__.isImageFile(pluploadFile)) return;

  const file = _helpers_js__WEBPACK_IMPORTED_MODULE_0__.getNativeFile(pluploadFile);
  const { type, subtype } = _helpers_js__WEBPACK_IMPORTED_MODULE_0__.parseMimeType(file);

  if (!_helpers_js__WEBPACK_IMPORTED_MODULE_0__.maybeCompressAttachment(type, subtype, compressOptions)) return;

  up?.stop();
  window.onbeforeunload = handleOnLeave;

  if (await _helpers_js__WEBPACK_IMPORTED_MODULE_0__.isExcludedFile(pluploadFile, up)) return;
  //*/

  try {
    return await processCompression(up, pluploadFile, file, compressOptions);
  } catch (error) {
    _helpers_js__WEBPACK_IMPORTED_MODULE_0__.handleCompressionError(error, up, pluploadFile);
    return false;
  }
}

async function processCompression(up, pluploadFile, file, compressOptions) {

  //*
  let originalFile = file;

  const base64Obj = await Squeeze.compressBeforeUpload(file);
  if (!base64Obj?.base64) {
    console.warn('Compression skipped or failed for:', file.name);
    _helpers_js__WEBPACK_IMPORTED_MODULE_0__.markFileFailed(pluploadFile);
    if (up) {
      _helpers_js__WEBPACK_IMPORTED_MODULE_0__.restartUploader(up);
    }
    return;
  }

  if (compressOptions?.backup_original) {
    originalFile = await _helpers_js__WEBPACK_IMPORTED_MODULE_0__.maybeBackupOriginal(file, compressOptions);
    pluploadFile.originalFile = originalFile;
  }

  const compressedFile = _helpers_js__WEBPACK_IMPORTED_MODULE_0__.base64ToFile(base64Obj.base64, file.name, file.type);
  const newSource = new mOxie.File(null, compressedFile);
  if (!newSource) {
    console.error('Failed to create new mOxie.File from base64 data');
    return;
  }

  _helpers_js__WEBPACK_IMPORTED_MODULE_0__.markFileCompressed(pluploadFile, newSource, base64Obj);
  if (up) {
    _helpers_js__WEBPACK_IMPORTED_MODULE_0__.restartUploader(up);
  }

  //console.timeEnd('Compressing image:', pluploadFile.name);

  return true;
  //*/
}

const handleMultiFileFormUpload = (compressOptions) => {
  if (typeof wpUploaderInit === 'undefined' || typeof plupload === 'undefined' || typeof uploader === 'undefined') return;

  const SqueezeUploader = uploader;

  SqueezeUploader.bind('BeforeUpload', async function (up, pluploadFile) {
    //console.log('BeforeUpload', up, pluploadFile.name, pluploadFile);
    handleCompressBeforeUpload(up, pluploadFile, compressOptions)
  });

  SqueezeUploader.bind('FileUploaded', function (up, file, response) {
    //console.log('FileUploaded', file, response);
    handleCompressAfterUpload(file, compressOptions, response);
  });
}

const handleCompressAfterUpload = async (file, compressOptions, response = null) => {
  const fileID = file?.id;
  const attachmentID = response?.response;
  const mediaItem = document.getElementById(`media-item-${fileID}`);

  if (_helpers_js__WEBPACK_IMPORTED_MODULE_0__.isFileFailedAfterCompression(file)) {
    window.onbeforeunload = null;
    if (mediaItem) {
      _helpers_js__WEBPACK_IMPORTED_MODULE_0__.waitForItemLoad(mediaItem, false).then(() => {
        mediaItem.innerHTML += `<div class="squeeze_status">
        ${file?._isExcluded ? __('File is excluded from compression:', 'squeeze') : __('File compression failed:', 'squeeze')}
        ${file.name}
        </div>`;
      });
    }
    return;
  }

  let attachment = file?.attachment;
  const type = attachment?.attributes?.type ?? file?.type?.split('/')[0];
  const subtype = attachment?.attributes?.subtype ?? file?.type?.split('/')[1];

  if (!_helpers_js__WEBPACK_IMPORTED_MODULE_0__.maybeCompressAttachment(type, subtype, compressOptions)) {
    //console.warn('Skipping compression for:', type, subtype);
    return; // Skip compression for this attachment
  }

  window.onbeforeunload = handleOnLeave;
  
  // set 'uploading' param to true, to pause the uploading process
  attachment?.set('uploading', true);
  attachment?.set('percent', 50);
  attachment?.set('status', 'Squeezing'); // Set status to 'Squeezing' to indicate compression is in progress

  if (mediaItem) {
    try {
      await _helpers_js__WEBPACK_IMPORTED_MODULE_0__.waitForItemLoad(mediaItem);
      const data = await wp.media.attachment(attachmentID).fetch();
      //console.log('Fetched attachment data:', data);
      attachment = { attributes: data };
    } catch (error) {
      console.error(error);
      _helpers_js__WEBPACK_IMPORTED_MODULE_0__.updateAttachmentUIFailed(mediaItem, error);
      window.onbeforeunload = null;
    }
  }

  _helpers_js__WEBPACK_IMPORTED_MODULE_0__.extendAttachment(attachment, file);

  try {
    const compressData = await Squeeze.handleCompress(attachment);
    if (attachment && typeof attachment.set === 'function') {
      attachment.set('percent', 75); // Set percent to 75% to indicate compression is done
    }
    const uploadData = await Squeeze.handleUpload({ attachment, base64: compressData });

    if (uploadData.success) {
      if (mediaItem) {
        mediaItem.innerHTML += `<div class="squeeze_status">${uploadData?.data?.message}</div>`;
        mediaItem.querySelector('.progress')?.remove();
      } else {
        _helpers_js__WEBPACK_IMPORTED_MODULE_0__.updateAttachmentUI(attachment, uploadData);
      }
      
    } else {
      console.warn(uploadData.data);
      _helpers_js__WEBPACK_IMPORTED_MODULE_0__.updateAttachmentUIFailed(mediaItem, uploadData?.data?.message ?? uploadData?.data ?? uploadData)
    }
  } catch (error) {
    console.error(error);
    _helpers_js__WEBPACK_IMPORTED_MODULE_0__.updateAttachmentUIFailed(mediaItem, error);
  } finally {
    if (attachment && typeof attachment.set === 'function') {
      attachment.set('uploading', false);
    }
    window.onbeforeunload = null;
  }
}


/***/ }),

/***/ "./assets/js/helpers.js":
/*!******************************!*\
  !*** ./assets/js/helpers.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "base64SizeInBytes": () => (/* binding */ base64SizeInBytes),
/* harmony export */   "base64ToBlob": () => (/* binding */ base64ToBlob),
/* harmony export */   "base64ToFile": () => (/* binding */ base64ToFile),
/* harmony export */   "cachedMediaData": () => (/* binding */ cachedMediaData),
/* harmony export */   "disableAllButtons": () => (/* binding */ disableAllButtons),
/* harmony export */   "disableBulkButtons": () => (/* binding */ disableBulkButtons),
/* harmony export */   "elements": () => (/* binding */ elements),
/* harmony export */   "enableBulkButtonsOnPause": () => (/* binding */ enableBulkButtonsOnPause),
/* harmony export */   "extendAttachment": () => (/* binding */ extendAttachment),
/* harmony export */   "fileToBase64": () => (/* binding */ fileToBase64),
/* harmony export */   "focusBulkAction": () => (/* binding */ focusBulkAction),
/* harmony export */   "getBulkButtonLabels": () => (/* binding */ getBulkButtonLabels),
/* harmony export */   "getCompressedSizeFromSqueezeResponse": () => (/* binding */ getCompressedSizeFromSqueezeResponse),
/* harmony export */   "getFileFromUrl": () => (/* binding */ getFileFromUrl),
/* harmony export */   "getNativeFile": () => (/* binding */ getNativeFile),
/* harmony export */   "handleCompressionError": () => (/* binding */ handleCompressionError),
/* harmony export */   "handleRemovePathButton": () => (/* binding */ handleRemovePathButton),
/* harmony export */   "hideBulkPausedBanner": () => (/* binding */ hideBulkPausedBanner),
/* harmony export */   "humanFileSize": () => (/* binding */ humanFileSize),
/* harmony export */   "isDocHidden": () => (/* binding */ isDocHidden),
/* harmony export */   "isExcludedFile": () => (/* binding */ isExcludedFile),
/* harmony export */   "isFileAlreadyProcessed": () => (/* binding */ isFileAlreadyProcessed),
/* harmony export */   "isFileFailedAfterCompression": () => (/* binding */ isFileFailedAfterCompression),
/* harmony export */   "isImageFile": () => (/* binding */ isImageFile),
/* harmony export */   "isSqueezeAvailable": () => (/* binding */ isSqueezeAvailable),
/* harmony export */   "logMessage": () => (/* binding */ logMessage),
/* harmony export */   "markFileCompressed": () => (/* binding */ markFileCompressed),
/* harmony export */   "markFileExcluded": () => (/* binding */ markFileExcluded),
/* harmony export */   "markFileFailed": () => (/* binding */ markFileFailed),
/* harmony export */   "maybeBackupOriginal": () => (/* binding */ maybeBackupOriginal),
/* harmony export */   "maybeCompressAttachment": () => (/* binding */ maybeCompressAttachment),
/* harmony export */   "objectToFormData": () => (/* binding */ objectToFormData),
/* harmony export */   "parseMimeType": () => (/* binding */ parseMimeType),
/* harmony export */   "populatePathInput": () => (/* binding */ populatePathInput),
/* harmony export */   "removeAllButtons": () => (/* binding */ removeAllButtons),
/* harmony export */   "renderDirectories": () => (/* binding */ renderDirectories),
/* harmony export */   "renderTemplate": () => (/* binding */ renderTemplate),
/* harmony export */   "restartUploader": () => (/* binding */ restartUploader),
/* harmony export */   "restoreBulkActionItems": () => (/* binding */ restoreBulkActionItems),
/* harmony export */   "restoreBulkButtons": () => (/* binding */ restoreBulkButtons),
/* harmony export */   "showBulkPausedBanner": () => (/* binding */ showBulkPausedBanner),
/* harmony export */   "showPopupMessage": () => (/* binding */ showPopupMessage),
/* harmony export */   "squeezeLoadingAnimationHTML": () => (/* binding */ squeezeLoadingAnimationHTML),
/* harmony export */   "syncAttachmentFileSizeModel": () => (/* binding */ syncAttachmentFileSizeModel),
/* harmony export */   "syncDirectoryDialogCheckboxesFromPathInput": () => (/* binding */ syncDirectoryDialogCheckboxesFromPathInput),
/* harmony export */   "updateAttachmentFileSizeDisplay": () => (/* binding */ updateAttachmentFileSizeDisplay),
/* harmony export */   "updateAttachmentUI": () => (/* binding */ updateAttachmentUI),
/* harmony export */   "updateAttachmentUIFailed": () => (/* binding */ updateAttachmentUIFailed),
/* harmony export */   "updateButtonText": () => (/* binding */ updateButtonText),
/* harmony export */   "waitBulkMessage": () => (/* binding */ waitBulkMessage),
/* harmony export */   "waitForItemLoad": () => (/* binding */ waitForItemLoad),
/* harmony export */   "waitMessage": () => (/* binding */ waitMessage)
/* harmony export */ });


const { __, sprintf } = wp.i18n; // Import __() from wp.i18n

const getBulkButtonLabels = () => ({
  newImages: __('Squeeze new images', 'squeeze'),
  reSqueezeAll: __('Re-squeeze all images', 'squeeze'),
  directorySqueeze: __('Run Directory Squeeze', 'squeeze'),
});

// move static helper functions here
const elements = {
  bulkBtn: document.querySelector("[name='squeeze_bulk']"),
  bulkAgainBtn: document.querySelector("[name='squeeze_bulk_again']"),
  bulkPathBtn: document.querySelector("[name='squeeze_bulk_path_button']"),
  bulkPathRestoreBtn: document.querySelector("[name='squeeze_bulk_path_restore_button']"),
  bulkPathRemoveBtns: document.querySelectorAll(".squeeze-path-list__remove"),
  selectPathBtn: document.querySelector("[name='squeeze_select_path_button']"),
  savePathBtn: document.querySelector("[name='squeeze_save_path_button']"),
  pathDialog: document.getElementById("squeeze-path-dialog"),
  closePathDialogBtn: document.querySelector("[name='squeeze_close_path_dialog_button']"),
  pathInput: document.querySelector("[name='squeeze_bulk_path']"),
  pathList: document.querySelector(".squeeze-path-list"),
  postsFilterForm: document.querySelector("#posts-filter"),
  dirContainer: document.getElementById("squeeze-bulk-directory-list"),
  bulkLogInput: document.querySelector("#squeeze-log-data"),
  pauseBulkBtn: document.querySelector("[name='squeeze_pause_page_bulk']"),
  bulkPausedBanner: document.getElementById('squeeze-bulk-paused-banner'),
  bulkPausedBannerText: document.getElementById('squeeze-bulk-paused-banner-text'),
}

const getBulkActionItem = (btn) => btn?.closest('.squeeze-bulk-media-actions__item');

const setBulkActionItemHidden = (btn, hidden) => {
  const item = getBulkActionItem(btn);
  if (item) {
    item.hidden = hidden;
  }
};

const focusBulkAction = (activeBtn) => {
  [elements.bulkBtn, elements.bulkAgainBtn].forEach((btn) => {
    if (!btn) return;
    setBulkActionItemHidden(btn, btn !== activeBtn);
  });
};

const restoreBulkActionItems = () => {
  [elements.bulkBtn, elements.bulkAgainBtn].forEach((btn) => {
    if (!btn) return;
    setBulkActionItemHidden(btn, false);
  });

  if (elements.bulkBtn?.dataset.defaultHidden === 'true') {
    setBulkActionItemHidden(elements.bulkBtn, true);
  }
};

const cachedMediaData = {
  isPaused: false,
  page: 1,
  process: '',
  mediaIDs: [],
  lastId: 0,
  totalImages: document.querySelector("[name='squeeze_bulk_total_images']")?.value || 0,
  uncompressedImages: document.querySelector("[name='squeeze_bulk_uncompressed_images']")?.value || 0,
  target: null
}

const loadTemplate = async (templatePath, data) => {
  const response = await fetch(templatePath);
  let template = await response.text();

  // Process sub-templates
  const subTemplateRegex = /\{\{\>\s*(.*?)\s*\}\}/g;
  let match;
  while ((match = subTemplateRegex.exec(template)) !== null) {
    const subTemplatePath = `${squeezeOptions.templateBase}/${match[1].trim()}.html`;
    const subTemplate = await loadTemplate(subTemplatePath, data);
    template = template.replace(match[0], subTemplate);
  }

  // Function to safely evaluate conditions (supports boolean variables, expressions, AND/OR)
  const evaluateCondition = (condition, data) => {
    try {
      // Convert standalone boolean variables (e.g., webp_lossless) to data['webp_lossless']
      condition = condition.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g, (match) =>
        match in data ? `data['${match}']` : match
      );

      return new Function("data", `with(data) { return ${condition}; }`)(data);
    } catch (e) {
      console.error("Error evaluating condition:", condition, e);
      return false;
    }
  };

  // Recursive function to process nested if-else conditions
  const processIfStatements = (template) => {
    return template.replace(/\{\{#if ([\s\S]*?)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
      condition = condition.trim();
      const conditionResult = evaluateCondition(condition, data);

      // Extract and split the if-else blocks
      const elseMatch = content.match(/\{\{#else\}\}([\s\S]*)/);
      const trueBlock = elseMatch ? content.replace(/\{\{#else\}\}([\s\S]*)/, "") : content;
      const falseBlock = elseMatch ? elseMatch[1] : "";

      // Process nested if statements recursively
      return processIfStatements(conditionResult ? trueBlock : falseBlock);
    });
  };

  // Apply recursive processing of if conditions
  template = processIfStatements(template);

  // Replace variables
  return template.replace(/\{\{(.*?)\}\}/g, (match, key) => data[key.trim()] || '');
}

const renderTemplate = async (templatePath, data, target = null) => {
  const renderedHTML = await loadTemplate(templatePath, data);

  // Create a temporary container to parse HTML
  const tempContainer = document.createElement("template");
  tempContainer.innerHTML = renderedHTML.trim();

  if (!target) {
    return tempContainer.content.firstChild;
  }

  target.appendChild(tempContainer.content.firstChild);

  // Return the last element of the rendered template
  return target.lastElementChild;
}

const logMessage = async (msg, options = {}) => {
  const { mediaLogWrapper = null, isStart = false, isPause = false, isEnd = false, isSuccess = false, isProgress = false, isWarning = false } = options;
  let { title = '', iconId = 'check-mark-circle-icon' } = options;

  if (!elements.bulkLogInput) return;

  if (isStart || isPause || isEnd) {
    iconId = isPause ? 'pause-button-icon' : ( isEnd ? 'check-mark-circle-icon' : 'image-file-icon' );
    title = isPause ? __('Bulk squeezing has been paused!', 'squeeze') : ( isEnd ? __('Bulk squeezing has been completed!', 'squeeze') : `${__('Media', 'squeeze')} ${title}:` );
    return await renderTemplate(squeezeOptions.templates.logWrapper, { title: title, msg: msg, iconId: iconId, isStart: isStart, isPause: isPause, isEnd: isEnd }, elements.bulkLogInput);
  } else {
    if (mediaLogWrapper) {
      const process = mediaLogWrapper.querySelector(".media-log-process");
      const step = await renderTemplate(squeezeOptions.templates.logStep, { msg: msg, iconId: iconId }, process);

      if (isWarning) {
        step.classList.add('media-log-step--warning');
      }

      if (msg && msg.includes('squeeze-comparison-table')) {
        const comparisonTable = step.querySelector('.squeeze-comparison-table');
        const toggleBtn = await renderTemplate(squeezeOptions.templates.logDetailsButton, { buttonText: __('Show details', 'squeeze') }, mediaLogWrapper);

        toggleBtn.addEventListener("click", () => {
          comparisonTable.classList.toggle("show");
          toggleBtn.textContent = comparisonTable.classList.contains("show") ? __('Hide details', 'squeeze') : __('Show details', 'squeeze');
        });
        step.closest(".media-log-wrapper").appendChild(comparisonTable);
        step.closest(".media-log-wrapper").appendChild(toggleBtn);
      }

      if (!isProgress) {
        mediaLogWrapper.classList.add('media-log-wrapper--done');
      }

      if (isSuccess) {
        mediaLogWrapper.classList.add('media-log-wrapper--success');
      }

      if (isWarning) {
        mediaLogWrapper.classList.add('media-log-wrapper--warning');
      }
    } else {
      elements.bulkLogInput.innerHTML += msg + `<br>`;
    }
  }
}

const showPopupMessage = (args) => {
  const { title = '', message, type = 'info', onClose = null } = args;
  const popup = document.createElement('dialog');
  const popupCloseBtn = document.createElement('button');
  const popupCloseIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const popupIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const popupText = document.createElement('p');
  const popupTitle = document.createElement('h3');

  popupIcon.setAttributeNS(null, 'viewBox', '0 0 32 32');
  popupIcon.classList.add('squeeze-icon');
  switch (type) {
    case 'success':
      popupIcon.innerHTML = `<use xlink:href="#check-mark-circle-icon"></use>`;
      break;
    case 'error':
      popupIcon.innerHTML = `<use xlink:href="#ban-sign-icon"></use>`;
      break;
    case 'info':
      popupIcon.innerHTML = `<use xlink:href="#info-icon"></use>`;
      break;
  }

  popup.appendChild(popupIcon);

  if (title) {
    popupTitle.innerText = title;
    popup.appendChild(popupTitle);
  }

  const closePopup = () => {
    popup.close();
    popup.remove();
  }
  popup.addEventListener('click', (event) => {
    const rect = popup.getBoundingClientRect();
    const isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
    
    if (!isInDialog) {
      popup.close();
    }
  })
  popupCloseBtn.addEventListener('click', closePopup);
  if (onClose) {
    popup.addEventListener('close', onClose);
  }
  popupCloseBtn.className = 'squeeze-popup-close-btn';
  popup.className = `squeeze-popup-message squeeze-popup-${type} squeeze-box`;
  popupText.innerHTML = message;
  popupCloseIcon.setAttributeNS(null, 'viewBox', '0 0 24 24');
  popupCloseIcon.classList.add('squeeze-icon');
  popupCloseIcon.innerHTML = `<use xlink:href="#close-round-icon"></use>`;

  popupCloseBtn.appendChild(popupCloseIcon);
  popup.appendChild(popupText);
  popup.appendChild(popupCloseBtn);
  document.body.appendChild(popup);
  popup.showModal();
}

const hideBulkPausedBanner = () => {
  if (!elements.bulkPausedBanner) return;
  elements.bulkPausedBanner.hidden = true;
  if (elements.bulkPausedBannerText) {
    elements.bulkPausedBannerText.textContent = '';
  }
};

const showBulkPausedBanner = () => {
  if (!elements.bulkPausedBanner || !elements.bulkPausedBannerText) return;

  elements.bulkPausedBannerText.textContent = __('Paused. Click Resume to continue.', 'squeeze');
  elements.bulkPausedBanner.hidden = false;
};

const enableBulkButtonsOnPause = (resumeTarget) => {
  if (resumeTarget) {
    resumeTarget.disabled = false;
    resumeTarget.dataset.running = 'false';
  }
};

const restoreBulkButtons = () => {
  const labels = getBulkButtonLabels();

  hideBulkPausedBanner();
  elements.bulkBtn.disabled = false;
  elements.bulkAgainBtn.disabled = false;
  elements.bulkPathBtn.disabled = false;
  if (elements.bulkPathRestoreBtn) elements.bulkPathRestoreBtn.disabled = false;
  elements.selectPathBtn.disabled = false;
  updateButtonText(elements.bulkBtn, labels.newImages, '#play-button-round-icon');
  updateButtonText(elements.bulkAgainBtn, labels.reSqueezeAll, '#repeat-icon');
  updateButtonText(elements.bulkPathBtn, labels.directorySqueeze, '#play-button-round-icon');
  elements.bulkBtn.dataset.running = 'false';
  elements.bulkAgainBtn.dataset.running = 'false';
  elements.bulkPathBtn.dataset.running = 'false';
  elements.bulkPathRemoveBtns?.forEach((btn) => {
    btn.disabled = false;
  });

  restoreBulkActionItems();

  cachedMediaData.process = '';
  cachedMediaData.mediaIDs = [];
  cachedMediaData.page = 1;
}

const disableBulkButtons = () => {
  elements.bulkBtn.disabled = true;
  elements.bulkAgainBtn.disabled = true;
  elements.bulkPathBtn.disabled = true;
  if (elements.bulkPathRestoreBtn) elements.bulkPathRestoreBtn.disabled = true;
  elements.selectPathBtn.disabled = true;
  elements.bulkPathRemoveBtns?.forEach((btn) => btn.disabled = true);
}

const disableAllButtons = (buttons) => {
  if (!buttons) return;
  buttons.forEach((btn) => btn.disabled = true);
}

const removeAllButtons = (buttons) => {
  if (!buttons) return;
  buttons.forEach((btn) => btn.remove());
}

const updateButtonText = (button, text, svgAnchor = false) => {
  button.childNodes.forEach((node) => {
    if (node.nodeName === '#text' && node.textContent.trim() !== '') {
      node.textContent = text;
    }
    if (svgAnchor && node.nodeName === 'svg') {
      node.querySelector('use').setAttribute('xlink:href', svgAnchor);
    }
  });
}

// Function to render directories in the dialog
const renderDirectories = async (dirs, parentDir = null, listeners = {}) => {
  if (!dirs) return;
  if (typeof dirs === 'object') dirs = Object.values(dirs);
  if (!elements.dirContainer.classList.contains("loaded")) elements.dirContainer.innerHTML = "";

  if (dirs.length === 0 && !parentDir) {
    const listItem = await renderTemplate(squeezeOptions.templates.directoryItemEmpty, { emptyText: __('No directories found!', 'squeeze') }, elements.dirContainer);
    return;
  }

  const selectedFolders = JSON.parse(elements.pathInput.value);
  let target;

  for (const dir of dirs) {
    const listItemClasses = [];
    const isBlocked = Boolean(dir.is_blocked);

    if (dir.parent === '/') {
      listItemClasses.push("loaded", "opened");
    }
    if (isBlocked) {
      listItemClasses.push("directory-item--blocked");
    }

    if (parentDir) {
      target = parentDir;
    } else if (dir.parent) {
      const parentElement = elements.dirContainer.querySelector(`[data-path="${dir.parent}"]`);
      if (parentElement) {
        target = parentElement;
      } else {
        target = elements.dirContainer;
      }
    } else {
      target = elements.dirContainer;
    }

    const listItem = await renderTemplate(
      squeezeOptions.templates.directoryItem,
      {
        parent: dir.parent,
        path: dir.path,
        label: dir.name,
        classes: listItemClasses.join(" "),
        isWritable: !isBlocked && dir.is_writeable && !(Array.isArray(selectedFolders) && selectedFolders.includes(dir.path)),
        isChecked: !isBlocked && dir.is_writeable && Array.isArray(selectedFolders) && selectedFolders.includes(dir.path),
        isBlocked,
        blockedTitle: isBlocked
          ? __('Media Library year/month folders cannot be selected. Use Bulk Media Library Squeeze instead.', 'squeeze')
          : '',
      },
      target
    )

    if (!isBlocked) {
      listItem.querySelector("label").addEventListener("click", listeners.handleDirectoryClick);
      listItem.querySelector("input[type='checkbox']")?.addEventListener("change", listeners.handleDirectoryCheck);
    }
  }

  elements.dirContainer.classList.add("loaded");
}

/**
 * Normalize directory path strings so checkbox values and hidden JSON compare reliably.
 */
const normalizeDirectoryPathKey = (p) => {
  let s = String(p ?? "").trim().replace(/\\/g, "/");
  s = s.replace(/\/+/g, "/");
  if (!s) {
    return "/";
  }
  if (s !== "/" && !s.endsWith("/")) {
    s += "/";
  }
  return s;
};

/**
 * Align checkboxes in #squeeze-bulk-directory-list with the hidden path JSON (e.g. after Clear path).
 */
const syncDirectoryDialogCheckboxesFromPathInput = () => {
  if (!elements.dirContainer) {
    return;
  }
  let selectedFolders = [];
  try {
    const raw = elements.pathInput?.value;
    if (raw) {
      selectedFolders = JSON.parse(raw);
    }
  } catch (e) {
    return;
  }
  if (!Array.isArray(selectedFolders)) {
    return;
  }
  const selectedSet = new Set(selectedFolders.map((p) => normalizeDirectoryPathKey(p)));
  elements.dirContainer.querySelectorAll("input[type='checkbox']").forEach((cb) => {
    cb.checked = selectedSet.has(normalizeDirectoryPathKey(cb.value));
  });
  if (elements.savePathBtn) {
    elements.savePathBtn.disabled = !elements.dirContainer.querySelector("input[type='checkbox']:checked");
  }
};

const handleRemovePathButton = async (e) => {
  e.preventDefault();
  const item = e.target.closest(".squeeze-path-list__item");
  if (item) {
    item.remove();
    const currentPaths = Array.from(elements.pathList.querySelectorAll(".squeeze-path-list__input"))
      .map(input => input.value.trim())
      .filter(value => value !== '');
    elements.pathInput.value = JSON.stringify(currentPaths);
    await populatePathInput();
  }
}

const populatePathInput = async () => {
  const path = elements.pathInput.value;
  if (!path) return;

  try {
    const selectedFolders = JSON.parse(path);
    const items = elements.pathList.querySelectorAll(".squeeze-path-list__item");

    items.forEach(item => item.remove());

    const showRemove = selectedFolders.length > 1;

    for (const folder of selectedFolders) {
      const item = await renderTemplate(squeezeOptions.templates.pathListItem, {
        folder: folder,
        showRemove: showRemove,
        clearLabel: __('Clear path', 'squeeze'),
        clearTitle: __('Clear the path field', 'squeeze'),
      }, elements.pathList);
      const removeButton = item.querySelector(".squeeze-path-list__remove");
      removeButton?.addEventListener("click", handleRemovePathButton);
    }
    syncDirectoryDialogCheckboxesFromPathInput();
  } catch (error) {
    alert(__('Error parsing path input!', 'squeeze'));
    console.error('Error parsing path input:', error);
  }
}

const getHiddenProp = () => {
  var prefixes = ['webkit', 'moz', 'ms', 'o'];

  // if 'hidden' is natively supported just return it
  if ('hidden' in document) return 'hidden';

  // otherwise loop over all the known prefixes until we find one
  for (let i = 0; i < prefixes.length; i++) {
    if ((prefixes[i] + 'Hidden') in document)
      return prefixes[i] + 'Hidden';
  }

  // otherwise it's not supported
  return null;
}

const isDocHidden = () => {
  const prop = getHiddenProp();
  if (!prop) return false;

  return document[prop];
}

/**
 * @see https://stackoverflow.com/a/20732091
 * @param {number} size bytes
 * @param {number} decimals fraction digits (0 matches WP size_format default used in the media modal)
 */
const humanFileSize = (size, decimals = 2) => {
  let i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  const value = size / Math.pow(1024, i);
  const formatted = decimals === 0
    ? String(Math.round(value))
    : String(+value.toFixed(decimals));
  return formatted + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
}

/**
 * Prefer the main compressed file size from a squeeze_update_attachment response.
 * @param {object} response
 * @returns {number|null} bytes, or null if unknown
 */
const getCompressedSizeFromSqueezeResponse = (response) => {
  if (response?.success === false) return null;
  const sizes = response?.data?.sizes;
  if (!sizes || typeof sizes !== 'object') return null;

  for (const key of ['original', 'scaled', 'full']) {
    const bytes = sizes[key]?.compressed_size;
    if (typeof bytes === 'number' && Number.isFinite(bytes) && bytes >= 0) {
      return bytes;
    }
  }
  return null;
};

/**
 * Update WordPress media modal / attachment details .file-size label(s).
 * @param {Element|null} contextEl click target or any node inside the details UI
 * @param {{ bytes?: number|null, humanReadable?: string|null }} size
 * @returns {boolean} whether any label was updated
 */
const updateAttachmentFileSizeDisplay = (contextEl, { bytes = null, humanReadable = null } = {}) => {
  // Media modal uses WP size_format(..., 0) — keep integer units in sync.
  const label = humanReadable || (bytes != null ? humanFileSize(bytes, 0) : null);
  if (!label) return false;

  const root =
    contextEl?.closest?.('.attachment-details') ||
    contextEl?.closest?.('.media-modal') ||
    contextEl?.closest?.('.edit-attachment-frame') ||
    document;

  const fileSizeEls = root.querySelectorAll('.attachment-info .file-size, .details .file-size');
  if (!fileSizeEls.length) return false;

  fileSizeEls.forEach((el) => {
    const strong = el.querySelector('strong');
    if (strong) {
      el.innerHTML = `${strong.outerHTML} ${label}`;
    } else {
      el.textContent = label;
    }
  });

  return true;
};

/**
 * Keep the Backbone media attachment model in sync with a new file size.
 */
const syncAttachmentFileSizeModel = (attachmentID, { bytes = null, humanReadable = null } = {}) => {
  if (attachmentID == null || typeof wp === 'undefined' || !wp.media?.attachment) return;

  const model = wp.media.attachment(attachmentID);
  if (!model?.set) return;

  const attrs = {};
  if (bytes != null) attrs.filesizeInBytes = bytes;
  const label = humanReadable || (bytes != null ? humanFileSize(bytes, 0) : null);
  if (label) attrs.filesizeHumanReadable = label;
  if (Object.keys(attrs).length) model.set(attrs);
};

const base64SizeInBytes = (base64) => {
  if (!base64 || typeof base64 !== 'string') return 0;
  // Remove data URL prefix if present
  const base64String = base64.split(',')[1] || base64;

  // Calculate padding characters ('=' at the end of Base64)
  const padding = (base64String.match(/=+$/) || [""])[0].length;

  // Compute byte size
  return (base64String.length * 3) / 4 - padding;
}

const maybeCompressAttachment = (attachmentType, attachmentSubType, compressOptions = null) => {
  const isAutoCompress = compressOptions?.auto_compress ?? true;
  const allowedMimeTypes = ['jpeg', 'png', 'webp', 'avif'];
  const isImage = attachmentType === 'image' && allowedMimeTypes.includes(attachmentSubType);

  return isImage && isAutoCompress;
};

const base64ToBlob = (base64, type = 'image/jpeg') => {
  // Remove data URL prefix if present
  const base64String = base64.split(',')[1] || base64;

  // Decode Base64 string
  const byteCharacters = atob(base64String);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: type });
}

const base64ToFile = (base64, fileName = 'image.jpg', type = 'image/jpeg') => {
  const blob = base64ToBlob(base64, type);
  return new File([blob], fileName, { type: type });
}

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

function objectToFormData(obj, fd = null, parentKey = null) {
  const formData = fd || new FormData();

  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    const value = obj[key];

    // build the form key: either "foo", "parent[foo]" or "parent[]" for arrays
    const formKey = parentKey
      ? Array.isArray(obj)
        ? `${parentKey}[]`
        : `${parentKey}[${key}]`
      : key;

    // Files or Blobs go straight in
    if (value instanceof File || value instanceof Blob) {
      formData.append(formKey, value, value.name);
    }
    // Arrays: recurse so they become key[]=val0, key[]=val1…
    else if (Array.isArray(value)) {
      objectToFormData(value, formData, formKey);
    }
    // Plain objects: recurse so they become key[subkey]=subval
    else if (
      value !== null &&
      typeof value === 'object' &&
      !(value instanceof Date)
    ) {
      objectToFormData(value, formData, formKey);
    }
    // Dates: convert to ISO string (or format as you like)
    else if (value instanceof Date) {
      formData.append(formKey, value.toISOString());
    }
    // Everything else (number, string, boolean, null, undefined)
    else {
      // Explicitly convert undefined to empty string so PHP sees it
      const stringVal =
        value === undefined || value === null ? '' : String(value);
      formData.append(formKey, stringVal);
    }
  }

  return formData;
}

/**
 * Extend the attachment object with additional data from the file.
 * @param {object} attachment 
 * @param {object} file 
 * @returns {object} — the extended attachment object.
 */
const extendAttachment = async (attachment, file) => {
  if (typeof attachment !== 'object' || !attachment.attributes) {
    console.warn('Invalid attachment object:', attachment);
    return;
  }

  const attributes = attachment.attributes;

  if (file?.base64) {
    attributes.base64Compressed = file.base64; // Use the base64 data from the attachment
  }

  if (file?.base64Webp) {
    attributes.base64WebpCompressed = file.base64Webp; // Use the WebP base64 data from the attachment
  }

  if (file?.originalFile) {
    attributes.originalFile = file.originalFile; // Use the original file from the attachment to be able to create a backup
  }

  return attachment;
}

const getFileFromUrl = async (url, filename, format) => {
  const response = await fetch(url);
  const blob = await response.blob();
  const mimeType = format ? `image/${format}` : blob.type;
  return new File([blob], filename, { type: mimeType });
}

function isSqueezeAvailable() {
  if (typeof Squeeze === 'undefined') return false;
  if (typeof Squeeze.compressBeforeUpload !== 'function') {
    console.warn('Squeeze.compressBeforeUpload is not a function');
    return false;
  }
  return true;
}

function isFileAlreadyProcessed(file) {
  return file?._isSqueezed || file?._isExcluded || file?._isFailed;
}

function isFileFailedAfterCompression(file) {
  if (file?._isExcluded || file?._isFailed) {
    console.warn(`File is ${file?._isExcluded ? 'excluded' : 'failed'} from compression:`, file.name);
    return true;
  }
  return false;
}

function isImageFile(file) {
  return file.type?.startsWith('image/');
}

function getNativeFile(pluploadFile) {
  return pluploadFile.getNative() || pluploadFile.getSource();
}

function parseMimeType(file) {
  const [type = '', subtype = ''] = file?.type?.split('/') ?? [];
  return { type, subtype };
}

async function isExcludedFile(pluploadFile, up) {
  
}

function markFileExcluded(pluploadFile) {
  pluploadFile.status = plupload.QUEUED;
  pluploadFile.loaded = 0;
  pluploadFile._isExcluded = true;
}

function markFileFailed(pluploadFile) {
  pluploadFile.status = plupload.QUEUED;
  pluploadFile.loaded = 0;
  pluploadFile._isFailed = true;
}

function markFileCompressed(pluploadFile, newSource, base64Obj) {
  pluploadFile.getSource = () => newSource;
  pluploadFile.status = plupload.QUEUED;
  pluploadFile.loaded = 0;
  pluploadFile._isSqueezed = true;
  pluploadFile.base64 = base64Obj.base64;
  pluploadFile.base64Webp = base64Obj?.base64Webp;
}

function restartUploader(up) {
  if (!up) return;
  setTimeout(() => up.start(), 0);
}

async function maybeBackupOriginal(file, compressOptions) {
  const isDirectWebp = compressOptions?.direct_webp && file.type !== 'image/webp';
  if (isDirectWebp) {
    return await Squeeze.convertFileToWebp(file);
  }
  return file;
}

function handleCompressionError(error, up, pluploadFile) {
  console.error('Error during compression before upload:', error);
  markFileFailed(pluploadFile);
  if (up) {
    restartUploader(up);
  }
}

function updateAttachmentUI(attachment, uploadData) {
  if (!attachment || !uploadData) return;
  if (uploadData.success === false) return;

  const compat = attachment.get('compat');
  const tempDiv = document.createElement('div');
  let compatItem = compat.item;

  tempDiv.innerHTML = compatItem;
  if (tempDiv.querySelector('.compat-field-squeeze_is_compressed .field')) {
    tempDiv.querySelector('.compat-field-squeeze_is_compressed .field').innerHTML = uploadData?.data?.message;
  }
  compat.item = tempDiv.innerHTML;

  attachment.set('compat', compat);
}

function updateAttachmentUIFailed(mediaItem, message) {
  if (!mediaItem) return;

  mediaItem.innerHTML += message;
  mediaItem.querySelector('.progress')?.remove();
}

/**
 * Wait for media item to load( 'async-upload.php' )
 * Ping every 1 second until the media item is loaded
 * @returns Promise
*/
const waitForItemLoad = (mediaItem, addProgressBar = true) => {
  return new Promise((resolve) => {
    let interval = setInterval(() => {
      if (mediaItem.querySelector('.media-item-wrapper')) {
        if (addProgressBar) {
          mediaItem.querySelector('.media-item-wrapper').innerHTML += `
            <div class="progress">
              <div class="percent">${__('Squeezing...', 'squeeze')}</div>
              <div class="bar" style="width: 200px;"></div>
            </div>
          `;
        }
        clearInterval(interval);
        resolve();
      }
    }, 1000);
  });
}

/**
 * Show a message in the status element after a delay
 * Useful for long-running operations
 * @param {string} message 
 * @param {HTMLElement} statusEl 
 * @param {integer} delay - delay in milliseconds (default: 5000)
 * @returns {integer} - timeout ID
 */
const waitMessage = (message, statusEl, delay = 5000) => {
  const timeoutId = setTimeout(() => {
    statusEl.innerHTML = message;
  }, delay);

  return timeoutId;
}

/**
 * After a delay, append a "still working" step to an in-progress bulk log entry.
 */
const waitBulkMessage = (mediaLogWrapper, filename, delay = 30000) => {
  return setTimeout(async () => {
    if (!mediaLogWrapper || mediaLogWrapper.classList.contains('media-log-wrapper--done')) {
      return;
    }

    await logMessage(
      sprintf(__('Still processing %s… Large images can take several minutes.', 'squeeze'), filename),
      { mediaLogWrapper, iconId: 'lemon-dot-icon', isProgress: true }
    );
  }, delay);
}

const squeezeLoadingAnimationHTML = `
  <div class="squeeze-loading-wrap" aria-live="polite" aria-label="Loading">
    <span class="squeeze-loading-icon">⌛</span>
  </div>
`;

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
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*****************************!*\
  !*** ./assets/js/editor.js ***!
  \*****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers.js */ "./assets/js/helpers.js");
/* harmony import */ var _handlers_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./handlers.js */ "./assets/js/handlers.js");



"use strict";

const { sprintf, __ } = wp.i18n; // Import __() from wp.i18n

const compressOptions = JSON.parse(squeezeOptions.options);

const addFilter = wp.hooks.addFilter;
const createHigherOrderComponent = wp.compose.createHigherOrderComponent;
const { createElement: el, Fragment } = wp.element;

// import Spinner component
const { Spinner } = wp.components;

// Add custom attribute to core/image and generateblocks/media blocks
wp.hooks.addFilter(
  'blocks.registerBlockType',
  'squeeze/add-compressing-attribute',
  (settings, name) => {
    if (name === 'core/image' || name === 'generateblocks/media') {
      return {
        ...settings,
        attributes: {
          ...settings.attributes,
          isSqueezing: {
            type: 'boolean',
            default: false,
          },
        },
      };
    }
    return settings;
  }
);

const withImageOnSelect = createHigherOrderComponent(
  function (BlockEdit) {
    return function (props) {
      const { attributes } = props;
      // Only target the core/image block
      if (props.name !== 'core/image' && props.name !== 'generateblocks/media') {
        // If not the core/image block, return the original BlockEdit
        return el(BlockEdit, props);
      }

      const { isSqueezing } = attributes;

      // While compressing, render the original editor plus a Spinner overlay
      if (isSqueezing) {

        return el(
          Fragment,
          {},
          // The normal block edit, dimmed
          el(
            'div',
            { style: { position: 'relative' } },
            el(BlockEdit, props),
            el(
              'div',
              { style: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.5)', pointerEvents: 'none', width: '100%', height: '100%', left: '0%', top: '0%' } },
            ),
            // Spinner absolutely centered
            el(
              'div',
              {
                style: {
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                },
              },
              el(Spinner, { size: 50 }),
              __('Squeezing image…', 'squeeze')
            )
          ),

        );
      }

      return el(BlockEdit, props);

    };
  },
  'withImageOnSelect'
);

// Inject our HOC into Gutenberg’s BlockEdit pipeline
addFilter(
  'editor.BlockEdit',
  'squeeze/with-image-onselect',
  withImageOnSelect
);

/**
 * Handles the compression of thumbnails after the image has been uploaded.
 * This function checks if the file is an image, determines if it should be compressed,
 * fetches the attachment data, and then compresses and uploads the image.
 * It also handles the original file and WebP conversion if specified in the options.
 * @param {object} file - The file attachment object.
 * @returns {Promise<void>}
 */
async function handleCompressThumbs(file) {
  const fileType = file.mime_type.split('/')[0];
  const fileSubType = file.mime_type.split('/')[1];

  if (!_helpers_js__WEBPACK_IMPORTED_MODULE_0__.maybeCompressAttachment(fileType, fileSubType, compressOptions)) {
    return;
  }

  //console.log('Compressing image:', file.id, file.source_url);
  window.onbeforeunload = _handlers_js__WEBPACK_IMPORTED_MODULE_1__.handleOnLeave;

  try {
    const attachmentResponse = await Squeeze.getAttachment(file.id);

    if (attachmentResponse.success === false) {
      window.onbeforeunload = null;
      console.error(sprintf(__('Error fetching attachment: %s', 'squeeze'), attachmentResponse.data));
      return;
    }

    const attachmentData = attachmentResponse.data;

    if (attachmentData.is_squeezed) {
      console.warn('Image already compressed:', attachmentData.id);
      window.onbeforeunload = null;
      return;
    }

    const attachment = {
      attributes: {
        url: attachmentData.url,
        mime: attachmentData.mime,
        name: attachmentData.name,
        filename: attachmentData.filename,
        id: attachmentData.id,
        sizes: attachmentData.sizes,
      }
    }

    _helpers_js__WEBPACK_IMPORTED_MODULE_0__.extendAttachment(attachment, file);

    const compressData = await Squeeze.handleCompress(attachment);
    const uploadData = await Squeeze.handleUpload({ attachment, base64: compressData });

    if (uploadData.success) {
      //console.log('Image uploaded successfully:', uploadData);
      window.onbeforeunload = null;
    } else {
      window.onbeforeunload = null;
      console.error(sprintf(__('Error uploading image: %s', 'squeeze'), uploadData.data));
    }
  } catch (error) {
    console.error(error);
    window.onbeforeunload = null;
  }
}

/**
 * Walk through all blocks and compress thumbnails for the given media ID.
 * This function checks if the block or any of its inner blocks matches the media ID,
 * and if so, it compresses the thumbnails using handleCompressThumbs.
 * @param {integer} mediaId - The ID of the media item to compress.
 * @param {object} response - The response object containing the media data.
 * @returns {Promise<void>}
 */
function squeezeAndUpdateThumbs(mediaId, response) {
  //console.log('squeezeAndUpdateThumbs', mediaId, response);
  return new Promise((resolve) => {
    setTimeout(() => {
      const blocks = wp.data.select('core/block-editor').getBlocks();
      // collect all handleCompressThumbs() calls
      const all = blocks.map(block => {
        // Check if the block or any of its innerBlocks matches the mediaId
        const matchesMedia = (block.attributes.id === mediaId) || (block.attributes.mediaId === mediaId);

        // Helper to recursively check innerBlocks
        function hasMatchingInnerBlock(innerBlocks) {
          if (!innerBlocks || !innerBlocks.length) return false;
          return innerBlocks.some(innerBlock => {
            if (
              innerBlock.attributes.id === mediaId ||
              innerBlock.attributes.mediaId === mediaId
            ) {
              return true;
            }
            return hasMatchingInnerBlock(innerBlock.innerBlocks);
          });
        }

        const isMatchingInnerBlock = hasMatchingInnerBlock(block.innerBlocks);

        if (!matchesMedia && !isMatchingInnerBlock) {
          return null;
        }

        // mark squeezing start
        if (isMatchingInnerBlock) {
          block.innerBlocks.forEach(innerBlock => {
            if (innerBlock.attributes.id === mediaId || innerBlock.attributes.mediaId === mediaId) {
               wp.data.dispatch('core/block-editor').updateBlockAttributes(innerBlock.clientId, { isSqueezing: true });
            }
          });
        } else {
          wp.data.dispatch('core/block-editor')
            .updateBlockAttributes(block.clientId, { isSqueezing: true });
        }
        // compress, then mark squeezing end
        return handleCompressThumbs(response)
          .then(() => {
            if (isMatchingInnerBlock) {
              block.innerBlocks.forEach(innerBlock => {
                if (innerBlock.attributes.id === mediaId || innerBlock.attributes.mediaId === mediaId) {
                  wp.data.dispatch('core/block-editor').updateBlockAttributes(innerBlock.clientId, { isSqueezing: false });
                }
              });
            } else {
              wp.data.dispatch('core/block-editor')
                .updateBlockAttributes(block.clientId, { isSqueezing: false });
            }
          });
      }).filter(p => p); // remove nulls
      
      // when all compress‐promises settle (or immediately, if none)
      Promise.all(all).then(() => {
        resolve();
      });
    }, 100); // ensure attributes are ready
  });
}

/**
 * True only for REST media *create* (`POST /wp/v2/media`), not sideload/finalize/id routes.
 */
function isWpV2MediaCreatePath(path) {
  if (!path || typeof path !== 'string') return false;
  const normalized = path.split('?')[0].replace(/\/+$/, '');
  return /(?:^|\/)wp\/v2\/media$/.test(normalized);
}

// Compress the original before upload and thumbnails after upload
wp.domReady(function () {
  // Middleware to intercept and modify the upload request
  wp.apiFetch.use(async (options, next) => {
    // Skip if we already marked this request as processed by Squeeze
    if (options && options._squeezeProcessed) {
      return await next(options);
    }
    
    // Only intercept media *create* uploads (not /sideload or /finalize).
    if (options.method === 'POST' && isWpV2MediaCreatePath(options.path)) {

      const formData = options.body;

      if (!(formData instanceof FormData) || !formData.has('file')) {
        return await next(options);
      }

      // ✅ Only compress uploads for the *current post in the editor*
      const currentPostId = wp?.data?.select?.('core/editor')?.getCurrentPostId?.();
      const postValue = formData.get('post');
      if (!postValue || Number(postValue) !== Number(currentPostId)) {
        return await next(options);
      }

      const file = formData.get('file');

      if (file && !file.type.startsWith('image/')) {
        //console.log('Not an image file:', file);
        return await next(options); // Proceed without modification
      }

      const fileType = file.type.split('/')[0];
      const fileSubType = file.type.split('/')[1];
      let originalFile = file;

      if (!_helpers_js__WEBPACK_IMPORTED_MODULE_0__.maybeCompressAttachment(fileType, fileSubType, compressOptions)) {
        //console.log('Compression not needed for:', file.name);
        return await next(options); // Proceed without modification
      }

      

      const noticeId = 'compression-notice';
      // Show compression notice
      wp.data.dispatch('core/notices').createNotice(
        'info',
        __('Squeezing the image...', 'squeeze'),
        { id: noticeId, isDismissible: false }
      )

      // Ensure the browser can set multipart boundary for FormData
      if (options.headers) {
        delete options.headers['Content-Type'];
        delete options.headers['content-type'];
      }

      // Mark this outgoing request so anything we intentionally trigger can skip the middleware.
      options._squeezeProcessed = true;

      try {
        //console.time('Compressing image:', file.name);
        window.onbeforeunload = _handlers_js__WEBPACK_IMPORTED_MODULE_1__.handleOnLeave;

        // Compress the file
        //console.log('Compressing image:', file.name, file.size, file.type);
        const base64Obj = await Squeeze.compressBeforeUpload(file);
        if (!base64Obj || !base64Obj.base64) {
          console.warn('Compression skipped or failed for:', file.name, base64Obj);
          return await next(options); // Proceed without modification
        }

        if (compressOptions.backup_original) {
          //console.log('Backing up original file:', file.name);
          const originalBlob = file instanceof Blob ? file : new Blob([file], { type: file.type });
          const isDirectWebp = compressOptions?.direct_webp && file.type !== 'image/webp';
          // If direct WebP conversion is enabled, convert the original file to WebP
          originalFile = isDirectWebp ? await Squeeze.convertFileToWebp(originalBlob) : originalBlob; // Use the original file from the attachment
        }

        const newFormData = new FormData();
        const imageBlob = _helpers_js__WEBPACK_IMPORTED_MODULE_0__.base64ToBlob(base64Obj.base64, file.type);

        newFormData.append('file', imageBlob, file.name);

        // Preserve other FormData fields (e.g., title, alt)
        for (const [key, value] of options.body.entries()) {
          if (key !== 'file') {
            newFormData.append(key, value);
          }
        }

        //console.log('New FormData:', newFormData);

        options.body = newFormData;

        const response = await next(options);

        if (response && response.id && response.media_type === 'image') {
          
          response.base64 = base64Obj.base64; // Add the base64 data to the response
          response.base64Webp = base64Obj?.base64Webp; // Add the WebP base64 data to the response
          if (compressOptions.backup_original) {
            response.originalFile = originalFile; // Add the original file to the response
          }

          const mediaId = response.id;
          squeezeAndUpdateThumbs(mediaId, response)
            .then(() => {
              // Dismiss the compression notice
              wp.data.dispatch('core/notices').removeNotice('compression-notice');
              window.onbeforeunload = null;
              //console.timeEnd('Compressing image:', file.name);
            })
            .catch(error => {
              console.error('Error during squeeze and update:', error);
              // Show error notice
              wp.data.dispatch('core/notices').createNotice(
                'error',
                sprintf(__('Error squeezing the image: %s', 'squeeze'), error.message),
                { id: noticeId, isDismissible: true }
              );
              window.onbeforeunload = null;
            });

        }

        return response; // Return the modified response

      } catch (error) {
        wp.data.dispatch('core/notices').removeNotice('compression-notice');
        console.error('Error during image compression:', error);
        // Show error notice
        wp.data.dispatch('core/notices').createNotice(
          'error',
          sprintf(__('Error squeezing the image: %s', 'squeeze'), error?.message || error),
          { id: noticeId, isDismissible: true }
        );
        window.onbeforeunload = null;
        return await next(options); // Proceed without modification
      }
    }

    // Default: let request through untouched
    return await next(options);

  });
});
})();

/******/ })()
;