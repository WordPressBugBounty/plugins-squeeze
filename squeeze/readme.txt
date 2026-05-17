=== Squeeze – Image Optimization & Compression, WEBP Conversion ===
Contributors: barb0ss
Tags: image compression, convert webp, image optimization, compress images, optimize images
Requires at least: 6.0
Tested up to: 6.9
Requires PHP: 7.3
Stable tag: 1.7.9
License: GPLv3
License URI: https://www.gnu.org/licenses/gpl-3.0.html

Unlimited. Private. Instant.
Squeeze compresses and converts your images directly in your browser — no external servers and no upload limits.

== Description ==
Squeeze is a lightweight yet powerful image optimization plugin for WordPress.
It compresses and converts your images directly in your browser, so no image ever leaves your site.

Unlike most competitors, Squeeze:

♾️ Has no image compression limits — you can squeeze as many images as you want.
☁️ Doesn’t send your images to any external servers — all processing happens locally in your browser.
⚡ Converts images to WEBP instantly and directly, replacing the original file (no duplicates, no clutter).
🖼️ Optimizes images on the fly inside Gutenberg, Elementor, and GenerateBlocks — right when you upload or insert them.

It’s privacy-safe, lightning-fast, and storage-efficient.

[Squeeze official website](https://pluginarium.com/squeeze/) | [Plugin's documentation](https://pluginarium.com/squeeze/squeeze-documentation/)

== 🌟 New Features since version 1.7 🌟 == 
* **Direct WEBP Conversion:** Convert JPG/PNG images into WEBP instantly and replace originals — saving tons of storage.
* **Pre-Upload Compression:** Compress images before they even reach your server, reducing upload time and bandwidth usage.

== ✨ Key Features ✨ == 
* **Increase Page Speed:** Reduces image sizes to improve website loading speed and overall user experience.
* **WEBP Conversion and Serving:** Convert images to the modern and efficient WEBP format and serve them seamlessly. The plugin adds .htaccess rules to serve WEBP images for supported browsers without changing URLs. Alternatively, enable the "Replace Image URLs" option to explicitly use WEBP versions on all pages.
* **Client-Side Image Squeezing:** Compress images directly in the browser without sending files to external servers
* **Upload Optimization:** Compresses images on-the-fly during the upload process, ensuring optimized images are added to your media library.
* **Gutenberg and GenerateBlocks Support:** Squeeze images directly on upload in Gutenberg or GenerateBlocks builder.
* **Bulk Compression:** Allows you to compress multiple images at once from your WordPress Media Library.
* **Image Exclusion:** Exclude images by URL or filename pattern (one per line) from upload and bulk squeeze.
* **Custom Directory Compression:** Select a directory on your site and compress all the images within it.
* **Selective Compression:** Choose which images to compress based on your preferences and requirements.
* **Custom Squeezing Settings:** Adjust compression parameters such as quality level to suit your specific needs.
* **Backup Option:** Creates a backup file to restore a compressed image to the original image.
* **Wide Format Support:** Squeezes images in popular formats, including JPEG, PNG, AVIF, and WEBP.

== ⚜️ Premium Features ⚜️ == 
* **Image Comparison:** Compare original and Squeezed images directly in the Media Library.
* **Resize Original Image:** Set maximum width and height for the original image.
* **Bulk Squeeze from a Page:** Compress all images from a specific page.
* **Elementor Integration:** Squeeze images directly while editing in Elementor.
* **Priority support & updates!**

Don't settle for limitations—upgrade now and supercharge your experience!

**[Explore the Premium version here.](https://pluginarium.com/squeeze/#premium)**

== How does the Squeeze plugin work? == 
Squeeze plugin compresses images directly from your WordPress Media Library or during the image upload process. All the work is handled directly inside your browser using advanced compression algorithms. That means there’s no third party service for compression images. Thus, you can be sure with the privacy of your images, ensuring data privacy and faster processing.

[Plugin's documentation is available here.](https://pluginarium.com/squeeze/squeeze-documentation/)

== Installation ==
1. Download the plugin ZIP file from the WordPress Plugin Directory, or install the plugin via the WordPress plugin installer.
2. Extract the ZIP file (if downloaded from WordPress Plugin Directory).
3. Upload the plugin directory to the wp-content/plugins/ directory of your WordPress installation.
4. Activate the Squeeze plugin from the WordPress plugins dashboard.

== Frequently Asked Questions ==
= How does the plugin work? =

The plugin uses client-side compression algorithms and provides you with the ability to compress images in your WordPress media library or during the image upload process.

= What does the speed of image compression depend on? =

Because the compression process happens directly into your browser - it depends on your device’s performance. 

= How are the images processed? Are they sent to an external server? =

The images compressed directly in your browser – means no external server used. Squeeze does all the work locally. So you should not worry about privacy.

= What makes Squeeze different from other image optimizers? =

* No compression limits.
* No cloud servers or API keys.
* Direct, local WEBP conversion for the newly uploaded images (no extra copies).
* Works instantly in Gutenberg and Elementor.

= Can this plugin convert images to the WEBP format? =

Yes! The Squeeze plugin supports converting images to the WEBP format during the compression process. WEBP is a modern image format that provides superior compression while maintaining high quality, resulting in faster loading times and reduced bandwidth usage. To enable this feature, check the "Direct WEBP Conversion" option under the Basic Settings tab to convert images in WEBP format.

= Is it safe to replace images with WEBP? =

Yes! It’s perfectly safe, especially for new uploads.
For existing images, the Squeeze plugin can automatically update JPG/PNG image URLs to their WebP versions when available.

Just a quick note — this replacement happens only when the page loads, so your database isn’t changed.
If you deactivate the Squeeze plugin, some images may stop showing. To fix that, simply reselect those images from the Media Library.

= Will my images break if I deactivate the plugin? =

If you deactivate Squeeze while the Direct WebP option is enabled, some images may stop showing because their JPG/PNG versions were converted to WebP.
To fix that, simply reselect those images in your posts or pages to restore the correct URLs.

= How are WEBP images served? =

Squeeze plugin converts your JPG/PNG images into WEBP format replacing the original images.
To enable this feature, check the "Direct WEBP Conversion" option under the Basic Settings tab to convert images in WEBP format.

That means if you have an image in JPG format like `image.jpg`, after conversion to WEBP format it becomes `image.webp`.

Previously, the generated WEBP images were stored in the wp-content/squeeze-webp directory within your WordPress installation.
That method is not very optimal, because it creates extra images which reduce your server's storage space.
However, if you already used that approach, you can keep it enabled for backwards compatibility.

= Why am I seeing an alert "Image conversion blocked by browser privacy setting"?  =

That means your browser is blocking access to canvas image data (this prevents image conversion).
The **privacy.resistFingerprinting** setting (or similar privacy features) is enabled.

**What you can do**:

* Open `about:config` in Firefox and set `privacy.resistFingerprinting` to `false`, then restart Firefox.
* Use a different browser (Chrome, Edge) or a browser profile without this setting.

= Which scripts are used for compressing and converting images?

The Squeeze plugin utilizes the same scripts and libraries that power the Squoosh.app, an open-source project by the Google Chrome team. These include highly efficient image processing libraries such as:

* MozJPEG: Used for compressing JPEG images.
* Browser Image Compression: Used for compressing PNG images. This does not come from the Squoosh.app, as its OxiPNG takes quite a long time to compress images.
* WEBP: Used for converting and compressing images to the modern WEBP format.
* AVIF: An advanced codec for creating lightweight and high-quality AVIF images.

= Why should I use image compression on my website? =

Image compression helps improve your website's performance by reducing the file size of images without significantly impacting their quality. Smaller image files load faster, resulting in faster page load times and a better user experience. Additionally, compressed images consume less bandwidth, which can be beneficial for websites with limited hosting resources or mobile users with limited data plans.

= Which image formats does the Squeeze plugin work with? =

Squeeze plugin supports JPG, PNG, WEBP and AVIF image formats.

= Can I compress multiple images at once? =

Yes, the plugin provides a bulk compression feature. This saves time and effort compared to compressing images individually.

= Can I compress images NOT from the Media Library, but from a custom directory? =

Yes, you can compress images from any directory within your WordPress installation.

= Can I customize the compression settings? =

Yes, the plugin allows you to customize various compression settings according to your preferences. The Settings page is located at Settings -> Squeeze.

= Image compression process seems to be stuck. The browser doesn't respond. =

It may happen if you are trying to compress a PNG image with a high resolution. In that case, you should wait a while, until the image finishes its compression or a “Request timed out.” error message occurs.

= How to fix a “Request timed out” error =

Go to the plugin’s setting page (Settings -> Squeeze).
At the “Basic Settings” tab increase the value of the field “Squeeze timeout”. By default it equals 60 seconds, try to make it bigger. If the error still persists, that means the script cannot process your image. 

= Where can I read the full documentation for this plugin? =

The full documentation is available here: [https://pluginarium.com/squeeze/squeeze-documentation/](https://pluginarium.com/squeeze/squeeze-documentation/)

== Screenshots ==
1. Compressed image with Squeeze Plugin
2. Squeeze's Bulk Compression Page
3. Squeeze's Restore and Recompress Options
4. Direct conversion of an image into WEBP format. The original image is being replaced by the compressed image in WEBP format.
5. A method of replacing images URLs with the corresponding WEBP versions.
6. Squeeze's Basic Settings
7. Squeeze's JPEG compression settings
8. Squeeze's PNG compression settings
9. Squeeze's WEBP compression settings
10. Squeeze's AVIF compression settings
11. Squeeze's Bulk actions in the List view of the Media Library
12. Squeeze's Filter in the Grid view of the Media Library
13. Squeeze images directly on upload in Gutenberg or GenerateBlocks builder.
14. Preview image with live Squeezing options (Premium feature)
15. Bulk Squeeze from a page (Premium feature)

== Changelog ==
= 1.7.9 =
* Redesigned WebP delivery settings with three clear modes: Direct WebP, separate squeeze-webp folder with URL rewrite, and separate folder with server-side delivery (.htaccess)
* CDN URL option is kept for all WebP delivery modes, including Direct WebP
* Improved URL-to-filesystem resolution when checking WebP files (CDN-aware)
* Bulk directory browser returns site-relative paths only (no absolute server paths in API responses)
* Fixed Media Library bulk squeeze completion popup (missing JavaScript helper import)
* PHPUnit and bulk browse path handling improvements
= 1.7.8 =
* Improved security for backend
= 1.7.7 =
* Fixed undefined function error for squeeze_premium
= 1.7.6 =
* Cached heavy PHP and SQL requests
= 1.7.5 =
* Updated notifications texts and icons
* Upgraded the Freemius version
= 1.7.4 =
* Replacing existing JPG/PNG images to WebP related from Direct WebP conversion
* Minor code refactor and bug fixing
= 1.7.3 =
* Added compatibility with Filebird plugin
* Refactored some JS functions
= 1.7.2 =
* Added compatibility with Elementor (Premium version only)
= 1.7.1 =
* Fixed Editor's interception request bug
* Add notification if Canvas extraction is blocked
= 1.7.0 =
* Added direct WEBP conversion option
* Compress newly uploaded images immediately, before they being uploaded to the server
* Skip uploading the compressed image, if it becomes larger than original after compression
* Fixed account tab on the Settings page
* Added explanation screenshots for some options on the Settings page
= 1.6.7 =
* Added auto-squeezing for the images uploaded via Image block 
* Adjusted UI for the bulk squeezing
* Added documentation tab on the Settings page
= 1.6.6 =
* Changed hook for enqueuing assets
= 1.6.5 =
* Added bulk Squeeze in the Grid mode
* Fixed filesize after Squeezing (on page reload)
* Fixed load_text_domain bug
= 1.6.4 =
* Changed PNG compression script
= 1.6.3 =
* Removed Freemius from the free version
= 1.6.2 =
* Pro version available
= 1.6.1 =
* Fixed vulnerabilities and bugs
= 1.6 =
* Refactored PHP and JS code
= 1.5.2 =
* Fixed WEBP conversion
* Added option to select image formats
= 1.5.1 =
* Fixed webworker bug
= 1.5 =
* Added WEBP serving
* Minor UI updates
= 1.4.9 =
* Added UI popup for bulk directory squeeze
* Added filters to the Media Library to select non-squeezed images
= 1.4.8 =
* Added webworker
* Fixed pause/resume on bulk Squeeze
* Minor UI/UX updates
= 1.4.7 =
* Updated plugin's UI and description
= 1.4.6 =
* Bulk compress option for the list view of the Media Library
* Pause/Resume option for the bulk compress process
* Fixed bugs with the list mode
* Fixed bug when bulk process stuck if image processing failed
* Added timeout for image compression process
* Added scaled image size for compression
* Refactored JS code
= 1.4.5 =
* Add bulk restore option to the list view of Media Library
* Compress selected thumbnails separately
= 1.4.4 =
* Delete .bak file on media delete
= 1.4.3 =
* Fixed minor JS bug
= 1.4.2 =
* Fixed security issue: check permissions for file upload
= 1.4.1 =
* Fixed security issue: Arbitrary File Upload
= 1.4 =
* Add AVIF support
= 1.3 =
* Add WEBP support
* Update settings page layout with tabs
* Add ability to re-compress images
* Add ability to compress images from custom directory
= 1.2 =
* Fix minor bug in Media library
= 1.1 =
* Fix PNG compressor
= 1.0 =
* First release.

== Upgrade Notice ==
= 1.7.9 =
* WebP delivery settings updated: three modes, CDN works with Direct WebP.
= 1.7.5 =
* Updated notifications texts and icons
* Upgraded the Freemius version
= 1.7.4 =
* Replacing existing JPG/PNG images to WebP related from Direct WebP conversion
= 1.7.3 =
* Added compatibility with Filebird plugin
= 1.7.1 =
* Fixed Editor's interception request bug
* Add notification if Canvas extraction is blocked
= 1.7.0 =
* Added direct WEBP conversion option
* Compress newly uploaded images immediately, not after they being uploaded to the server
* Skip uploading the compressed image, if it becomes larger than original after compression
* Fixed account tab on the Settings page
* Added explanation screenshots for some options on the Settings page
= 1.6.5 =
* Added bulk Squeeze in the Grid mode
* Refactored JS code
* Fixed filesize after Squeezing (on page reload)
* Fixed load_text_domain bug, caused by Freemius
= 1.6.4 =
* Changed PNG compression script and related settings
= 1.6.3 =
* Removed Freemius from the free version
= 1.6.2 =
* Pro version available
= 1.6.1 =
* Fixed vulnerabilities
= 1.6 =
* Refactored PHP: converted to Classes, exploded complex functions
* Refactored JS: exploded complex functions, add html templates to separate business logic from layouts
= 1.5.2 =
* Fixed WEBP conversion
* Added option to select image formats
= 1.5.1 =
* Fixed webworker bug: terminate it on complete squeezing
= 1.5 =
* Added WEBP serving for JPG and PNG images.
* Minor UI updates (savings label on the comparison table)
= 1.4.9 =
* Added UI popup for bulk directory squeeze
* Added filters to the Media Library
= 1.4.8 =
* Added webworker
* Fixed pause/resume on bulk Squeeze
* Minor UI/UX updates
= 1.4.7 =
* Updated plugin's UI and description
* Moved JS and CSS backend to external files
* Added sprite.svg for backend icons
* Updated restore defaults handler function
= 1.4.6 =
* Bulk compress option for the list view of the Media Library
* Pause/Resume option for the bulk compress process
* Fixed bugs with the list mode
* Fixed bug when bulk process stuck if image processing failed
* Added timeout for image compression process
* Refactored JS code
= 1.4.5 =
* Add bulk restore option to the list view of Media Library
* Compress selected thumbnails separately
= 1.4 =
* Add AVIF support
= 1.3 =
* Add WEBP support
* Update settings page layout with tabs
* Add ability to re-compress images
* Add ability to compress images from custom directory
= 1.2 =
* Fix minor bug in Media library
= 1.1 =
* Fix PNG compressor
= 1.0 =
* First release.