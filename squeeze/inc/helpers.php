<?php
namespace SqueezeFree;

// Exit if accessed directly.
if (!defined('ABSPATH')) {
	exit;
}

class SqueezeHelpers extends SqueezeInit {
	// Cache squeeze_options array per request to avoid repeated database queries
	private static $cached_squeeze_options = null;

	/** @var string[]|null */
	private static $cached_excluded_images = null;

	public function __construct() {
		//parent::__construct(); // will cause infinite loop in SquuezeInit

		add_filter( 'posts_where', [$this, 'get_images_from_last_id'], 10, 2 );
	}

	public function get_upload_path($attach_id, $filename, $url) {
		if ($attach_id > 0) {
			$upload_dir = str_replace($filename, "", wp_get_original_image_path($attach_id));
		} else {
			$upload_url = str_replace($filename, '', $url);
			if (strpos($upload_url, '//') === 0) {
				$upload_url = (is_ssl() ? 'https:' : 'http:') . $upload_url;
			}
			$resolved = $this->resolve_media_url_to_abspath($upload_url);
			$upload_dir = $resolved !== '' ? $resolved : str_replace(home_url('/'), ABSPATH, $upload_url);
		}
		return str_replace('/', DIRECTORY_SEPARATOR, $upload_dir);
	}

	public function create_backup_filename($filename) {
		$backup_filename = preg_replace("/(\.(?!.*\.))/", '.bak.', $filename);
		return $backup_filename;
	}

	public function backup_original_image($upload_path, $filename, $original_file = null) {
		if ( ! function_exists( 'WP_Filesystem' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}

		global $wp_filesystem;

		// Initialize the filesystem (this populates $wp_filesystem)
		WP_Filesystem();

		if ( ! $wp_filesystem || ! method_exists( $wp_filesystem, 'copy' ) ) {
			return new \WP_Error( 'squeeze_filesystem_api_error', 'Filesystem API is not available or failed to initialize.' );
		}

		$backup_filename = $this->create_backup_filename($filename);
		if (!file_exists($upload_path . $backup_filename)) {
			try {
				if (!$original_file) {
					$upload_backup_file = $wp_filesystem->copy($upload_path . $filename, $upload_path . $backup_filename, true);
				} else {
					$upload_backup_file = move_uploaded_file($original_file, $upload_path . $backup_filename);
				}
			} catch (\Exception $e) {
				return new \WP_Error('squeeze_backup_original_image_failed', '❌ '.esc_html__('Backup original image failed', 'squeeze') . ': '. $upload_path . $backup_filename);
			}
		}

		return true;
	}

	public function decode_base64_image($base64, $file_format) {
		$img = str_replace('data:image/'.$file_format.';base64,', '', $base64);
		$img = str_replace(' ', '+', $img);
		return base64_decode($img);
	}

	public function upload_image($upload_path, $filename, $decoded_image, $is_file = false) {
		if ( ! function_exists( 'WP_Filesystem' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}

		global $wp_filesystem;

		// Initialize the filesystem (this populates $wp_filesystem)
		WP_Filesystem();

		if ( ! $wp_filesystem || ! method_exists( $wp_filesystem, 'copy' ) ) {
			return new \WP_Error('squeeze_filesystem_api_error', 'Filesystem API is not available or failed to initialize.');
		}

		if ($is_file) {
			$upload_file = move_uploaded_file($decoded_image, $upload_path . $filename);
		} else {
			$upload_file = $wp_filesystem->put_contents($upload_path . $filename, $decoded_image);
		}
		if (!$upload_file) {
			return new \WP_Error('squeeze_upload_image_failed', '❌ '.esc_html__('Upload image failed', 'squeeze') . ': <br>upload_path: ' . $upload_path . '<br>filename: ' . $filename);
		}

		return $upload_file;
	}

	public function upload_image_thumbs($upload_path, $sizes, $file_format, $filename = '') {
		if (!is_array($sizes) || empty($sizes)) {
			return new \WP_Error('squeeze_upload_image_thumbs_failed', '❌ '.esc_html__('No image data found', 'squeeze'));
		}

		if ( ! function_exists( 'WP_Filesystem' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}

		global $wp_filesystem;

		// Initialize the filesystem (this populates $wp_filesystem)
		WP_Filesystem();

		if ( ! $wp_filesystem || ! method_exists( $wp_filesystem, 'copy' ) ) {
			return new \WP_Error('squeeze_filesystem_api_error', 'Filesystem API is not available or failed to initialize.');
		}
		
		$is_direct_webp = $this->get_option('direct_webp');
		foreach ($sizes as $size_name => $size_data) {
			if ($size_name === 'original') {
				continue;
			}
			$new_size_url = '';
			if ($file_format === 'webp' && $is_direct_webp && $filename) {
				//$size_data['url'] = preg_replace('/\.[^.]+$/', '.webp', $size_data['url']);

				// remove extension from filename if it exists
				//$origin_filename = $filename;
				$new_filename = pathinfo($filename, PATHINFO_FILENAME); // DO NOT appennd to the $filename, causes bug with complex filenames


				// replace the filename in the URL before the last dash
				// e.g. 'http://localhost/test/wp-content/uploads/2025/08/image-thumbxsize.jpg' becomes
				// 'http://localhost/test/wp-content/uploads/2025/08/$new_filename-thumbxsize.webp'

				// 1. Match and capture path, base filename, suffix, and extension
				//if (preg_match('/^(.*\/)(.+)-([^-\/]+)\.((?:jpe?g|png))$/i', $size_data['url'], $m)) {
				if (preg_match('#^(?P<path>.*/wp-content/uploads/.*/)(?P<base>[^/]+?)(?P<suffix>-(?:\d+x\d+|scaled|rotated))?\.(?P<ext>jpe?g|png)$#i', $size_data['url'], $m)) {
					// $m[1] = the full path including trailing slash
					// $m[2] = the base filename (before the dash)
					// $m[3] = the suffix (between dash and extension)
					// $m[4] = the original extension

					$path      = $m[1];
					//$new_filename  = $m[2];   // <-- this is your variable
					$suffix    = $m[3];

					// 2. Rebuild URL with .webp
					$new_size_url = "{$path}{$new_filename}{$suffix}.webp";
				}
			}
			$size_base64 = sanitize_text_field($size_data['base64']);
			$size_decoded = $this->decode_base64_image($size_base64, $file_format);
			$size_filename = basename(sanitize_url($new_size_url ? $new_size_url : $size_data['url']));
			if ($size_name === 'full') {
				$size_name = 'scaled';
				unset($sizes['full']);
			}
			$original_size = file_exists($upload_path . $size_filename) ? wp_filesize($upload_path . $size_filename) : 0;
			$compressed_size = strlen($size_decoded);
			$sizes[$size_name]['original_size'] = $original_size;

			// if compressed size is larger than original, skip uploading and keep original
			if ($original_size > 0 && $compressed_size > $original_size) {
				$sizes[$size_name]['compressed_size'] = $original_size;
				continue;
			}
			$upload_size_file = $wp_filesystem->put_contents($upload_path . $size_filename, $size_decoded);
			if (!$upload_size_file) {
				return new \WP_Error('squeeze_upload_image_thumbs_failed', '❌ '.esc_html__('Upload image failed', 'squeeze') . ': <br>upload_path: ' . $upload_path . '<br>filename: ' . $size_filename);
			} else {
				$sizes[$size_name]['compressed_size'] = $compressed_size;
			}
		}
		return $sizes;
	}

	public function upload_webp($upload_path, $base64_webp, $filename, $is_file = false) {
		if (!$base64_webp) {
			return new \WP_Error('squeeze_upload_webp_failed', '❌ '.esc_html__('No WebP data found', 'squeeze'));
		}

		$upload_webp_path = $this->convert_image_path_to_webp_path($upload_path);
		if (!file_exists($upload_webp_path)) {
			wp_mkdir_p($upload_webp_path);
		}
		$decoded_webp = $is_file ? $base64_webp : $this->decode_base64_image($base64_webp, 'webp');
		$filename_webp = $filename.'.webp';
		$upload_file_webp = $this->upload_image($upload_webp_path, $filename_webp, $decoded_webp, $is_file);

		return $upload_file_webp;
	}

	public function upload_webp_thumbs($upload_path, $sizes_webp) {
		if (!is_array($sizes_webp) || empty($sizes_webp)) {
			return new \WP_Error('squeeze_upload_webp_thumbs_failed', '❌ '.esc_html__('No WebP data found', 'squeeze'));
		}

		$upload_webp_path = $this->convert_image_path_to_webp_path($upload_path);
		if (!file_exists($upload_webp_path)) {
			wp_mkdir_p($upload_webp_path);
		}
		foreach ($sizes_webp as $size_name => $size_data) {
			if ($size_name === 'original') {
				continue;
			}
			$size_base64 = sanitize_text_field($size_data['base64']);
			$size_decoded = $this->decode_base64_image($size_base64, 'webp');
			$size_filename = basename(sanitize_url($size_data['url']));
			$size_filename = $size_filename.'.webp';
			$upload_size_file = $this->upload_image($upload_webp_path, $size_filename, $size_decoded);
		}
		return $sizes_webp;
	}

	public function convert_image_path_to_webp_path($image_path) {
		//$webp_path = preg_replace('/wp-content[\/\\\\]/', 'wp-content/squeeze-webp/', $image_path, 1);
		//return str_replace(['/', '\\'], '/', $webp_path);

		// Grab your actual content folder name (e.g. "wp-content" or custom)
		$content_folder = basename( WP_CONTENT_DIR );

		// Build a regex to match that folder plus a slash or backslash
		$pattern     = sprintf(
			'#%s[\\/\\\\]#', 
			preg_quote( $content_folder, '#' )
		);
		// Replace with "{folder}/squeeze-webp/"
		$replacement = $content_folder . '/squeeze-webp/';

		// Do the one-time replacement…
		$webp_path = preg_replace( $pattern, $replacement, $image_path, 1 );

		// Normalize backslashes to forward slashes and return
		return str_replace( '\\', '/', $webp_path );
	}

	/**
	 * Map a full media URL (scheme or protocol-relative) to a path under ABSPATH.
	 * Strips the configured CDN base URL first when set, then home_url(), matching premium behavior.
	 *
	 * @param string $absolute_url Full URL, e.g. https://cdn.example.com/wp-content/uploads/...
	 * @return string Absolute filesystem path, or empty string if the URL does not map to this site.
	 */
	public function resolve_media_url_to_abspath( $absolute_url ) {
		if ( ! is_string( $absolute_url ) || $absolute_url === '' ) {
			return '';
		}
		if ( strpos( $absolute_url, '//' ) === 0 ) {
			$absolute_url = ( is_ssl() ? 'https:' : 'http:' ) . $absolute_url;
		}
		$cdn = trim( (string) $this->get_option( 'cdn_url' ) );

		/**
		 * Filter additional base URLs that should be stripped when resolving a media URL
		 * to an absolute filesystem path.
		 *
		 * Integrations that serve images from an external domain (e.g. WP Offload Media
		 * serving from an S3/GCS CDN) can add their provider URL(s) here so that Squeeze
		 * can correctly map CDN URLs back to local paths.
		 *
		 * @since 1.8.0
		 * @param string[] $urls Existing extra base URLs (empty by default).
		 */
		$additional_bases = (array) apply_filters( 'squeeze_additional_base_urls', array() );

		$bases = array_values( array_filter( array_unique( array_merge(
			$cdn !== '' ? array( $cdn ) : array(),
			$additional_bases,
			array( home_url() )
		) ) ) );

		$rel = str_replace( $bases, '', $absolute_url );
		$rel = ltrim( str_replace( '\\', '/', $rel ), '/' );
		if ( $rel === '' || strpos( $rel, '..' ) !== false ) {
			return '';
		}
		$content_folder = basename( WP_CONTENT_DIR );
		if ( stripos( $rel, $content_folder . '/' ) !== 0 && stripos( $rel, $content_folder ) !== 0 ) {
			return '';
		}
		return ABSPATH . $rel;
	}

    public function can_restore($attach_id) {
		$original_img_path = wp_get_original_image_path((int) $attach_id);
        $backup_img_path = preg_replace("/(\.(?!.*\.))/", '.bak.', $original_img_path);
        $can_restore = file_exists($backup_img_path);

        return $can_restore;
	}

    public function restore_attachment($attach_id, $is_bulk = false) {
		if ( ! function_exists( 'WP_Filesystem' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}

		global $wp_filesystem;

		// Initialize the filesystem (this populates $wp_filesystem)
		WP_Filesystem();

		if ( ! $wp_filesystem || ! method_exists( $wp_filesystem, 'copy' ) ) {
			if ($is_bulk) {
				wp_die( 'Filesystem API is not available or failed to initialize.' );
			} else {
				return new \WP_Error('squeeze_filesystem_api_error', 'Filesystem API is not available or failed to initialize.');
			}
		}

        $original_img_path = wp_get_original_image_path($attach_id);
        $backup_img_path = preg_replace("/(\.(?!.*\.))/", '.bak.', $original_img_path);

		if (!file_exists($backup_img_path)) {
			$error_message = '❌ ' . esc_html__('Backup image not found', 'squeeze');
			if ($is_bulk) {
				wp_die(esc_html($error_message));
			} else {
				return new \WP_Error('squeeze_restore_attachment_failed', $error_message);
			}
			return false;
		}

		$backup_img = $wp_filesystem->copy($backup_img_path, $original_img_path, true);
		if (!$backup_img) {
			$error_message = '❌ ' . esc_html__('Restore original image failed', 'squeeze');
			if ($is_bulk) {
				wp_die(esc_html($error_message));
			} else {
				return new \WP_Error('squeeze_restore_attachment_failed', $error_message);
			}
			return false;
		}

        $attachment_data = wp_create_image_subsizes($original_img_path, $attach_id);
        if (!delete_post_meta($attach_id, "squeeze_is_compressed")) {
            return false;
        }

        wp_delete_file($backup_img_path);
        $this->delete_webp_images($original_img_path, $attachment_data);

        $uncompressed_images = $this->get_stats_option('uncompressed_images');
        update_option('squeeze_stats', array('uncompressed_images' => ++$uncompressed_images));
        return true;
    }

    public function delete_webp_images($original_img_path, $attachment_data) {
		$result = false;
		
		if (!is_array($attachment_data) || empty($attachment_data)) {
			return $result;
		}

        $original_filename = pathinfo($original_img_path, PATHINFO_BASENAME);

        $webp_path = $this->convert_image_path_to_webp_path($original_img_path);
        $result = wp_delete_file($webp_path . '.webp');

        foreach ($attachment_data['sizes'] as $size_data) {
            $webp_thumb_path = str_replace($original_filename, $size_data['file'] . '.webp', $original_img_path);
            $result = wp_delete_file($this->convert_image_path_to_webp_path($webp_thumb_path));
        }

        $webp_scaled_filename = pathinfo($attachment_data['file'], PATHINFO_BASENAME);
        $webp_scaled_path = $this->convert_image_path_to_webp_path(str_replace($original_filename, $webp_scaled_filename . '.webp', $original_img_path));
		
		if (file_exists($webp_scaled_path)) {
        	$result = wp_delete_file($webp_scaled_path);
		}

		return $result;
    }

    public function get_stats_option($option) {
		$stats = get_option('squeeze_stats');
		$option_value = isset($stats[$option]) ? $stats[$option] : 0;

		return $option_value;
	}

	public function get_option($option) {
		// Cache squeeze_options array per request to avoid repeated database queries
		// This prevents hundreds of get_option('squeeze_options') calls during bulk operations
		if (self::$cached_squeeze_options === null) {
			self::$cached_squeeze_options = get_option('squeeze_options');
		}
		
		$options = self::$cached_squeeze_options;
		$option_value = isset($options[$option]) ? $options[$option] : $this->get_default_value($option);

		return $option_value;
	}

	public function set_options($options) {
		$default_options = $this->get_default_value('all', true);
		$options = wp_parse_args($options, $default_options);
		$result = update_option('squeeze_options', $options);
		
		// Clear the cache when options are updated
		if ($result) {
			self::$cached_squeeze_options = $options;
			// New settings may produce smaller output — let all previously-failed images be retried
			$this->clear_compression_failed_meta();
		}
		
		return $result;
	}

	private function clear_compression_failed_meta() {
		global $wpdb;
		$wpdb->delete( $wpdb->postmeta, array( 'meta_key' => 'squeeze_compression_failed' ) );
	}

    public function get_comparison_table($sizes) {
		if (!is_array($sizes) || empty($sizes)) {
			return '';
		}

		//$table = print_r($sizes, true);
		$table = '<div class="squeeze-comparison-table">';
		$table .= '<table class="wp-list-table widefat striped">';
		$table .= '<thead><tr><th>'.esc_html__('Size Name', 'squeeze').'</th><th>'.esc_html__('Original Size', 'squeeze').'</th><th>'.esc_html__('Squeezed Size', 'squeeze').'</th><th>'.esc_html__('Savings', 'squeeze').' (%)</th></tr></thead>';
		$table .= '<tbody>';

		foreach ($sizes as $size_name => $size_data) {
			/*if (!isset($size_data['url'])) {
				continue;
			}*/
			//$size_filename = basename(sanitize_url($size_data['url']));
			$original_size = $size_data['original_size'];
			$compressed_size = $size_data['compressed_size'];
			$savings = $original_size - $compressed_size;
			$savings_percent = round(($savings / $original_size) * 100, 2);
			$savings_class = $savings > 0 ? 'squeeze-savings-positive' : 'squeeze-savings-negative';

			$table .= '<tr>';
			$table .= '<td><strong>'.$size_name.'</strong></td>';
			$table .= '<td>'.size_format($original_size, 0).'</td>';
			$table .= '<td>'.size_format($compressed_size, 0).'</td>';
			$table .= '<td><span class="squeeze-savings-label '.$savings_class.'">'.$savings_percent.'%</span></td>';
			$table .= '</tr>';
		}

		$table .= '</tbody></table></div>';

		return $table;
	}

    public function is_webp_replace_urls() {
		$is_auto_webp = $this->get_option('auto_webp');
		$is_webp_replace_urls = $this->get_option('webp_replace_urls');

		if (!$is_auto_webp || !$is_webp_replace_urls) {
			return false;
		}
		
		return true;
	}

    public function get_image_formats($return_mimes = false, $custom_formats = []) {
		$allowed_image_formats = empty($custom_formats) ? $this->get_option('compress_formats') : $custom_formats;
		$allowed_image_formats = array_keys($allowed_image_formats);

		// make values the same as keys
		$allowed_image_formats = array_combine($allowed_image_formats, $allowed_image_formats);

		if ($return_mimes) {
			$allowed_image_formats = array_map(function($format) {
				$format = $format === 'jpg' ? 'jpeg' : $format; // handle jpg/jpeg mime type
				return 'image/'.$format;
			}, $allowed_image_formats);
		}

		return $allowed_image_formats;
	}

    public function get_total_images_count() {
		$total_images = $this->get_stats_option('total_images');

		if ($total_images > 0) {
			return $total_images;
		}

		$query_all = new \WP_Query(array(
			'post_type' => 'attachment',
			'post_status' => 'inherit',
			'post_mime_type' => $this->get_image_formats(true),
			'posts_per_page' => -1,
			'fields' => 'ids',
		));

		$total_images = $query_all->found_posts;

		$stats['total_images'] = $total_images;
		update_option('squeeze_stats', $stats);

		return $total_images;
	}

    public function get_uncompressed_images_count() {
		$uncompressed_images = $this->get_stats_option('uncompressed_images');

		if ($uncompressed_images > 0) {
			return $uncompressed_images;
		}

		$query_uncompressed = new \WP_Query(array(
			'post_type' => 'attachment',
			'post_status' => 'inherit',
			'post_mime_type' => $this->get_image_formats(true),
			'posts_per_page' => -1,
			'fields' => 'ids',
			'meta_query' => array(
				'relation' => 'AND',
				array(
					'relation' => 'OR',
					array(
						'key' => 'squeeze_is_compressed',
						'compare' => 'NOT EXISTS',
					),
					array(
						'key' => 'squeeze_is_compressed',
						'compare' => '!=',
						'value' => '1',
					),
				),
				array(
					'key' => 'squeeze_compression_failed',
					'compare' => 'NOT EXISTS',
				),
			),
		));

		$uncompressed_images = $query_uncompressed->found_posts;

		$stats['uncompressed_images'] = $uncompressed_images;
		update_option('squeeze_stats', $stats);

		return $uncompressed_images;
	}

	public function get_images_from_last_id($where, $wp_query) {
		if ( $wp_query->get( 'squeeze_last_id' ) !== null && $wp_query->get( 'squeeze_last_id' ) > 0 ) {
			global $wpdb;
			$last = intval( $wp_query->get( 'squeeze_last_id' ) );
			$where .= $wpdb->prepare( " AND {$wpdb->posts}.ID < %d", $last );
		}
		return $where;
	}

    public function get_uncompressed_images($last_id = 0) {

		$query_uncompressed = new \WP_Query(array(
			'post_type' => 'attachment',
			'post_status' => 'inherit',
			'post_mime_type' => $this->get_image_formats(true),
            'posts_per_page' => self::$MEDIA_PER_PAGE,
			'fields' => 'ids',
			'orderby'        => 'ID',
        	'order'          => 'DESC',
			'meta_query' => array(
				'relation' => 'AND',
				array(
					'relation' => 'OR',
					array(
						'key' => 'squeeze_is_compressed',
						'compare' => 'NOT EXISTS',
					),
					array(
						'key' => 'squeeze_is_compressed',
						'compare' => '!=',
						'value' => '1',
					),
				),
				array(
					'key' => 'squeeze_compression_failed',
					'compare' => 'NOT EXISTS',
				),
			),
			'squeeze_last_id' => $last_id,
		));
	
		return $query_uncompressed->posts;
	}

	public function get_total_images($paged = 1) {
		$args = array(
			'post_type' => 'attachment',
			'post_status' => 'inherit',
			'post_mime_type' => $this->get_image_formats(true),
			'posts_per_page' => self::$MEDIA_PER_PAGE,
			'paged' => $paged,
			'fields' => 'ids',
		);
	
		$query_all = new \WP_Query($args);
	
		return $query_all->posts;
	}

	public function get_hint($hint, $class = 'squeeze-hint') {
		return '<span class="' . esc_attr($class) . '">' . esc_html($hint) . '</span>';
	}

	/**
	 * Parsed list of exclusion patterns (one per line in settings). Cached per request.
	 *
	 * @return string[]
	 */
	public function get_excluded_images() {
		if ( null !== self::$cached_excluded_images ) {
			return self::$cached_excluded_images;
		}

		$raw = $this->get_option( 'excluded_images' );
		if ( ! is_string( $raw ) || $raw === '' ) {
			self::$cached_excluded_images = array();
			return self::$cached_excluded_images;
		}

		$lines = explode( "\n", $raw );
		$lines = array_filter(
			array_map( 'trim', $lines ),
			static function ( $line ) {
				return $line !== '';
			}
		);

		self::$cached_excluded_images = array_values( $lines );
		return self::$cached_excluded_images;
	}

	/**
	 * Whether a URL or path matches any exclusion pattern (substring match, case-insensitive).
	 *
	 * @param string|null $image_path URL or path fragment.
	 * @param string[]|null $excluded_images Patterns from get_excluded_images(); null loads from options.
	 * @return array{is_excluded: true, exclude_reason: string}|false
	 */
	public function is_excluded_image( $image_path, $excluded_images = null ) {
		if ( ! $image_path ) {
			return false;
		}

		if ( null === $excluded_images ) {
			$excluded_images = $this->get_excluded_images();
		}

		if ( empty( $excluded_images ) ) {
			return false;
		}

		foreach ( $excluded_images as $excluded_image ) {
			$excluded_image = trim( $excluded_image );
			if ( $excluded_image === '' ) {
				continue;
			}
			if ( stripos( $image_path, $excluded_image ) !== false ) {
				return array(
					'is_excluded'      => true,
					'exclude_reason'   => $excluded_image,
				);
			}
		}

		return false;
	}

	public function get_default_value ( $option, $all = false ) {
		$options_defaults = apply_filters('squeeze_options_default', 
		array(
			// JPEG settings
			'jpeg_quality' => 80,
			'jpeg_baseline' => false,
			//'jpeg_arithmetic' => false,
			'jpeg_progressive' => true,
			'jpeg_optimize_coding' => true,
			'jpeg_smoothing' => 0,
			'jpeg_color_space' => 3,
			'jpeg_quant_table' => 3,
			'jpeg_trellis_multipass' => false,
			'jpeg_trellis_opt_zero' => false,
			'jpeg_trellis_opt_table' => false,
			'jpeg_trellis_loops' => 1,
			'jpeg_auto_subsample' => true,
			'jpeg_chroma_subsample' => 2,
			'jpeg_separate_chroma_quality' => false,
			'jpeg_chroma_quality' => 75,
	
			// PNG settings
			'png_level' => 2,
			'png_interlace' => false,
			'png_quality' => 0.7,
	
			// WEBP settings
			'webp_method' => 4,
			'webp_quality' => 80,
			'webp_lossless' => false,
			'webp_near_lossless' => 100,
	
			// AVIF settings
			'avif_cqLevel' => 70,
	
			// General settings
			'auto_compress' => true,
			'auto_webp' => false, // needs to be false by default, because user has to save settings first in order to flush rewrite rules
			'webp_replace_urls' => false,
			'direct_webp' => true,
			'cdn_url' => '',
			'backup_original' => true,
			'compress_formats' => self::ALLOWED_IMAGE_FORMATS,
			'compress_thumbs' => array('large' => 'on', 'full' => 'on'),
			'max_width' => '',
			'max_height' => '',
			'excluded_images' => '',
			'timeout' => 60,
			'restore_defaults' => false, // special option to trigger restore defaults
		)
		);
		if ($all) {
			return $options_defaults;
		}
		return in_array($option, array_keys($options_defaults)) ? $options_defaults[ $option ] : false;
	}

	public function get_thumb_sizes() {
		$sizes = wp_get_registered_image_subsizes();
		if ( !empty( $sizes ) && is_array( $sizes ) ) {
			// Add the scaled image size option if it fits the image dimensions
			$big_image_size_threshold = apply_filters('big_image_size_threshold', 2560);
			if ( $big_image_size_threshold ) {
				$sizes['full'] = array(
					'width' => $big_image_size_threshold,
					'height' => $big_image_size_threshold,
					'crop' => false,
				);
			}
		}
		return $sizes;
	}

	public function is_rest_enabled() {
		// Check if REST API is enabled
		if ( !function_exists( 'rest_get_server' ) || !rest_get_server() ) {
			return false;
		}

		return (bool) apply_filters( 'rest_enabled', true );
	}

	public function apache_get_modules() {
		if (!function_exists('apache_get_modules') || !in_array('mod_rewrite', apache_get_modules())) {
			return false;
		}
		return apache_get_modules();
	}

	/**
	 * Convert a filesystem directory under ABSPATH to site-root-relative form (/wp-content/foo/).
	 *
	 * @param string $filesystem_dir Absolute directory path.
	 * @return string Leading slash, forward slashes, trailing slash (or '/' for site root).
	 */
	public function bulk_directory_uri_from_filesystem( $filesystem_dir ) {
		$abs_base = wp_normalize_path( ABSPATH );
		$full     = wp_normalize_path( rtrim( (string) $filesystem_dir, '/\\' ) );
		if ( strpos( $full, $abs_base ) !== 0 ) {
			$slash = preg_replace( '#/+#', '/', str_replace( '\\', '/', str_replace( ABSPATH, '/', (string) $filesystem_dir ) ) );
			if ( '/' === $slash || '' === $slash ) {
				return '/';
			}
			if ( '/' !== substr( $slash, 0, 1 ) ) {
				$slash = '/' . ltrim( $slash, '/' );
			}
			return substr( $slash, -1 ) === '/' ? $slash : $slash . '/';
		}
		$rel = substr( $full, strlen( $abs_base ) );
		$rel = trim( str_replace( '\\', '/', $rel ), '/' );
		return '' === $rel ? '/' : '/' . $rel . '/';
	}

	/**
	 * Turn browse API parentDir into a path relative to WP_CONTENT_DIR (uploads, themes/foo, or '').
	 *
	 * @param string $parent_directory Raw POST value (e.g. /wp-content/uploads/ or wp-content/uploads).
	 * @return string No leading/trailing slashes.
	 */
	public function bulk_parent_relative_to_content_dir( $parent_directory ) {
		$parent_directory = preg_replace( '#/+#', '/', str_replace( '\\', '/', (string) $parent_directory ) );
		$parent_directory = trim( $parent_directory, '/' );
		if ( '' === $parent_directory ) {
			return '';
		}
		if ( 'wp-content' === $parent_directory ) {
			return '';
		}
		if ( 0 === strpos( $parent_directory, 'wp-content/' ) ) {
			return trim( substr( $parent_directory, strlen( 'wp-content/' ) ), '/' );
		}
		return $parent_directory;
	}

	/**
	 * Normalize directory paths for bulk UI and JSON: never show filesystem absolute paths.
	 *
	 * @param string $path Raw path from transient, manual entry, etc.
	 * @return string Site-relative path like /wp-content/uploads/.
	 */
	public function normalize_bulk_directory_storage_path( $path ) {
		$path = trim( (string) $path );
		if ( '' === $path ) {
			return '/';
		}
		if ( preg_match( '#^https?://#i', $path ) ) {
			$parsed = wp_parse_url( $path );
			$path   = isset( $parsed['path'] ) ? $parsed['path'] : '/';
			$site   = wp_parse_url( home_url( '/' ), PHP_URL_PATH );
			if ( is_string( $site ) && strlen( $site ) > 1 ) {
				$site = untrailingslashit( $site );
				if ( $site && strpos( $path, $site . '/' ) === 0 ) {
					$path = substr( $path, strlen( $site ) );
				}
			}
		}
		$clean = preg_replace( '#/+#', '/', str_replace( '\\', '/', $path ) );
		$norm  = wp_normalize_path( $clean );
		$base  = wp_normalize_path( ABSPATH );
		if ( ( strlen( $norm ) >= 2 && ctype_alpha( $norm[0] ) && ':' === $norm[1] ) || ( strpos( $norm, $base ) === 0 ) ) {
			return $this->bulk_directory_uri_from_filesystem( $clean );
		}
		if ( '/' !== substr( $clean, 0, 1 ) ) {
			$clean = '/' . ltrim( $clean, '/' );
		}
		if ( '/' !== substr( $clean, -1 ) ) {
			$clean .= '/';
		}
		return $clean;
	}
}
