<?php

namespace SqueezeFree;

// Exit if accessed directly.
if ( !defined( 'ABSPATH' ) ) {
    exit;
}
class SqueezeHandlers extends SqueezeInit {
    public function __construct() {
        add_action( 'wp_ajax_squeeze_update_attachment', [$this, 'update_attachment'] );
        add_action( 'wp_ajax_squeeze_restore_attachment', [$this, 'restore_attachment'] );
        add_action( 'wp_ajax_squeeze_get_attachment', [$this, 'get_attachment'] );
        add_action( 'wp_ajax_squeeze_get_attachment_by_path', [$this, 'get_attachment_by_path'] );
        add_action( 'wp_ajax_squeeze_get_next_attachments', [$this, 'get_next_attachments'] );
        add_action( 'wp_ajax_squeeze_get_directories', [$this, 'get_directories'] );
        add_action( 'wp_ajax_squeeze_set_options', [$this, 'set_options'] );
        add_action( 'delete_attachment', [$this, 'delete_backup_attachment'] );
        add_action( 'delete_attachment', [$this, 'delete_webp_images'] );
        add_filter( 'bulk_actions-upload', [$this, 'bulk_actions'] );
        add_filter(
            'handle_bulk_actions-upload',
            [$this, 'handle_bulk_actions'],
            10,
            3
        );
        add_filter( 'image_size_names_choose', [$this, 'custom_image_sizes'] );
        add_filter( 'mod_rewrite_rules', [$this, 'add_webp_rewrite_rules'] );
        add_action( 'pre-html-upload-ui', [$this, 'single_file_upload_notice'], 10 );
        add_action( 'admin_notices', [$this, 'bulk_action_admin_notice'] );
        add_action( 'init', [$this, 'output_buffer_start'], 1 );
        add_action( 'shutdown', [$this, 'output_buffer_end'], 0 );
        // test this
        add_filter(
            'wp_prepare_attachment_for_js',
            [$this, 'update_attachment_metadata_for_js'],
            10,
            3
        );
        add_filter(
            'wp_get_attachment_metadata',
            [$this, 'update_attachment_metadata'],
            10,
            2
        );
    }

    public function update_attachment() {
        check_ajax_referer( 'squeeze-nonce', '_ajax_nonce' );
        if ( !current_user_can( 'upload_files' ) ) {
            wp_send_json_error( '❌ ' . esc_html__( 'You do not have permission to upload files', 'squeeze' ) );
        }
        if ( !isset( $_POST["base64"] ) || empty( $_POST["base64"] ) ) {
            wp_send_json_error( '❌ ' . esc_html__( 'No image data found', 'squeeze' ) );
        }
        $base64 = sanitize_text_field( wp_unslash( $_POST["base64"] ) );
        $sizes = ( isset( $_POST["base64Sizes"] ) ? (array) $_POST["base64Sizes"] : array() );
        // DO NOT SANITIZE because it's an array
        $base64_webp = ( isset( $_POST["base64Webp"] ) ? sanitize_text_field( wp_unslash( $_POST["base64Webp"] ) ) : '' );
        $sizes_webp = ( isset( $_POST["base64SizesWebp"] ) ? (array) $_POST["base64SizesWebp"] : array() );
        $file_format = ( isset( $_POST["format"] ) ? sanitize_text_field( wp_unslash( $_POST["format"] ) ) : '' );
        $filename = ( isset( $_POST["filename"] ) ? sanitize_text_field( wp_unslash( $_POST["filename"] ) ) : '' );
        $extension = pathinfo( $filename, PATHINFO_EXTENSION );
        // handle jpg/jpeg extension
        if ( $extension === 'jpeg' ) {
            $extension = 'jpg';
        }
        $image_formats = self::$SqueezeHelpers->get_image_formats();
        $original_file = ( isset( $_FILES['originalFile'] ) ? $_FILES['originalFile'] : null );
        if ( !in_array( $extension, $image_formats ) || empty( $file_format ) ) {
            wp_send_json_error( '❌ ' . esc_html__( 'Invalid image format', 'squeeze' ) );
        }
        $attach_id = ( isset( $_POST["attachmentID"] ) ? (int) $_POST["attachmentID"] : 0 );
        $meta_data = wp_get_attachment_metadata( $attach_id );
        $url = ( isset( $_POST["url"] ) ? sanitize_text_field( $_POST["url"] ) : '' );
        // sanitize_url() replaces spaces with %20, so we use sanitize_text_field() instead
        $process = ( isset( $_POST["process"] ) ? sanitize_text_field( $_POST["process"] ) : '' );
        // process: all, uncompressed, path
        if ( empty( $attach_id ) && $process !== 'path' || empty( $url ) ) {
            wp_send_json_error( '❌ ' . esc_html__( 'Attachment not found', 'squeeze' ) );
        }
        $is_backup_original = self::$SqueezeHelpers->get_option( 'backup_original' );
        $is_direct_webp = self::$SqueezeHelpers->get_option( 'direct_webp' );
        // Upload path.
        $upload_path = self::$SqueezeHelpers->get_upload_path( $attach_id, $filename, $url );
        $decoded = self::$SqueezeHelpers->decode_base64_image( $base64, $file_format );
        $webp_file_path = '';
        $old_metadata = wp_get_attachment_metadata( $attach_id );
        $old_filename = $filename;
        // in case the original file is not webp and we should convert it to webp
        // we need to generate a new filename for the webp file
        // and update its url
        if ( $file_format === 'webp' && $extension !== 'webp' && $is_direct_webp && $process !== 'path' ) {
            $file = get_attached_file( $attach_id );
            // get the _wp_attached_file meta value which looks like "2023/10/image.jpg"
            $path_info = pathinfo( $file );
            $dirname = $path_info['dirname'];
            //Get a unique filename in that folder
            $unique_filename = wp_unique_filename( $dirname, sanitize_file_name( preg_replace( '/\\.[^.]+$/', '.webp', $filename ) ) );
            $webp_file_path = trailingslashit( $dirname ) . $unique_filename;
            // looks like "E:\Extra-Time\test/wp-content/uploads/2023/10/image.webp"
            $filename = basename( $unique_filename );
            $url = str_replace( ABSPATH, home_url( '/' ), $webp_file_path );
            // convert file path to URL
            //wp_send_json_error($filename . ' ' . $url . ' ' . $webp_file_path);
        }
        if ( $original_file ) {
            $sizes['original']['original_size'] = $original_file['size'];
        } else {
            $sizes['original']['original_size'] = wp_filesize( $upload_path . $filename );
        }
        $sizes['original']['compressed_size'] = strlen( $decoded );
        // check if compressed_size is greater than original_size
        if ( $sizes['original']['compressed_size'] > $sizes['original']['original_size'] ) {
            wp_send_json_error( '❌ ' . esc_html__( 'Compressed image size is greater than original size.', 'squeeze' ) . ' ' . sprintf( __( 'Please try to change your <a href="%s" target="_blank">compression settings</a> by decreasing the quality or compression level.', 'squeeze' ), self::$SETTINGS_URL . '#squeeze_' . $file_format ) );
        }
        if ( $is_backup_original && $process !== 'path' ) {
            // do not backup for non library images
            // backup original
            if ( $original_file ) {
                $backup_original_image = self::$SqueezeHelpers->backup_original_image( $upload_path, $filename, $original_file['tmp_name'] );
            } else {
                $backup_original_image = self::$SqueezeHelpers->backup_original_image( $upload_path, $filename );
            }
            if ( is_wp_error( $backup_original_image ) ) {
                wp_send_json_error( $backup_original_image->get_error_message() );
            }
        }
        // Save the image in the uploads directory.
        $upload_image = self::$SqueezeHelpers->upload_image( $upload_path, $filename, $decoded );
        if ( is_wp_error( $upload_image ) ) {
            wp_send_json_error( $upload_image->get_error_message() );
        }
        if ( $base64_webp ) {
            $upload_webp = self::$SqueezeHelpers->upload_webp( $upload_path, $base64_webp, $filename );
            if ( is_wp_error( $upload_webp ) ) {
                wp_send_json_error( $upload_webp->get_error_message() );
            }
            $upload_webp_thumbs = self::$SqueezeHelpers->upload_webp_thumbs( $upload_path, $sizes_webp );
            // skip handling errors for webp thumbs, because they are not always required
        }
        // upload thumbnails
        if ( $process !== 'path' ) {
            if ( $file_format === 'webp' && $extension !== 'webp' && $is_direct_webp ) {
                update_attached_file( $attach_id, $webp_file_path );
                // update the _wp_attached_file meta value to the new webp file path
                wp_update_post( [
                    'ID'             => $attach_id,
                    'post_mime_type' => 'image/webp',
                ] );
                $metadata = wp_generate_attachment_metadata( $attach_id, $webp_file_path );
                wp_update_attachment_metadata( $attach_id, $metadata );
            }
            $sizes = self::$SqueezeHelpers->upload_image_thumbs(
                $upload_path,
                $sizes,
                $file_format,
                $filename
            );
            //wp_send_json_error( print_r($sizes, true) );
            if ( is_wp_error( $sizes ) ) {
                wp_send_json_error( $sizes->get_error_message() );
            }
            if ( $file_format === 'webp' && $extension !== 'webp' && $is_direct_webp ) {
                // remove webp images from the squeeze-webp directory
                $this->delete_webp_images( $attach_id, $old_metadata );
                // remove original JPG/PNG file if it exists
                foreach ( $old_metadata['sizes'] as $size_name => $size_data ) {
                    $old_size_filename = $size_data['file'];
                    wp_delete_file( $upload_path . $old_size_filename );
                }
                $old_scaled_filename = basename( $old_metadata['file'] );
                wp_delete_file( $upload_path . $old_scaled_filename );
                $old_original_path = $upload_path . $old_filename;
                wp_delete_file( $old_original_path );
                if ( $is_backup_original ) {
                    // delete old backup file
                    $backup_filename = self::$SqueezeHelpers->create_backup_filename( $old_filename );
                    $old_backup_path = $upload_path . $backup_filename;
                    wp_delete_file( $old_backup_path );
                }
            }
            update_post_meta( $attach_id, "squeeze_is_compressed", true );
            $response_msg = self::$SqueezeHelpers->get_comparison_table( $sizes );
            $response_msg = '<strong>✅ ' . esc_html__( 'Squeezed successfully', 'squeeze' ) . '!</strong> ' . $response_msg;
            $uncompressed_images = self::$SqueezeHelpers->get_stats_option( 'uncompressed_images' );
            $uncompressed_images--;
            update_option( 'squeeze_stats', array(
                'uncompressed_images' => $uncompressed_images,
            ) );
            //wp_send_json_error( print_r($sizes, true) );
            //wp_send_json_success($response_msg .  print_r($sizes['scaled']['url'], true) . ' | ' . $filename . ' | ' . pathinfo($filename, PATHINFO_FILENAME) );
            //wp_send_json_success($response_msg);
            wp_send_json_success( array(
                'message'  => $response_msg,
                'sizes'    => $sizes,
                'filename' => $filename,
                'url'      => $url,
            ) );
        } else {
            wp_send_json_success( '✅ ' . esc_html__( 'Squeezed successfully', 'squeeze' ) );
        }
        wp_die();
    }

    public function restore_attachment() {
        check_ajax_referer( 'squeeze-nonce', '_ajax_nonce' );
        if ( !isset( $_POST["attachmentID"] ) || empty( $_POST["attachmentID"] ) || !wp_get_attachment_url( $_POST["attachmentID"] ) ) {
            wp_send_json_error( '❌ ' . esc_html__( 'Attachment not found', 'squeeze' ) );
        }
        $attach_id = (int) $_POST["attachmentID"];
        $can_restore = self::$SqueezeHelpers->can_restore( $attach_id );
        if ( $can_restore ) {
            $is_restore_attachment = self::$SqueezeHelpers->restore_attachment( $attach_id );
            if ( !is_wp_error( $is_restore_attachment ) ) {
                wp_send_json_success( '✅ ' . esc_html__( 'Restored successfully', 'squeeze' ) );
            } else {
                wp_send_json_error( '❌ ' . esc_html__( 'Attachment not restored', 'squeeze' ) );
            }
        }
        wp_die();
    }

    public function get_attachment() {
        check_ajax_referer( 'squeeze-nonce', '_ajax_nonce' );
        if ( !current_user_can( 'upload_files' ) ) {
            wp_send_json_error( '❌ ' . esc_html__( 'You do not have permission to upload files', 'squeeze' ) );
        }
        if ( !isset( $_POST["attachmentID"] ) || empty( $_POST["attachmentID"] ) || !wp_get_attachment_url( $_POST["attachmentID"] ) ) {
            wp_send_json_error( '❌ ' . esc_html__( 'Attachment not found', 'squeeze' ) );
        }
        $attach_id = (int) $_POST["attachmentID"];
        // Load excluded images once per request (Premium only) - cached in get_excluded_images()
        $excluded_images = array();
        // Get attachment metadata once (contains sizes data)
        $metadata = wp_get_attachment_metadata( $attach_id );
        $sizes = ( isset( $metadata['sizes'] ) ? $metadata['sizes'] : array() );
        $full_image = wp_get_attachment_image_src( $attach_id, 'full' );
        // Cache file paths to avoid repeated function calls
        $attached_file = get_attached_file( $attach_id );
        $original_image_path = wp_get_original_image_path( $attach_id );
        $is_squeezed = get_post_meta( $attach_id, 'squeeze_is_compressed', true );
        // -scaled image
        $sizes['full'] = array(
            'url'      => $full_image[0],
            'width'    => $full_image[1],
            'height'   => $full_image[2],
            'filesize' => wp_filesize( $attached_file ),
        );
        // Build size URLs (WordPress caches these internally)
        foreach ( $sizes as $size_name => $size_data ) {
            $sizes[$size_name]['url'] = wp_get_attachment_image_url( $attach_id, $size_name );
        }
        $attachment_data = array(
            'id'          => $attach_id,
            'url'         => wp_get_original_image_url( $attach_id ),
            'mime'        => get_post_mime_type( $attach_id ),
            'name'        => get_the_title( $attach_id ),
            'filename'    => basename( $original_image_path ),
            'sizes'       => $sizes,
            'is_squeezed' => $is_squeezed,
        );
        wp_send_json_success( $attachment_data );
        wp_die();
    }

    public function get_attachment_by_path() {
        check_ajax_referer( 'squeeze-nonce', '_ajax_nonce' );
        if ( !current_user_can( 'upload_files' ) ) {
            wp_send_json_error( '❌ ' . esc_html__( 'You do not have permission to upload files', 'squeeze' ) );
        }
        if ( !isset( $_POST["path"] ) || empty( $_POST["path"] ) ) {
            wp_send_json_error( '❌ ' . esc_html__( 'Path not found', 'squeeze' ) );
        }
        $pathes = sanitize_text_field( $_POST["path"] );
        $pathes = json_decode( stripslashes( $pathes ), true );
        $attachment_data = array();
        $image_formats = self::$SqueezeHelpers->get_image_formats();
        $image_formats = implode( ',', $image_formats );
        // MIME type mapping based on file extension (much faster than exif_imagetype)
        $mime_type_map = array(
            'jpg'  => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png'  => 'image/png',
            'webp' => 'image/webp',
            'avif' => 'image/avif',
            'gif'  => 'image/gif',
        );
        // Load excluded images once per request (Premium only) - cached in get_excluded_images()
        $excluded_images = array();
        // Cache home URL and normalize ABSPATH to avoid repeated function calls and string operations
        $home_url = trailingslashit( home_url() );
        $abspath_normalized = str_replace( '\\', '/', ABSPATH );
        foreach ( $pathes as $path ) {
            // Remove dangerous patterns related to directory traversal
            $path = preg_replace( [
                '/\\.\\.+/',
                // Remove multiple dots (.., ...)
                '/\\/\\*/',
            ], '', $path );
            // replace multiple backslashes with slashes
            $path = preg_replace( ['/\\/+/'], '/', $path );
            // Add trailing slash if it's not there
            if ( substr( $path, -1 ) !== '/' ) {
                $path .= '/';
            }
            // Add leading slash if it's not there
            if ( substr( $path, 0, 1 ) !== '/' ) {
                $path = '/' . $path;
            }
            $images = glob( ABSPATH . $path . '*.{' . $image_formats . '}', GLOB_BRACE );
            if ( empty( $images ) ) {
                continue;
            }
            foreach ( $images as $image ) {
                // Get file extension for MIME type detection (much faster than exif_imagetype)
                $extension = strtolower( pathinfo( $image, PATHINFO_EXTENSION ) );
                // Skip if extension not in our map (safety check)
                if ( !isset( $mime_type_map[$extension] ) ) {
                    continue;
                }
                $attach_mime = $mime_type_map[$extension];
                $filename = basename( $image );
                // Convert file path to URL efficiently
                // Normalize path separators and replace ABSPATH with home URL
                $image_normalized = str_replace( '\\', '/', $image );
                $attach_url = str_replace( $abspath_normalized, $home_url, $image_normalized );
                // Skip attachment_url_to_postid() to avoid expensive database queries
                // Path-based compression works with ID = 0 (files not in media library)
                $attach_id = 0;
                $attach_name = pathinfo( $image, PATHINFO_FILENAME );
                $attachment_data[] = array(
                    'id'       => $attach_id,
                    'url'      => $attach_url,
                    'mime'     => $attach_mime,
                    'name'     => $attach_name,
                    'filename' => $filename,
                );
            }
        }
        // Save pathes to cache
        set_transient( 'squeeze_bulk_path', $pathes, MONTH_IN_SECONDS );
        if ( empty( $attachment_data ) ) {
            wp_send_json_error( '❌ ' . esc_html__( 'Images were not found in the selected directories', 'squeeze' ) );
        }
        wp_send_json_success( $attachment_data );
        wp_die();
    }

    public function delete_backup_attachment( $attach_id ) {
        $original_img_path = wp_get_original_image_path( (int) $attach_id );
        $backup_img_path = preg_replace( "/(\\.(?!.*\\.))/", '.bak.', $original_img_path );
        if ( file_exists( $backup_img_path ) ) {
            return wp_delete_file( $backup_img_path );
        }
        return false;
    }

    public function delete_webp_images( $attach_id, $old_metadata = null ) {
        $original_img_path = wp_get_original_image_path( (int) $attach_id );
        $attachment_data = ( $old_metadata ? $old_metadata : wp_get_attachment_metadata( $attach_id ) );
        $delete_webp_images = self::$SqueezeHelpers->delete_webp_images( $original_img_path, $attachment_data );
        return $delete_webp_images;
    }

    public function bulk_actions( $actions ) {
        if ( !is_array( $actions ) ) {
            $actions = array();
        }
        $actions['squeeze_bulk_restore'] = esc_html__( 'Restore Original Image', 'squeeze' );
        $actions['squeeze_bulk_compress'] = esc_html__( 'Squeeze Image', 'squeeze' );
        $actions['squeeze_bulk_delete_backup'] = esc_html__( 'Delete Backup Image', 'squeeze' );
        $actions['squeeze_bulk_delete_webp'] = esc_html__( 'Delete WEBP Image', 'squeeze' );
        return $actions;
    }

    public function handle_bulk_actions( $redirect_to, $doaction, $post_ids ) {
        if ( $doaction === 'squeeze_bulk_restore' ) {
            $restored_ids_count = 0;
            foreach ( $post_ids as $post_id ) {
                $can_restore = self::$SqueezeHelpers->can_restore( $post_id );
                if ( $can_restore ) {
                    $is_restore_attachment = self::$SqueezeHelpers->restore_attachment( $post_id, true );
                    if ( $is_restore_attachment ) {
                        $restored_ids_count += 1;
                    }
                }
            }
            $redirect_to = add_query_arg( 'squeeze_bulk_restored', $restored_ids_count, $redirect_to );
        }
        if ( $doaction === 'squeeze_bulk_compress' ) {
            foreach ( $post_ids as $post_id ) {
                $redirect_to = add_query_arg( 'squeeze_bulk_compressed', count( $post_ids ), $redirect_to );
            }
        }
        if ( $doaction === 'squeeze_bulk_delete_backup' ) {
            $deleted_ids_count = 0;
            foreach ( $post_ids as $post_id ) {
                $is_delete_backup = $this->delete_backup_attachment( $post_id );
                if ( $is_delete_backup ) {
                    $deleted_ids_count += 1;
                }
            }
            $redirect_to = add_query_arg( 'squeeze_bulk_deleted', $deleted_ids_count, $redirect_to );
        }
        if ( $doaction === 'squeeze_bulk_delete_webp' ) {
            $deleted_ids_count = 0;
            foreach ( $post_ids as $post_id ) {
                $is_delete_webp = $this->delete_webp_images( $post_id );
                if ( $is_delete_webp ) {
                    $deleted_ids_count += 1;
                }
            }
            $redirect_to = add_query_arg( 'squeeze_bulk_webp_deleted', $deleted_ids_count, $redirect_to );
        }
        return $redirect_to;
    }

    public function bulk_action_admin_notice() {
        if ( !empty( $_REQUEST['squeeze_bulk_restored'] ) ) {
            $message = sprintf( 
                /* translators: %d: number of attachments restored */
                _n(
                    '%d attachment restored.',
                    '%d attachments restored.',
                    $_REQUEST['squeeze_bulk_restored'],
                    'squeeze'
                ),
                number_format_i18n( $_REQUEST['squeeze_bulk_restored'] )
             );
            printf( '<div class="notice notice-success is-dismissible"><p>%s</p></div>', esc_html( $message ) );
        }
        if ( !empty( $_REQUEST['squeeze_bulk_compressed'] ) ) {
            $message = sprintf( 
                /* translators: %d: number of attachments squeezed */
                _n(
                    '%d attachment squeezed.',
                    '%d attachments squeezed.',
                    $_REQUEST['squeeze_bulk_compressed'],
                    'squeeze'
                ),
                number_format_i18n( $_REQUEST['squeeze_bulk_compressed'] )
             );
            printf( '<div class="notice notice-success is-dismissible"><p>%s</p></div>', esc_html( $message ) );
        }
        if ( !empty( $_REQUEST['squeeze_bulk_deleted'] ) ) {
            $message = sprintf( 
                /* translators: %d: number of backup images deleted */
                _n(
                    '%d backup image deleted.',
                    '%d backup images deleted.',
                    $_REQUEST['squeeze_bulk_deleted'],
                    'squeeze'
                ),
                number_format_i18n( $_REQUEST['squeeze_bulk_deleted'] )
             );
            printf( '<div class="notice notice-success is-dismissible"><p>%s</p></div>', esc_html( $message ) );
        }
        if ( !empty( $_REQUEST['squeeze_bulk_webp_deleted'] ) ) {
            $message = sprintf( 
                /* translators: %d: number of webp images deleted */
                _n(
                    '%d WEBP image deleted.',
                    '%d WEBP images deleted.',
                    $_REQUEST['squeeze_bulk_webp_deleted'],
                    'squeeze'
                ),
                number_format_i18n( $_REQUEST['squeeze_bulk_webp_deleted'] )
             );
            printf( '<div class="notice notice-success is-dismissible"><p>%s</p></div>', esc_html( $message ) );
        }
    }

    public function custom_image_sizes( $sizes ) {
        $available_sizes = wp_get_registered_image_subsizes();
        if ( empty( $available_sizes ) ) {
            return $sizes;
        }
        foreach ( $available_sizes as $size_name => $size_data ) {
            $sizes[$size_name] = $size_data['width'] . 'x' . $size_data['height'];
        }
        return $sizes;
    }

    public function get_next_attachments() {
        check_ajax_referer( 'squeeze-nonce', '_ajax_nonce' );
        $per_page = self::$MEDIA_PER_PAGE;
        $page = ( isset( $_POST['page'] ) ? (int) $_POST['page'] : 1 );
        $type = ( isset( $_POST['type'] ) ? sanitize_text_field( $_POST['type'] ) : 'uncompressed' );
        $last_id = ( isset( $_POST['lastId'] ) ? (int) $_POST['lastId'] : 0 );
        if ( $type === 'uncompressed' ) {
            $next_images = self::$SqueezeHelpers->get_uncompressed_images( $last_id );
        } else {
            $next_images = self::$SqueezeHelpers->get_total_images( $page );
        }
        wp_send_json_success( $next_images );
    }

    public function single_file_upload_notice() {
        global $current_screen;
        if ( $current_screen->id === 'media' ) {
            ?>
			<div class="notice notice-warning hide-if-js squeeze-single-file-upload-notice">
				<p><?php 
            esc_html_e( 'Single file upload is not supported for the image compression by Squeeze. Please use multi-file uploader or bulk squeeze.', 'squeeze' );
            ?></p>
			</div>
			<?php 
        }
    }

    public function get_directories() {
        check_ajax_referer( 'squeeze-nonce', '_ajax_nonce' );
        if ( !current_user_can( 'manage_options' ) ) {
            wp_send_json_error( '❌ ' . esc_html__( 'You do not have permission to browse directories.', 'squeeze' ) );
        }
        $parent_directory = ( isset( $_POST['parentDir'] ) ? sanitize_text_field( wp_unslash( $_POST['parentDir'] ) ) : '' );
        $allowed_base = realpath( WP_CONTENT_DIR );
        if ( $allowed_base === false ) {
            wp_send_json_error( '❌ ' . esc_html__( 'Content directory is not accessible.', 'squeeze' ) );
        }
        if ( $parent_directory === '' ) {
            $base_dir = $allowed_base;
        } else {
            // Prevent path traversal: resolve path and ensure it stays under WP_CONTENT_DIR.
            $parent_directory = str_replace( '\\', '/', $parent_directory );
            $parent_directory = preg_replace( '#/+#', '/', trim( $parent_directory, '/' ) );
            if ( $parent_directory === '' || preg_match( '#(^|/)\\.\\.(/|$)#', $parent_directory ) ) {
                wp_send_json_error( '❌ ' . esc_html__( 'Invalid directory path.', 'squeeze' ) );
            }
            $base_dir = realpath( $allowed_base . '/' . $parent_directory );
            if ( $base_dir === false || strpos( $base_dir, $allowed_base ) !== 0 ) {
                wp_send_json_error( '❌ ' . esc_html__( 'Invalid directory path.', 'squeeze' ) );
            }
        }
        $directories = scandir( $base_dir );
        if ( !$parent_directory ) {
            $directories[] = $base_dir;
        }
        $result = array_filter( $directories, function ( $dir ) use($base_dir) {
            if ( $dir === $base_dir ) {
                return true;
            }
            return is_dir( $base_dir . '/' . $dir ) && !in_array( $dir, ['.', '..'] );
        } );
        $output = array_map( function ( $dir ) use($base_dir) {
            if ( $dir === 'squeeze-webp' ) {
                return [
                    'name'         => '',
                    'path'         => '',
                    'is_writeable' => false,
                    'parent'       => '',
                ];
            }
            if ( $dir === $base_dir ) {
                $path = str_replace( ABSPATH, '/', $dir . '/' );
                $parent_path = dirname( $base_dir );
                $parent_path = str_replace( ABSPATH, '/', $parent_path . '/' );
                return [
                    'name'         => 'wp-content',
                    'path'         => $path,
                    'is_writeable' => false,
                    'parent'       => $parent_path,
                ];
            }
            $path = str_replace( ABSPATH, '/', $base_dir . '/' . $dir . '/' );
            $parent_path = dirname( $base_dir . '/' . $dir );
            $parent_path = str_replace( ABSPATH, '/', $parent_path . '/' );
            // Remove double slashes from path
            $path = preg_replace( '/\\/+/', '/', $path );
            $parent_path = preg_replace( '/\\/+/', '/', $parent_path );
            return [
                'name'         => $dir,
                'path'         => $path,
                'is_writeable' => wp_is_writable( $base_dir . '/' . $dir ),
                'parent'       => $parent_path,
            ];
        }, $result );
        usort( $output, function ( $a, $b ) {
            if ( $a['name'] === 'wp-content' ) {
                return -1;
            } elseif ( $b['name'] === 'wp-content' ) {
                return 1;
            }
            return strcmp( $a['name'], $b['name'] );
        } );
        wp_send_json( $output );
    }

    public function add_webp_rewrite_rules( $rules ) {
        $is_auto_webp = self::$SqueezeHelpers->get_option( 'auto_webp' );
        $modules = self::$SqueezeHelpers->apache_get_modules();
        // Get the WordPress installation subdirectory, if applicable
        $wordpress_subdirectory = wp_parse_url( home_url(), PHP_URL_PATH );
        // Check if WordPress is installed in a subdirectory (not just the root)
        if ( strlen( $wordpress_subdirectory ) > 1 ) {
            // Ensure the subdirectory is used correctly in the rules
            $rewrite_base = $wordpress_subdirectory . '/';
        } else {
            // If WordPress is installed in the root, no subdirectory path is needed
            $rewrite_base = '/';
        }
        $webp_rules = "\n# Serve WebP images from the wp-content/squeeze-webp folder if available\n";
        $webp_rules .= "RewriteCond %{HTTP_ACCEPT} image/webp\n";
        // Check if browser supports WebP
        $webp_rules .= "RewriteCond %{REQUEST_URI} \\.(jpg|jpeg|png)\$ [NC]\n";
        // Check if request is for JPG, JPEG, or PNG
        $webp_rules .= "RewriteCond %{DOCUMENT_ROOT}" . $rewrite_base . "wp-content/squeeze-webp/\$1.\$2.webp -f\n";
        // Check if WebP file exists
        $webp_rules .= "RewriteRule ^wp-content/(.+)\\.(jpg|jpeg|png)\$ wp-content/squeeze-webp/\$1.\$2.webp [T=image/webp,E=webp_request,L]\n";
        // Serve WebP file
        $webp_rules .= "# END Serve WebP images from the wp-content/squeeze-webp folder if available\n";
        $webp_rules .= "\n";
        if ( !$is_auto_webp ) {
            // If auto WebP conversion is disabled, return the original rules and replace the WebP rules if they exist
            $rules = preg_replace( '/# Serve WebP images from the wp-content\\/squeeze-webp folder if available.*?# END Serve WebP images from the wp-content\\/squeeze-webp folder if available\\n/s', '', $rules );
            return $rules;
        }
        // Check if the server is Apache and htaccess is writable
        if ( !is_array( $modules ) || !in_array( 'mod_rewrite', $modules ) ) {
            return $rules;
        }
        return $webp_rules . $rules;
    }

    public function output_buffer_start() {
        if ( !is_admin() && (!isset( $_SERVER['HTTP_X_WP_REMOTE_REQUEST'] ) || $_SERVER['HTTP_X_WP_REMOTE_REQUEST'] !== 'true') || function_exists( "wp_doing_ajax" ) && wp_doing_ajax() || defined( 'DOING_AJAX' ) && DOING_AJAX ) {
            ob_start( [$this, 'replace_image_urls_with_webp'] );
        }
    }

    /**
     * While WordPress flushes automatically, you can add an explicit handler on shutdown 
     * (with higher priority than 1, e.g., 0) to ensure clean flushing if there are conflicts 
     * (e.g., with zlib compression or other plugins). 
     * This suppresses potential PHP notices like "failed to send buffer of zlib output compression" 
     * without discarding content:
     */
    public function output_buffer_end() {
        while ( ob_get_level() > 0 ) {
            @ob_end_flush();
            // Suppress notices; flushes modified content
        }
    }

    // Other helper functions
    public function replace_image_urls_with_webp( $content ) {
        $is_replace_urls = self::$SqueezeHelpers->is_webp_replace_urls();
        $is_direct_webp = self::$SqueezeHelpers->get_option( 'direct_webp' );
        if ( !$is_replace_urls && !$is_direct_webp ) {
            return $content;
        }
        $content_folder = basename( WP_CONTENT_DIR );
        // Regular expression to find JPG and PNG images in src and srcset attributes.
        //$pattern = '/(\/\/.*?\/' . preg_quote($content_folder, '/') . '\/)([^"\s]+\.(jpg|jpeg|png))(\?[^"\s]*)?/i';
        // Supports query params, size suffixes, and encoded filenames.
        $pattern = '/(\\/\\/[^"\\s]*?' . preg_quote( $content_folder, '/' ) . '\\/[^"\\s]+\\.(jpg|jpeg|png))(\\?[^"\\s]*)?/i';
        // Callback function to replace the URLs.
        $callback = function ( $matches ) use($is_direct_webp, $is_replace_urls) {
            // $matches[0] is the full matched URL
            $full_match = $matches[0];
            $url_no_query = $matches[1];
            $query = ( isset( $matches[3] ) ? $matches[3] : '' );
            $file_extension = strtolower( pathinfo( $url_no_query, PATHINFO_EXTENSION ) );
            if ( $file_extension === 'webp' ) {
                return $full_match;
                // Already a WebP image, no need to replace.
            }
            $protocol = ( is_ssl() ? 'https:' : 'http:' );
            $file_path = str_replace( home_url(), ABSPATH, $protocol . $url_no_query );
            // Convert URL to file path.
            if ( $is_replace_urls ) {
                $webp_url = self::$SqueezeHelpers->convert_image_path_to_webp_path( $url_no_query ) . '.webp';
                // WebP URL like 'example.com/wp-content/squeeze-webp/uploads/2024/12/test.jpg.webp'
                // Check if the WEBP file exists on the server.
                $webp_file_path = str_replace( home_url(), ABSPATH, $protocol . $webp_url );
                // Convert URL to file path.
                //return $webp_file_path.'::'.$webp_url;
                if ( file_exists( $webp_file_path ) ) {
                    return $webp_url;
                    // Use WEBP version if it exists.
                }
            }
            if ( $is_direct_webp && !file_exists( $file_path ) ) {
                // try to find possible WEBP variants
                $webp_candidates = [];
                // Base WebP
                $webp_url = preg_replace( '/\\.[^.]+$/i', '.webp', $url_no_query );
                $webp_candidates[] = $webp_url;
                // Unscaled version (remove -scaled)
                if ( preg_match( '/-scaled\\.[^.]+$/i', $webp_url ) ) {
                    $webp_candidates[] = preg_replace( '/-scaled\\.[^.]+$/i', '.webp', $webp_url );
                }
                // Dimensioned variants (e.g. test-300x200.jpg)
                if ( preg_match( '/-\\d+x\\d+\\.[^.]+$/i', $webp_url ) ) {
                    $webp_candidates[] = preg_replace( '/-\\d+x\\d+\\.[^.]+$/i', '.webp', $webp_url );
                }
                // Numbered suffixes: test-1.webp, test-2.webp...
                for ($i = 1; $i <= 99; $i++) {
                    $webp_candidates[] = preg_replace( '/(-scaled)?\\.[^.]+$/i', '-' . $i . '.webp', $webp_url );
                }
                foreach ( $webp_candidates as $candidate ) {
                    $candidate_full = ( strpos( $candidate, '//' ) === 0 ? $protocol . $candidate : $candidate );
                    $candidate_path = str_replace( home_url(), ABSPATH, $candidate_full );
                    if ( file_exists( $candidate_path ) ) {
                        return $candidate . $query;
                    }
                }
                /*
                				// try to find webp without -scaled suffix
                				$webp_url_no_scaled = preg_replace('/-scaled\.webp$/', '.webp', $webp_url);
                				$webp_file_path_no_scaled = str_replace(home_url(), ABSPATH, $protocol.$webp_url_no_scaled); // Convert URL to file path.
                				if (file_exists($webp_file_path_no_scaled)) {
                					return $webp_url_no_scaled; // Use WEBP version if it exists.
                				} else {
                					// loop through the files with number suffixes
                					for ($i = 1; $i <= 99; $i++) {
                						$webp_url_numbered = preg_replace('/(-scaled)?\.webp$/', '-' . $i . '.webp', $webp_url);
                						$webp_file_path_numbered = str_replace(home_url(), ABSPATH, $protocol.$webp_url_numbered); // Convert URL to file path.
                						if (file_exists($webp_file_path_numbered)) {
                							return $webp_url_numbered; // Use WEBP version if it exists.
                						}
                					}
                				}
                				//*/
            }
            return $full_match;
            // Fallback to the original URL if WEBP file doesn't exist.
        };
        // Replace URLs in the content, including src and srcset attributes.
        $content = preg_replace_callback( $pattern, $callback, $content );
        return $content;
    }

    public function set_options() {
        check_ajax_referer( 'squeeze-nonce', '_ajax_nonce' );
        if ( !current_user_can( 'upload_files' ) ) {
            wp_send_json_error( '❌ ' . esc_html__( 'You do not have permission to upload files', 'squeeze' ) );
        }
        $options = ( isset( $_POST['options'] ) ? $_POST['options'] : array() );
        if ( empty( $options ) ) {
            wp_send_json_error( '❌ ' . esc_html__( 'Options not found', 'squeeze' ) );
        }
        $is_set_options = self::$SqueezeHelpers->set_options( $options );
        if ( !$is_set_options ) {
            wp_send_json_error( '❌ ' . esc_html__( 'Options not saved', 'squeeze' ) );
        }
        wp_send_json_success( '✅ ' . esc_html__( 'Options saved successfully', 'squeeze' ) );
    }

    public function update_attachment_metadata_for_js( $response, $attachment, $meta ) {
        if ( isset( $response['filesizeInBytes'] ) && isset( $response['filesizeHumanReadable'] ) ) {
            // check if the attachment is compressed
            $is_squeezed = get_post_meta( $attachment->ID, 'squeeze_is_compressed', true );
            if ( !$is_squeezed ) {
                return $response;
            }
            // get updated filesize from the actual file
            $attachment_path = get_attached_file( $attachment->ID );
            $filesize = wp_filesize( $attachment_path );
            $filesize_human = size_format( $filesize );
            $image_info = getimagesize( $attachment_path );
            $image_width = $image_info[0];
            $image_height = $image_info[1];
            $response['filesizeInBytes'] = $filesize;
            $response['filesizeHumanReadable'] = $filesize_human;
            $response['width'] = $image_width;
            $response['height'] = $image_height;
        }
        return $response;
    }

    public function update_attachment_metadata( $data, $attachment_id ) {
        if ( isset( $data['filesize'] ) ) {
            // check if the attachment is compressed
            $is_squeezed = get_post_meta( $attachment_id, 'squeeze_is_compressed', true );
            if ( !$is_squeezed ) {
                return $data;
            }
            // get updated filesize from the actual file
            $attachment_path = get_attached_file( $attachment_id );
            $filesize = wp_filesize( $attachment_path );
            $image_info = getimagesize( $attachment_path );
            $data['filesize'] = $filesize;
            if ( $image_info ) {
                $image_width = $image_info[0];
                $image_height = $image_info[1];
                $data['width'] = $image_width;
                $data['height'] = $image_height;
            }
        }
        return $data;
    }

}
