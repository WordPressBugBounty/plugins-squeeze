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
		// AS3CF "domain" setting is a delivery *mode* enum (path|cloudfront|...), not a hostname.
		$delivery_mode_enums = array( 'path', 'cloudfront', 'amazon', 'aws', 'storage', 'cdn' );

		// Attempt 1: real custom/CDN hostname (CloudFront or delivery-domain), never the mode enum.
		if ( method_exists( $as3cf, 'get_setting' ) ) {
			$candidates = array(
				(string) $as3cf->get_setting( 'cloudfront' ),
				(string) $as3cf->get_setting( 'delivery-domain' ),
			);
			foreach ( $candidates as $domain ) {
				$domain = trim( $domain, " \t\n\r\0\x0B/" );
				if ( $domain === '' || in_array( strtolower( $domain ), $delivery_mode_enums, true ) ) {
					continue;
				}
				// Require a hostname-like value (must contain a dot) to avoid mode strings.
				$host = $domain;
				if ( strpos( $domain, '//' ) !== false ) {
					$host = (string) wp_parse_url( $domain, PHP_URL_HOST );
				}
				if ( $host === '' || strpos( $host, '.' ) === false ) {
					continue;
				}
				if ( strpos( $domain, '//' ) === false ) {
					$domain = 'https://' . $domain;
				}
				$provider_urls[] = rtrim( $domain, '/' );
			}
		}

		// Attempt 2: get_provider_url_prefix (v3.x) — merge when available (path-style delivery).
		if ( method_exists( $as3cf, 'get_provider_url_prefix' ) ) {
			$prefix = rtrim( (string) $as3cf->get_provider_url_prefix(), '/' );
			if ( '' !== $prefix && strpos( $prefix, '.' ) !== false ) {
				$provider_urls[] = $prefix;
			}
		}

		// Attempt 3: derive provider URL prefixes from bucket.
		// Staging evidence: delivery host was {bucket}.storage.googleapis.com while we only
		// emitted S3 amazonaws hosts — add both GCS and S3 shapes so either provider matches.
		if ( method_exists( $as3cf, 'get_setting' ) ) {
			$bucket = trim( (string) $as3cf->get_setting( 'bucket' ) );
			$region = trim( (string) $as3cf->get_setting( 'region' ) );
			if ( $bucket !== '' ) {
				// Google Cloud Storage (virtual-hosted + path-style).
				$provider_urls[] = 'https://' . $bucket . '.storage.googleapis.com';
				$provider_urls[] = 'https://storage.googleapis.com/' . $bucket;

				// Amazon S3 (virtual-hosted + path-style).
				if ( $region !== '' && $region !== 'us-east-1' ) {
					$provider_urls[] = 'https://' . $bucket . '.s3.' . $region . '.amazonaws.com';
					$provider_urls[] = 'https://s3.' . $region . '.amazonaws.com/' . $bucket;
				}
				$provider_urls[] = 'https://' . $bucket . '.s3.amazonaws.com';
				$provider_urls[] = 'https://s3.amazonaws.com/' . $bucket;
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
