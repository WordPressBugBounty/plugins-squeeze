/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./assets/js/handlers.js":
/*!*******************************!*\
  !*** ./assets/js/handlers.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
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

"use strict";
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

/***/ }),

/***/ "./assets/js/instant-images-upload-compat.js":
/*!***************************************************!*\
  !*** ./assets/js/instant-images-upload-compat.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "initInstantImagesUploadCompat": () => (/* binding */ initInstantImagesUploadCompat)
/* harmony export */ });
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers.js */ "./assets/js/helpers.js");
/* harmony import */ var _handlers_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./handlers.js */ "./assets/js/handlers.js");





/** One successful patch per JS realm (per window / iframe). */
const PATCHED_KEY = "__squeezeInstantImagesCompatPatched";

const LOG_PREFIX = "[Squeeze · Instant Images]";

/** @type {Set<number>} */
const inFlightIds = new Set();

function iiLog(...args) {
	console.info(LOG_PREFIX, ...args);
}

function iiWarn(...args) {
	console.warn(LOG_PREFIX, ...args);
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
 * Instant Images imports via POST /wp-json/instant-images/download (server-side sideload).
 *
 * @param {string} url
 * @returns {boolean}
 */
function looksLikeInstantImagesDownload(url) {
	const s = String(url || "");
	if (!s) {
		return false;
	}
	return /instant-images\/download\/?(?:\?|$)/i.test(s);
}

/**
 * @param {unknown} data
 * @returns {number}
 */
function attachmentIdFromDownloadResponse(data) {
	if (!data || typeof data !== "object") {
		return 0;
	}
	const payload = /** @type {{ success?: boolean; attachment?: { id?: number|string } }} */ (data);
	if (payload.success !== true) {
		return 0;
	}
	const id = payload.attachment?.id;
	const n = typeof id === "number" ? id : parseInt(String(id ?? ""), 10);
	return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * Post-attach squeeze for Instant Images imports (no browser File before attach).
 *
 * @param {number} attachmentId
 * @param {Record<string, unknown>} compressOptions
 */
async function squeezeInstantImagesAttachment(attachmentId, compressOptions) {
	if (!attachmentId || inFlightIds.has(attachmentId)) {
		return;
	}

	const squeeze = window.Squeeze;
	if (!squeeze || typeof squeeze.getAttachment !== "function") {
		iiWarn("window.Squeeze.getAttachment missing; skip post-attach squeeze.", attachmentId);
		return;
	}

	inFlightIds.add(attachmentId);
	window.onbeforeunload = _handlers_js__WEBPACK_IMPORTED_MODULE_1__.handleOnLeave;

	try {
		const attachmentResponse = await squeeze.getAttachment(attachmentId);

		if (attachmentResponse?.success === false) {
			iiWarn("getAttachment failed:", attachmentResponse.data);
			return;
		}

		const attachmentData = attachmentResponse?.data;
		if (!attachmentData) {
			iiWarn("getAttachment returned empty data for", attachmentId);
			return;
		}

		if (attachmentData.is_squeezed) {
			iiLog("already squeezed:", attachmentId);
			return;
		}

		const mimeParts = String(attachmentData.mime || "").split("/");
		const type = mimeParts[0] || "";
		const subtype = mimeParts[1] || "";

		if (!(0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.maybeCompressAttachment)(type, subtype, compressOptions)) {
			iiLog("skip (mime / auto_compress):", attachmentId, attachmentData.mime);
			return;
		}

		

		iiLog("squeezing attachment", attachmentId, attachmentData.filename);

		const attachment = {
			attributes: {
				url: attachmentData.url,
				mime: attachmentData.mime,
				name: attachmentData.name,
				filename: attachmentData.filename,
				id: attachmentData.id,
				sizes: attachmentData.sizes,
				width: attachmentData.width,
				height: attachmentData.height,
			},
		};

		const compressData = await squeeze.handleCompress(attachment);
		const uploadData = await squeeze.handleUpload({ attachment, base64: compressData });

		if (uploadData?.success) {
			iiLog("squeezed:", attachmentId, uploadData?.data?.message || "");
			try {
				if (typeof wp !== "undefined" && wp?.media?.attachment) {
					wp.media.attachment(attachmentId).fetch();
				}
			} catch (e) {
				/* non-fatal media model refresh */
			}
		} else {
			iiWarn("handleUpload failed:", uploadData?.data ?? uploadData);
		}
	} catch (e) {
		iiWarn("post-attach squeeze failed:", e);
	} finally {
		inFlightIds.delete(attachmentId);
		window.onbeforeunload = null;
	}
}

/**
 * @param {string} raw
 */
function maybeSqueezeFromResponseText(raw, compressOptions) {
	if (!raw || typeof raw !== "string") {
		return;
	}
	try {
		const data = JSON.parse(raw);
		const id = attachmentIdFromDownloadResponse(data);
		if (id) {
			void squeezeInstantImagesAttachment(id, compressOptions);
		}
	} catch (e) {
		/* not JSON / incomplete */
	}
}

/**
 * Instant Images downloads stock photos server-side via REST
 * (`POST …/wp-json/instant-images/download`), bypassing plupload / wp.Uploader.
 * When "Squeeze on upload" is enabled, compress the new attachment after attach
 * using the same getAttachment → handleCompress → handleUpload path as Elementor.
 *
 * @param {Record<string, unknown>} compressOptions Parsed squeezeOptions.options
 */
function initInstantImagesUploadCompat(compressOptions) {
	if (typeof window === "undefined") {
		return;
	}

	const protoEarly = window.XMLHttpRequest?.prototype;
	if (protoEarly && /** @type {{ [k: string]: boolean }} */ (protoEarly)[PATCHED_KEY]) {
		return;
	}

	if (!compressOptions?.auto_compress) {
		iiLog("compat skipped: Squeeze on upload (auto_compress) is off in settings.");
		return;
	}

	const XHR = window.XMLHttpRequest;
	const proto = XHR && XHR.prototype;
	if (!proto) {
		return;
	}

	const origOpen = proto.open;
	const origSend = proto.send;

	/** @type {{ [k: string]: boolean }} */ (proto)[PATCHED_KEY] = true;

	proto.open = function (method, url, ...rest) {
		this.__squeezeIiRequestUrl = normalizeOpenUrl(url);
		return origOpen.call(this, method, url, ...rest);
	};

	proto.send = function (body) {
		const xhr = this;
		const reqUrl = xhr.__squeezeIiRequestUrl || "";

		if (!looksLikeInstantImagesDownload(reqUrl)) {
			return origSend.call(xhr, body);
		}

		xhr.addEventListener("load", function onIiDownloadLoad() {
			xhr.removeEventListener("load", onIiDownloadLoad);
			if (xhr.status < 200 || xhr.status >= 300) {
				return;
			}
			maybeSqueezeFromResponseText(xhr.responseText, compressOptions);
		});

		return origSend.call(xhr, body);
	};

	iiLog("XMLHttpRequest hook installed for instant-images/download.");

	if (typeof window.fetch === "function") {
		const origFetch = window.fetch.bind(window);

		window.fetch = async function (input, init) {
			const url =
				typeof input === "string"
					? input
					: input instanceof Request
						? input.url
						: normalizeOpenUrl(input);

			const response = await origFetch(input, init);

			if (!looksLikeInstantImagesDownload(String(url))) {
				return response;
			}

			try {
				const clone = response.clone();
				const data = await clone.json();
				const id = attachmentIdFromDownloadResponse(data);
				if (id) {
					void squeezeInstantImagesAttachment(id, compressOptions);
				}
			} catch (e) {
				/* non-JSON or aborted clone */
			}

			return response;
		};

		iiLog("window.fetch hook installed for instant-images/download.");
	}
}


/***/ }),

/***/ "./assets/js/memory.js":
/*!*****************************!*\
  !*** ./assets/js/memory.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
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


/***/ }),

/***/ "./assets/js/set-public-path.js":
/*!**************************************!*\
  !*** ./assets/js/set-public-path.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Set webpack's public path from the localized plugin URL so Workers and
 * dynamic chunks always resolve under this plugin's assets/js/ directory.
 * Must be imported before any other webpack entry modules.
 */
if (
	typeof squeezeOptions !== 'undefined' &&
	squeezeOptions &&
	typeof squeezeOptions.pluginUrl === 'string' &&
	squeezeOptions.pluginUrl
) {
	// eslint-disable-next-line no-undef, camelcase
	__webpack_require__.p = squeezeOptions.pluginUrl.replace( /\/?$/, '/' ) + 'assets/js/';
}


/***/ }),

/***/ "./assets/js/squeeze.js":
/*!******************************!*\
  !*** ./assets/js/squeeze.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ SQUEEZE)
/* harmony export */ });
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers.js */ "./assets/js/helpers.js");
/* harmony import */ var browser_image_compression__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! browser-image-compression */ "./node_modules/browser-image-compression/dist/browser-image-compression.mjs");
/* harmony import */ var _jsquash_webp__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @jsquash/webp */ "./node_modules/@jsquash/webp/encode.js");
/* harmony import */ var _memory_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./memory.js */ "./assets/js/memory.js");
/* harmony import */ var _worker_pool_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./worker-pool.js */ "./assets/js/worker-pool.js");








const { __, sprintf } = wp.i18n; // Import __() from wp.i18n

class SQUEEZE {

  constructor(squeeze) {
    this.options = JSON.parse(squeeze.options); // plugin options
    this.nonce = squeeze.nonce; // nonce
    this.ajaxUrl = squeeze.ajaxUrl; // ajax url
    this.timeout = parseInt(this.options.timeout) * 1000; // convert to milliseconds
    this.memory = (0,_memory_js__WEBPACK_IMPORTED_MODULE_2__.getMemorySettings)(typeof navigator !== 'undefined' ? navigator : {});
    this.poolSize = this.memory.poolSize; // memory-aware concurrency (not raw core count)
    this.settingsPageUrl = squeeze.settingsPageUrl || ''; // settings page URL
    this.assetsVersion = squeeze.assetsVersion || ''; // cache-bust Worker + chunks after deploy
    this._workerPool = null;
  }

  /**
   * Lazily create a reusable worker pool sized to poolSize.
   * @returns {WorkerPool}
   */
  _getWorkerPool() {
    if (!this._workerPool) {
      // Must be written as `new Worker(new URL(...))` inline — assigning the URL to a
      // variable (or mutating searchParams) makes webpack emit an unbundled copy of
      // worker.js instead of a Worker compilation with codec/wasm chunks.
      this._workerPool = new _worker_pool_js__WEBPACK_IMPORTED_MODULE_3__["default"](this.poolSize, () =>
        new Worker(new URL(/* worker import */ __webpack_require__.p + __webpack_require__.u("assets_js_worker_js"), __webpack_require__.b), { type: undefined })
      );
    }
    return this._workerPool;
  }

  /**
   * Returns true when `url` is on a different origin than the current page.
   * Used to detect images served from an external CDN (e.g. GCS, S3) so we can
   * proxy them through WordPress before passing to the Web Worker.
   */
  _isCrossOrigin = (url) => {
    if (!url) return false;
    try {
      return new URL(url, window.location.href).origin !== window.location.origin;
    } catch {
      return false;
    }
  }

  /**
   * Build a same-origin proxy URL for an attachment image.
   * The browser can fetch this without CORS errors; the PHP handler streams the
   * actual image (from local disk or from the provider) back to the browser.
   *
   * @param {number} attachmentId  WordPress attachment post ID.
   * @param {string} size          WP size name: 'original', 'full', or registered size.
   * @returns {string}
   */
  _buildProxyUrl = (attachmentId, size = 'original') => {
    return `${this.ajaxUrl}?action=squeeze_fetch_image` +
      `&attachment_id=${encodeURIComponent(attachmentId)}` +
      `&size=${encodeURIComponent(size)}` +
      `&_ajax_nonce=${encodeURIComponent(this.nonce)}`;
  }

  /**
   * For each size whose `url` is cross-origin, add a `fetchUrl` field pointing to
   * the same-origin proxy.  The original `url` is kept so PHP can still derive the
   * correct filename.  The worker will use `fetchUrl` for the actual fetch() call.
   *
   * @param {Object} sizes        Sizes object from attachment data.
   * @param {number} attachmentId WordPress attachment post ID.
   * @returns {Object}
   */
  _proxySizes = (sizes, attachmentId) => {
    if (!sizes || !attachmentId) return sizes;
    const proxied = {};
    for (const [sizeName, sizeData] of Object.entries(sizes)) {
      proxied[sizeName] = { ...sizeData };
      if (sizeData?.url && this._isCrossOrigin(sizeData.url)) {
        proxied[sizeName].fetchUrl = this._buildProxyUrl(attachmentId, sizeName);
      }
    }
    return proxied;
  }

  handleCompress = async ( attachment, type = 'uncompressed' ) => {
    const attachmentData = attachment.attributes;
    const url = attachmentData?.originalImageURL ?? attachmentData.url;
    const mime = attachmentData.mime;
    const name = attachmentData.name;
    const filename = attachmentData?.originalImageName ?? attachmentData.filename;
    const attachmentID = attachmentData.id;
    const sizes = attachmentData.sizes;
    const format = mime.split("/")[1];
    const sourceType = format;
    const outputType = format;
    const skipFull = attachmentData?.skipFull ?? attachmentData.originalImageName === undefined ? true : false;
    const timeout = this.timeout;
    const isPreview = attachmentData?.isPreview ?? false;
    const file = attachmentData?.file ?? null; // the original file, it passed for the newly uploaded attachment to compress it

    // the original compressed image base64, it passed when the attachment was already compressed and we need to compress thumbs only
    // we pass it in order to prevent re-compressing the original image when we need to compress thumbs only
    const base64Compressed = attachmentData?.base64Compressed ?? null; 
    const base64WebpCompressed = attachmentData?.base64WebpCompressed ?? null; // the original compressed webp image base64

    // When the image is served from a cross-origin CDN (e.g. WP Offload Media → GCS/S3),
    // the worker's fetch() call would be blocked by CORS.  We compute a same-origin proxy
    // URL and pass it alongside the original URL.  The worker fetches from fetchUrl; the
    // original url is kept so PHP can still determine the correct filename.
    const fetchUrl = !file && this._isCrossOrigin(url) && attachmentID
      ? this._buildProxyUrl(attachmentID, 'original')
      : undefined;
    const workerSizes = this._proxySizes(sizes, attachmentID);

    const pool = this._getWorkerPool();
    const worker = await pool.acquire();
    const channel = new MessageChannel();

    // Listen for compression requests from the worker via port1
    channel.port1.onmessage = async (ev) => {
      //console.log("Worker received compression request:", ev.data);
      const { id, action, fileOrArrayBuffer, mime, options } = ev.data;
      if (action !== 'imageCompression') return;

      try {
        // Accept ArrayBuffer or Blob
        const blob = (fileOrArrayBuffer instanceof ArrayBuffer)
          ? new Blob([this.toUint8Array(fileOrArrayBuffer)], { type: mime })
          : fileOrArrayBuffer;

        const compressedBlob = await (0,browser_image_compression__WEBPACK_IMPORTED_MODULE_1__["default"])(blob, { useWebWorker: true, ...(options || {}) });

        // quick checks
        //console.log('compressedBlob.type, size:', compressedBlob.type, compressedBlob.size);
        // normalize final binary
        const compressedArrayBuffer = await compressedBlob.arrayBuffer();

        // Reply with the compressed ArrayBuffer (transfer to avoid copy)
        channel.port1.postMessage({ id, ok: true, arrayBuffer: compressedArrayBuffer }, [compressedArrayBuffer]);
      } catch (err) {
        channel.port1.postMessage({ id, ok: false, error: err.message || String(err) });
      }
    };

    return new Promise((resolve, reject) => {
      let settled = false;
      let timeoutId = null;

      const cleanup = (shouldRelease) => {
        if (timeoutId != null) clearTimeout(timeoutId);
        worker.removeEventListener('message', onMessage);
        worker.removeEventListener('error', onError);
        try { channel.port1.close(); } catch (e) { /* ignore */ }
        if (shouldRelease) {
          pool.release(worker);
        }
      };

      const fail = (err) => {
        if (settled) return;
        settled = true;
        const message = (0,_memory_js__WEBPACK_IMPORTED_MODULE_2__.isWasmOomError)(err) ? (0,_memory_js__WEBPACK_IMPORTED_MODULE_2__.formatOomMessage)(err, __) : (err?.message || err);
        reject(message);
      };

      const succeed = (data) => {
        if (settled) return;
        settled = true;
        resolve(data);
      };

      const onMessage = (event) => {
        cleanup(true);
        if (event.data.error) {
          fail(event.data.error);
        } else {
          succeed(event.data);
        }
      };

      const onError = (error) => {
        cleanup(false);
        pool.replace(worker);
        fail(`Worker error: ${error.message}`);
      };

      worker.addEventListener('message', onMessage);
      worker.addEventListener('error', onError);

      timeoutId = setTimeout(() => {
        // Hung worker — replace rather than reuse.
        cleanup(false);
        pool.replace(worker);
        console.warn('Worker compress terminated', name, sourceType, outputType);
        fail(sprintf('😩 ' + __('Request timed out. Try to increase the timeout limit on the Squeeze <a target="_blank" href="%s">settings page</a>.', 'squeeze'), `${this.settingsPageUrl}#:~:text=Squeeze%20timeout`));
      }, timeout);

      worker.postMessage({
        action: 'compress',
        format,
        url,
        fetchUrl,
        name,
        sourceType,
        outputType,
        mime,
        sizes: workerSizes,
        skipFull,
        timeout,
        isPreview,
        file,
        base64Compressed,
        base64WebpCompressed,
        type,
        options: this.options,
        memory: {
          deviceMemory: this.memory.deviceMemory,
          forceSingleThreadAvif: this.memory.forceSingleThreadAvif,
          megapixelLimit: this.memory.megapixelLimit,
        },
      }, [channel.port2]);
    });

  }

  handleUpload = async ({ attachment, base64, type = 'uncompressed', mediaIDs = [] }) => {

    const attachmentData = attachment.attributes;
    const url = attachmentData?.originalImageURL ?? attachmentData.url;
    const mime = attachmentData.mime;
    const filename = attachmentData?.originalImageName ?? attachmentData.filename;
    const attachmentID = attachmentData.id;
    const format = base64?.isDirectWebp ? 'webp' : mime.split("/")[1];
    const sizes = attachmentData.sizes;

    const isDirectWebp = base64?.isDirectWebp && mime !== 'image/webp';
    const isBackupOriginal = this.options?.backup_original ?? false; // check if backup original is enabled
    let originalFile = attachmentData?.originalFile ?? null; // the original file, used for creating backup
    
    // if originalFile is not provided, try to get it from the URL
    // used when the attachment needs to be converted to webp from jpg or png
    // (Media Library and Directory Squeeze — restore expects .bak.webp beside live .webp)
    if (!originalFile && isBackupOriginal && isDirectWebp) {
      // Use proxy URL when the image is served from a cross-origin CDN (e.g. WP Offload Media).
      const fetchUrlForOriginal = this._isCrossOrigin(url) && attachmentID
        ? this._buildProxyUrl(attachmentID, 'original')
        : url;
      const file = await (0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.getFileFromUrl)(fetchUrlForOriginal, filename, mime.split("/")[1])
      //console.log('conveting original file to webp', file);
      originalFile = await this.convertFileToWebp(file);
    }
    //console.log('handleUpload attachmentData', attachmentData)

    const data = {
      action: 'squeeze_update_attachment',
      _ajax_nonce: this.nonce,
      filename: filename,
      type: 'image',
      format: format,
      base64: base64.base64,
      base64Sizes: base64.base64Sizes,
      base64Webp: base64.base64Webp,
      base64SizesWebp: base64.base64SizesWebp,
      
      attachmentID: attachmentID,
      url: url,
      process: type,
      originalFile: originalFile,
    }

    const formData = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.objectToFormData)(data);

    //console.log('squeeze_update_attachment', JSON.stringify(data, null, 2));

    try {
      const uploadResponse = await jQuery.ajax({
      url: this.ajaxUrl, // + '111',
      type: 'POST',
      data: formData,
      processData: false,  // very important!
      contentType: false,  // very important!
      });

      //if (uploadResponse.success) {
        uploadResponse['mediaIDs'] = mediaIDs;
      //}

      if (!uploadResponse?.data?.url) {
        uploadResponse.url = url; // fallback to original URL if not provided
      }

      //console.log('uploadResponse', JSON.stringify(uploadResponse, null, 2));

      return uploadResponse;
      
    } catch (error) {
      // jQuery.ajax rejects with a jqXHR object on HTTP errors, not a plain Error.
      // Extract a human-readable message so callers never receive [object Object].
      let errorMessage;
      if (error && typeof error === 'object' && typeof error.status === 'number') {
        if (error.status === 413) {
          errorMessage = __('The compressed image payload is too large for the server to accept (HTTP 413). Please ask your host to raise the post_max_size PHP setting and, for nginx, the client_max_body_size directive.', 'squeeze');
        } else {
          errorMessage = sprintf(
            /* translators: 1: HTTP status code, 2: HTTP status text */
            __('Upload failed with HTTP %1$d: %2$s', 'squeeze'),
            error.status,
            error.statusText ?? ''
          );
        }
      } else {
        errorMessage = error?.message ?? String(error);
      }

      return {
      'mediaIDs': mediaIDs,
      'data': errorMessage,
      'success': false
      };
    }

  }

  handleBulkUpload = async (type = 'uncompressed', mediaIDs = []) => {
    let currentID;
    let attachment;

    switch (type) {
      case 'all':
      case 'uncompressed':
        currentID = mediaIDs[0];
        break;
      case 'path':
        currentID = mediaIDs[0]?.filename;
        break;
      default:
        currentID = 0;
        break;
    }

    if (type === 'path') {

      

      attachment = {
        attributes: {
          url: mediaIDs[0].url,
          mime: mediaIDs[0].mime,
          name: mediaIDs[0].name,
          filename: mediaIDs[0].filename,
          id: mediaIDs[0].id,
          sizes: mediaIDs[0]?.sizes,
        }
      }

    } else {

      const attachmentResponse = await this.getAttachment(currentID); 
      if (attachmentResponse.success === false) {
        if (Array.isArray(mediaIDs)) mediaIDs.shift();
        return {
          'mediaIDs': mediaIDs,
          'data': attachmentResponse.data
        }
      }
      const attachmentData = attachmentResponse.data;
      attachment = {
        attributes: {
          url: attachmentData.url,
          mime: attachmentData.mime,
          name: attachmentData.name,
          filename: attachmentData.filename,
          id: attachmentData.id,
          sizes: attachmentData.sizes,
        }
      }

    }

    if (Array.isArray(mediaIDs)) mediaIDs.shift();

    const mediaType = attachment.attributes.mime.split("/")[0];
    const mediaSubType = attachment.attributes.mime.split("/")[1];

    if (!(0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.maybeCompressAttachment)(mediaType, mediaSubType)) {
      return {
        'mediaIDs': mediaIDs,
        'data': __('Skipped: the image is broken or its format is not supported or excluded from squeezing.', 'squeeze')
      }
    }

    try {
      const compressData = await this.handleCompress( attachment, type );
      const uploadData = await this.handleUpload({ attachment: attachment, base64: compressData, type: type, mediaIDs: mediaIDs })

      return uploadData;

    } catch (error) {
      return {
        'mediaIDs': mediaIDs,
        'data': error?.message ?? error,
        'success': false
      }
    }

  }

  

  handleRestore = async (attachmentID) => {
    const data = {
      action: 'squeeze_restore_attachment',
      _ajax_nonce: this.nonce,
      attachmentID: attachmentID,
    };

    const response = await jQuery.ajax({
      url: this.ajaxUrl,
      type: 'POST',
      data: data,
    });

    return response;
  };

  // Get list of attachments by path
  getAttachmentsByPath = async (path) => {

    const data = {
      action: 'squeeze_get_attachment_by_path',
      path: path,
      _ajax_nonce: this.nonce,
    }

    const response = jQuery.ajax({
      url: this.ajaxUrl,
      type: 'POST',
      data: data,
    });

    return response;
  }

  restorePathBackups = async (path) => {
    const data = {
      action: 'squeeze_restore_path_backups',
      path: path,
      _ajax_nonce: this.nonce,
    };

    return jQuery.ajax({
      url: this.ajaxUrl,
      type: 'POST',
      data: data,
    });
  }

  getAttachment = async (attachmentID) => {
    const data = {
      action: 'squeeze_get_attachment',
      _ajax_nonce: this.nonce,
      attachmentID: attachmentID,
    }

    const response = jQuery.ajax({
      url: this.ajaxUrl,
      type: 'POST',
      data: data,
    });

    return response;
  }

  getNextAttachments = async (page = 1, type = 'uncompressed', lastId = 0) => {
    const data = {
      action: 'squeeze_get_next_attachments',
      _ajax_nonce: this.nonce,
      page: page,
      type: type,
      lastId: lastId,
    }

    const response = jQuery.ajax({
      url: this.ajaxUrl,
      type: 'POST',
      data: data,
    });

    return response;
  }

  getDirectories = async (parentDir = false) => {
    const data = {
      action: 'squeeze_get_directories',
      _ajax_nonce: this.nonce,
    }

    if (parentDir) {
      data['parentDir'] = parentDir;
    }

    const response = jQuery.ajax({
      url: this.ajaxUrl,
      type: 'POST',
      data: data,
    });

    return response;
  }

  

  setOptions = async (options) => {
    const data = {
      action: 'squeeze_set_options',
      _ajax_nonce: this.nonce,
      options: options,
    }

    const response = jQuery.ajax({
      url: this.ajaxUrl,
      type: 'POST',
      data: data,
    });

    return response;
  }

  /**
   * Compresses an image before upload.
   * If the compressSizes parameter is provided, it will compress the sizes specified along with the original image.
   * 
   * @param {File} file - The file to be compressed
   * @param {object} compressSizes - Optional sizes for compression
   * @returns {Promise<object|boolean>} - Returns a Promise that resolves to the compressed file as a base64 object or false if the file is invalid
   */
  compressBeforeUpload = async (file, compressSizes = null) => {
    if (!(file instanceof Blob) && !(file instanceof File) && (file.constructor.name !== 'File')) {
      console.error('Invalid file type:', file);
      return false; // Return false if the file is not a Blob or File
    }

    const attachment = {
      attributes: {
        url: null,
        mime: file.type,
        name: file.name,
        filename: file.name,
        id: 0,
        sizes: compressSizes,
        file: file,
        skipFull: false,
      }
    }

    try {
      const base64Obj = await this.handleCompress(attachment);

      return base64Obj; // Return the compressed file as base64Obj
    } catch (error) {
      console.error(error);
      return error; // Return the error for further handling
    }
  }

  isWebpEncodingSupported = async () => {
    try {
      const canvas = document.createElement('canvas');
      if (!canvas.toDataURL) return false;
      const data = canvas.toDataURL('image/webp');
      // WebP signature starts with "data:image/webp"
      return data.indexOf('data:image/webp') === 0;
    } catch (e) {
      return false;
    }
  }

  handleConvertFileToWebp = async (args) => {
    const timeout = this.timeout;
    
    const { file, sourceType, name } = args;
    const fileBuffer = await file.arrayBuffer();
    const mime = sourceType === 'png' ? 'image/png' : 'image/jpeg';
    const inputBlob = new Blob([fileBuffer], { type: mime });
    // compression options you can tune
    const imageCompressionOptions = {
      useWebWorker: true,
      fileType: 'image/webp',
    };

    return new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
      console.warn('Worker convertToWebp terminated', name);
      reject(new Error(sprintf('😩 ' + __('Request timed out. Try to increase the timeout limit on the Squeeze <a target="_blank" href="%s">settings page</a>.', 'squeeze'), `${this.settingsPageUrl}#:~:text=Squeeze%20timeout`)));
      }, timeout);

      try {

        const compressedBlob = await (0,browser_image_compression__WEBPACK_IMPORTED_MODULE_1__["default"])(inputBlob, imageCompressionOptions);

        // quick checks
        //console.log('compressedBlob.type, size:', compressedBlob.type, compressedBlob.size);
        // normalize final binary
        const webpArrayBuffer = await compressedBlob.arrayBuffer();

        const webpName = name.replace(/\.\w+$/, '.webp');
        const webpFile = new File([webpArrayBuffer], webpName, { type: 'image/webp', lastModified: Date.now() });

        clearTimeout(timeoutId);
        resolve({ webpFile }); // must return object with webpFile prop
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Error during image processing:', error);
        reject(error);
      }
    });
    
  }

  // helper: normalize buffer-like inputs to Uint8Array
  toUint8Array = (bufferLike) => {
    if (bufferLike instanceof Uint8Array) return bufferLike;
    if (bufferLike instanceof ArrayBuffer) return new Uint8Array(bufferLike);
    if (ArrayBuffer.isView(bufferLike)) return new Uint8Array(bufferLike.buffer, bufferLike.byteOffset, bufferLike.byteLength);
    // Node Buffer (in some environments) has .buffer and .byteOffset
    if (bufferLike && typeof bufferLike === 'object' && bufferLike.buffer) {
      return new Uint8Array(bufferLike.buffer, bufferLike.byteOffset || 0, bufferLike.byteLength || bufferLike.length);
    }
    throw new Error('Unsupported buffer type: ' + Object.prototype.toString.call(bufferLike));
  }

  /**
   * Convert an image File to WebP.
   *
   * @param {File} inputFile  — the original image File (e.g. JPEG, PNG).
   * @returns {Promise<File>} — a Promise that resolves to a WebP File.
   */
  convertFileToWebp = async (inputFile) => {
    // Ensure it’s an image
    if (!inputFile.type.startsWith('image/')) {
      throw new Error('Input must be an image File');
    }
    if (this.isCanvasExtractionBlocked()) {
      console.warn('Canvas extraction is blocked');
      // Handle the case where canvas extraction is blocked
      alert(__('Image conversion blocked by browser privacy setting', 'squeeze'));
      throw new Error('Canvas extraction is blocked');
    } else {
      console.log('Canvas extraction is allowed');
    }
    const args = {
      file: inputFile,
      sourceType: inputFile.type.split('/')[1], // e.g. 'jpeg', 'png'
      name: inputFile.name,
    }
    const webpSupported = await this.isWebpEncodingSupported();
    try {
      // Convert the image to WebP
      let webpData;
      if (webpSupported) {
        //console.log('WebP decoding is supported');
        webpData = await this.handleConvertFileToWebp(args);
      } else {
        console.warn('WebP encoding not supported on this device. Using original format instead.');
        const webpName = args.name.replace(/\.\w+$/, '.webp');
        webpData = await this.convertToWebpWithJsquash(inputFile, webpName);
      }
      if (!webpData || !webpData.webpFile) {
        throw new Error('Failed to convert image to WebP');
      }

      return webpData.webpFile; // Return the WebP File

    } catch (error) {
      console.error('Error converting image to WebP:', error);
      throw error; // Re-throw the error for further handling
    }

  }

  /**
 * Convert an input (File | Blob | ArrayBuffer | Uint8Array) to a WebP File using @jsquash/webp.
 * @param {File|Blob|ArrayBuffer|Uint8Array} input
 * @param {string} outputName - desired filename for the .webp output
 * @param {{quality?: number, lossless?: boolean, method?: number}} [opts] - encoder options (quality 0-100)
 * @returns {Promise<File>} - WebP File
 */
  convertToWebpWithJsquash = async (input, outputName = 'out.webp', opts = { quality: 100 }) => {
    // Normalize input to Blob
    let blob;
    if (input instanceof Blob) {
      blob = input;
    } else if (input instanceof ArrayBuffer || ArrayBuffer.isView(input)) {
      blob = new Blob([input]);
    } else {
      throw new Error('Unsupported input type. Provide File, Blob, ArrayBuffer or TypedArray.');
    }

    // Load image into <img>
    const dataURL = await new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });

    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('Failed to load image for conversion'));
      i.src = dataURL;
      // avoid cross-origin taint if data-url is used
    });

    // Draw to canvas and extract ImageData
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // encode -> returns ArrayBuffer (WASM libwebp)
    // opts example: { quality: 75, lossless: false, method: 4 }
    const webpArrayBuffer = await (0,_jsquash_webp__WEBPACK_IMPORTED_MODULE_4__["default"])(imageData, opts);

    // Validate a little (size)
    if (!webpArrayBuffer || webpArrayBuffer.byteLength < 20) {
      throw new Error('jsquash produced an invalid WebP buffer');
    }

    // Wrap into File
    const webpFile = new File([webpArrayBuffer], outputName.replace(/\.\w+$/, '.webp'), {
      type: 'image/webp',
      lastModified: Date.now(),
    });

    return {webpFile};
  }

  isCanvasExtractionBlocked = () => {
    try {
      const c = document.createElement('canvas');
      c.width = 2;
      c.height = 2;
      const ctx = c.getContext('2d');
      if (!ctx) return false; // no ctx => treat as not-blocked here (or handle separately)

      // draw four known opaque pixels (no alpha surprise)
      ctx.fillStyle = 'rgb(255,0,0)'; // top-left
      ctx.fillRect(0, 0, 1, 1);

      ctx.fillStyle = 'rgb(0,255,0)'; // top-right
      ctx.fillRect(1, 0, 1, 1);

      ctx.fillStyle = 'rgb(0,0,255)'; // bottom-left
      ctx.fillRect(0, 1, 1, 1);

      ctx.fillStyle = 'rgb(1,2,3)'; // bottom-right (small values detect naive normalization)
      ctx.fillRect(1, 1, 1, 1);

      let data;
      try {
        data = ctx.getImageData(0, 0, 2, 2).data; // Uint8ClampedArray length 16 (4*2*2)
      } catch (err) {
        // thrown security/blocked error (Firefox/resistFingerprinting sometimes throws)
        if (err && (err.name === 'SecurityError' || /blocked/i.test(err.message))) return true;
        // other errors: be conservative and return false
        return false;
      }

      // Expected RGBA order for pixels (top-left, top-right, bottom-left, bottom-right)
      const expected = new Uint8ClampedArray([
        255, 0,   0,   255,   // top-left
        0,   255, 0,   255,   // top-right
        0,   0,   255, 255,   // bottom-left
        1,   2,   3,   255    // bottom-right
      ]);

      // Compare each channel exactly. If ANY mismatch — canvas data was altered.
      for (let i = 0; i < expected.length; i++) {
        if (data[i] !== expected[i]) {
          // mismatch -> either fingerprint-protection normalized the canvas OR something else tainted it
          return true;
        }
      }

      // No thrown error and pixels match exactly => extraction works
      return false;
    } catch (e) {
      // If something unexpected goes wrong, assume not blocked so caller can handle fallback.
      return false;
    }
  }


}

/***/ }),

/***/ "./assets/js/voxel-upload-compat.js":
/*!******************************************!*\
  !*** ./assets/js/voxel-upload-compat.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "initVoxelUploadCompat": () => (/* binding */ initVoxelUploadCompat)
/* harmony export */ });
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers.js */ "./assets/js/helpers.js");




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
	const { type, subtype } = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.parseMimeType)(fileValue);
	if (!(0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.maybeCompressAttachment)(type, subtype, compressOptions)) {
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
		const outFile = (0,_helpers_js__WEBPACK_IMPORTED_MODULE_0__.base64ToFile)(base64Obj.base64, fileValue.name, fileValue.type);
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
function initVoxelUploadCompat(compressOptions) {
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


/***/ }),

/***/ "./assets/js/worker-pool.js":
/*!**********************************!*\
  !*** ./assets/js/worker-pool.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ WorkerPool)
/* harmony export */ });
/**
 * Small reusable Web Worker pool for Squeeze compression jobs.
 * Avoids new Worker() + WASM cold-start on every image.
 */

class WorkerPool {
  /**
   * @param {number} size
   * @param {() => Worker} createWorker  factory that returns a new Worker
   */
  constructor(size, createWorker) {
    this.size = Math.max(1, size || 1);
    this.createWorker = createWorker;
    this.workers = [];
    this.available = [];
    this.waitQueue = [];
  }

  _spawn() {
    const worker = this.createWorker();
    this.workers.push(worker);
    return worker;
  }

  /**
   * Acquire an idle worker (or spawn up to pool size).
   * @returns {Promise<Worker>}
   */
  acquire() {
    if (this.available.length > 0) {
      return Promise.resolve(this.available.pop());
    }
    if (this.workers.length < this.size) {
      return Promise.resolve(this._spawn());
    }
    return new Promise((resolve) => {
      this.waitQueue.push(resolve);
    });
  }

  /**
   * Return a worker to the pool.
   * @param {Worker} worker
   */
  release(worker) {
    if (!worker || !this.workers.includes(worker)) {
      return;
    }
    if (this.waitQueue.length > 0) {
      const resolve = this.waitQueue.shift();
      resolve(worker);
      return;
    }
    this.available.push(worker);
  }

  /**
   * Replace a dead/hung worker (e.g. after timeout) with a fresh one.
   * @param {Worker} worker
   */
  replace(worker) {
    const idx = this.workers.indexOf(worker);
    if (idx !== -1) {
      this.workers.splice(idx, 1);
    }
    const availIdx = this.available.indexOf(worker);
    if (availIdx !== -1) {
      this.available.splice(availIdx, 1);
    }
    try {
      worker.terminate();
    } catch (e) {
      /* already dead */
    }
  }

  /**
   * Terminate all workers and clear the pool.
   */
  destroy() {
    for (const worker of this.workers) {
      try {
        worker.terminate();
      } catch (e) {
        /* ignore */
      }
    }
    this.workers = [];
    this.available = [];
    this.waitQueue = [];
  }

  get activeCount() {
    return this.workers.length - this.available.length;
  }

  get totalCount() {
    return this.workers.length;
  }
}


/***/ }),

/***/ "./node_modules/@jsquash/webp/encode.js":
/*!**********************************************!*\
  !*** ./node_modules/@jsquash/webp/encode.js ***!
  \**********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ encode),
/* harmony export */   "init": () => (/* binding */ init)
/* harmony export */ });
/* harmony import */ var _meta_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./meta.js */ "./node_modules/@jsquash/webp/meta.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils.js */ "./node_modules/@jsquash/webp/utils.js");
/* harmony import */ var wasm_feature_detect__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! wasm-feature-detect */ "./node_modules/wasm-feature-detect/dist/esm/index.js");
/**
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */



let emscriptenModule;
async function init(module, moduleOptionOverrides) {
    if (await (0,wasm_feature_detect__WEBPACK_IMPORTED_MODULE_0__.simd)()) {
        const webpEncoder = await __webpack_require__.e(/*! import() */ "vendors-node_modules_jsquash_webp_codec_enc_webp_enc_simd_js").then(__webpack_require__.bind(__webpack_require__, /*! ./codec/enc/webp_enc_simd.js */ "./node_modules/@jsquash/webp/codec/enc/webp_enc_simd.js"));
        emscriptenModule = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.initEmscriptenModule)(webpEncoder.default, module, moduleOptionOverrides);
        return emscriptenModule;
    }
    const webpEncoder = await __webpack_require__.e(/*! import() */ "vendors-node_modules_jsquash_webp_codec_enc_webp_enc_js").then(__webpack_require__.bind(__webpack_require__, /*! ./codec/enc/webp_enc.js */ "./node_modules/@jsquash/webp/codec/enc/webp_enc.js"));
    emscriptenModule = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.initEmscriptenModule)(webpEncoder.default, module, moduleOptionOverrides);
    return emscriptenModule;
}
async function encode(data, options = {}) {
    if (!emscriptenModule)
        emscriptenModule = init();
    const _options = { ..._meta_js__WEBPACK_IMPORTED_MODULE_2__.defaultOptions, ...options };
    const module = await emscriptenModule;
    const result = module.encode(data.data, data.width, data.height, _options);
    if (!result)
        throw new Error('Encoding error.');
    return result.buffer;
}


/***/ }),

/***/ "./node_modules/@jsquash/webp/meta.js":
/*!********************************************!*\
  !*** ./node_modules/@jsquash/webp/meta.js ***!
  \********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "defaultOptions": () => (/* binding */ defaultOptions),
/* harmony export */   "extension": () => (/* binding */ extension),
/* harmony export */   "label": () => (/* binding */ label),
/* harmony export */   "mimeType": () => (/* binding */ mimeType)
/* harmony export */ });
const label = 'WebP';
const mimeType = 'image/webp';
const extension = 'webp';
// These come from struct WebPConfig in encode.h.
const defaultOptions = {
    quality: 75,
    target_size: 0,
    target_PSNR: 0,
    method: 4,
    sns_strength: 50,
    filter_strength: 60,
    filter_sharpness: 0,
    filter_type: 1,
    partitions: 0,
    segments: 4,
    pass: 1,
    show_compressed: 0,
    preprocessing: 0,
    autofilter: 0,
    partition_limit: 0,
    alpha_compression: 1,
    alpha_filtering: 1,
    alpha_quality: 100,
    lossless: 0,
    exact: 0,
    image_hint: 0,
    emulate_jpeg_size: 0,
    thread_level: 0,
    low_memory: 0,
    near_lossless: 100,
    use_delta_palette: 0,
    use_sharp_yuv: 0,
};


/***/ }),

/***/ "./node_modules/@jsquash/webp/utils.js":
/*!*********************************************!*\
  !*** ./node_modules/@jsquash/webp/utils.js ***!
  \*********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "initEmscriptenModule": () => (/* binding */ initEmscriptenModule)
/* harmony export */ });
/**
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Notice: I (Jamie Sinclair) have modified this file to allow manual instantiation of the Wasm Module.
 */
function initEmscriptenModule(moduleFactory, wasmModule, moduleOptionOverrides = {}) {
    let instantiateWasm;
    if (wasmModule) {
        instantiateWasm = (imports, callback) => {
            const instance = new WebAssembly.Instance(wasmModule, imports);
            callback(instance);
            return instance.exports;
        };
    }
    return moduleFactory({
        // Just to be safe, don't automatically invoke any wasm functions
        noInitialRun: true,
        instantiateWasm,
        ...moduleOptionOverrides,
    });
}


/***/ }),

/***/ "./node_modules/browser-image-compression/dist/browser-image-compression.mjs":
/*!***********************************************************************************!*\
  !*** ./node_modules/browser-image-compression/dist/browser-image-compression.mjs ***!
  \***********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ imageCompression)
/* harmony export */ });
/**
 * Browser Image Compression
 * v2.0.2
 * by Donald <donaldcwl@gmail.com>
 * https://github.com/Donaldcwl/browser-image-compression
 */

function _mergeNamespaces(e,t){return t.forEach((function(t){t&&"string"!=typeof t&&!Array.isArray(t)&&Object.keys(t).forEach((function(r){if("default"!==r&&!(r in e)){var i=Object.getOwnPropertyDescriptor(t,r);Object.defineProperty(e,r,i.get?i:{enumerable:!0,get:function(){return t[r]}})}}))})),Object.freeze(e)}function copyExifWithoutOrientation(e,t){return new Promise((function(r,i){let o;return getApp1Segment(e).then((function(e){try{return o=e,r(new Blob([t.slice(0,2),o,t.slice(2)],{type:"image/jpeg"}))}catch(e){return i(e)}}),i)}))}const getApp1Segment=e=>new Promise(((t,r)=>{const i=new FileReader;i.addEventListener("load",(({target:{result:e}})=>{const i=new DataView(e);let o=0;if(65496!==i.getUint16(o))return r("not a valid JPEG");for(o+=2;;){const a=i.getUint16(o);if(65498===a)break;const s=i.getUint16(o+2);if(65505===a&&1165519206===i.getUint32(o+4)){const a=o+10;let f;switch(i.getUint16(a)){case 18761:f=!0;break;case 19789:f=!1;break;default:return r("TIFF header contains invalid endian")}if(42!==i.getUint16(a+2,f))return r("TIFF header contains invalid version");const l=i.getUint32(a+4,f),c=a+l+2+12*i.getUint16(a+l,f);for(let e=a+l+2;e<c;e+=12){if(274==i.getUint16(e,f)){if(3!==i.getUint16(e+2,f))return r("Orientation data type is invalid");if(1!==i.getUint32(e+4,f))return r("Orientation data count is invalid");i.setUint16(e+8,1,f);break}}return t(e.slice(o,o+2+s))}o+=2+s}return t(new Blob)})),i.readAsArrayBuffer(e)}));var e={},t={get exports(){return e},set exports(t){e=t}};!function(e){var r,i,UZIP={};t.exports=UZIP,UZIP.parse=function(e,t){for(var r=UZIP.bin.readUshort,i=UZIP.bin.readUint,o=0,a={},s=new Uint8Array(e),f=s.length-4;101010256!=i(s,f);)f--;o=f;o+=4;var l=r(s,o+=4);r(s,o+=2);var c=i(s,o+=2),u=i(s,o+=4);o+=4,o=u;for(var h=0;h<l;h++){i(s,o),o+=4,o+=4,o+=4,i(s,o+=4);c=i(s,o+=4);var d=i(s,o+=4),A=r(s,o+=4),g=r(s,o+2),p=r(s,o+4);o+=6;var m=i(s,o+=8);o+=4,o+=A+g+p,UZIP._readLocal(s,m,a,c,d,t)}return a},UZIP._readLocal=function(e,t,r,i,o,a){var s=UZIP.bin.readUshort,f=UZIP.bin.readUint;f(e,t),s(e,t+=4),s(e,t+=2);var l=s(e,t+=2);f(e,t+=2),f(e,t+=4),t+=4;var c=s(e,t+=8),u=s(e,t+=2);t+=2;var h=UZIP.bin.readUTF8(e,t,c);if(t+=c,t+=u,a)r[h]={size:o,csize:i};else{var d=new Uint8Array(e.buffer,t);if(0==l)r[h]=new Uint8Array(d.buffer.slice(t,t+i));else{if(8!=l)throw"unknown compression method: "+l;var A=new Uint8Array(o);UZIP.inflateRaw(d,A),r[h]=A}}},UZIP.inflateRaw=function(e,t){return UZIP.F.inflate(e,t)},UZIP.inflate=function(e,t){return e[0],e[1],UZIP.inflateRaw(new Uint8Array(e.buffer,e.byteOffset+2,e.length-6),t)},UZIP.deflate=function(e,t){null==t&&(t={level:6});var r=0,i=new Uint8Array(50+Math.floor(1.1*e.length));i[r]=120,i[r+1]=156,r+=2,r=UZIP.F.deflateRaw(e,i,r,t.level);var o=UZIP.adler(e,0,e.length);return i[r+0]=o>>>24&255,i[r+1]=o>>>16&255,i[r+2]=o>>>8&255,i[r+3]=o>>>0&255,new Uint8Array(i.buffer,0,r+4)},UZIP.deflateRaw=function(e,t){null==t&&(t={level:6});var r=new Uint8Array(50+Math.floor(1.1*e.length)),i=UZIP.F.deflateRaw(e,r,i,t.level);return new Uint8Array(r.buffer,0,i)},UZIP.encode=function(e,t){null==t&&(t=!1);var r=0,i=UZIP.bin.writeUint,o=UZIP.bin.writeUshort,a={};for(var s in e){var f=!UZIP._noNeed(s)&&!t,l=e[s],c=UZIP.crc.crc(l,0,l.length);a[s]={cpr:f,usize:l.length,crc:c,file:f?UZIP.deflateRaw(l):l}}for(var s in a)r+=a[s].file.length+30+46+2*UZIP.bin.sizeUTF8(s);r+=22;var u=new Uint8Array(r),h=0,d=[];for(var s in a){var A=a[s];d.push(h),h=UZIP._writeHeader(u,h,s,A,0)}var g=0,p=h;for(var s in a){A=a[s];d.push(h),h=UZIP._writeHeader(u,h,s,A,1,d[g++])}var m=h-p;return i(u,h,101010256),h+=4,o(u,h+=4,g),o(u,h+=2,g),i(u,h+=2,m),i(u,h+=4,p),h+=4,h+=2,u.buffer},UZIP._noNeed=function(e){var t=e.split(".").pop().toLowerCase();return-1!="png,jpg,jpeg,zip".indexOf(t)},UZIP._writeHeader=function(e,t,r,i,o,a){var s=UZIP.bin.writeUint,f=UZIP.bin.writeUshort,l=i.file;return s(e,t,0==o?67324752:33639248),t+=4,1==o&&(t+=2),f(e,t,20),f(e,t+=2,0),f(e,t+=2,i.cpr?8:0),s(e,t+=2,0),s(e,t+=4,i.crc),s(e,t+=4,l.length),s(e,t+=4,i.usize),f(e,t+=4,UZIP.bin.sizeUTF8(r)),f(e,t+=2,0),t+=2,1==o&&(t+=2,t+=2,s(e,t+=6,a),t+=4),t+=UZIP.bin.writeUTF8(e,t,r),0==o&&(e.set(l,t),t+=l.length),t},UZIP.crc={table:function(){for(var e=new Uint32Array(256),t=0;t<256;t++){for(var r=t,i=0;i<8;i++)1&r?r=3988292384^r>>>1:r>>>=1;e[t]=r}return e}(),update:function(e,t,r,i){for(var o=0;o<i;o++)e=UZIP.crc.table[255&(e^t[r+o])]^e>>>8;return e},crc:function(e,t,r){return 4294967295^UZIP.crc.update(4294967295,e,t,r)}},UZIP.adler=function(e,t,r){for(var i=1,o=0,a=t,s=t+r;a<s;){for(var f=Math.min(a+5552,s);a<f;)o+=i+=e[a++];i%=65521,o%=65521}return o<<16|i},UZIP.bin={readUshort:function(e,t){return e[t]|e[t+1]<<8},writeUshort:function(e,t,r){e[t]=255&r,e[t+1]=r>>8&255},readUint:function(e,t){return 16777216*e[t+3]+(e[t+2]<<16|e[t+1]<<8|e[t])},writeUint:function(e,t,r){e[t]=255&r,e[t+1]=r>>8&255,e[t+2]=r>>16&255,e[t+3]=r>>24&255},readASCII:function(e,t,r){for(var i="",o=0;o<r;o++)i+=String.fromCharCode(e[t+o]);return i},writeASCII:function(e,t,r){for(var i=0;i<r.length;i++)e[t+i]=r.charCodeAt(i)},pad:function(e){return e.length<2?"0"+e:e},readUTF8:function(e,t,r){for(var i,o="",a=0;a<r;a++)o+="%"+UZIP.bin.pad(e[t+a].toString(16));try{i=decodeURIComponent(o)}catch(i){return UZIP.bin.readASCII(e,t,r)}return i},writeUTF8:function(e,t,r){for(var i=r.length,o=0,a=0;a<i;a++){var s=r.charCodeAt(a);if(0==(4294967168&s))e[t+o]=s,o++;else if(0==(4294965248&s))e[t+o]=192|s>>6,e[t+o+1]=128|s>>0&63,o+=2;else if(0==(4294901760&s))e[t+o]=224|s>>12,e[t+o+1]=128|s>>6&63,e[t+o+2]=128|s>>0&63,o+=3;else{if(0!=(4292870144&s))throw"e";e[t+o]=240|s>>18,e[t+o+1]=128|s>>12&63,e[t+o+2]=128|s>>6&63,e[t+o+3]=128|s>>0&63,o+=4}}return o},sizeUTF8:function(e){for(var t=e.length,r=0,i=0;i<t;i++){var o=e.charCodeAt(i);if(0==(4294967168&o))r++;else if(0==(4294965248&o))r+=2;else if(0==(4294901760&o))r+=3;else{if(0!=(4292870144&o))throw"e";r+=4}}return r}},UZIP.F={},UZIP.F.deflateRaw=function(e,t,r,i){var o=[[0,0,0,0,0],[4,4,8,4,0],[4,5,16,8,0],[4,6,16,16,0],[4,10,16,32,0],[8,16,32,32,0],[8,16,128,128,0],[8,32,128,256,0],[32,128,258,1024,1],[32,258,258,4096,1]][i],a=UZIP.F.U,s=UZIP.F._goodIndex;UZIP.F._hash;var f=UZIP.F._putsE,l=0,c=r<<3,u=0,h=e.length;if(0==i){for(;l<h;){f(t,c,l+(_=Math.min(65535,h-l))==h?1:0),c=UZIP.F._copyExact(e,l,_,t,c+8),l+=_}return c>>>3}var d=a.lits,A=a.strt,g=a.prev,p=0,m=0,w=0,v=0,b=0,y=0;for(h>2&&(A[y=UZIP.F._hash(e,0)]=0),l=0;l<h;l++){if(b=y,l+1<h-2){y=UZIP.F._hash(e,l+1);var E=l+1&32767;g[E]=A[y],A[y]=E}if(u<=l){(p>14e3||m>26697)&&h-l>100&&(u<l&&(d[p]=l-u,p+=2,u=l),c=UZIP.F._writeBlock(l==h-1||u==h?1:0,d,p,v,e,w,l-w,t,c),p=m=v=0,w=l);var F=0;l<h-2&&(F=UZIP.F._bestMatch(e,l,g,b,Math.min(o[2],h-l),o[3]));var _=F>>>16,B=65535&F;if(0!=F){B=65535&F;var U=s(_=F>>>16,a.of0);a.lhst[257+U]++;var C=s(B,a.df0);a.dhst[C]++,v+=a.exb[U]+a.dxb[C],d[p]=_<<23|l-u,d[p+1]=B<<16|U<<8|C,p+=2,u=l+_}else a.lhst[e[l]]++;m++}}for(w==l&&0!=e.length||(u<l&&(d[p]=l-u,p+=2,u=l),c=UZIP.F._writeBlock(1,d,p,v,e,w,l-w,t,c),p=0,m=0,p=m=v=0,w=l);0!=(7&c);)c++;return c>>>3},UZIP.F._bestMatch=function(e,t,r,i,o,a){var s=32767&t,f=r[s],l=s-f+32768&32767;if(f==s||i!=UZIP.F._hash(e,t-l))return 0;for(var c=0,u=0,h=Math.min(32767,t);l<=h&&0!=--a&&f!=s;){if(0==c||e[t+c]==e[t+c-l]){var d=UZIP.F._howLong(e,t,l);if(d>c){if(u=l,(c=d)>=o)break;l+2<d&&(d=l+2);for(var A=0,g=0;g<d-2;g++){var p=t-l+g+32768&32767,m=p-r[p]+32768&32767;m>A&&(A=m,f=p)}}}l+=(s=f)-(f=r[s])+32768&32767}return c<<16|u},UZIP.F._howLong=function(e,t,r){if(e[t]!=e[t-r]||e[t+1]!=e[t+1-r]||e[t+2]!=e[t+2-r])return 0;var i=t,o=Math.min(e.length,t+258);for(t+=3;t<o&&e[t]==e[t-r];)t++;return t-i},UZIP.F._hash=function(e,t){return(e[t]<<8|e[t+1])+(e[t+2]<<4)&65535},UZIP.saved=0,UZIP.F._writeBlock=function(e,t,r,i,o,a,s,f,l){var c,u,h,d,A,g,p,m,w,v=UZIP.F.U,b=UZIP.F._putsF,y=UZIP.F._putsE;v.lhst[256]++,u=(c=UZIP.F.getTrees())[0],h=c[1],d=c[2],A=c[3],g=c[4],p=c[5],m=c[6],w=c[7];var E=32+(0==(l+3&7)?0:8-(l+3&7))+(s<<3),F=i+UZIP.F.contSize(v.fltree,v.lhst)+UZIP.F.contSize(v.fdtree,v.dhst),_=i+UZIP.F.contSize(v.ltree,v.lhst)+UZIP.F.contSize(v.dtree,v.dhst);_+=14+3*p+UZIP.F.contSize(v.itree,v.ihst)+(2*v.ihst[16]+3*v.ihst[17]+7*v.ihst[18]);for(var B=0;B<286;B++)v.lhst[B]=0;for(B=0;B<30;B++)v.dhst[B]=0;for(B=0;B<19;B++)v.ihst[B]=0;var U=E<F&&E<_?0:F<_?1:2;if(b(f,l,e),b(f,l+1,U),l+=3,0==U){for(;0!=(7&l);)l++;l=UZIP.F._copyExact(o,a,s,f,l)}else{var C,I;if(1==U&&(C=v.fltree,I=v.fdtree),2==U){UZIP.F.makeCodes(v.ltree,u),UZIP.F.revCodes(v.ltree,u),UZIP.F.makeCodes(v.dtree,h),UZIP.F.revCodes(v.dtree,h),UZIP.F.makeCodes(v.itree,d),UZIP.F.revCodes(v.itree,d),C=v.ltree,I=v.dtree,y(f,l,A-257),y(f,l+=5,g-1),y(f,l+=5,p-4),l+=4;for(var Q=0;Q<p;Q++)y(f,l+3*Q,v.itree[1+(v.ordr[Q]<<1)]);l+=3*p,l=UZIP.F._codeTiny(m,v.itree,f,l),l=UZIP.F._codeTiny(w,v.itree,f,l)}for(var M=a,x=0;x<r;x+=2){for(var S=t[x],R=S>>>23,T=M+(8388607&S);M<T;)l=UZIP.F._writeLit(o[M++],C,f,l);if(0!=R){var O=t[x+1],P=O>>16,H=O>>8&255,L=255&O;y(f,l=UZIP.F._writeLit(257+H,C,f,l),R-v.of0[H]),l+=v.exb[H],b(f,l=UZIP.F._writeLit(L,I,f,l),P-v.df0[L]),l+=v.dxb[L],M+=R}}l=UZIP.F._writeLit(256,C,f,l)}return l},UZIP.F._copyExact=function(e,t,r,i,o){var a=o>>>3;return i[a]=r,i[a+1]=r>>>8,i[a+2]=255-i[a],i[a+3]=255-i[a+1],a+=4,i.set(new Uint8Array(e.buffer,t,r),a),o+(r+4<<3)},UZIP.F.getTrees=function(){for(var e=UZIP.F.U,t=UZIP.F._hufTree(e.lhst,e.ltree,15),r=UZIP.F._hufTree(e.dhst,e.dtree,15),i=[],o=UZIP.F._lenCodes(e.ltree,i),a=[],s=UZIP.F._lenCodes(e.dtree,a),f=0;f<i.length;f+=2)e.ihst[i[f]]++;for(f=0;f<a.length;f+=2)e.ihst[a[f]]++;for(var l=UZIP.F._hufTree(e.ihst,e.itree,7),c=19;c>4&&0==e.itree[1+(e.ordr[c-1]<<1)];)c--;return[t,r,l,o,s,c,i,a]},UZIP.F.getSecond=function(e){for(var t=[],r=0;r<e.length;r+=2)t.push(e[r+1]);return t},UZIP.F.nonZero=function(e){for(var t="",r=0;r<e.length;r+=2)0!=e[r+1]&&(t+=(r>>1)+",");return t},UZIP.F.contSize=function(e,t){for(var r=0,i=0;i<t.length;i++)r+=t[i]*e[1+(i<<1)];return r},UZIP.F._codeTiny=function(e,t,r,i){for(var o=0;o<e.length;o+=2){var a=e[o],s=e[o+1];i=UZIP.F._writeLit(a,t,r,i);var f=16==a?2:17==a?3:7;a>15&&(UZIP.F._putsE(r,i,s,f),i+=f)}return i},UZIP.F._lenCodes=function(e,t){for(var r=e.length;2!=r&&0==e[r-1];)r-=2;for(var i=0;i<r;i+=2){var o=e[i+1],a=i+3<r?e[i+3]:-1,s=i+5<r?e[i+5]:-1,f=0==i?-1:e[i-1];if(0==o&&a==o&&s==o){for(var l=i+5;l+2<r&&e[l+2]==o;)l+=2;(c=Math.min(l+1-i>>>1,138))<11?t.push(17,c-3):t.push(18,c-11),i+=2*c-2}else if(o==f&&a==o&&s==o){for(l=i+5;l+2<r&&e[l+2]==o;)l+=2;var c=Math.min(l+1-i>>>1,6);t.push(16,c-3),i+=2*c-2}else t.push(o,0)}return r>>>1},UZIP.F._hufTree=function(e,t,r){var i=[],o=e.length,a=t.length,s=0;for(s=0;s<a;s+=2)t[s]=0,t[s+1]=0;for(s=0;s<o;s++)0!=e[s]&&i.push({lit:s,f:e[s]});var f=i.length,l=i.slice(0);if(0==f)return 0;if(1==f){var c=i[0].lit;l=0==c?1:0;return t[1+(c<<1)]=1,t[1+(l<<1)]=1,1}i.sort((function(e,t){return e.f-t.f}));var u=i[0],h=i[1],d=0,A=1,g=2;for(i[0]={lit:-1,f:u.f+h.f,l:u,r:h,d:0};A!=f-1;)u=d!=A&&(g==f||i[d].f<i[g].f)?i[d++]:i[g++],h=d!=A&&(g==f||i[d].f<i[g].f)?i[d++]:i[g++],i[A++]={lit:-1,f:u.f+h.f,l:u,r:h};var p=UZIP.F.setDepth(i[A-1],0);for(p>r&&(UZIP.F.restrictDepth(l,r,p),p=r),s=0;s<f;s++)t[1+(l[s].lit<<1)]=l[s].d;return p},UZIP.F.setDepth=function(e,t){return-1!=e.lit?(e.d=t,t):Math.max(UZIP.F.setDepth(e.l,t+1),UZIP.F.setDepth(e.r,t+1))},UZIP.F.restrictDepth=function(e,t,r){var i=0,o=1<<r-t,a=0;for(e.sort((function(e,t){return t.d==e.d?e.f-t.f:t.d-e.d})),i=0;i<e.length&&e[i].d>t;i++){var s=e[i].d;e[i].d=t,a+=o-(1<<r-s)}for(a>>>=r-t;a>0;){(s=e[i].d)<t?(e[i].d++,a-=1<<t-s-1):i++}for(;i>=0;i--)e[i].d==t&&a<0&&(e[i].d--,a++);0!=a&&console.log("debt left")},UZIP.F._goodIndex=function(e,t){var r=0;return t[16|r]<=e&&(r|=16),t[8|r]<=e&&(r|=8),t[4|r]<=e&&(r|=4),t[2|r]<=e&&(r|=2),t[1|r]<=e&&(r|=1),r},UZIP.F._writeLit=function(e,t,r,i){return UZIP.F._putsF(r,i,t[e<<1]),i+t[1+(e<<1)]},UZIP.F.inflate=function(e,t){var r=Uint8Array;if(3==e[0]&&0==e[1])return t||new r(0);var i=UZIP.F,o=i._bitsF,a=i._bitsE,s=i._decodeTiny,f=i.makeCodes,l=i.codes2map,c=i._get17,u=i.U,h=null==t;h&&(t=new r(e.length>>>2<<3));for(var d,A,g=0,p=0,m=0,w=0,v=0,b=0,y=0,E=0,F=0;0==g;)if(g=o(e,F,1),p=o(e,F+1,2),F+=3,0!=p){if(h&&(t=UZIP.F._check(t,E+(1<<17))),1==p&&(d=u.flmap,A=u.fdmap,b=511,y=31),2==p){m=a(e,F,5)+257,w=a(e,F+5,5)+1,v=a(e,F+10,4)+4,F+=14;for(var _=0;_<38;_+=2)u.itree[_]=0,u.itree[_+1]=0;var B=1;for(_=0;_<v;_++){var U=a(e,F+3*_,3);u.itree[1+(u.ordr[_]<<1)]=U,U>B&&(B=U)}F+=3*v,f(u.itree,B),l(u.itree,B,u.imap),d=u.lmap,A=u.dmap,F=s(u.imap,(1<<B)-1,m+w,e,F,u.ttree);var C=i._copyOut(u.ttree,0,m,u.ltree);b=(1<<C)-1;var I=i._copyOut(u.ttree,m,w,u.dtree);y=(1<<I)-1,f(u.ltree,C),l(u.ltree,C,d),f(u.dtree,I),l(u.dtree,I,A)}for(;;){var Q=d[c(e,F)&b];F+=15&Q;var M=Q>>>4;if(M>>>8==0)t[E++]=M;else{if(256==M)break;var x=E+M-254;if(M>264){var S=u.ldef[M-257];x=E+(S>>>3)+a(e,F,7&S),F+=7&S}var R=A[c(e,F)&y];F+=15&R;var T=R>>>4,O=u.ddef[T],P=(O>>>4)+o(e,F,15&O);for(F+=15&O,h&&(t=UZIP.F._check(t,E+(1<<17)));E<x;)t[E]=t[E++-P],t[E]=t[E++-P],t[E]=t[E++-P],t[E]=t[E++-P];E=x}}}else{0!=(7&F)&&(F+=8-(7&F));var H=4+(F>>>3),L=e[H-4]|e[H-3]<<8;h&&(t=UZIP.F._check(t,E+L)),t.set(new r(e.buffer,e.byteOffset+H,L),E),F=H+L<<3,E+=L}return t.length==E?t:t.slice(0,E)},UZIP.F._check=function(e,t){var r=e.length;if(t<=r)return e;var i=new Uint8Array(Math.max(r<<1,t));return i.set(e,0),i},UZIP.F._decodeTiny=function(e,t,r,i,o,a){for(var s=UZIP.F._bitsE,f=UZIP.F._get17,l=0;l<r;){var c=e[f(i,o)&t];o+=15&c;var u=c>>>4;if(u<=15)a[l]=u,l++;else{var h=0,d=0;16==u?(d=3+s(i,o,2),o+=2,h=a[l-1]):17==u?(d=3+s(i,o,3),o+=3):18==u&&(d=11+s(i,o,7),o+=7);for(var A=l+d;l<A;)a[l]=h,l++}}return o},UZIP.F._copyOut=function(e,t,r,i){for(var o=0,a=0,s=i.length>>>1;a<r;){var f=e[a+t];i[a<<1]=0,i[1+(a<<1)]=f,f>o&&(o=f),a++}for(;a<s;)i[a<<1]=0,i[1+(a<<1)]=0,a++;return o},UZIP.F.makeCodes=function(e,t){for(var r,i,o,a,s=UZIP.F.U,f=e.length,l=s.bl_count,c=0;c<=t;c++)l[c]=0;for(c=1;c<f;c+=2)l[e[c]]++;var u=s.next_code;for(r=0,l[0]=0,i=1;i<=t;i++)r=r+l[i-1]<<1,u[i]=r;for(o=0;o<f;o+=2)0!=(a=e[o+1])&&(e[o]=u[a],u[a]++)},UZIP.F.codes2map=function(e,t,r){for(var i=e.length,o=UZIP.F.U.rev15,a=0;a<i;a+=2)if(0!=e[a+1])for(var s=a>>1,f=e[a+1],l=s<<4|f,c=t-f,u=e[a]<<c,h=u+(1<<c);u!=h;){r[o[u]>>>15-t]=l,u++}},UZIP.F.revCodes=function(e,t){for(var r=UZIP.F.U.rev15,i=15-t,o=0;o<e.length;o+=2){var a=e[o]<<t-e[o+1];e[o]=r[a]>>>i}},UZIP.F._putsE=function(e,t,r){r<<=7&t;var i=t>>>3;e[i]|=r,e[i+1]|=r>>>8},UZIP.F._putsF=function(e,t,r){r<<=7&t;var i=t>>>3;e[i]|=r,e[i+1]|=r>>>8,e[i+2]|=r>>>16},UZIP.F._bitsE=function(e,t,r){return(e[t>>>3]|e[1+(t>>>3)]<<8)>>>(7&t)&(1<<r)-1},UZIP.F._bitsF=function(e,t,r){return(e[t>>>3]|e[1+(t>>>3)]<<8|e[2+(t>>>3)]<<16)>>>(7&t)&(1<<r)-1},UZIP.F._get17=function(e,t){return(e[t>>>3]|e[1+(t>>>3)]<<8|e[2+(t>>>3)]<<16)>>>(7&t)},UZIP.F._get25=function(e,t){return(e[t>>>3]|e[1+(t>>>3)]<<8|e[2+(t>>>3)]<<16|e[3+(t>>>3)]<<24)>>>(7&t)},UZIP.F.U=(r=Uint16Array,i=Uint32Array,{next_code:new r(16),bl_count:new r(16),ordr:[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],of0:[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,999,999,999],exb:[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0],ldef:new r(32),df0:[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,65535,65535],dxb:[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0],ddef:new i(32),flmap:new r(512),fltree:[],fdmap:new r(32),fdtree:[],lmap:new r(32768),ltree:[],ttree:[],dmap:new r(32768),dtree:[],imap:new r(512),itree:[],rev15:new r(32768),lhst:new i(286),dhst:new i(30),ihst:new i(19),lits:new i(15e3),strt:new r(65536),prev:new r(32768)}),function(){for(var e=UZIP.F.U,t=0;t<32768;t++){var r=t;r=(4278255360&(r=(4042322160&(r=(3435973836&(r=(2863311530&r)>>>1|(1431655765&r)<<1))>>>2|(858993459&r)<<2))>>>4|(252645135&r)<<4))>>>8|(16711935&r)<<8,e.rev15[t]=(r>>>16|r<<16)>>>17}function pushV(e,t,r){for(;0!=t--;)e.push(0,r)}for(t=0;t<32;t++)e.ldef[t]=e.of0[t]<<3|e.exb[t],e.ddef[t]=e.df0[t]<<4|e.dxb[t];pushV(e.fltree,144,8),pushV(e.fltree,112,9),pushV(e.fltree,24,7),pushV(e.fltree,8,8),UZIP.F.makeCodes(e.fltree,9),UZIP.F.codes2map(e.fltree,9,e.flmap),UZIP.F.revCodes(e.fltree,9),pushV(e.fdtree,32,5),UZIP.F.makeCodes(e.fdtree,5),UZIP.F.codes2map(e.fdtree,5,e.fdmap),UZIP.F.revCodes(e.fdtree,5),pushV(e.itree,19,0),pushV(e.ltree,286,0),pushV(e.dtree,30,0),pushV(e.ttree,320,0)}()}();var UZIP=_mergeNamespaces({__proto__:null,default:e},[e]);const UPNG=function(){var e={nextZero(e,t){for(;0!=e[t];)t++;return t},readUshort:(e,t)=>e[t]<<8|e[t+1],writeUshort(e,t,r){e[t]=r>>8&255,e[t+1]=255&r},readUint:(e,t)=>16777216*e[t]+(e[t+1]<<16|e[t+2]<<8|e[t+3]),writeUint(e,t,r){e[t]=r>>24&255,e[t+1]=r>>16&255,e[t+2]=r>>8&255,e[t+3]=255&r},readASCII(e,t,r){let i="";for(let o=0;o<r;o++)i+=String.fromCharCode(e[t+o]);return i},writeASCII(e,t,r){for(let i=0;i<r.length;i++)e[t+i]=r.charCodeAt(i)},readBytes(e,t,r){const i=[];for(let o=0;o<r;o++)i.push(e[t+o]);return i},pad:e=>e.length<2?`0${e}`:e,readUTF8(t,r,i){let o,a="";for(let o=0;o<i;o++)a+=`%${e.pad(t[r+o].toString(16))}`;try{o=decodeURIComponent(a)}catch(o){return e.readASCII(t,r,i)}return o}};function decodeImage(t,r,i,o){const a=r*i,s=_getBPP(o),f=Math.ceil(r*s/8),l=new Uint8Array(4*a),c=new Uint32Array(l.buffer),{ctype:u}=o,{depth:h}=o,d=e.readUshort;if(6==u){const e=a<<2;if(8==h)for(var A=0;A<e;A+=4)l[A]=t[A],l[A+1]=t[A+1],l[A+2]=t[A+2],l[A+3]=t[A+3];if(16==h)for(A=0;A<e;A++)l[A]=t[A<<1]}else if(2==u){const e=o.tabs.tRNS;if(null==e){if(8==h)for(A=0;A<a;A++){var g=3*A;c[A]=255<<24|t[g+2]<<16|t[g+1]<<8|t[g]}if(16==h)for(A=0;A<a;A++){g=6*A;c[A]=255<<24|t[g+4]<<16|t[g+2]<<8|t[g]}}else{var p=e[0];const r=e[1],i=e[2];if(8==h)for(A=0;A<a;A++){var m=A<<2;g=3*A;c[A]=255<<24|t[g+2]<<16|t[g+1]<<8|t[g],t[g]==p&&t[g+1]==r&&t[g+2]==i&&(l[m+3]=0)}if(16==h)for(A=0;A<a;A++){m=A<<2,g=6*A;c[A]=255<<24|t[g+4]<<16|t[g+2]<<8|t[g],d(t,g)==p&&d(t,g+2)==r&&d(t,g+4)==i&&(l[m+3]=0)}}}else if(3==u){const e=o.tabs.PLTE,s=o.tabs.tRNS,c=s?s.length:0;if(1==h)for(var w=0;w<i;w++){var v=w*f,b=w*r;for(A=0;A<r;A++){m=b+A<<2;var y=3*(E=t[v+(A>>3)]>>7-((7&A)<<0)&1);l[m]=e[y],l[m+1]=e[y+1],l[m+2]=e[y+2],l[m+3]=E<c?s[E]:255}}if(2==h)for(w=0;w<i;w++)for(v=w*f,b=w*r,A=0;A<r;A++){m=b+A<<2,y=3*(E=t[v+(A>>2)]>>6-((3&A)<<1)&3);l[m]=e[y],l[m+1]=e[y+1],l[m+2]=e[y+2],l[m+3]=E<c?s[E]:255}if(4==h)for(w=0;w<i;w++)for(v=w*f,b=w*r,A=0;A<r;A++){m=b+A<<2,y=3*(E=t[v+(A>>1)]>>4-((1&A)<<2)&15);l[m]=e[y],l[m+1]=e[y+1],l[m+2]=e[y+2],l[m+3]=E<c?s[E]:255}if(8==h)for(A=0;A<a;A++){var E;m=A<<2,y=3*(E=t[A]);l[m]=e[y],l[m+1]=e[y+1],l[m+2]=e[y+2],l[m+3]=E<c?s[E]:255}}else if(4==u){if(8==h)for(A=0;A<a;A++){m=A<<2;var F=t[_=A<<1];l[m]=F,l[m+1]=F,l[m+2]=F,l[m+3]=t[_+1]}if(16==h)for(A=0;A<a;A++){var _;m=A<<2,F=t[_=A<<2];l[m]=F,l[m+1]=F,l[m+2]=F,l[m+3]=t[_+2]}}else if(0==u)for(p=o.tabs.tRNS?o.tabs.tRNS:-1,w=0;w<i;w++){const e=w*f,i=w*r;if(1==h)for(var B=0;B<r;B++){var U=(F=255*(t[e+(B>>>3)]>>>7-(7&B)&1))==255*p?0:255;c[i+B]=U<<24|F<<16|F<<8|F}else if(2==h)for(B=0;B<r;B++){U=(F=85*(t[e+(B>>>2)]>>>6-((3&B)<<1)&3))==85*p?0:255;c[i+B]=U<<24|F<<16|F<<8|F}else if(4==h)for(B=0;B<r;B++){U=(F=17*(t[e+(B>>>1)]>>>4-((1&B)<<2)&15))==17*p?0:255;c[i+B]=U<<24|F<<16|F<<8|F}else if(8==h)for(B=0;B<r;B++){U=(F=t[e+B])==p?0:255;c[i+B]=U<<24|F<<16|F<<8|F}else if(16==h)for(B=0;B<r;B++){F=t[e+(B<<1)],U=d(t,e+(B<<1))==p?0:255;c[i+B]=U<<24|F<<16|F<<8|F}}return l}function _decompress(e,r,i,o){const a=_getBPP(e),s=Math.ceil(i*a/8),f=new Uint8Array((s+1+e.interlace)*o);return r=e.tabs.CgBI?t(r,f):_inflate(r,f),0==e.interlace?r=_filterZero(r,e,0,i,o):1==e.interlace&&(r=function _readInterlace(e,t){const r=t.width,i=t.height,o=_getBPP(t),a=o>>3,s=Math.ceil(r*o/8),f=new Uint8Array(i*s);let l=0;const c=[0,0,4,0,2,0,1],u=[0,4,0,2,0,1,0],h=[8,8,8,4,4,2,2],d=[8,8,4,4,2,2,1];let A=0;for(;A<7;){const p=h[A],m=d[A];let w=0,v=0,b=c[A];for(;b<i;)b+=p,v++;let y=u[A];for(;y<r;)y+=m,w++;const E=Math.ceil(w*o/8);_filterZero(e,t,l,w,v);let F=0,_=c[A];for(;_<i;){let t=u[A],i=l+F*E<<3;for(;t<r;){var g;if(1==o)g=(g=e[i>>3])>>7-(7&i)&1,f[_*s+(t>>3)]|=g<<7-((7&t)<<0);if(2==o)g=(g=e[i>>3])>>6-(7&i)&3,f[_*s+(t>>2)]|=g<<6-((3&t)<<1);if(4==o)g=(g=e[i>>3])>>4-(7&i)&15,f[_*s+(t>>1)]|=g<<4-((1&t)<<2);if(o>=8){const r=_*s+t*a;for(let t=0;t<a;t++)f[r+t]=e[(i>>3)+t]}i+=o,t+=m}F++,_+=p}w*v!=0&&(l+=v*(1+E)),A+=1}return f}(r,e)),r}function _inflate(e,r){return t(new Uint8Array(e.buffer,2,e.length-6),r)}var t=function(){const e={H:{}};return e.H.N=function(t,r){const i=Uint8Array;let o,a,s=0,f=0,l=0,c=0,u=0,h=0,d=0,A=0,g=0;if(3==t[0]&&0==t[1])return r||new i(0);const p=e.H,m=p.b,w=p.e,v=p.R,b=p.n,y=p.A,E=p.Z,F=p.m,_=null==r;for(_&&(r=new i(t.length>>>2<<5));0==s;)if(s=m(t,g,1),f=m(t,g+1,2),g+=3,0!=f){if(_&&(r=e.H.W(r,A+(1<<17))),1==f&&(o=F.J,a=F.h,h=511,d=31),2==f){l=w(t,g,5)+257,c=w(t,g+5,5)+1,u=w(t,g+10,4)+4,g+=14;let e=1;for(var B=0;B<38;B+=2)F.Q[B]=0,F.Q[B+1]=0;for(B=0;B<u;B++){const r=w(t,g+3*B,3);F.Q[1+(F.X[B]<<1)]=r,r>e&&(e=r)}g+=3*u,b(F.Q,e),y(F.Q,e,F.u),o=F.w,a=F.d,g=v(F.u,(1<<e)-1,l+c,t,g,F.v);const r=p.V(F.v,0,l,F.C);h=(1<<r)-1;const i=p.V(F.v,l,c,F.D);d=(1<<i)-1,b(F.C,r),y(F.C,r,o),b(F.D,i),y(F.D,i,a)}for(;;){const e=o[E(t,g)&h];g+=15&e;const i=e>>>4;if(i>>>8==0)r[A++]=i;else{if(256==i)break;{let e=A+i-254;if(i>264){const r=F.q[i-257];e=A+(r>>>3)+w(t,g,7&r),g+=7&r}const o=a[E(t,g)&d];g+=15&o;const s=o>>>4,f=F.c[s],l=(f>>>4)+m(t,g,15&f);for(g+=15&f;A<e;)r[A]=r[A++-l],r[A]=r[A++-l],r[A]=r[A++-l],r[A]=r[A++-l];A=e}}}}else{0!=(7&g)&&(g+=8-(7&g));const o=4+(g>>>3),a=t[o-4]|t[o-3]<<8;_&&(r=e.H.W(r,A+a)),r.set(new i(t.buffer,t.byteOffset+o,a),A),g=o+a<<3,A+=a}return r.length==A?r:r.slice(0,A)},e.H.W=function(e,t){const r=e.length;if(t<=r)return e;const i=new Uint8Array(r<<1);return i.set(e,0),i},e.H.R=function(t,r,i,o,a,s){const f=e.H.e,l=e.H.Z;let c=0;for(;c<i;){const e=t[l(o,a)&r];a+=15&e;const i=e>>>4;if(i<=15)s[c]=i,c++;else{let e=0,t=0;16==i?(t=3+f(o,a,2),a+=2,e=s[c-1]):17==i?(t=3+f(o,a,3),a+=3):18==i&&(t=11+f(o,a,7),a+=7);const r=c+t;for(;c<r;)s[c]=e,c++}}return a},e.H.V=function(e,t,r,i){let o=0,a=0;const s=i.length>>>1;for(;a<r;){const r=e[a+t];i[a<<1]=0,i[1+(a<<1)]=r,r>o&&(o=r),a++}for(;a<s;)i[a<<1]=0,i[1+(a<<1)]=0,a++;return o},e.H.n=function(t,r){const i=e.H.m,o=t.length;let a,s,f;let l;const c=i.j;for(var u=0;u<=r;u++)c[u]=0;for(u=1;u<o;u+=2)c[t[u]]++;const h=i.K;for(a=0,c[0]=0,s=1;s<=r;s++)a=a+c[s-1]<<1,h[s]=a;for(f=0;f<o;f+=2)l=t[f+1],0!=l&&(t[f]=h[l],h[l]++)},e.H.A=function(t,r,i){const o=t.length,a=e.H.m.r;for(let e=0;e<o;e+=2)if(0!=t[e+1]){const o=e>>1,s=t[e+1],f=o<<4|s,l=r-s;let c=t[e]<<l;const u=c+(1<<l);for(;c!=u;){i[a[c]>>>15-r]=f,c++}}},e.H.l=function(t,r){const i=e.H.m.r,o=15-r;for(let e=0;e<t.length;e+=2){const a=t[e]<<r-t[e+1];t[e]=i[a]>>>o}},e.H.M=function(e,t,r){r<<=7&t;const i=t>>>3;e[i]|=r,e[i+1]|=r>>>8},e.H.I=function(e,t,r){r<<=7&t;const i=t>>>3;e[i]|=r,e[i+1]|=r>>>8,e[i+2]|=r>>>16},e.H.e=function(e,t,r){return(e[t>>>3]|e[1+(t>>>3)]<<8)>>>(7&t)&(1<<r)-1},e.H.b=function(e,t,r){return(e[t>>>3]|e[1+(t>>>3)]<<8|e[2+(t>>>3)]<<16)>>>(7&t)&(1<<r)-1},e.H.Z=function(e,t){return(e[t>>>3]|e[1+(t>>>3)]<<8|e[2+(t>>>3)]<<16)>>>(7&t)},e.H.i=function(e,t){return(e[t>>>3]|e[1+(t>>>3)]<<8|e[2+(t>>>3)]<<16|e[3+(t>>>3)]<<24)>>>(7&t)},e.H.m=function(){const e=Uint16Array,t=Uint32Array;return{K:new e(16),j:new e(16),X:[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],S:[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,999,999,999],T:[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0],q:new e(32),p:[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,65535,65535],z:[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0],c:new t(32),J:new e(512),_:[],h:new e(32),$:[],w:new e(32768),C:[],v:[],d:new e(32768),D:[],u:new e(512),Q:[],r:new e(32768),s:new t(286),Y:new t(30),a:new t(19),t:new t(15e3),k:new e(65536),g:new e(32768)}}(),function(){const t=e.H.m;for(var r=0;r<32768;r++){let e=r;e=(2863311530&e)>>>1|(1431655765&e)<<1,e=(3435973836&e)>>>2|(858993459&e)<<2,e=(4042322160&e)>>>4|(252645135&e)<<4,e=(4278255360&e)>>>8|(16711935&e)<<8,t.r[r]=(e>>>16|e<<16)>>>17}function n(e,t,r){for(;0!=t--;)e.push(0,r)}for(r=0;r<32;r++)t.q[r]=t.S[r]<<3|t.T[r],t.c[r]=t.p[r]<<4|t.z[r];n(t._,144,8),n(t._,112,9),n(t._,24,7),n(t._,8,8),e.H.n(t._,9),e.H.A(t._,9,t.J),e.H.l(t._,9),n(t.$,32,5),e.H.n(t.$,5),e.H.A(t.$,5,t.h),e.H.l(t.$,5),n(t.Q,19,0),n(t.C,286,0),n(t.D,30,0),n(t.v,320,0)}(),e.H.N}();function _getBPP(e){return[1,null,3,1,2,null,4][e.ctype]*e.depth}function _filterZero(e,t,r,i,o){let a=_getBPP(t);const s=Math.ceil(i*a/8);let f,l;a=Math.ceil(a/8);let c=e[r],u=0;if(c>1&&(e[r]=[0,0,1][c-2]),3==c)for(u=a;u<s;u++)e[u+1]=e[u+1]+(e[u+1-a]>>>1)&255;for(let t=0;t<o;t++)if(f=r+t*s,l=f+t+1,c=e[l-1],u=0,0==c)for(;u<s;u++)e[f+u]=e[l+u];else if(1==c){for(;u<a;u++)e[f+u]=e[l+u];for(;u<s;u++)e[f+u]=e[l+u]+e[f+u-a]}else if(2==c)for(;u<s;u++)e[f+u]=e[l+u]+e[f+u-s];else if(3==c){for(;u<a;u++)e[f+u]=e[l+u]+(e[f+u-s]>>>1);for(;u<s;u++)e[f+u]=e[l+u]+(e[f+u-s]+e[f+u-a]>>>1)}else{for(;u<a;u++)e[f+u]=e[l+u]+_paeth(0,e[f+u-s],0);for(;u<s;u++)e[f+u]=e[l+u]+_paeth(e[f+u-a],e[f+u-s],e[f+u-a-s])}return e}function _paeth(e,t,r){const i=e+t-r,o=i-e,a=i-t,s=i-r;return o*o<=a*a&&o*o<=s*s?e:a*a<=s*s?t:r}function _IHDR(t,r,i){i.width=e.readUint(t,r),r+=4,i.height=e.readUint(t,r),r+=4,i.depth=t[r],r++,i.ctype=t[r],r++,i.compress=t[r],r++,i.filter=t[r],r++,i.interlace=t[r],r++}function _copyTile(e,t,r,i,o,a,s,f,l){const c=Math.min(t,o),u=Math.min(r,a);let h=0,d=0;for(let r=0;r<u;r++)for(let a=0;a<c;a++)if(s>=0&&f>=0?(h=r*t+a<<2,d=(f+r)*o+s+a<<2):(h=(-f+r)*t-s+a<<2,d=r*o+a<<2),0==l)i[d]=e[h],i[d+1]=e[h+1],i[d+2]=e[h+2],i[d+3]=e[h+3];else if(1==l){var A=e[h+3]*(1/255),g=e[h]*A,p=e[h+1]*A,m=e[h+2]*A,w=i[d+3]*(1/255),v=i[d]*w,b=i[d+1]*w,y=i[d+2]*w;const t=1-A,r=A+w*t,o=0==r?0:1/r;i[d+3]=255*r,i[d+0]=(g+v*t)*o,i[d+1]=(p+b*t)*o,i[d+2]=(m+y*t)*o}else if(2==l){A=e[h+3],g=e[h],p=e[h+1],m=e[h+2],w=i[d+3],v=i[d],b=i[d+1],y=i[d+2];A==w&&g==v&&p==b&&m==y?(i[d]=0,i[d+1]=0,i[d+2]=0,i[d+3]=0):(i[d]=g,i[d+1]=p,i[d+2]=m,i[d+3]=A)}else if(3==l){A=e[h+3],g=e[h],p=e[h+1],m=e[h+2],w=i[d+3],v=i[d],b=i[d+1],y=i[d+2];if(A==w&&g==v&&p==b&&m==y)continue;if(A<220&&w>20)return!1}return!0}return{decode:function decode(r){const i=new Uint8Array(r);let o=8;const a=e,s=a.readUshort,f=a.readUint,l={tabs:{},frames:[]},c=new Uint8Array(i.length);let u,h=0,d=0;const A=[137,80,78,71,13,10,26,10];for(var g=0;g<8;g++)if(i[g]!=A[g])throw"The input is not a PNG file!";for(;o<i.length;){const e=a.readUint(i,o);o+=4;const r=a.readASCII(i,o,4);if(o+=4,"IHDR"==r)_IHDR(i,o,l);else if("iCCP"==r){for(var p=o;0!=i[p];)p++;a.readASCII(i,o,p-o),i[p+1];const s=i.slice(p+2,o+e);let f=null;try{f=_inflate(s)}catch(e){f=t(s)}l.tabs[r]=f}else if("CgBI"==r)l.tabs[r]=i.slice(o,o+4);else if("IDAT"==r){for(g=0;g<e;g++)c[h+g]=i[o+g];h+=e}else if("acTL"==r)l.tabs[r]={num_frames:f(i,o),num_plays:f(i,o+4)},u=new Uint8Array(i.length);else if("fcTL"==r){if(0!=d)(E=l.frames[l.frames.length-1]).data=_decompress(l,u.slice(0,d),E.rect.width,E.rect.height),d=0;const e={x:f(i,o+12),y:f(i,o+16),width:f(i,o+4),height:f(i,o+8)};let t=s(i,o+22);t=s(i,o+20)/(0==t?100:t);const r={rect:e,delay:Math.round(1e3*t),dispose:i[o+24],blend:i[o+25]};l.frames.push(r)}else if("fdAT"==r){for(g=0;g<e-4;g++)u[d+g]=i[o+g+4];d+=e-4}else if("pHYs"==r)l.tabs[r]=[a.readUint(i,o),a.readUint(i,o+4),i[o+8]];else if("cHRM"==r){l.tabs[r]=[];for(g=0;g<8;g++)l.tabs[r].push(a.readUint(i,o+4*g))}else if("tEXt"==r||"zTXt"==r){null==l.tabs[r]&&(l.tabs[r]={});var m=a.nextZero(i,o),w=a.readASCII(i,o,m-o),v=o+e-m-1;if("tEXt"==r)y=a.readASCII(i,m+1,v);else{var b=_inflate(i.slice(m+2,m+2+v));y=a.readUTF8(b,0,b.length)}l.tabs[r][w]=y}else if("iTXt"==r){null==l.tabs[r]&&(l.tabs[r]={});m=0,p=o;m=a.nextZero(i,p);w=a.readASCII(i,p,m-p);const t=i[p=m+1];var y;i[p+1],p+=2,m=a.nextZero(i,p),a.readASCII(i,p,m-p),p=m+1,m=a.nextZero(i,p),a.readUTF8(i,p,m-p);v=e-((p=m+1)-o);if(0==t)y=a.readUTF8(i,p,v);else{b=_inflate(i.slice(p,p+v));y=a.readUTF8(b,0,b.length)}l.tabs[r][w]=y}else if("PLTE"==r)l.tabs[r]=a.readBytes(i,o,e);else if("hIST"==r){const e=l.tabs.PLTE.length/3;l.tabs[r]=[];for(g=0;g<e;g++)l.tabs[r].push(s(i,o+2*g))}else if("tRNS"==r)3==l.ctype?l.tabs[r]=a.readBytes(i,o,e):0==l.ctype?l.tabs[r]=s(i,o):2==l.ctype&&(l.tabs[r]=[s(i,o),s(i,o+2),s(i,o+4)]);else if("gAMA"==r)l.tabs[r]=a.readUint(i,o)/1e5;else if("sRGB"==r)l.tabs[r]=i[o];else if("bKGD"==r)0==l.ctype||4==l.ctype?l.tabs[r]=[s(i,o)]:2==l.ctype||6==l.ctype?l.tabs[r]=[s(i,o),s(i,o+2),s(i,o+4)]:3==l.ctype&&(l.tabs[r]=i[o]);else if("IEND"==r)break;o+=e,a.readUint(i,o),o+=4}var E;return 0!=d&&((E=l.frames[l.frames.length-1]).data=_decompress(l,u.slice(0,d),E.rect.width,E.rect.height)),l.data=_decompress(l,c,l.width,l.height),delete l.compress,delete l.interlace,delete l.filter,l},toRGBA8:function toRGBA8(e){const t=e.width,r=e.height;if(null==e.tabs.acTL)return[decodeImage(e.data,t,r,e).buffer];const i=[];null==e.frames[0].data&&(e.frames[0].data=e.data);const o=t*r*4,a=new Uint8Array(o),s=new Uint8Array(o),f=new Uint8Array(o);for(let c=0;c<e.frames.length;c++){const u=e.frames[c],h=u.rect.x,d=u.rect.y,A=u.rect.width,g=u.rect.height,p=decodeImage(u.data,A,g,e);if(0!=c)for(var l=0;l<o;l++)f[l]=a[l];if(0==u.blend?_copyTile(p,A,g,a,t,r,h,d,0):1==u.blend&&_copyTile(p,A,g,a,t,r,h,d,1),i.push(a.buffer.slice(0)),0==u.dispose);else if(1==u.dispose)_copyTile(s,A,g,a,t,r,h,d,0);else if(2==u.dispose)for(l=0;l<o;l++)a[l]=f[l]}return i},_paeth:_paeth,_copyTile:_copyTile,_bin:e}}();!function(){const{_copyTile:e}=UPNG,{_bin:t}=UPNG,r=UPNG._paeth;var i={table:function(){const e=new Uint32Array(256);for(let t=0;t<256;t++){let r=t;for(let e=0;e<8;e++)1&r?r=3988292384^r>>>1:r>>>=1;e[t]=r}return e}(),update(e,t,r,o){for(let a=0;a<o;a++)e=i.table[255&(e^t[r+a])]^e>>>8;return e},crc:(e,t,r)=>4294967295^i.update(4294967295,e,t,r)};function addErr(e,t,r,i){t[r]+=e[0]*i>>4,t[r+1]+=e[1]*i>>4,t[r+2]+=e[2]*i>>4,t[r+3]+=e[3]*i>>4}function N(e){return Math.max(0,Math.min(255,e))}function D(e,t){const r=e[0]-t[0],i=e[1]-t[1],o=e[2]-t[2],a=e[3]-t[3];return r*r+i*i+o*o+a*a}function dither(e,t,r,i,o,a,s){null==s&&(s=1);const f=i.length,l=[];for(var c=0;c<f;c++){const e=i[c];l.push([e>>>0&255,e>>>8&255,e>>>16&255,e>>>24&255])}for(c=0;c<f;c++){let e=4294967295;for(var u=0,h=0;h<f;h++){var d=D(l[c],l[h]);h!=c&&d<e&&(e=d,u=h)}}const A=new Uint32Array(o.buffer),g=new Int16Array(t*r*4),p=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];for(c=0;c<p.length;c++)p[c]=255*((p[c]+.5)/16-.5);for(let o=0;o<r;o++)for(let w=0;w<t;w++){var m;c=4*(o*t+w);if(2!=s)m=[N(e[c]+g[c]),N(e[c+1]+g[c+1]),N(e[c+2]+g[c+2]),N(e[c+3]+g[c+3])];else{d=p[4*(3&o)+(3&w)];m=[N(e[c]+d),N(e[c+1]+d),N(e[c+2]+d),N(e[c+3]+d)]}u=0;let v=16777215;for(h=0;h<f;h++){const e=D(m,l[h]);e<v&&(v=e,u=h)}const b=l[u],y=[m[0]-b[0],m[1]-b[1],m[2]-b[2],m[3]-b[3]];1==s&&(w!=t-1&&addErr(y,g,c+4,7),o!=r-1&&(0!=w&&addErr(y,g,c+4*t-4,3),addErr(y,g,c+4*t,5),w!=t-1&&addErr(y,g,c+4*t+4,1))),a[c>>2]=u,A[c>>2]=i[u]}}function _main(e,r,o,a,s){null==s&&(s={});const{crc:f}=i,l=t.writeUint,c=t.writeUshort,u=t.writeASCII;let h=8;const d=e.frames.length>1;let A,g=!1,p=33+(d?20:0);if(null!=s.sRGB&&(p+=13),null!=s.pHYs&&(p+=21),null!=s.iCCP&&(A=pako.deflate(s.iCCP),p+=21+A.length+4),3==e.ctype){for(var m=e.plte.length,w=0;w<m;w++)e.plte[w]>>>24!=255&&(g=!0);p+=8+3*m+4+(g?8+1*m+4:0)}for(var v=0;v<e.frames.length;v++){d&&(p+=38),p+=(F=e.frames[v]).cimg.length+12,0!=v&&(p+=4)}p+=12;const b=new Uint8Array(p),y=[137,80,78,71,13,10,26,10];for(w=0;w<8;w++)b[w]=y[w];if(l(b,h,13),h+=4,u(b,h,"IHDR"),h+=4,l(b,h,r),h+=4,l(b,h,o),h+=4,b[h]=e.depth,h++,b[h]=e.ctype,h++,b[h]=0,h++,b[h]=0,h++,b[h]=0,h++,l(b,h,f(b,h-17,17)),h+=4,null!=s.sRGB&&(l(b,h,1),h+=4,u(b,h,"sRGB"),h+=4,b[h]=s.sRGB,h++,l(b,h,f(b,h-5,5)),h+=4),null!=s.iCCP){const e=13+A.length;l(b,h,e),h+=4,u(b,h,"iCCP"),h+=4,u(b,h,"ICC profile"),h+=11,h+=2,b.set(A,h),h+=A.length,l(b,h,f(b,h-(e+4),e+4)),h+=4}if(null!=s.pHYs&&(l(b,h,9),h+=4,u(b,h,"pHYs"),h+=4,l(b,h,s.pHYs[0]),h+=4,l(b,h,s.pHYs[1]),h+=4,b[h]=s.pHYs[2],h++,l(b,h,f(b,h-13,13)),h+=4),d&&(l(b,h,8),h+=4,u(b,h,"acTL"),h+=4,l(b,h,e.frames.length),h+=4,l(b,h,null!=s.loop?s.loop:0),h+=4,l(b,h,f(b,h-12,12)),h+=4),3==e.ctype){l(b,h,3*(m=e.plte.length)),h+=4,u(b,h,"PLTE"),h+=4;for(w=0;w<m;w++){const t=3*w,r=e.plte[w],i=255&r,o=r>>>8&255,a=r>>>16&255;b[h+t+0]=i,b[h+t+1]=o,b[h+t+2]=a}if(h+=3*m,l(b,h,f(b,h-3*m-4,3*m+4)),h+=4,g){l(b,h,m),h+=4,u(b,h,"tRNS"),h+=4;for(w=0;w<m;w++)b[h+w]=e.plte[w]>>>24&255;h+=m,l(b,h,f(b,h-m-4,m+4)),h+=4}}let E=0;for(v=0;v<e.frames.length;v++){var F=e.frames[v];d&&(l(b,h,26),h+=4,u(b,h,"fcTL"),h+=4,l(b,h,E++),h+=4,l(b,h,F.rect.width),h+=4,l(b,h,F.rect.height),h+=4,l(b,h,F.rect.x),h+=4,l(b,h,F.rect.y),h+=4,c(b,h,a[v]),h+=2,c(b,h,1e3),h+=2,b[h]=F.dispose,h++,b[h]=F.blend,h++,l(b,h,f(b,h-30,30)),h+=4);const t=F.cimg;l(b,h,(m=t.length)+(0==v?0:4)),h+=4;const r=h;u(b,h,0==v?"IDAT":"fdAT"),h+=4,0!=v&&(l(b,h,E++),h+=4),b.set(t,h),h+=m,l(b,h,f(b,r,h-r)),h+=4}return l(b,h,0),h+=4,u(b,h,"IEND"),h+=4,l(b,h,f(b,h-4,4)),h+=4,b.buffer}function compressPNG(e,t,r){for(let i=0;i<e.frames.length;i++){const o=e.frames[i];o.rect.width;const a=o.rect.height,s=new Uint8Array(a*o.bpl+a);o.cimg=_filterZero(o.img,a,o.bpp,o.bpl,s,t,r)}}function compress(t,r,i,o,a){const s=a[0],f=a[1],l=a[2],c=a[3],u=a[4],h=a[5];let d=6,A=8,g=255;for(var p=0;p<t.length;p++){const e=new Uint8Array(t[p]);for(var m=e.length,w=0;w<m;w+=4)g&=e[w+3]}const v=255!=g,b=function framize(t,r,i,o,a,s){const f=[];for(var l=0;l<t.length;l++){const h=new Uint8Array(t[l]),A=new Uint32Array(h.buffer);var c;let g=0,p=0,m=r,w=i,v=o?1:0;if(0!=l){const b=s||o||1==l||0!=f[l-2].dispose?1:2;let y=0,E=1e9;for(let e=0;e<b;e++){var u=new Uint8Array(t[l-1-e]);const o=new Uint32Array(t[l-1-e]);let s=r,f=i,c=-1,h=-1;for(let e=0;e<i;e++)for(let t=0;t<r;t++){A[d=e*r+t]!=o[d]&&(t<s&&(s=t),t>c&&(c=t),e<f&&(f=e),e>h&&(h=e))}-1==c&&(s=f=c=h=0),a&&(1==(1&s)&&s--,1==(1&f)&&f--);const v=(c-s+1)*(h-f+1);v<E&&(E=v,y=e,g=s,p=f,m=c-s+1,w=h-f+1)}u=new Uint8Array(t[l-1-y]);1==y&&(f[l-1].dispose=2),c=new Uint8Array(m*w*4),e(u,r,i,c,m,w,-g,-p,0),v=e(h,r,i,c,m,w,-g,-p,3)?1:0,1==v?_prepareDiff(h,r,i,c,{x:g,y:p,width:m,height:w}):e(h,r,i,c,m,w,-g,-p,0)}else c=h.slice(0);f.push({rect:{x:g,y:p,width:m,height:w},img:c,blend:v,dispose:0})}if(o)for(l=0;l<f.length;l++){if(1==(A=f[l]).blend)continue;const e=A.rect,o=f[l-1].rect,s=Math.min(e.x,o.x),c=Math.min(e.y,o.y),u={x:s,y:c,width:Math.max(e.x+e.width,o.x+o.width)-s,height:Math.max(e.y+e.height,o.y+o.height)-c};f[l-1].dispose=1,l-1!=0&&_updateFrame(t,r,i,f,l-1,u,a),_updateFrame(t,r,i,f,l,u,a)}let h=0;if(1!=t.length)for(var d=0;d<f.length;d++){var A;h+=(A=f[d]).rect.width*A.rect.height}return f}(t,r,i,s,f,l),y={},E=[],F=[];if(0!=o){const e=[];for(w=0;w<b.length;w++)e.push(b[w].img.buffer);const t=function concatRGBA(e){let t=0;for(var r=0;r<e.length;r++)t+=e[r].byteLength;const i=new Uint8Array(t);let o=0;for(r=0;r<e.length;r++){const t=new Uint8Array(e[r]),a=t.length;for(let e=0;e<a;e+=4){let r=t[e],a=t[e+1],s=t[e+2];const f=t[e+3];0==f&&(r=a=s=0),i[o+e]=r,i[o+e+1]=a,i[o+e+2]=s,i[o+e+3]=f}o+=a}return i.buffer}(e),r=quantize(t,o);for(w=0;w<r.plte.length;w++)E.push(r.plte[w].est.rgba);let i=0;for(w=0;w<b.length;w++){const e=(B=b[w]).img.length;var _=new Uint8Array(r.inds.buffer,i>>2,e>>2);F.push(_);const t=new Uint8Array(r.abuf,i,e);h&&dither(B.img,B.rect.width,B.rect.height,E,t,_),B.img.set(t),i+=e}}else for(p=0;p<b.length;p++){var B=b[p];const e=new Uint32Array(B.img.buffer);var U=B.rect.width;m=e.length,_=new Uint8Array(m);F.push(_);for(w=0;w<m;w++){const t=e[w];if(0!=w&&t==e[w-1])_[w]=_[w-1];else if(w>U&&t==e[w-U])_[w]=_[w-U];else{let e=y[t];if(null==e&&(y[t]=e=E.length,E.push(t),E.length>=300))break;_[w]=e}}}const C=E.length;C<=256&&0==u&&(A=C<=2?1:C<=4?2:C<=16?4:8,A=Math.max(A,c));for(p=0;p<b.length;p++){(B=b[p]).rect.x,B.rect.y;U=B.rect.width;const e=B.rect.height;let t=B.img;new Uint32Array(t.buffer);let r=4*U,i=4;if(C<=256&&0==u){r=Math.ceil(A*U/8);var I=new Uint8Array(r*e);const o=F[p];for(let t=0;t<e;t++){w=t*r;const e=t*U;if(8==A)for(var Q=0;Q<U;Q++)I[w+Q]=o[e+Q];else if(4==A)for(Q=0;Q<U;Q++)I[w+(Q>>1)]|=o[e+Q]<<4-4*(1&Q);else if(2==A)for(Q=0;Q<U;Q++)I[w+(Q>>2)]|=o[e+Q]<<6-2*(3&Q);else if(1==A)for(Q=0;Q<U;Q++)I[w+(Q>>3)]|=o[e+Q]<<7-1*(7&Q)}t=I,d=3,i=1}else if(0==v&&1==b.length){I=new Uint8Array(U*e*3);const o=U*e;for(w=0;w<o;w++){const e=3*w,r=4*w;I[e]=t[r],I[e+1]=t[r+1],I[e+2]=t[r+2]}t=I,d=2,i=3,r=3*U}B.img=t,B.bpl=r,B.bpp=i}return{ctype:d,depth:A,plte:E,frames:b}}function _updateFrame(t,r,i,o,a,s,f){const l=Uint8Array,c=Uint32Array,u=new l(t[a-1]),h=new c(t[a-1]),d=a+1<t.length?new l(t[a+1]):null,A=new l(t[a]),g=new c(A.buffer);let p=r,m=i,w=-1,v=-1;for(let e=0;e<s.height;e++)for(let t=0;t<s.width;t++){const i=s.x+t,f=s.y+e,l=f*r+i,c=g[l];0==c||0==o[a-1].dispose&&h[l]==c&&(null==d||0!=d[4*l+3])||(i<p&&(p=i),i>w&&(w=i),f<m&&(m=f),f>v&&(v=f))}-1==w&&(p=m=w=v=0),f&&(1==(1&p)&&p--,1==(1&m)&&m--),s={x:p,y:m,width:w-p+1,height:v-m+1};const b=o[a];b.rect=s,b.blend=1,b.img=new Uint8Array(s.width*s.height*4),0==o[a-1].dispose?(e(u,r,i,b.img,s.width,s.height,-s.x,-s.y,0),_prepareDiff(A,r,i,b.img,s)):e(A,r,i,b.img,s.width,s.height,-s.x,-s.y,0)}function _prepareDiff(t,r,i,o,a){e(t,r,i,o,a.width,a.height,-a.x,-a.y,2)}function _filterZero(e,t,r,i,o,a,s){const f=[];let l,c=[0,1,2,3,4];-1!=a?c=[a]:(t*i>5e5||1==r)&&(c=[0]),s&&(l={level:0});const u=UZIP;for(var h=0;h<c.length;h++){for(let a=0;a<t;a++)_filterLine(o,e,a,i,r,c[h]);f.push(u.deflate(o,l))}let d,A=1e9;for(h=0;h<f.length;h++)f[h].length<A&&(d=h,A=f[h].length);return f[d]}function _filterLine(e,t,i,o,a,s){const f=i*o;let l=f+i;if(e[l]=s,l++,0==s)if(o<500)for(var c=0;c<o;c++)e[l+c]=t[f+c];else e.set(new Uint8Array(t.buffer,f,o),l);else if(1==s){for(c=0;c<a;c++)e[l+c]=t[f+c];for(c=a;c<o;c++)e[l+c]=t[f+c]-t[f+c-a]+256&255}else if(0==i){for(c=0;c<a;c++)e[l+c]=t[f+c];if(2==s)for(c=a;c<o;c++)e[l+c]=t[f+c];if(3==s)for(c=a;c<o;c++)e[l+c]=t[f+c]-(t[f+c-a]>>1)+256&255;if(4==s)for(c=a;c<o;c++)e[l+c]=t[f+c]-r(t[f+c-a],0,0)+256&255}else{if(2==s)for(c=0;c<o;c++)e[l+c]=t[f+c]+256-t[f+c-o]&255;if(3==s){for(c=0;c<a;c++)e[l+c]=t[f+c]+256-(t[f+c-o]>>1)&255;for(c=a;c<o;c++)e[l+c]=t[f+c]+256-(t[f+c-o]+t[f+c-a]>>1)&255}if(4==s){for(c=0;c<a;c++)e[l+c]=t[f+c]+256-r(0,t[f+c-o],0)&255;for(c=a;c<o;c++)e[l+c]=t[f+c]+256-r(t[f+c-a],t[f+c-o],t[f+c-a-o])&255}}}function quantize(e,t){const r=new Uint8Array(e),i=r.slice(0),o=new Uint32Array(i.buffer),a=getKDtree(i,t),s=a[0],f=a[1],l=r.length,c=new Uint8Array(l>>2);let u;if(r.length<2e7)for(var h=0;h<l;h+=4){u=getNearest(s,d=r[h]*(1/255),A=r[h+1]*(1/255),g=r[h+2]*(1/255),p=r[h+3]*(1/255)),c[h>>2]=u.ind,o[h>>2]=u.est.rgba}else for(h=0;h<l;h+=4){var d=r[h]*(1/255),A=r[h+1]*(1/255),g=r[h+2]*(1/255),p=r[h+3]*(1/255);for(u=s;u.left;)u=planeDst(u.est,d,A,g,p)<=0?u.left:u.right;c[h>>2]=u.ind,o[h>>2]=u.est.rgba}return{abuf:i.buffer,inds:c,plte:f}}function getKDtree(e,t,r){null==r&&(r=1e-4);const i=new Uint32Array(e.buffer),o={i0:0,i1:e.length,bst:null,est:null,tdst:0,left:null,right:null};o.bst=stats(e,o.i0,o.i1),o.est=estats(o.bst);const a=[o];for(;a.length<t;){let t=0,o=0;for(var s=0;s<a.length;s++)a[s].est.L>t&&(t=a[s].est.L,o=s);if(t<r)break;const f=a[o],l=splitPixels(e,i,f.i0,f.i1,f.est.e,f.est.eMq255);if(f.i0>=l||f.i1<=l){f.est.L=0;continue}const c={i0:f.i0,i1:l,bst:null,est:null,tdst:0,left:null,right:null};c.bst=stats(e,c.i0,c.i1),c.est=estats(c.bst);const u={i0:l,i1:f.i1,bst:null,est:null,tdst:0,left:null,right:null};u.bst={R:[],m:[],N:f.bst.N-c.bst.N};for(s=0;s<16;s++)u.bst.R[s]=f.bst.R[s]-c.bst.R[s];for(s=0;s<4;s++)u.bst.m[s]=f.bst.m[s]-c.bst.m[s];u.est=estats(u.bst),f.left=c,f.right=u,a[o]=c,a.push(u)}a.sort(((e,t)=>t.bst.N-e.bst.N));for(s=0;s<a.length;s++)a[s].ind=s;return[o,a]}function getNearest(e,t,r,i,o){if(null==e.left)return e.tdst=function dist(e,t,r,i,o){const a=t-e[0],s=r-e[1],f=i-e[2],l=o-e[3];return a*a+s*s+f*f+l*l}(e.est.q,t,r,i,o),e;const a=planeDst(e.est,t,r,i,o);let s=e.left,f=e.right;a>0&&(s=e.right,f=e.left);const l=getNearest(s,t,r,i,o);if(l.tdst<=a*a)return l;const c=getNearest(f,t,r,i,o);return c.tdst<l.tdst?c:l}function planeDst(e,t,r,i,o){const{e:a}=e;return a[0]*t+a[1]*r+a[2]*i+a[3]*o-e.eMq}function splitPixels(e,t,r,i,o,a){for(i-=4;r<i;){for(;vecDot(e,r,o)<=a;)r+=4;for(;vecDot(e,i,o)>a;)i-=4;if(r>=i)break;const s=t[r>>2];t[r>>2]=t[i>>2],t[i>>2]=s,r+=4,i-=4}for(;vecDot(e,r,o)>a;)r-=4;return r+4}function vecDot(e,t,r){return e[t]*r[0]+e[t+1]*r[1]+e[t+2]*r[2]+e[t+3]*r[3]}function stats(e,t,r){const i=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],o=[0,0,0,0],a=r-t>>2;for(let a=t;a<r;a+=4){const t=e[a]*(1/255),r=e[a+1]*(1/255),s=e[a+2]*(1/255),f=e[a+3]*(1/255);o[0]+=t,o[1]+=r,o[2]+=s,o[3]+=f,i[0]+=t*t,i[1]+=t*r,i[2]+=t*s,i[3]+=t*f,i[5]+=r*r,i[6]+=r*s,i[7]+=r*f,i[10]+=s*s,i[11]+=s*f,i[15]+=f*f}return i[4]=i[1],i[8]=i[2],i[9]=i[6],i[12]=i[3],i[13]=i[7],i[14]=i[11],{R:i,m:o,N:a}}function estats(e){const{R:t}=e,{m:r}=e,{N:i}=e,a=r[0],s=r[1],f=r[2],l=r[3],c=0==i?0:1/i,u=[t[0]-a*a*c,t[1]-a*s*c,t[2]-a*f*c,t[3]-a*l*c,t[4]-s*a*c,t[5]-s*s*c,t[6]-s*f*c,t[7]-s*l*c,t[8]-f*a*c,t[9]-f*s*c,t[10]-f*f*c,t[11]-f*l*c,t[12]-l*a*c,t[13]-l*s*c,t[14]-l*f*c,t[15]-l*l*c],h=u,d=o;let A=[Math.random(),Math.random(),Math.random(),Math.random()],g=0,p=0;if(0!=i)for(let e=0;e<16&&(A=d.multVec(h,A),p=Math.sqrt(d.dot(A,A)),A=d.sml(1/p,A),!(0!=e&&Math.abs(p-g)<1e-9));e++)g=p;const m=[a*c,s*c,f*c,l*c];return{Cov:u,q:m,e:A,L:g,eMq255:d.dot(d.sml(255,m),A),eMq:d.dot(A,m),rgba:(Math.round(255*m[3])<<24|Math.round(255*m[2])<<16|Math.round(255*m[1])<<8|Math.round(255*m[0])<<0)>>>0}}var o={multVec:(e,t)=>[e[0]*t[0]+e[1]*t[1]+e[2]*t[2]+e[3]*t[3],e[4]*t[0]+e[5]*t[1]+e[6]*t[2]+e[7]*t[3],e[8]*t[0]+e[9]*t[1]+e[10]*t[2]+e[11]*t[3],e[12]*t[0]+e[13]*t[1]+e[14]*t[2]+e[15]*t[3]],dot:(e,t)=>e[0]*t[0]+e[1]*t[1]+e[2]*t[2]+e[3]*t[3],sml:(e,t)=>[e*t[0],e*t[1],e*t[2],e*t[3]]};UPNG.encode=function encode(e,t,r,i,o,a,s){null==i&&(i=0),null==s&&(s=!1);const f=compress(e,t,r,i,[!1,!1,!1,0,s,!1]);return compressPNG(f,-1),_main(f,t,r,o,a)},UPNG.encodeLL=function encodeLL(e,t,r,i,o,a,s,f){const l={ctype:0+(1==i?0:2)+(0==o?0:4),depth:a,frames:[]},c=(i+o)*a,u=c*t;for(let i=0;i<e.length;i++)l.frames.push({rect:{x:0,y:0,width:t,height:r},img:new Uint8Array(e[i]),blend:0,dispose:1,bpp:Math.ceil(c/8),bpl:Math.ceil(u/8)});return compressPNG(l,0,!0),_main(l,t,r,s,f)},UPNG.encode.compress=compress,UPNG.encode.dither=dither,UPNG.quantize=quantize,UPNG.quantize.getKDtree=getKDtree,UPNG.quantize.getNearest=getNearest}();const r={toArrayBuffer(e,t){const i=e.width,o=e.height,a=i<<2,s=e.getContext("2d").getImageData(0,0,i,o),f=new Uint32Array(s.data.buffer),l=(32*i+31)/32<<2,c=l*o,u=122+c,h=new ArrayBuffer(u),d=new DataView(h),A=1<<20;let g,p,m,w,v=A,b=0,y=0,E=0;function set16(e){d.setUint16(y,e,!0),y+=2}function set32(e){d.setUint32(y,e,!0),y+=4}function seek(e){y+=e}set16(19778),set32(u),seek(4),set32(122),set32(108),set32(i),set32(-o>>>0),set16(1),set16(32),set32(3),set32(c),set32(2835),set32(2835),seek(8),set32(16711680),set32(65280),set32(255),set32(4278190080),set32(1466527264),function convert(){for(;b<o&&v>0;){for(w=122+b*l,g=0;g<a;)v--,p=f[E++],m=p>>>24,d.setUint32(w+g,p<<8|m),g+=4;b++}E<f.length?(v=A,setTimeout(convert,r._dly)):t(h)}()},toBlob(e,t){this.toArrayBuffer(e,(e=>{t(new Blob([e],{type:"image/bmp"}))}))},_dly:9};var i={CHROME:"CHROME",FIREFOX:"FIREFOX",DESKTOP_SAFARI:"DESKTOP_SAFARI",IE:"IE",IOS:"IOS",ETC:"ETC"},o={[i.CHROME]:16384,[i.FIREFOX]:11180,[i.DESKTOP_SAFARI]:16384,[i.IE]:8192,[i.IOS]:4096,[i.ETC]:8192};const a="undefined"!=typeof window,s="undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope,f=a&&window.cordova&&window.cordova.require&&window.cordova.require("cordova/modulemapper"),CustomFile=(a||s)&&(f&&f.getOriginalSymbol(window,"File")||"undefined"!=typeof File&&File),CustomFileReader=(a||s)&&(f&&f.getOriginalSymbol(window,"FileReader")||"undefined"!=typeof FileReader&&FileReader);function getFilefromDataUrl(e,t,r=Date.now()){return new Promise((i=>{const o=e.split(","),a=o[0].match(/:(.*?);/)[1],s=globalThis.atob(o[1]);let f=s.length;const l=new Uint8Array(f);for(;f--;)l[f]=s.charCodeAt(f);const c=new Blob([l],{type:a});c.name=t,c.lastModified=r,i(c)}))}function getDataUrlFromFile(e){return new Promise(((t,r)=>{const i=new CustomFileReader;i.onload=()=>t(i.result),i.onerror=e=>r(e),i.readAsDataURL(e)}))}function loadImage(e){return new Promise(((t,r)=>{const i=new Image;i.onload=()=>t(i),i.onerror=e=>r(e),i.src=e}))}function getBrowserName(){if(void 0!==getBrowserName.cachedResult)return getBrowserName.cachedResult;let e=i.ETC;const{userAgent:t}=navigator;return/Chrom(e|ium)/i.test(t)?e=i.CHROME:/iP(ad|od|hone)/i.test(t)&&/WebKit/i.test(t)?e=i.IOS:/Safari/i.test(t)?e=i.DESKTOP_SAFARI:/Firefox/i.test(t)?e=i.FIREFOX:(/MSIE/i.test(t)||!0==!!document.documentMode)&&(e=i.IE),getBrowserName.cachedResult=e,getBrowserName.cachedResult}function approximateBelowMaximumCanvasSizeOfBrowser(e,t){const r=getBrowserName(),i=o[r];let a=e,s=t,f=a*s;const l=a>s?s/a:a/s;for(;f>i*i;){const e=(i+a)/2,t=(i+s)/2;e<t?(s=t,a=t*l):(s=e*l,a=e),f=a*s}return{width:a,height:s}}function getNewCanvasAndCtx(e,t){let r,i;try{if(r=new OffscreenCanvas(e,t),i=r.getContext("2d"),null===i)throw new Error("getContext of OffscreenCanvas returns null")}catch(e){r=document.createElement("canvas"),i=r.getContext("2d")}return r.width=e,r.height=t,[r,i]}function drawImageInCanvas(e,t){const{width:r,height:i}=approximateBelowMaximumCanvasSizeOfBrowser(e.width,e.height),[o,a]=getNewCanvasAndCtx(r,i);return t&&/jpe?g/.test(t)&&(a.fillStyle="white",a.fillRect(0,0,o.width,o.height)),a.drawImage(e,0,0,o.width,o.height),o}function isIOS(){return void 0!==isIOS.cachedResult||(isIOS.cachedResult=["iPad Simulator","iPhone Simulator","iPod Simulator","iPad","iPhone","iPod"].includes(navigator.platform)||navigator.userAgent.includes("Mac")&&"undefined"!=typeof document&&"ontouchend"in document),isIOS.cachedResult}function drawFileInCanvas(e,t={}){return new Promise((function(r,o){let a,s;var $Try_2_Post=function(){try{return s=drawImageInCanvas(a,t.fileType||e.type),r([a,s])}catch(e){return o(e)}},$Try_2_Catch=function(t){try{0;var $Try_3_Catch=function(e){try{throw e}catch(e){return o(e)}};try{let t;return getDataUrlFromFile(e).then((function(e){try{return t=e,loadImage(t).then((function(e){try{return a=e,function(){try{return $Try_2_Post()}catch(e){return o(e)}}()}catch(e){return $Try_3_Catch(e)}}),$Try_3_Catch)}catch(e){return $Try_3_Catch(e)}}),$Try_3_Catch)}catch(e){$Try_3_Catch(e)}}catch(e){return o(e)}};try{if(isIOS()||[i.DESKTOP_SAFARI,i.MOBILE_SAFARI].includes(getBrowserName()))throw new Error("Skip createImageBitmap on IOS and Safari");return createImageBitmap(e).then((function(e){try{return a=e,$Try_2_Post()}catch(e){return $Try_2_Catch()}}),$Try_2_Catch)}catch(e){$Try_2_Catch()}}))}function canvasToFile(e,t,i,o,a=1){return new Promise((function(s,f){let l;if("image/png"===t){let c,u,h;return c=e.getContext("2d"),({data:u}=c.getImageData(0,0,e.width,e.height)),h=UPNG.encode([u.buffer],e.width,e.height,4096*a),l=new Blob([h],{type:t}),l.name=i,l.lastModified=o,$If_4.call(this)}{if("image/bmp"===t)return new Promise((t=>r.toBlob(e,t))).then(function(e){try{return l=e,l.name=i,l.lastModified=o,$If_5.call(this)}catch(e){return f(e)}}.bind(this),f);{if("function"==typeof OffscreenCanvas&&e instanceof OffscreenCanvas)return e.convertToBlob({type:t,quality:a}).then(function(e){try{return l=e,l.name=i,l.lastModified=o,$If_6.call(this)}catch(e){return f(e)}}.bind(this),f);{let d;return d=e.toDataURL(t,a),getFilefromDataUrl(d,i,o).then(function(e){try{return l=e,$If_6.call(this)}catch(e){return f(e)}}.bind(this),f)}function $If_6(){return $If_5.call(this)}}function $If_5(){return $If_4.call(this)}}function $If_4(){return s(l)}}))}function cleanupCanvasMemory(e){e.width=0,e.height=0}function isAutoOrientationInBrowser(){return new Promise((function(e,t){let r,i,o,a,s;return void 0!==isAutoOrientationInBrowser.cachedResult?e(isAutoOrientationInBrowser.cachedResult):(r="data:image/jpeg;base64,/9j/4QAiRXhpZgAATU0AKgAAAAgAAQESAAMAAAABAAYAAAAAAAD/2wCEAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/AABEIAAEAAgMBEQACEQEDEQH/xABKAAEAAAAAAAAAAAAAAAAAAAALEAEAAAAAAAAAAAAAAAAAAAAAAQEAAAAAAAAAAAAAAAAAAAAAEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8H//2Q==",getFilefromDataUrl("data:image/jpeg;base64,/9j/4QAiRXhpZgAATU0AKgAAAAgAAQESAAMAAAABAAYAAAAAAAD/2wCEAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/AABEIAAEAAgMBEQACEQEDEQH/xABKAAEAAAAAAAAAAAAAAAAAAAALEAEAAAAAAAAAAAAAAAAAAAAAAQEAAAAAAAAAAAAAAAAAAAAAEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8H//2Q==","test.jpg",Date.now()).then((function(r){try{return i=r,drawFileInCanvas(i).then((function(r){try{return o=r[1],canvasToFile(o,i.type,i.name,i.lastModified).then((function(r){try{return a=r,cleanupCanvasMemory(o),drawFileInCanvas(a).then((function(r){try{return s=r[0],isAutoOrientationInBrowser.cachedResult=1===s.width&&2===s.height,e(isAutoOrientationInBrowser.cachedResult)}catch(e){return t(e)}}),t)}catch(e){return t(e)}}),t)}catch(e){return t(e)}}),t)}catch(e){return t(e)}}),t))}))}function getExifOrientation(e){return new Promise(((t,r)=>{const i=new CustomFileReader;i.onload=e=>{const r=new DataView(e.target.result);if(65496!=r.getUint16(0,!1))return t(-2);const i=r.byteLength;let o=2;for(;o<i;){if(r.getUint16(o+2,!1)<=8)return t(-1);const e=r.getUint16(o,!1);if(o+=2,65505==e){if(1165519206!=r.getUint32(o+=2,!1))return t(-1);const e=18761==r.getUint16(o+=6,!1);o+=r.getUint32(o+4,e);const i=r.getUint16(o,e);o+=2;for(let a=0;a<i;a++)if(274==r.getUint16(o+12*a,e))return t(r.getUint16(o+12*a+8,e))}else{if(65280!=(65280&e))break;o+=r.getUint16(o,!1)}}return t(-1)},i.onerror=e=>r(e),i.readAsArrayBuffer(e)}))}function handleMaxWidthOrHeight(e,t){const{width:r}=e,{height:i}=e,{maxWidthOrHeight:o}=t;let a,s=e;return isFinite(o)&&(r>o||i>o)&&([s,a]=getNewCanvasAndCtx(r,i),r>i?(s.width=o,s.height=i/r*o):(s.width=r/i*o,s.height=o),a.drawImage(e,0,0,s.width,s.height),cleanupCanvasMemory(e)),s}function followExifOrientation(e,t){const{width:r}=e,{height:i}=e,[o,a]=getNewCanvasAndCtx(r,i);switch(t>4&&t<9?(o.width=i,o.height=r):(o.width=r,o.height=i),t){case 2:a.transform(-1,0,0,1,r,0);break;case 3:a.transform(-1,0,0,-1,r,i);break;case 4:a.transform(1,0,0,-1,0,i);break;case 5:a.transform(0,1,1,0,0,0);break;case 6:a.transform(0,1,-1,0,i,0);break;case 7:a.transform(0,-1,-1,0,i,r);break;case 8:a.transform(0,-1,1,0,0,r)}return a.drawImage(e,0,0,r,i),cleanupCanvasMemory(e),o}function compress(e,t,r=0){return new Promise((function(i,o){let a,s,f,l,c,u,h,d,A,g,p,m,w,v,b,y,E,F,_,B;function incProgress(e=5){if(t.signal&&t.signal.aborted)throw t.signal.reason;a+=e,t.onProgress(Math.min(a,100))}function setProgress(e){if(t.signal&&t.signal.aborted)throw t.signal.reason;a=Math.min(Math.max(e,a),100),t.onProgress(a)}return a=r,s=t.maxIteration||10,f=1024*t.maxSizeMB*1024,incProgress(),drawFileInCanvas(e,t).then(function(r){try{return[,l]=r,incProgress(),c=handleMaxWidthOrHeight(l,t),incProgress(),new Promise((function(r,i){var o;if(!(o=t.exifOrientation))return getExifOrientation(e).then(function(e){try{return o=e,$If_2.call(this)}catch(e){return i(e)}}.bind(this),i);function $If_2(){return r(o)}return $If_2.call(this)})).then(function(r){try{return u=r,incProgress(),isAutoOrientationInBrowser().then(function(r){try{return h=r?c:followExifOrientation(c,u),incProgress(),d=t.initialQuality||1,A=t.fileType||e.type,canvasToFile(h,A,e.name,e.lastModified,d).then(function(r){try{{if(g=r,incProgress(),p=g.size>f,m=g.size>e.size,!p&&!m)return setProgress(100),i(g);var a;function $Loop_3(){if(s--&&(b>f||b>w)){let t,r;return t=B?.95*_.width:_.width,r=B?.95*_.height:_.height,[E,F]=getNewCanvasAndCtx(t,r),F.drawImage(_,0,0,t,r),d*="image/png"===A?.85:.95,canvasToFile(E,A,e.name,e.lastModified,d).then((function(e){try{return y=e,cleanupCanvasMemory(_),_=E,b=y.size,setProgress(Math.min(99,Math.floor((v-b)/(v-f)*100))),$Loop_3}catch(e){return o(e)}}),o)}return[1]}return w=e.size,v=g.size,b=v,_=h,B=!t.alwaysKeepResolution&&p,(a=function(e){for(;e;){if(e.then)return void e.then(a,o);try{if(e.pop){if(e.length)return e.pop()?$Loop_3_exit.call(this):e;e=$Loop_3}else e=e.call(this)}catch(e){return o(e)}}}.bind(this))($Loop_3);function $Loop_3_exit(){return cleanupCanvasMemory(_),cleanupCanvasMemory(E),cleanupCanvasMemory(c),cleanupCanvasMemory(h),cleanupCanvasMemory(l),setProgress(100),i(y)}}}catch(u){return o(u)}}.bind(this),o)}catch(e){return o(e)}}.bind(this),o)}catch(e){return o(e)}}.bind(this),o)}catch(e){return o(e)}}.bind(this),o)}))}const l="\nlet scriptImported = false\nself.addEventListener('message', async (e) => {\n  const { file, id, imageCompressionLibUrl, options } = e.data\n  options.onProgress = (progress) => self.postMessage({ progress, id })\n  try {\n    if (!scriptImported) {\n      // console.log('[worker] importScripts', imageCompressionLibUrl)\n      self.importScripts(imageCompressionLibUrl)\n      scriptImported = true\n    }\n    // console.log('[worker] self', self)\n    const compressedFile = await imageCompression(file, options)\n    self.postMessage({ file: compressedFile, id })\n  } catch (e) {\n    // console.error('[worker] error', e)\n    self.postMessage({ error: e.message + '\\n' + e.stack, id })\n  }\n})\n";let c;function compressOnWebWorker(e,t){return new Promise(((r,i)=>{c||(c=function createWorkerScriptURL(e){const t=[];return"function"==typeof e?t.push(`(${e})()`):t.push(e),URL.createObjectURL(new Blob(t))}(l));const o=new Worker(c);o.addEventListener("message",(function handler(e){if(t.signal&&t.signal.aborted)o.terminate();else if(void 0===e.data.progress){if(e.data.error)return i(new Error(e.data.error)),void o.terminate();r(e.data.file),o.terminate()}else t.onProgress(e.data.progress)})),o.addEventListener("error",i),t.signal&&t.signal.addEventListener("abort",(()=>{i(t.signal.reason),o.terminate()})),o.postMessage({file:e,imageCompressionLibUrl:t.libURL,options:{...t,onProgress:void 0,signal:void 0}})}))}function imageCompression(e,t){return new Promise((function(r,i){let o,a,s,f,l,c;if(o={...t},s=0,({onProgress:f}=o),o.maxSizeMB=o.maxSizeMB||Number.POSITIVE_INFINITY,l="boolean"!=typeof o.useWebWorker||o.useWebWorker,delete o.useWebWorker,o.onProgress=e=>{s=e,"function"==typeof f&&f(s)},!(e instanceof Blob||e instanceof CustomFile))return i(new Error("The file given is not an instance of Blob or File"));if(!/^image/.test(e.type))return i(new Error("The file given is not an image"));if(c="undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope,!l||"function"!=typeof Worker||c)return compress(e,o).then(function(e){try{return a=e,$If_4.call(this)}catch(e){return i(e)}}.bind(this),i);var u=function(){try{return $If_4.call(this)}catch(e){return i(e)}}.bind(this),$Try_1_Catch=function(t){try{return compress(e,o).then((function(e){try{return a=e,u()}catch(e){return i(e)}}),i)}catch(e){return i(e)}};try{return o.libURL=o.libURL||"https://cdn.jsdelivr.net/npm/browser-image-compression@2.0.2/dist/browser-image-compression.js",compressOnWebWorker(e,o).then((function(e){try{return a=e,u()}catch(e){return $Try_1_Catch()}}),$Try_1_Catch)}catch(e){$Try_1_Catch()}function $If_4(){try{a.name=e.name,a.lastModified=e.lastModified}catch(e){}try{o.preserveExif&&"image/jpeg"===e.type&&(!o.fileType||o.fileType&&o.fileType===e.type)&&(a=copyExifWithoutOrientation(e,a))}catch(e){}return r(a)}}))}imageCompression.getDataUrlFromFile=getDataUrlFromFile,imageCompression.getFilefromDataUrl=getFilefromDataUrl,imageCompression.loadImage=loadImage,imageCompression.drawImageInCanvas=drawImageInCanvas,imageCompression.drawFileInCanvas=drawFileInCanvas,imageCompression.canvasToFile=canvasToFile,imageCompression.getExifOrientation=getExifOrientation,imageCompression.handleMaxWidthOrHeight=handleMaxWidthOrHeight,imageCompression.followExifOrientation=followExifOrientation,imageCompression.cleanupCanvasMemory=cleanupCanvasMemory,imageCompression.isAutoOrientationInBrowser=isAutoOrientationInBrowser,imageCompression.approximateBelowMaximumCanvasSizeOfBrowser=approximateBelowMaximumCanvasSizeOfBrowser,imageCompression.copyExifWithoutOrientation=copyExifWithoutOrientation,imageCompression.getBrowserName=getBrowserName,imageCompression.version="2.0.2";
//# sourceMappingURL=browser-image-compression.mjs.map


/***/ }),

/***/ "./node_modules/wasm-feature-detect/dist/esm/index.js":
/*!************************************************************!*\
  !*** ./node_modules/wasm-feature-detect/dist/esm/index.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "bigInt": () => (/* binding */ bigInt),
/* harmony export */   "bulkMemory": () => (/* binding */ bulkMemory),
/* harmony export */   "exceptions": () => (/* binding */ exceptions),
/* harmony export */   "extendedConst": () => (/* binding */ extendedConst),
/* harmony export */   "gc": () => (/* binding */ gc),
/* harmony export */   "memory64": () => (/* binding */ memory64),
/* harmony export */   "multiValue": () => (/* binding */ multiValue),
/* harmony export */   "mutableGlobals": () => (/* binding */ mutableGlobals),
/* harmony export */   "referenceTypes": () => (/* binding */ referenceTypes),
/* harmony export */   "relaxedSimd": () => (/* binding */ relaxedSimd),
/* harmony export */   "saturatedFloatToInt": () => (/* binding */ saturatedFloatToInt),
/* harmony export */   "signExtensions": () => (/* binding */ signExtensions),
/* harmony export */   "simd": () => (/* binding */ simd),
/* harmony export */   "streamingCompilation": () => (/* binding */ streamingCompilation),
/* harmony export */   "tailCall": () => (/* binding */ tailCall),
/* harmony export */   "threads": () => (/* binding */ threads)
/* harmony export */ });
const bigInt=()=>(async e=>{try{return(await WebAssembly.instantiate(e)).instance.exports.b(BigInt(0))===BigInt(0)}catch(e){return!1}})(new Uint8Array([0,97,115,109,1,0,0,0,1,6,1,96,1,126,1,126,3,2,1,0,7,5,1,1,98,0,0,10,6,1,4,0,32,0,11])),bulkMemory=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,5,3,1,0,1,10,14,1,12,0,65,0,65,0,65,0,252,10,0,0,11])),exceptions=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,8,1,6,0,6,64,25,11,11])),extendedConst=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,5,3,1,0,1,11,9,1,0,65,1,65,2,106,11,0])),gc=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,10,2,95,1,125,0,96,0,1,107,0,3,2,1,1,10,12,1,10,0,67,0,0,0,0,251,7,0,11])),memory64=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,5,3,1,4,1])),multiValue=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,6,1,96,0,2,127,127,3,2,1,0,10,8,1,6,0,65,0,65,0,11])),mutableGlobals=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,2,8,1,1,97,1,98,3,127,1,6,6,1,127,1,65,0,11,7,5,1,1,97,3,1])),referenceTypes=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,7,1,5,0,208,112,26,11])),relaxedSimd=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,15,1,13,0,65,1,253,15,65,2,253,15,253,128,2,11])),saturatedFloatToInt=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,12,1,10,0,67,0,0,0,0,252,0,26,11])),signExtensions=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,8,1,6,0,65,0,192,26,11])),simd=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,10,1,8,0,65,0,253,15,253,98,11])),streamingCompilation=()=>(async()=>"compileStreaming"in WebAssembly)(),tailCall=async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,6,1,4,0,18,0,11])),threads=()=>(async e=>{try{return"undefined"!=typeof MessageChannel&&(new MessageChannel).port1.postMessage(new SharedArrayBuffer(1)),WebAssembly.validate(e)}catch(e){return!1}})(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,5,4,1,3,1,1,10,11,1,9,0,65,0,254,16,2,0,26,11]));


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
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
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
/******/ 	/* webpack/runtime/load script */
/******/ 	(() => {
/******/ 		var inProgress = {};
/******/ 		// data-webpack is not used as build has no uniqueName
/******/ 		// loadScript function to load a script via script tag
/******/ 		__webpack_require__.l = (url, done, key, chunkId) => {
/******/ 			if(inProgress[url]) { inProgress[url].push(done); return; }
/******/ 			var script, needAttach;
/******/ 			if(key !== undefined) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				for(var i = 0; i < scripts.length; i++) {
/******/ 					var s = scripts[i];
/******/ 					if(s.getAttribute("src") == url) { script = s; break; }
/******/ 				}
/******/ 			}
/******/ 			if(!script) {
/******/ 				needAttach = true;
/******/ 				script = document.createElement('script');
/******/ 		
/******/ 				script.charset = 'utf-8';
/******/ 				script.timeout = 120;
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 		
/******/ 				script.src = url;
/******/ 			}
/******/ 			inProgress[url] = [done];
/******/ 			var onScriptComplete = (prev, event) => {
/******/ 				// avoid mem leaks in IE.
/******/ 				script.onerror = script.onload = null;
/******/ 				clearTimeout(timeout);
/******/ 				var doneFns = inProgress[url];
/******/ 				delete inProgress[url];
/******/ 				script.parentNode && script.parentNode.removeChild(script);
/******/ 				doneFns && doneFns.forEach((fn) => (fn(event)));
/******/ 				if(prev) return prev(event);
/******/ 			}
/******/ 			var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
/******/ 			script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 			script.onload = onScriptComplete.bind(null, script.onload);
/******/ 			needAttach && document.head.appendChild(script);
/******/ 		};
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
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.b = document.baseURI || self.location.href;
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"script": 0
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.f.j = (chunkId, promises) => {
/******/ 				// JSONP chunk loading for javascript
/******/ 				var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
/******/ 				if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 		
/******/ 					// a Promise means "currently loading".
/******/ 					if(installedChunkData) {
/******/ 						promises.push(installedChunkData[2]);
/******/ 					} else {
/******/ 						if(true) { // all chunks have JS
/******/ 							// setup Promise in chunk cache
/******/ 							var promise = new Promise((resolve, reject) => (installedChunkData = installedChunks[chunkId] = [resolve, reject]));
/******/ 							promises.push(installedChunkData[2] = promise);
/******/ 		
/******/ 							// start chunk loading
/******/ 							var url = __webpack_require__.p + __webpack_require__.u(chunkId);
/******/ 							// create error before stack unwound to get useful stacktrace later
/******/ 							var error = new Error();
/******/ 							var loadingEnded = (event) => {
/******/ 								if(__webpack_require__.o(installedChunks, chunkId)) {
/******/ 									installedChunkData = installedChunks[chunkId];
/******/ 									if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
/******/ 									if(installedChunkData) {
/******/ 										var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 										var realSrc = event && event.target && event.target.src;
/******/ 										error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 										error.name = 'ChunkLoadError';
/******/ 										error.type = errorType;
/******/ 										error.request = realSrc;
/******/ 										installedChunkData[1](error);
/******/ 									}
/******/ 								}
/******/ 							};
/******/ 							__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
/******/ 						} else installedChunks[chunkId] = 0;
/******/ 					}
/******/ 				}
/******/ 		};
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 		
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunk"] = self["webpackChunk"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!*****************************!*\
  !*** ./assets/js/script.js ***!
  \*****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _set_public_path_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./set-public-path.js */ "./assets/js/set-public-path.js");
/* harmony import */ var _set_public_path_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_set_public_path_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _squeeze_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./squeeze.js */ "./assets/js/squeeze.js");
/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./helpers.js */ "./assets/js/helpers.js");
/* harmony import */ var _handlers_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./handlers.js */ "./assets/js/handlers.js");
/* harmony import */ var _voxel_upload_compat_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./voxel-upload-compat.js */ "./assets/js/voxel-upload-compat.js");
/* harmony import */ var _instant_images_upload_compat_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./instant-images-upload-compat.js */ "./assets/js/instant-images-upload-compat.js");








"use strict";

const { sprintf, __ } = wp.i18n; // Import __() from wp.i18n

//const Squeeze = new SQUEEZE(squeezeOptions);
const compressOptions = JSON.parse(squeezeOptions.options);
window.Squeeze = window.Squeeze || new _squeeze_js__WEBPACK_IMPORTED_MODULE_1__["default"](squeezeOptions); // make it globally accessible for other scripts

(0,_voxel_upload_compat_js__WEBPACK_IMPORTED_MODULE_4__.initVoxelUploadCompat)(compressOptions);
(0,_instant_images_upload_compat_js__WEBPACK_IMPORTED_MODULE_5__.initInstantImagesUploadCompat)(compressOptions);

document.addEventListener("click", (event) => {
  _handlers_js__WEBPACK_IMPORTED_MODULE_3__.handleButtonsClick(event);
});

_helpers_js__WEBPACK_IMPORTED_MODULE_2__.elements.bulkBtn?.addEventListener("click", async (event) => {
  let uncompressedIDs = squeezeBulk.unCompressedImages ? squeezeBulk.unCompressedImages.split(",") : [];
  let currentPage = _helpers_js__WEBPACK_IMPORTED_MODULE_2__.cachedMediaData.page ?? 1;

  _handlers_js__WEBPACK_IMPORTED_MODULE_3__.handleBulkButtonClick(event, 'uncompressed', uncompressedIDs, currentPage);
});

_helpers_js__WEBPACK_IMPORTED_MODULE_2__.elements.bulkAgainBtn?.addEventListener("click", async (event) => {
  let allIDs = squeezeBulk.allImages ? squeezeBulk.allImages.split(",") : [];
  let currentPage = _helpers_js__WEBPACK_IMPORTED_MODULE_2__.cachedMediaData.page ?? 1;

  _handlers_js__WEBPACK_IMPORTED_MODULE_3__.handleBulkButtonClick(event, 'all', allIDs, currentPage);
});

_helpers_js__WEBPACK_IMPORTED_MODULE_2__.elements.bulkPathBtn?.addEventListener("click", async (event) => {
  const path = _helpers_js__WEBPACK_IMPORTED_MODULE_2__.elements.pathInput?.value ?? '';
  let bulkPathData;

  if (path.replace(/\[\]/g, '').split(',').length === 0 || !path.replace(/\[\]/g, '').split(',')[0] || !path) {
    alert(__('Please enter a valid path!', 'squeeze'));
    return;
  }

  _helpers_js__WEBPACK_IMPORTED_MODULE_2__.disableBulkButtons();
  window.onbeforeunload = _handlers_js__WEBPACK_IMPORTED_MODULE_3__.handleOnLeave;

  if (_helpers_js__WEBPACK_IMPORTED_MODULE_2__.cachedMediaData.process === 'path' && _helpers_js__WEBPACK_IMPORTED_MODULE_2__.cachedMediaData.mediaIDs.length > 0) {
    bulkPathData = _helpers_js__WEBPACK_IMPORTED_MODULE_2__.cachedMediaData.mediaIDs;
  } else {
    const pathData = await Squeeze.getAttachmentsByPath(path);

    if (pathData.success) {
      bulkPathData = pathData.data;
    } else {
      console.error(pathData.data);
      _helpers_js__WEBPACK_IMPORTED_MODULE_2__.restoreBulkButtons();
      window.onbeforeunload = null;
    }
  }

  const isPaused = _handlers_js__WEBPACK_IMPORTED_MODULE_3__.handleBulkToggle(event, 'path', bulkPathData);

  if (isPaused) {
    _helpers_js__WEBPACK_IMPORTED_MODULE_2__.updateButtonText(event.target, __('Pausing...', 'squeeze'), '#pause-button-icon');
    return;
  }

  _helpers_js__WEBPACK_IMPORTED_MODULE_2__.hideBulkPausedBanner();
  event.target.disabled = false;

  try {
    const finalResponse = await _handlers_js__WEBPACK_IMPORTED_MODULE_3__.handleRecursiveUpload('path', bulkPathData, 1);

    if (finalResponse?.mediaIDs) {
      if (finalResponse.mediaIDs.length === 0) {
        _helpers_js__WEBPACK_IMPORTED_MODULE_2__.logMessage(__('All images have been processed!', 'squeeze'), { isEnd: true });
        _helpers_js__WEBPACK_IMPORTED_MODULE_2__.showPopupMessage( {
          title: __('Squeezing complete', 'squeeze'),
          message: __('All images have been processed!', 'squeeze'),
          type: 'success'
        });
        window.onbeforeunload = null;
        _helpers_js__WEBPACK_IMPORTED_MODULE_2__.restoreBulkButtons();
      }
    }
  } catch (error) {
    console.error(error);
    _helpers_js__WEBPACK_IMPORTED_MODULE_2__.restoreBulkButtons();
    window.onbeforeunload = null;
    alert(__('An error has occured. Check the console for details.', 'squeeze'));
  }
})

_helpers_js__WEBPACK_IMPORTED_MODULE_2__.elements.bulkPathRestoreBtn?.addEventListener("click", _handlers_js__WEBPACK_IMPORTED_MODULE_3__.handleDirectoryPathRestore);

_helpers_js__WEBPACK_IMPORTED_MODULE_2__.elements.bulkPathRemoveBtns?.forEach((btn) => {
  btn.addEventListener("click", _helpers_js__WEBPACK_IMPORTED_MODULE_2__.handleRemovePathButton);
});

_helpers_js__WEBPACK_IMPORTED_MODULE_2__.elements.selectPathBtn?.addEventListener("click", async (event) => {
  _helpers_js__WEBPACK_IMPORTED_MODULE_2__.elements.pathDialog.showModal();

  if (_helpers_js__WEBPACK_IMPORTED_MODULE_2__.elements.dirContainer.classList.contains("loading")) return;

  if (_helpers_js__WEBPACK_IMPORTED_MODULE_2__.elements.dirContainer.classList.contains("loaded")) {
    const selectedFolders = JSON.parse(_helpers_js__WEBPACK_IMPORTED_MODULE_2__.elements.pathInput.value);

    if (Array.isArray(selectedFolders)) {
      selectedFolders.forEach((folder) => {
        const checkbox = _helpers_js__WEBPACK_IMPORTED_MODULE_2__.elements.dirContainer.querySelector(`input[value="${folder}"]`);
        if (checkbox) {
          checkbox.checked = true;
        }
      });
    }

    return;

  } else {
    _helpers_js__WEBPACK_IMPORTED_MODULE_2__.elements.dirContainer.classList.add("loading");
    const folders = await Squeeze.getDirectories();
    _helpers_js__WEBPACK_IMPORTED_MODULE_2__.renderDirectories(folders, null, {
      handleDirectoryClick: _handlers_js__WEBPACK_IMPORTED_MODULE_3__.handleDirectoryClick,
      handleDirectoryCheck: _handlers_js__WEBPACK_IMPORTED_MODULE_3__.handleDirectoryCheck
    });
    _helpers_js__WEBPACK_IMPORTED_MODULE_2__.elements.dirContainer.classList.remove("loading");
  }


});

_helpers_js__WEBPACK_IMPORTED_MODULE_2__.elements.savePathBtn?.addEventListener("click", () => {
  const checkboxes = _helpers_js__WEBPACK_IMPORTED_MODULE_2__.elements.dirContainer.querySelectorAll("input[type='checkbox']");
  const selectedFolders = Array.from(checkboxes)
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.value);

  _helpers_js__WEBPACK_IMPORTED_MODULE_2__.elements.pathInput.value = JSON.stringify(selectedFolders);
  _helpers_js__WEBPACK_IMPORTED_MODULE_2__.populatePathInput();
  _helpers_js__WEBPACK_IMPORTED_MODULE_2__.elements.pathDialog.close();
});

_helpers_js__WEBPACK_IMPORTED_MODULE_2__.elements.closePathDialogBtn?.addEventListener("click", () => {
  _helpers_js__WEBPACK_IMPORTED_MODULE_2__.elements.pathDialog.close();
});

document.addEventListener('click', _handlers_js__WEBPACK_IMPORTED_MODULE_3__.handleClosePathDialog);

_helpers_js__WEBPACK_IMPORTED_MODULE_2__.elements.postsFilterForm?.addEventListener("submit", async (event) => {
  const dataAction = _helpers_js__WEBPACK_IMPORTED_MODULE_2__.elements.postsFilterForm.dataset.action;
  const action = event.target.querySelector("select[name='action']").value;
  const submitButtons = event.target.querySelectorAll("input[name='bulk_action']");

  if (action === 'squeeze_bulk_compress' && dataAction !== 'squeeze_bulk_compressed') {
    event.preventDefault();
    const mediaList = document.querySelectorAll("input[name='media[]']:checked");
    const uncompressedIDs = Array.from(mediaList).map((el) => el.value);

    if (uncompressedIDs.length === 0) return;

    window.onbeforeunload = _handlers_js__WEBPACK_IMPORTED_MODULE_3__.handleOnLeave;

    uncompressedIDs.forEach((id) => {
      _helpers_js__WEBPACK_IMPORTED_MODULE_2__.elements.postsFilterForm.querySelectorAll(`#post-${id} .column-squeeze button`).forEach((btn) => {
        btn.disabled = true;
      });
      const squeezeStatusElement = _helpers_js__WEBPACK_IMPORTED_MODULE_2__.elements.postsFilterForm.querySelector(`#post-${id} .column-squeeze .squeeze_status`);
      if (squeezeStatusElement) {
        squeezeStatusElement.innerText = '⏳ ' + __('Squeezing...', 'squeeze');
      }
    });

    submitButtons.forEach((btn) => {
      btn.disabled = true;
      btn.value = __('Squeezing...', 'squeeze');
    });

    try {
      const finalResponse = await _handlers_js__WEBPACK_IMPORTED_MODULE_3__.handleRecursiveUpload('uncompressed', uncompressedIDs, 1);

      if (finalResponse?.mediaIDs) {
        if (finalResponse.mediaIDs.length === 0) {
          window.onbeforeunload = null;
          _helpers_js__WEBPACK_IMPORTED_MODULE_2__.elements.postsFilterForm.dataset.action = 'squeeze_bulk_compressed';
          _helpers_js__WEBPACK_IMPORTED_MODULE_2__.elements.postsFilterForm.submit();
        }
      }
    } catch (error) {
      console.error(error);
      window.onbeforeunload = null;
      alert(__('An error has occured. Check the console for details.', 'squeeze'));
    }
  }
});

// https://wordpress.stackexchange.com/a/131295/186146 - override wp.Uploader.prototype.success
window.wp.domReady(()=>{

  if (wp?.Uploader?.prototype) {
    const prevInit = wp.Uploader.prototype.init;

    wp.Uploader.prototype.init = function (...args) {
      // Call Filebird’s (or whoever’s) init first
      if (typeof prevInit === 'function') {
        prevInit.apply(this, args);
      }
      
      const uploader = this.uploader;

      // Now add *your* logic
      if (uploader) {

        uploader.bind('BeforeUpload', async function (up, pluploadFile) {
          //console.time('Compressing image:', pluploadFile.name);
          _handlers_js__WEBPACK_IMPORTED_MODULE_3__.handleCompressBeforeUpload(up, pluploadFile, compressOptions);
        });

        uploader.bind('FileUploaded', async function (up, file, response) {
          _handlers_js__WEBPACK_IMPORTED_MODULE_3__.handleCompressAfterUpload(file, compressOptions);
          //console.timeEnd('Compressing image:', file.name)
        })

      }
    }
  }
});

document.onreadystatechange = function () {
  if (document.readyState === "complete") { // equivalent to jQuery $(document).ready()
    _handlers_js__WEBPACK_IMPORTED_MODULE_3__.handleMultiFileFormUpload(compressOptions);
  }
}


/**
 * Create the toggle preview checkbox
 * @param {Integer} attachmentId 
 * @param {Boolean} isPlaceholder
 * @returns HTMLElement
 */
const createTogglePreview = (attachmentId, isPlaceholder = false) => {

  // Create the toggle
  const toggleWrap = document.createElement('span');
  const toggleInput = document.createElement('input');
  const toggleLabel = document.createElement('label');
  const toggleIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  toggleInput.type = 'checkbox';
  toggleInput.className = 'squeeze-ios8-switch';
  toggleInput.id = 'squeeze-ios8-switch-' + attachmentId;
  toggleLabel.textContent = __('Compare Squeeze', 'squeeze');
  toggleLabel.title = __('Image comparison with Squeeze', 'squeeze');
  toggleLabel.htmlFor = toggleInput.id;
  toggleWrap.style.marginInlineStart = '1em';
  toggleWrap.style.verticalAlign = 'sub';
  toggleIcon.style.display = 'inline-block';
  toggleIcon.style.verticalAlign = 'middle';
  toggleIcon.setAttributeNS(null, 'viewBox', '0 0 122.88 101.61');
  toggleIcon.classList.add('squeeze-icon');
  toggleIcon.innerHTML = `<g><path d="M15.28,46.33h30V4.44c0-2.45,1.99-4.44,4.44-4.44c2.45,0,4.44,1.99,4.44,4.44v92.72c0,2.45-1.99,4.44-4.44,4.44 c-2.45,0-4.44-1.99-4.44-4.44V55.21H15.07l15.15,15.28c1.72,1.73,1.72,4.54-0.02,6.26c-1.73,1.72-4.54,1.72-6.26-0.02L1.29,53.89 l0,0l-0.01-0.01c-0.05-0.05-0.09-0.09-0.13-0.14l-0.01-0.01l-0.06-0.07l-0.02-0.02l-0.05-0.06l-0.02-0.03l-0.02-0.02l-0.05-0.07 l0,0L0.87,53.4l-0.02-0.02l-0.01-0.02l-0.05-0.07l-0.01-0.02l-0.05-0.07l0,0l-0.04-0.07L0.66,53.1l-0.01-0.02l-0.04-0.07 l-0.01-0.02l-0.02-0.03l-0.04-0.06l0,0L0.5,52.82l-0.01-0.02l-0.04-0.08l0,0l-0.04-0.08L0.4,52.62l-0.03-0.06l-0.01-0.03L0.35,52.5 l-0.03-0.08L0.31,52.4l-0.03-0.08L0.27,52.3l-0.03-0.08l0-0.01c-0.02-0.06-0.04-0.13-0.06-0.19l0-0.01l-0.02-0.08l-0.01-0.02 l-0.01-0.02l-0.02-0.08l-0.02-0.1l0-0.01l-0.02-0.1l0-0.01l-0.01-0.07L0.06,51.5l0-0.02l-0.01-0.08l0-0.02l-0.01-0.08l0,0 L0.02,51.2l0-0.01l0-0.02l-0.01-0.08l0-0.01C0.01,51,0,50.93,0,50.87l0-0.01l0-0.09v-0.02l0-0.08l0-0.02l0-0.02l0-0.08l0-0.02 l0.01-0.08l0,0l0.01-0.09l0-0.01c0.01-0.1,0.02-0.21,0.04-0.31l0.02-0.09l0-0.02c0.02-0.1,0.04-0.2,0.07-0.3l0,0l0.02-0.08 l0.01-0.03l0.01-0.02l0.02-0.08l0.01-0.02l0.03-0.08l0.01-0.02l0.03-0.08l0-0.01c0.04-0.1,0.08-0.19,0.12-0.28l0.01-0.01 c0.03-0.06,0.06-0.12,0.09-0.17l0.01-0.02l0.01-0.02l0.04-0.07l0.01-0.02l0.04-0.07c0.03-0.05,0.06-0.11,0.1-0.16l0.02-0.03 l0.01-0.02l0.05-0.07l0-0.01c0.04-0.06,0.08-0.11,0.12-0.16l0.01-0.01L1,47.97v0l0.07-0.08l0.01-0.01l0.04-0.05l0.05-0.05l0,0 l0.06-0.06l0.02-0.02l0.06-0.06l0,0l0.01-0.01L23.97,25.4c1.74-1.71,4.55-1.69,6.26,0.05c1.71,1.74,1.69,4.55-0.05,6.26 L15.28,46.33L15.28,46.33z M67.86,4.44C67.86,1.99,69.85,0,72.3,0c2.45,0,4.44,1.99,4.44,4.44v41.89h30.86L92.7,31.72 c-1.74-1.71-1.77-4.52-0.05-6.26c1.71-1.74,4.52-1.77,6.26-0.05l22.65,22.21l0.01,0.01l0,0l0.06,0.06l0.02,0.02l0.06,0.06l0,0 l0.05,0.05l0.04,0.05l0.01,0.01l0.07,0.08v0l0.07,0.08l0.01,0.01c0.04,0.05,0.08,0.11,0.12,0.16l0,0.01l0.05,0.07l0.01,0.02 l0.02,0.03c0.03,0.05,0.07,0.11,0.1,0.16l0.04,0.07l0.01,0.02l0.04,0.07l0.01,0.02l0.01,0.02c0.03,0.06,0.06,0.12,0.09,0.17 l0.01,0.01c0.04,0.09,0.08,0.19,0.12,0.28l0,0.01l0.03,0.08l0.01,0.02l0.03,0.08l0.01,0.02l0.02,0.08l0.01,0.02l0.01,0.03 l0.02,0.08l0,0c0.03,0.1,0.05,0.2,0.07,0.3l0,0.02l0.02,0.09c0.02,0.1,0.03,0.21,0.04,0.31l0,0.01l0.01,0.09l0,0l0.01,0.08l0,0.02 l0,0.08l0,0.02l0,0.02l0,0.08v0.02l0,0.09l0,0.01c0,0.07,0,0.13-0.01,0.2l0,0.01l-0.01,0.08l0,0.02l0,0.01l-0.01,0.09l0,0 l-0.01,0.08l0,0.02l-0.01,0.08l0,0.02l-0.01,0.03l-0.01,0.07l0,0.01l-0.02,0.1l0,0.01l-0.02,0.1l-0.02,0.08l-0.01,0.02l-0.01,0.02 l-0.02,0.08l0,0.01c-0.02,0.06-0.04,0.13-0.06,0.19l0,0.01l-0.03,0.08l-0.01,0.02l-0.03,0.08l-0.01,0.02l-0.03,0.08l-0.01,0.02 l-0.01,0.03l-0.03,0.06l-0.01,0.02l-0.04,0.08l0,0l-0.04,0.08l-0.01,0.02l-0.04,0.07l0,0l-0.04,0.06l-0.02,0.03l-0.01,0.02 l-0.04,0.07l-0.01,0.02l-0.01,0.02l-0.04,0.07l0,0l-0.05,0.07l-0.01,0.02l-0.05,0.07l-0.01,0.02l-0.02,0.02l-0.05,0.06l0,0 l-0.05,0.07l-0.02,0.02l-0.02,0.03l-0.05,0.06l-0.02,0.02l-0.06,0.07l-0.01,0.01c-0.04,0.05-0.09,0.1-0.13,0.14l-0.01,0.01l0,0 L98.94,76.73c-1.72,1.73-4.53,1.74-6.26,0.02c-1.73-1.72-1.74-4.53-0.02-6.26l15.15-15.28H76.74v41.96c0,2.45-1.99,4.44-4.44,4.44 c-2.45,0-4.44-1.99-4.44-4.44V4.44L67.86,4.44z M122.16,48.35c0.03,0.05,0.07,0.11,0.1,0.16L122.16,48.35L122.16,48.35z"></path></g>`;

  if (isPlaceholder) {
    toggleInput.disabled = true;
    toggleLabel.innerHTML += ' ' + sprintf(__('(<a href="%s" target="_blank">premium only</a>)', 'squeeze'), squeezeOptions.upgradeUrl);
  }

  toggleWrap.appendChild(toggleIcon);
  toggleWrap.appendChild(toggleInput);
  toggleWrap.appendChild(toggleLabel);

  return toggleWrap;
}


})();

/******/ })()
;