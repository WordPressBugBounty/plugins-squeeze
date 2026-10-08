<?php

/**
 * Plugin Name: Squeeze – Browser-Based Image Compression & WebP Converter (No API, No Limits)
 * Description: Browser-based image compression & WebP—no API keys or quotas. Works on any hosting; Premium adds Media Library comparison, resize, Bulk from a page, Elementor, Gravity Forms uploads, and CDN URL mapping.
 * Author URI:  https://pluginarium.com
 * Author:      Bogdan Bendziukov
 * Version:     1.8.0
 *
 * Text Domain: squeeze
 * Domain Path: /languages
 *
 * License:     GPLv3
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 * 
 * 
 */
namespace SqueezeFree;

// Exit if accessed directly.
if ( !defined( 'ABSPATH' ) ) {
    exit;
}
class SqueezeInit {
    /**
     * Plugin version
     */
    const VERSION = '1.8.0';

    /**
     * Freemius checkout base (no UTM). Use get_checkout_url() for placement-specific links.
     */
    const CHECKOUT_BASE_URL = 'https://checkout.freemius.com/plugin/17217/plan/28703/';

    /**
     * Default checkout URL (Upgrade tab). Prefer get_checkout_url( $utm_content ) for new links.
     */
    const CHECKOUT_URL = 'https://checkout.freemius.com/plugin/17217/plan/28703/?utm_source=wordpress_plugin&utm_medium=admin&utm_campaign=squeeze_upgrade&utm_content=settings_upgrade_tab';

    /**
     * Freemius checkout URL with a unique utm_content per upsell placement.
     *
     * @param string $utm_content Placement slug, e.g. settings_upgrade_tab.
     * @param array  $args {
     *     Optional. Checkout modifiers.
     *     @type string     $billing_cycle monthly|annual|lifetime. Default annual.
     *     @type int|string $licenses      License quantity or "unlimited". Default 1.
     * }
     * @return string
     */
    public static function get_checkout_url( $utm_content = 'settings_upgrade_tab', $args = array() ) {
        $utm_content = sanitize_key( (string) $utm_content );
        if ( $utm_content === '' ) {
            $utm_content = 'settings_upgrade_tab';
        }
        $billing_cycle = ( isset( $args['billing_cycle'] ) ? sanitize_key( (string) $args['billing_cycle'] ) : 'annual' );
        if ( !in_array( $billing_cycle, array('monthly', 'annual', 'lifetime'), true ) ) {
            $billing_cycle = 'annual';
        }
        $licenses = ( isset( $args['licenses'] ) ? $args['licenses'] : 1 );
        if ( 'unlimited' === $licenses ) {
            $licenses_path = 'unlimited';
        } else {
            $licenses_path = (string) max( 1, absint( $licenses ) );
        }
        $base = self::CHECKOUT_BASE_URL . 'licenses/' . rawurlencode( $licenses_path ) . '/';
        return add_query_arg( array(
            'billing_cycle' => $billing_cycle,
            'utm_source'    => 'wordpress_plugin',
            'utm_medium'    => 'admin',
            'utm_campaign'  => 'squeeze_upgrade',
            'utm_content'   => $utm_content,
        ), $base );
    }

    /**
     * Cache-bust script assets with filemtime so rebuilt bundles are not served from a stale ?ver=.
     *
     * @param string $relative_path Path under the plugin directory.
     * @return string
     */
    protected function get_script_asset_version( $relative_path ) {
        $path = self::$PLUGIN_DIR . ltrim( (string) $relative_path, '/\\' );
        $mtime = @filemtime( $path );
        if ( $mtime ) {
            return self::VERSION . '.' . (string) $mtime;
        }
        return self::VERSION;
    }

    /**
     * Register application/wasm for .wasm files in WordPress MIME maps.
     *
     * @param array $mimes Existing MIME types.
     * @return array
     */
    public function register_wasm_mime_type( $mimes ) {
        $mimes['wasm'] = 'application/wasm';
        return $mimes;
    }

    /**
     * Allow .wasm uploads (same type as register_wasm_mime_type).
     *
     * @param array $mimes Existing upload MIME types.
     * @return array
     */
    public function register_wasm_upload_mime( $mimes ) {
        $mimes['wasm'] = 'application/wasm';
        return $mimes;
    }

    /**
     * Allowed image formats
     */
    const ALLOWED_IMAGE_FORMATS = array(
        'jpg'  => 'JPG/JPEG',
        'png'  => 'PNG',
        'webp' => 'WebP',
        'avif' => 'AVIF',
    );

    // Array containing dynamic data for a JS Global.
    public static $LOCALIZE_ARGS;

    public static $JS_OPTIONS = array();

    public static $SqueezeHelpers;

    public static $SqueezeSettings;

    public static $SqueezeHandlers;

    public static $SqueezePremium;

    public static $SqueezeReviewNotice;

    public static $UPGRADE_URL;

    public static $SETTINGS_URL;

    /**
     * Media per page
     */
    public static $MEDIA_PER_PAGE;

    /**
     * Plugin directory
     */
    public static $PLUGIN_DIR;

    /**
     * Plugin URL
     */
    public static $PLUGIN_URL;

    public static $DOCS_URL = 'https://pluginarium.com/squeeze/squeeze-documentation/?utm_source=wordpress_plugin&utm_medium=admin&utm_campaign=squeeze_docs&utm_content=docs_tab';

    /**
     * Initialize the plugin
     */
    public function __construct() {
        self::$PLUGIN_DIR = plugin_dir_path( __FILE__ );
        self::$PLUGIN_URL = plugin_dir_url( __FILE__ );
        self::$MEDIA_PER_PAGE = apply_filters( 'squeeze_media_per_page', 50 );
        self::$UPGRADE_URL = admin_url( 'options-general.php?page=squeeze#squeeze_upgrade' );
        self::$SETTINGS_URL = admin_url( 'options-general.php?page=squeeze' );
        $this->load_helpers();
        $this->load_handlers();
        $this->load_settings();
        $this->load_review_notice();
        self::$SqueezeHelpers = new SqueezeHelpers();
        self::$SqueezeSettings = new SqueezeSettings();
        self::$SqueezeHandlers = new SqueezeHandlers();
        self::$SqueezeReviewNotice = new SqueezeReviewNotice();
        $this->maybe_disable_client_side_media_processing();
        // Defer compat module loading until after all plugins have initialised.
        // If load_compat() runs in __construct() the WP Offload Media class may not
        // exist yet (plugins are loaded in file-system order), so is_active() returns
        // false and none of the sync / URL-override hooks get registered.
        add_action( 'plugins_loaded', array($this, 'load_compat'), 20 );
        add_action( 'init', [$this, 'prepare_localize_args'] );
        add_action( 'plugins_loaded', array($this, 'load_textdomain') );
        add_action( 'admin_enqueue_scripts', array($this, 'load_assets') );
        add_action( 'wp_enqueue_scripts', array($this, 'load_form_frontend_assets'), 20 );
        add_action( 'wp_enqueue_scripts', array($this, 'load_voxel_frontend_assets'), 25 );
        add_filter( 'mime_types', array($this, 'register_wasm_mime_type') );
        add_filter( 'upload_mimes', array($this, 'register_wasm_upload_mime') );
        add_filter(
            'plugin_action_links',
            array($this, 'plugin_action_links'),
            10,
            2
        );
        add_action( 'enqueue_block_editor_assets', array($this, 'load_editor_assets') );
        add_action( 'squeeze_freemius_loaded', array($this, 'load_freemius') );
        register_activation_hook( __FILE__, array($this, 'activation_actions') );
        add_action( 'admin_init', array($this, 'maybe_redirect_to_bulk_page') );
        $this->register_uninstall_cleanup();
    }

    /**
     * Register a single uninstall cleanup entry point.
     * Freemius owns register_uninstall_hook when present, so premium uses fs_after_uninstall_squeeze.
     * Free builds without Freemius use the native WordPress uninstall hook.
     */
    private function register_uninstall_cleanup() {
        $callback = array(__NAMESPACE__ . '\\SqueezeHelpers', 'uninstall_cleanup');
        if ( file_exists( self::$PLUGIN_DIR . 'freemius/start.php' ) ) {
            add_action( 'fs_after_uninstall_squeeze', $callback );
            return;
        }
        register_uninstall_hook( __FILE__, $callback );
    }

    /**
     * Turn off WordPress 7.1+ client-side media processing while Squeeze on-upload is enabled.
     *
     * Core CSMP encodes in the browser then sideloads thumbs and finalize — that double-encodes
     * Squeeze uploads and races thumbnail overwrite. Users who want HEIC conversion / HDR thumbs
     * from core can disable Squeeze on upload; bulk and manual squeeze still work.
     */
    public function maybe_disable_client_side_media_processing() {
        if ( !function_exists( 'wp_is_client_side_media_processing_enabled' ) ) {
            return;
        }
        if ( !self::$SqueezeHelpers->get_option( 'auto_compress' ) ) {
            return;
        }
        add_filter( 'wp_client_side_media_processing_enabled', '__return_false' );
    }

    /**
     * Load plugin textdomain
     */
    public function load_textdomain() {
        load_plugin_textdomain( 'squeeze', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
    }

    public function load_freemius() {
    }

    public function opt_in_freemius() {
    }

    public function freemius_admin_notices() {
    }

    public function prepare_localize_args() {
        $options = get_option( 'squeeze_options' );
        if ( !is_array( $options ) ) {
            $options = array();
        }
        $default_options = self::$SqueezeHelpers->get_default_value( null, true );
        // get all default values
        $js_options = array();
        foreach ( $default_options as $key => $value ) {
            if ( array_key_exists( $key, $options ) ) {
                if ( is_numeric( $options[$key] ) ) {
                    $js_options[$key] = floatval( $options[$key] );
                } elseif ( $options[$key] === "on" ) {
                    $js_options[$key] = true;
                } elseif ( $key === "compress_thumbs" ) {
                    $js_options[$key] = $options[$key];
                } else {
                    $js_options[$key] = $options[$key];
                    //echo $key . ': ' . $js_options[$key] . ',' . $options[$key] . '<br>';
                }
            } else {
                $js_options[$key] = $value;
            }
        }
        // Keep JS worker flags aligned with UI: neither WebP mode set ⇒ Direct WebP.
        $js_options = self::$SqueezeHelpers->normalize_webp_delivery_options( $js_options );
        self::$JS_OPTIONS = $js_options;
        $wp_max_memory = ( defined( 'WP_MAX_MEMORY_LIMIT' ) ? WP_MAX_MEMORY_LIMIT : (( defined( 'WP_MEMORY_LIMIT' ) ? WP_MEMORY_LIMIT : ini_get( 'memory_limit' ) )) );
        self::$LOCALIZE_ARGS = array(
            'isPremium'                 => false,
            'pluginUrl'                 => self::$PLUGIN_URL,
            'upgradeUrl'                => self::$UPGRADE_URL,
            'checkoutUrl'               => self::get_checkout_url( 'compare_media_modal' ),
            'checkoutUrls'              => array(
                'compare_media_modal' => self::get_checkout_url( 'compare_media_modal' ),
                'bulk_from_page'      => self::get_checkout_url( 'bulk_from_page' ),
            ),
            'ajaxUrl'                   => admin_url( 'admin-ajax.php' ),
            'nonce'                     => wp_create_nonce( 'squeeze-nonce' ),
            'restNonce'                 => wp_create_nonce( 'wp_rest' ),
            'options'                   => wp_json_encode( self::$JS_OPTIONS ),
            'templateBase'              => self::$PLUGIN_URL . 'assets/templates/',
            'templates'                 => array(
                'logWrapper'         => self::$PLUGIN_URL . 'assets/templates/log-wrapper.html',
                'logStep'            => self::$PLUGIN_URL . 'assets/templates/log-step.html',
                'logDetailsButton'   => self::$PLUGIN_URL . 'assets/templates/log-details-button.html',
                'directoryItem'      => self::$PLUGIN_URL . 'assets/templates/directory-item.html',
                'directoryItemEmpty' => self::$PLUGIN_URL . 'assets/templates/directory-item-empty.html',
                'pathListItem'       => self::$PLUGIN_URL . 'assets/templates/path-list-item.html',
                'previewSqueeze'     => self::$PLUGIN_URL . 'assets/templates/preview-squeeze.html',
            ),
            'settingsPageUrl'           => admin_url( 'options-general.php?page=squeeze' ),
            'assetsVersion'             => $this->get_script_asset_version( 'assets/js/assets_js_worker_js.bundle.js' ),
            'reviewUrl'                 => 'https://wordpress.org/support/plugin/squeeze/reviews/?rate=5#new-post',
            'wpMaxMemoryBytes'          => wp_convert_hr_to_bytes( $wp_max_memory ),
            'formCompressProgressLabel' => (string) apply_filters( 'squeeze_form_compress_progress_label', __( 'Compressing the image...', 'squeeze' ) ),
        );
    }

    public function load_settings() {
        require_once self::$PLUGIN_DIR . 'inc/settings.php';
    }

    public function load_handlers() {
        require_once self::$PLUGIN_DIR . 'inc/handlers.php';
    }

    public function load_helpers() {
        require_once self::$PLUGIN_DIR . 'inc/helpers.php';
    }

    public function load_review_notice() {
        require_once self::$PLUGIN_DIR . 'inc/review-notice.php';
    }

    /**
     * Load third-party plugin compatibility modules.
     * Each module is self-contained and checks whether the target plugin is active
     * before registering any hooks.
     */
    public function load_compat() {
        // WP Offload Media (amazon-s3-and-cloudfront) — push WebP files to external storage.
        require_once self::$PLUGIN_DIR . 'inc/compat/offload-media.php';
        new SqueezeOffloadMedia();
    }

    /**
     * Script dependencies: admin needs media/plupload; frontend (Voxel) only needs i18n + domReady.
     *
     * @return string[]
     */
    protected function get_squeeze_script_dependencies() {
        if ( is_admin() ) {
            return array(
                'jquery',
                'jquery-ui-core',
                'wp-mediaelement',
                'wp-i18n',
                'wp-dom-ready'
            );
        }
        return array('jquery', 'wp-i18n', 'wp-dom-ready');
    }

    /**
     * Whether the active theme (or parent) is Voxel.
     */
    protected function is_voxel_theme_active() {
        $theme = wp_get_theme();
        $slug = $theme->get_template();
        $active = is_string( $slug ) && strtolower( $slug ) === 'voxel';
        /**
         * @since 1.7.8
         * @param bool   $active Whether the active parent theme is Voxel.
         * @param string $slug   Parent theme directory slug (stylesheet template).
         */
        return (bool) apply_filters( 'squeeze_is_voxel_theme', $active, ( is_string( $slug ) ? $slug : '' ) );
    }

    /**
     * Whether Contact Form 7 is available (forms may be used by logged-out visitors).
     *
     * @return bool
     */
    protected function is_contact_form_7_active() {
        return defined( 'WPCF7_VERSION' ) || class_exists( 'WPCF7_ContactForm' );
    }

    /**
     * Whether Gravity Forms is available.
     *
     * @return bool
     */
    protected function is_gravity_forms_active() {
        return class_exists( 'GFForms' ) || class_exists( 'GFCommon' ) || function_exists( 'gravity_form' );
    }

    /**
     * @param array $form Gravity Forms form array.
     * @return bool
     */
    protected function gravity_form_has_file_field( $form ) {
        if ( empty( $form['fields'] ) || !is_array( $form['fields'] ) ) {
            return false;
        }
        foreach ( $form['fields'] as $field ) {
            $type = ( is_object( $field ) ? $field->type : (( isset( $field['type'] ) ? $field['type'] : '' )) );
            if ( $type === 'fileupload' || $type === 'post_image' ) {
                return true;
            }
        }
        return false;
    }

    /**
     * Shared enqueue for front-end form compression scripts.
     *
     * @param array $args {
     *     @type bool $cf7 Depend on Contact Form 7 when its script is present.
     *     @type bool $gf  Depend on Gravity Forms / Plupload when present.
     * }
     */
    protected function enqueue_form_frontend_script( $args = array() ) {
        static $form_squeeze_enqueued = false;
        if ( $form_squeeze_enqueued ) {
            return;
        }
        $cf7 = !empty( $args['cf7'] );
        $gf = !empty( $args['gf'] );
        $deps = $this->get_squeeze_script_dependencies();
        if ( $cf7 && (wp_script_is( 'contact-form-7', 'registered' ) || wp_script_is( 'contact-form-7', 'enqueued' )) ) {
            $deps[] = 'contact-form-7';
        }
        if ( $gf && (wp_script_is( 'gform_gravityforms', 'registered' ) || wp_script_is( 'gform_gravityforms', 'enqueued' )) ) {
            $deps[] = 'gform_gravityforms';
        }
        if ( $gf && (wp_script_is( 'plupload-all', 'registered' ) || wp_script_is( 'plupload-all', 'enqueued' )) ) {
            $deps[] = 'plupload-all';
        }
        wp_enqueue_script(
            'squeeze-script',
            self::$PLUGIN_URL . 'assets/js/script.bundle.js',
            $deps,
            $this->get_script_asset_version( 'assets/js/script.bundle.js' ),
            true
        );
        wp_localize_script( 'squeeze-script', 'squeezeOptions', self::$LOCALIZE_ARGS );
        wp_set_script_translations( 'squeeze-script', 'squeeze', self::$PLUGIN_DIR . 'languages' );
        $form_squeeze_enqueued = true;
    }

    /**
     * Front-end form uploads for Contact Form 7 (scripts load site-wide when CF7 is active).
     * No capability check — visitors are usually logged out.
     */
    public function load_form_frontend_assets() {
        if ( is_admin() ) {
            return;
        }
        if ( !self::$SqueezeHelpers->get_option( 'form_compress' ) ) {
            return;
        }
        if ( !$this->is_contact_form_7_active() ) {
            return;
        }
        $this->enqueue_form_frontend_script( array(
            'cf7' => true,
        ) );
    }

    /**
     * Front-end form uploads for Gravity Forms (Premium only) — when the rendered form has a file field.
     *
     * @param array $form    GF form.
     * @param bool  $is_ajax Whether the form is AJAX-enabled.
     */
    public function load_gf_form_frontend_assets( $form, $is_ajax = false ) {
        unset($is_ajax);
        return;
        if ( is_admin() ) {
            return;
        }
        if ( !self::$SqueezeHelpers->get_option( 'form_compress' ) ) {
            return;
        }
        if ( !$this->is_gravity_forms_active() ) {
            return;
        }
        if ( !$this->gravity_form_has_file_field( $form ) ) {
            return;
        }
        $this->enqueue_form_frontend_script( array(
            'gf' => true,
        ) );
    }

    /**
     * Voxel create-post / file fields upload via multipart FormData to admin-ajax.php, not wp.Uploader.
     * Load Squeeze on the frontend so client-side compression can run for logged-in users who can upload.
     */
    public function load_voxel_frontend_assets() {
        static $voxel_squeeze_enqueued = false;
        if ( $voxel_squeeze_enqueued ) {
            return;
        }
        if ( !$this->is_voxel_theme_active() ) {
            return;
        }
        if ( !is_user_logged_in() || !current_user_can( 'upload_files' ) ) {
            return;
        }
        wp_enqueue_script(
            'squeeze-script',
            self::$PLUGIN_URL . 'assets/js/script.bundle.js',
            $this->get_squeeze_script_dependencies(),
            $this->get_script_asset_version( 'assets/js/script.bundle.js' ),
            true
        );
        wp_localize_script( 'squeeze-script', 'squeezeOptions', self::$LOCALIZE_ARGS );
        wp_set_script_translations( 'squeeze-script', 'squeeze', self::$PLUGIN_DIR . 'languages' );
        $voxel_squeeze_enqueued = true;
    }

    /**
     * Enqueue assets
     */
    public function load_assets() {
        global $pagenow;
        if ( !wp_script_is( 'media-editor', 'enqueued' ) ) {
            wp_enqueue_media();
        }
        // Enqueue script for backend.
        wp_enqueue_script(
            'squeeze-script',
            self::$PLUGIN_URL . 'assets/js/script.bundle.js',
            $this->get_squeeze_script_dependencies(),
            $this->get_script_asset_version( 'assets/js/script.bundle.js' ),
            true
        );
        // WP Localized globals. Use dynamic PHP stuff in JavaScript via `squeeze` object.
        wp_localize_script( 'squeeze-script', 'squeezeOptions', self::$LOCALIZE_ARGS );
        if ( $pagenow === 'upload.php' && isset( $_GET['page'] ) && $_GET['page'] === 'squeeze-bulk' ) {
            wp_localize_script( 'squeeze-script', 'squeezeBulk', [
                'allImages'          => implode( ",", self::$SqueezeHelpers->get_total_images() ),
                'unCompressedImages' => implode( ",", self::$SqueezeHelpers->get_uncompressed_images() ),
            ] );
        }
        // Check if we are on the options page for the plugin
        if ( $pagenow === 'upload.php' || $pagenow === 'options-general.php' && isset( $_GET['page'] ) && $_GET['page'] === 'squeeze' ) {
            // media-views required on upload.php so Bulk Squeeze hooks after wp.media.view exists.
            $admin_script_deps = array('jquery', 'squeeze-script');
            if ( $pagenow === 'upload.php' ) {
                $admin_script_deps[] = 'media-views';
            }
            wp_enqueue_script(
                'squeeze-settings-script',
                self::$PLUGIN_URL . 'assets/js/admin.bundle.js',
                $admin_script_deps,
                $this->get_script_asset_version( 'assets/js/admin.bundle.js' ),
                true
            );
        }
        wp_set_script_translations( 'squeeze-script', 'squeeze', self::$PLUGIN_DIR . 'languages' );
        // Enqueue styles for backend.
        wp_enqueue_style(
            'squeeze-style',
            self::$PLUGIN_URL . 'assets/css/admin.css',
            array(),
            self::VERSION
        );
        wp_localize_script( 'squeeze-editor-script', 'squeezeOptions', array(
            'ajaxUrl' => admin_url( 'admin-ajax.php' ),
            'nonce'   => wp_create_nonce( 'squeeze-nonce' ),
            'options' => wp_json_encode( self::$JS_OPTIONS ),
        ) );
    }

    public function load_elementor_assets() {
    }

    public function load_beaver_assets() {
    }

    public function load_editor_assets() {
        // Enqueue scripts for the editor.
        wp_enqueue_script(
            'squeeze-editor-script',
            self::$PLUGIN_URL . 'assets/js/editor.bundle.js',
            array(
                'wp-blocks',
                'wp-hooks',
                'wp-compose',
                'wp-element',
                'wp-data',
                'wp-block-editor',
                'wp-api-fetch'
            ),
            self::VERSION,
            true
        );
    }

    /**
     * Add settings link on plugin page
     *
     * @param array $links
     * @return array
     */
    public function plugin_action_links( $actions, $plugin_file ) {
        static $plugin;
        if ( !current_user_can( 'manage_options' ) ) {
            return $actions;
        }
        if ( !isset( $plugin ) ) {
            $plugin = plugin_basename( __FILE__ );
        }
        if ( $plugin === $plugin_file ) {
            $settings_link = array(
                'settings' => '<a href="' . admin_url( 'options-general.php?page=squeeze' ) . '">' . __( 'Settings', 'squeeze' ) . '</a>',
            );
            $bulk_link = array(
                'bulk' => '<a href="' . admin_url( 'upload.php?page=squeeze-bulk' ) . '">' . __( 'Squeeze Bulk Tools', 'squeeze' ) . '</a>',
            );
            $docs_link = array(
                'docs' => '<a target="_blank" href="' . esc_url( self::$DOCS_URL ) . '">' . __( 'Documentation', 'squeeze' ) . '</a>',
            );
            $actions['upgrade'] = '<a href="' . esc_url( self::get_checkout_url( 'plugins_list_go_premium' ) ) . '" target="_blank" rel="noopener noreferrer">' . esc_html__( 'Go Premium', 'squeeze' ) . '</a>';
            $actions = array_merge( $docs_link, $actions );
            $actions = array_merge( $bulk_link, $actions );
            $actions = array_merge( $settings_link, $actions );
        }
        return $actions;
    }

    public function activation_actions() {
        // Only for single-site activation
        if ( !is_network_admin() && !isset( $_GET['activate-multi'] ) ) {
            add_option( 'squeeze_do_activation_redirect', true );
        }
    }

    public function maybe_redirect_to_bulk_page() {
        if ( get_option( 'squeeze_do_activation_redirect', false ) ) {
            // Delete the flag so it happens only once
            delete_option( 'squeeze_do_activation_redirect' );
            // Skip redirection during bulk or network activation
            // When you activate several plugins at once (for example, from the Plugins screen using the bulk “Activate” action),
            // WordPress adds ?activate-multi=true to the URL.
            if ( isset( $_GET['activate-multi'] ) ) {
                return;
            }
            // Redirect to your custom bulk optimization page
            wp_safe_redirect( admin_url( 'upload.php?page=squeeze-bulk' ) );
            exit;
        }
    }

}

new SqueezeInit();