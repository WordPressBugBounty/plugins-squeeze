<?php

/**
 * Plugin Name: Squeeze – Image Optimization & Compression, WebP Conversion
 * Description: Compress unlimited images directly into your browser. Convert images to WebP format. No limits on file size or number of images. No third-party services or API keys required.
 * Author URI:  https://pluginarium.com
 * Author:      Bogdan Bendziukov
 * Version:     1.7.7
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
    const VERSION = '1.7.7';

    const CHECKOUT_URL = 'https://checkout.freemius.com/plugin/17217/plan/28703/';

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

    public static $DOCS_URL = 'https://pluginarium.com/squeeze/squeeze-documentation/';

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
        self::$SqueezeHelpers = new SqueezeHelpers();
        self::$SqueezeSettings = new SqueezeSettings();
        self::$SqueezeHandlers = new SqueezeHandlers();
        add_action( 'init', [$this, 'prepare_localize_args'] );
        add_action( 'plugins_loaded', array($this, 'load_textdomain') );
        add_action( 'admin_enqueue_scripts', array($this, 'load_assets') );
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
        $default_options = self::$SqueezeHelpers->get_default_value( null, true );
        // get all default values
        $js_options = array();
        foreach ( $default_options as $key => $value ) {
            if ( isset( $options[$key] ) ) {
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
        self::$JS_OPTIONS = $js_options;
        self::$LOCALIZE_ARGS = array(
            'isPremium'       => false,
            'pluginUrl'       => self::$PLUGIN_URL,
            'upgradeUrl'      => self::$UPGRADE_URL,
            'ajaxUrl'         => admin_url( 'admin-ajax.php' ),
            'nonce'           => wp_create_nonce( 'squeeze-nonce' ),
            'restNonce'       => wp_create_nonce( 'wp_rest' ),
            'options'         => wp_json_encode( self::$JS_OPTIONS ),
            'templateBase'    => self::$PLUGIN_URL . 'assets/templates/',
            'templates'       => array(
                'logWrapper'         => self::$PLUGIN_URL . 'assets/templates/log-wrapper.html',
                'logStep'            => self::$PLUGIN_URL . 'assets/templates/log-step.html',
                'logDetailsButton'   => self::$PLUGIN_URL . 'assets/templates/log-details-button.html',
                'directoryItem'      => self::$PLUGIN_URL . 'assets/templates/directory-item.html',
                'directoryItemEmpty' => self::$PLUGIN_URL . 'assets/templates/directory-item-empty.html',
                'pathListItem'       => self::$PLUGIN_URL . 'assets/templates/path-list-item.html',
                'previewSqueeze'     => self::$PLUGIN_URL . 'assets/templates/preview-squeeze.html',
            ),
            'settingsPageUrl' => admin_url( 'options-general.php?page=squeeze' ),
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
            array('jquery', 'jquery-ui-core', 'wp-mediaelement'),
            self::VERSION,
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
            wp_enqueue_script(
                'squeeze-settings-script',
                self::$PLUGIN_URL . 'assets/js/admin.bundle.js',
                array('jquery'),
                self::VERSION,
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
                'bulk' => '<a href="' . admin_url( 'upload.php?page=squeeze-bulk' ) . '">' . __( 'Bulk Squeeze', 'squeeze' ) . '</a>',
            );
            $docs_link = array(
                'docs' => '<a target="_blank" href="https://pluginarium.com/squeeze/squeeze-documentation/">' . __( 'Documentation', 'squeeze' ) . '</a>',
            );
            $actions['upgrade'] = '<a href="' . esc_url( self::$UPGRADE_URL ) . '">' . esc_html__( 'Go Premium', 'squeeze' ) . '</a>';
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