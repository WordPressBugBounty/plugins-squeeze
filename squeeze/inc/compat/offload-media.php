<?php
namespace SqueezeFree;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WP Offload Media (amazon-s3-and-cloudfront) compatibility for Squeeze.
 *
 * Responsibilities:
 *
 * 1. `squeeze_additional_base_urls` filter — feeds the provider/CDN domain(s)
 *    into Squeeze's URL resolver so that provider URLs in page HTML are correctly
 *    mapped back to local paths. This lets Squeeze download images from external
 *    storage without CORS issues when the AJAX proxy is used.
 *
 * Note: the "Rewrite <img> src to WebP URLs in HTML" delivery mode is NOT
 * compatible with WP Offload Media. When images are offloaded to an external
 * provider the squeeze-webp/ WebP sidecar files are never pushed to the
 * provider, so they cannot be served from there. Use the "Direct WebP"
 * conversion mode instead — it converts the image in-place and WP Offload
 * Media handles the rest automatically.
 *
 * @since 1.7.10
 */
class SqueezeOffloadMedia {

	public function __construct() {
		if ( did_action( 'as3cf_ready' ) ) {
			$this->register_integration_hooks();
		} else {
			add_action( 'as3cf_ready', array( $this, 'register_integration_hooks' ) );
		}
	}

	// -------------------------------------------------------------------------
	// Detection
	// -------------------------------------------------------------------------

	/**
	 * Returns true when WP Offload Media (free or Pro) is active.
	 */
	public static function is_active(): bool {
		return (
			class_exists( 'Amazon_S3_And_CloudFront' )
			|| defined( 'AS3CF_PLUGIN_FILE' )
			|| defined( 'AS3CF_VERSION' )
			|| defined( 'AS3CF_PRO_PLUGIN_FILE' )
			|| isset( $GLOBALS['as3cf'] )
		);
	}

	// -------------------------------------------------------------------------
	// Hooks
	// -------------------------------------------------------------------------

	public function register_integration_hooks(): void {
		if ( ! self::is_active() ) {
			return;
		}
		add_filter( 'squeeze_additional_base_urls', array( $this, 'add_provider_base_urls' ), 10, 1 );
	}

	// -------------------------------------------------------------------------
	// squeeze_additional_base_urls — expose the provider/CDN origin to Squeeze
	// -------------------------------------------------------------------------

	/**
	 * Appends the WP Offload Media provider/CDN base URL(s) to Squeeze's URL
	 * resolver list. This lets Squeeze translate provider URLs in page HTML back
	 * to local paths so it can download them for compression.
	 *
	 * @param array $urls Existing list of base URLs.
	 * @return array
	 */
	public function add_provider_base_urls( array $urls ): array {
		global $as3cf;

		if ( ! isset( $as3cf ) ) {
			return $urls;
		}

		$provider_urls = array();

		// Attempt 1: read domain from AS3CF settings (works across many versions).
		if ( method_exists( $as3cf, 'get_setting' ) ) {
			// CloudFront or custom domain.
			$domain = (string) $as3cf->get_setting( 'cloudfront' );
			if ( '' === $domain ) {
				$domain = (string) $as3cf->get_setting( 'domain' );
			}
			if ( '' !== trim( $domain ) ) {
				$domain = trim( $domain, '/' );
				if ( strpos( $domain, '//' ) === false ) {
					$domain = 'https://' . $domain;
				}
				$provider_urls[] = rtrim( $domain, '/' );
			}
		}

		// Attempt 2: get_provider_url_prefix (v3.x).
		if ( empty( $provider_urls ) && method_exists( $as3cf, 'get_provider_url_prefix' ) ) {
			$prefix = rtrim( (string) $as3cf->get_provider_url_prefix(), '/' );
			if ( '' !== $prefix ) {
				$provider_urls[] = $prefix;
			}
		}

		// Add both http and https variants so we match regardless of scheme.
		$all_urls = array();
		foreach ( $provider_urls as $url ) {
			$all_urls[] = preg_replace( '#^https?:#', 'https:', $url );
			$all_urls[] = preg_replace( '#^https?:#', 'http:', $url );
		}

		return array_merge( $urls, array_filter( array_unique( $all_urls ) ) );
	}
}
