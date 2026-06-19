<?php

namespace SqueezeFree;

// Exit if accessed directly.
if ( !defined( 'ABSPATH' ) ) {
    exit;
}
class SqueezeSettings extends SqueezeInit {
    public function __construct() {
        add_action( 'admin_menu', [$this, 'options_page'] );
        add_action( 'admin_menu', [$this, 'options_bulk_page'] );
        add_action( 'admin_init', [$this, 'register_settings'] );
        add_action(
            'update_option_squeeze_options',
            [$this, 'restore_defaults'],
            10,
            2
        );
        add_action(
            'update_option_squeeze_options',
            [$this, 'flush_rewrite_rules'],
            10,
            2
        );
        add_filter(
            'attachment_fields_to_edit',
            [$this, 'add_custom_field_to_attachment'],
            10,
            2
        );
        add_filter( 'manage_media_columns', [$this, 'add_media_columns'] );
        add_action(
            'manage_media_custom_column',
            [$this, 'media_custom_column'],
            10,
            2
        );
        add_filter( 'manage_upload_sortable_columns', [$this, 'sortable_columns'] );
        add_action( 'pre_get_posts', [$this, 'sortable_columns_orderby'] );
        add_action( 'restrict_manage_posts', [$this, 'media_filter_dropdown'] );
        add_action( 'pre_get_posts', [$this, 'media_filter_query'] );
        add_filter(
            'ajax_query_attachments_args',
            [$this, 'media_filter_ajax_query'],
            10,
            1
        );
        add_action( 'admin_footer', [$this, 'svg_sprite_output'] );
        add_action( 'admin_notices', [$this, 'incompatibility_notices'] );
        add_action( 'edit_form_after_title', [$this, 'add_preview_button_placeholder'], 10 );
    }

    public function options_page() {
        add_submenu_page(
            'options-general.php',
            __( 'Squeeze Settings', 'squeeze' ),
            __( 'Squeeze', 'squeeze' ),
            'manage_options',
            'squeeze',
            [$this, 'options_page_html']
        );
    }

    public function options_bulk_page() {
        add_submenu_page(
            'upload.php',
            __( 'Bulk Squeeze', 'squeeze' ),
            __( 'Bulk Squeeze', 'squeeze' ),
            'manage_options',
            'squeeze-bulk',
            [$this, 'options_bulk_page_html']
        );
    }

    public function options_bulk_page_html() {
        // check user capabilities
        if ( !current_user_can( 'manage_options' ) ) {
            return;
        }
        $is_single_page_squeeze = false;
        $uncompressed_count = self::$SqueezeHelpers->get_uncompressed_images_count();
        $uncompressed_pages = ceil( $uncompressed_count / self::$MEDIA_PER_PAGE );
        $total_count = self::$SqueezeHelpers->get_total_images_count();
        $total_pages = ceil( $total_count / self::$MEDIA_PER_PAGE );
        $compressed_count = $total_count - $uncompressed_count;
        $compressed_percentage = ( $total_count > 0 ? round( $compressed_count / $total_count * 100, 2 ) : 0 );
        //$total_count = array_sum((array)wp_count_attachments("image"));
        $not_compressed_posts = implode( ",", self::$SqueezeHelpers->get_uncompressed_images() );
        $all_posts = implode( ",", self::$SqueezeHelpers->get_total_images() );
        $directory_path = ( get_transient( 'squeeze_bulk_path' ) ? get_transient( 'squeeze_bulk_path' ) : array('/wp-content/uploads/') );
        $directory_path = array_map( array(self::$SqueezeHelpers, 'normalize_bulk_directory_storage_path'), (array) $directory_path );
        $directory_path_json = wp_json_encode( $directory_path );
        $is_direct_webp = self::$SqueezeHelpers->get_option( 'direct_webp' );
        ?>
        <div class="wrap">
            <h1>
                <?php 
        echo esc_html( get_admin_page_title() );
        ?>
            </h1>
            <?php 
        if ( !$is_single_page_squeeze ) {
            ?>
            <p class="squeeze-bulk-lede description">
                <?php 
            esc_html_e( 'Compress and convert images in bulk. "Squeeze" means optimize file size (and optionally change format) for items in your Media Library or a folder you choose.', 'squeeze' );
            ?>
            </p>
            <?php 
        }
        ?>
            <section class="squeeze-box">
                <div class="squeeze-box-bulk-stack">
                    <?php 
        if ( !$is_single_page_squeeze ) {
            ?>
                    <div class="squeeze-box-bulk-workflows">
                    <section id="squeeze-bulk-section-library" class="squeeze-bulk-section squeeze-bulk-section--library" aria-labelledby="squeeze-heading-library">
                        <header class="squeeze-bulk-section__head">
                            <h2 id="squeeze-heading-library"><?php 
            esc_html_e( 'Bulk Media Library Squeeze', 'squeeze' );
            ?></h2>
                            <p class="squeeze-bulk-section__meta"><?php 
            esc_html_e( 'Uses attachments in the library; backups follow your plugin settings.', 'squeeze' );
            ?></p>
                        </header>
                        <div class="squeeze-bulk-section__body">
                            <?php 
            if ( $is_direct_webp ) {
                ?>
                            <div class="squeeze-banner squeeze-banner--notice">
                                <svg class="squeeze-icon" aria-hidden="true">
                                    <use xlink:href="#info-icon"></use>
                                </svg>
                                <div class="squeeze-banner__content">
                                    <p class="squeeze-banner__title"><?php 
                esc_html_e( 'Direct WebP conversion is on', 'squeeze' );
                ?></p>
                                    <p><?php 
                esc_html_e( 'After conversion, image URLs may change. Check themes and content for hard-coded .jpg / .png links (image blocks, custom HTML, CSS, or shortcodes) so nothing breaks.', 'squeeze' );
                ?></p>
                                </div>
                            </div>
                            <?php 
            }
            ?>

                            <div class="squeeze-bulk-media-stats squeeze-bulk-media-stats--linear" style="--squeeze-progress-pct: <?php 
            echo esc_attr( $compressed_percentage );
            ?>;">
                                <div class="squeeze-bulk-media-stats-linear-head">
                                    <div class="squeeze-bulk-media-stats-chart-value squeeze-bulk-media-stats-chart-value--linear">
                                        <span class="squeeze-bulk-media-stats-chart-pct"><?php 
            echo esc_html( $compressed_percentage );
            ?>%</span>
                                        <span class="squeeze-bulk-media-stats-chart-pct-label"><?php 
            esc_html_e( 'complete', 'squeeze' );
            ?></span>
                                    </div>
                                    <div class="squeeze-bulk-media-stats-item squeeze-bulk-media-stats-item--inline">
                                        <span class="squeeze-bulk-media-stats-item-label"><?php 
            esc_html_e( 'Squeezed images', 'squeeze' );
            ?></span>
                                        <span class="squeeze-bulk-media-stats-item-value"><?php 
            echo esc_html( $compressed_count );
            ?> / <?php 
            echo esc_html( $total_count );
            ?></span>
                                    </div>
                                </div>
                                <div class="squeeze-bulk-media-stats-chart squeeze-bulk-media-stats-chart--linear" aria-hidden="true">
                                    <div class="squeeze-bulk-media-stats-chart-track">
                                        <div class="squeeze-bulk-media-stats-chart-fill"></div>
                                    </div>
                                </div>
                                <div class="squeeze-bulk-media-stats-legend">
                                    <span class="squeeze-bulk-media-stats-legend-item">
                                        <span class="squeeze-bulk-media-stats-legend-swatch squeeze-bulk-media-stats-legend-swatch--done" aria-hidden="true"></span>
                                        <?php 
            esc_html_e( 'Processed (success)', 'squeeze' );
            ?>
                                    </span>
                                    <span class="squeeze-bulk-media-stats-legend-item">
                                        <span class="squeeze-bulk-media-stats-legend-swatch squeeze-bulk-media-stats-legend-swatch--rest" aria-hidden="true"></span>
                                        <?php 
            esc_html_e( 'Remaining or needs attention', 'squeeze' );
            ?>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="squeeze-bulk-section__actions squeeze-bulk-media-actions">
                            <button name="squeeze_bulk" class="button button-primary button-hero" type="button" <?php 
            echo ( $uncompressed_count === 0 ? 'hidden disabled' : '' );
            ?>>
                                <svg class="squeeze-icon" aria-hidden="true">
                                    <use xlink:href="#play-button-round-icon"></use>
                                </svg>
                                <?php 
            esc_attr_e( 'Run Bulk Squeeze', 'squeeze' );
            ?>
                            </button>
                            <button name="squeeze_bulk_again" class="button button-secondary button-large" type="button">
                                <svg class="squeeze-icon" aria-hidden="true">
                                    <use xlink:href="#repeat-icon"></use>
                                </svg>
                                <?php 
            esc_attr_e( 'Repeat Bulk Squeeze', 'squeeze' );
            ?>
                            </button>
                        </div>
                    </section>

                    <section id="squeeze-bulk-section-directory" class="squeeze-bulk-section squeeze-bulk-section--directory" aria-labelledby="squeeze-heading-directory">
                        <header class="squeeze-bulk-section__head">
                            <h2 id="squeeze-heading-directory"><?php 
            esc_html_e( 'Directory Squeeze', 'squeeze' );
            ?></h2>
                            <p class="squeeze-bulk-section__meta"><?php 
            esc_html_e( 'Filesystem folder — not limited to Media Library. No automatic backup in this mode.', 'squeeze' );
            ?></p>
                        </header>
                        <div class="squeeze-bulk-section__body">
                            <div class="squeeze-banner squeeze-banner--warning">
                                <svg class="squeeze-icon" aria-hidden="true">
                                    <use xlink:href="#info-icon"></use>
                                </svg>
                                <div class="squeeze-banner__content">
                                    <p class="squeeze-banner__title"><?php 
            esc_html_e( 'Back up before you run', 'squeeze' );
            ?></p>
                                    <p><?php 
            esc_html_e( 'Automatic backup from the plugin is not available here. Manually back up the folder or your site before squeezing.', 'squeeze' );
            ?></p>
                                    <ul>
                                        <li><?php 
            esc_html_e( 'Use your host snapshot or a backup plugin.', 'squeeze' );
            ?></li>
                                        <li><?php 
            esc_html_e( 'Test on a copy first if you are unsure.', 'squeeze' );
            ?></li>
                                    </ul>
                                </div>
                            </div>

                            <input type="hidden" name="squeeze_bulk_path" value="<?php 
            echo esc_attr( $directory_path_json );
            ?>" />

                            <div class="squeeze-bulk-field">
                                <label class="squeeze-bulk-field-label"><?php 
            esc_html_e( 'Directory path', 'squeeze' );
            ?></label>
                                <p id="squeeze-directory-path-hint" class="squeeze-bulk-field-hint"><?php 
            esc_html_e( 'Relative to site root.', 'squeeze' );
            ?></p>
                                <div class="squeeze-path-list" aria-describedby="squeeze-directory-path-hint">
                                    <?php 
            $squeeze_bulk_path_count = count( $directory_path );
            foreach ( $directory_path as $path ) {
                ?>
                                        <div class="squeeze-path-list__item">
                                            <input name="squeeze-path-list__item[]" type="text" class="squeeze-path-list__input" value="<?php 
                echo esc_attr( $path );
                ?>" readonly />
                                            <?php 
                if ( $squeeze_bulk_path_count > 1 ) {
                    ?>
                                            <button name="squeeze_remove_path_button" class="squeeze-path-list__remove button" type="button" title="<?php 
                    esc_attr_e( 'Clear the path field', 'squeeze' );
                    ?>">
                                                <?php 
                    esc_html_e( 'Clear path', 'squeeze' );
                    ?>
                                            </button>
                                            <?php 
                }
                ?>
                                        </div>
                                    <?php 
            }
            ?>
                                </div>
                                <p class="squeeze-bulk-field-hint squeeze-bulk-field-hint--tight"><?php 
            esc_html_e( 'Clear path only empties the field — it does not delete files on disk.', 'squeeze' );
            ?></p>
                            </div>

                            <div class="squeeze-bulk-section__secondary-actions">
                                <button name="squeeze_select_path_button" class="button button-secondary button-large" type="button">
                                    <svg class="squeeze-icon" aria-hidden="true">
                                        <use xlink:href="#open-folder-outline-icon"></use>
                                    </svg>
                                    <?php 
            esc_attr_e( 'Select Directory', 'squeeze' );
            ?>
                                </button>
                            </div>
                            <dialog id="squeeze-path-dialog">
                                <div class="squeeze-box-header">
                                    <h2><?php 
            esc_html_e( "Select Directory for Squeeze", "squeeze" );
            ?></h2>
                                    <button name="squeeze_close_path_dialog_button" class="button button-link" type="button">
                                        <svg class="squeeze-icon" aria-hidden="true">
                                            <use xlink:href="#close-round-icon"></use>
                                        </svg>
                                    </button>
                                </div>

                                <div id="squeeze-bulk-directory-list">
                                    <svg class="squeeze-icon" aria-hidden="true">
                                        <use xlink:href="#reload-sync-icon"></use>
                                    </svg>
                                    <?php 
            esc_html_e( "Loading directories...", "squeeze" );
            ?>
                                </div>

                                <div class="squeeze-box-footer">
                                    <button disabled name="squeeze_save_path_button" class="button button-secondary button-large" type="button">
                                        <svg class="squeeze-icon" aria-hidden="true">
                                            <use xlink:href="#open-folder-outline-icon"></use>
                                        </svg>
                                        <?php 
            esc_attr_e( 'Select Directory', 'squeeze' );
            ?>
                                    </button>
                                </div>
                            </dialog>
                        </div>
                        <div class="squeeze-bulk-section__actions squeeze-bulk-media-actions">
                            <button name="squeeze_bulk_path_button" class="button button-primary button-hero" type="button">
                                <svg class="squeeze-icon" aria-hidden="true">
                                    <use xlink:href="#play-button-round-icon"></use>
                                </svg>
                                <?php 
            esc_attr_e( 'Run Directory Squeeze', 'squeeze' );
            ?>
                            </button>
                        </div>
                    </section>
                    </div>
                    <?php 
        }
        ?>
                    
                    <?php 
        ?>

                    
                    <div class="squeeze-box-bulk-stack__footer">
                        <div class="squeeze-box-content">
                            <p class="squeeze-hint">
                                <?php 
        $images_formats = self::$SqueezeHelpers->get_image_formats();
        $images_formats = implode( ', ', $images_formats );
        esc_html_e( 'Processed formats:', 'squeeze' );
        echo esc_html( '&nbsp;' . $images_formats . '. ' );
        printf( __( 'You can change the image formats for squeezing on the <a href="%s" target="_blank">settings page.</a>', 'squeeze' ), esc_url( admin_url( 'options-general.php?page=squeeze' ) ) );
        ?>
                            </p>
                        </div>
                    </div>

                </div>
            </section>
            <section class="squeeze-box" name="squeeze_bulk_log" id="squeeze_bulk_log" contenteditable="false">
                <div class="squeeze-log-placeholder">
                    <?php 
        esc_html_e( 'Start Squeezing your images and watch the progress here.', 'squeeze' );
        ?>
                </div>
                <div id="squeeze-log-data"></div>
                <div id="squeeze-anchor"></div><!-- to force scroll to the bottom -->
                <input type="hidden" value="<?php 
        echo wp_kses_data( $not_compressed_posts );
        ?>" name="squeeze_bulk_ids" />
                <input type="hidden" value="<?php 
        echo wp_kses_data( $all_posts );
        ?>" name="squeeze_bulk_all_ids" />
                <input type="hidden" value="<?php 
        echo wp_kses_data( $total_pages );
        ?>" name="squeeze_bulk_total_pages" />
                <input type="hidden" value="<?php 
        echo wp_kses_data( $uncompressed_pages );
        ?>" name="squeeze_bulk_uncompressed_pages" />
                <input type="hidden" value="<?php 
        echo wp_kses_data( $total_count );
        ?>" name="squeeze_bulk_total_images" />
                <input type="hidden" value="<?php 
        echo wp_kses_data( $uncompressed_count );
        ?>" name="squeeze_bulk_uncompressed_images" />
            </section>
        </div>
        <?php 
    }

    public function options_page_html() {
        // check user capabilities
        if ( !current_user_can( 'manage_options' ) ) {
            return;
        }
        $modules = self::$SqueezeHelpers->apache_get_modules();
        if ( !is_array( $modules ) || !in_array( 'mod_rewrite', $modules ) ) {
            $is_auto_webp = self::$SqueezeHelpers->get_option( 'auto_webp' );
            $is_webp_replace_urls = self::$SqueezeHelpers->get_option( 'webp_replace_urls' );
            if ( $is_auto_webp && !$is_webp_replace_urls ) {
                add_settings_error(
                    'squeeze_notices',
                    'squeeze_notices',
                    __( 'The Apache mod_rewrite module is not enabled on your server OR your server is not running Apache.', 'squeeze' ) . '<br>' . __( 'To serve WebP, enable mod_rewrite, or switch to "Rewrite <img> src to WebP URLs in HTML" delivery.', 'squeeze' ),
                    'warning'
                );
            }
        }
        ?>
        <div class="wrap">
            <h1>
                <?php 
        echo esc_html( get_admin_page_title() );
        ?>
            </h1>
            <nav class="nav-tab-wrapper">
                <a href="#squeeze_basic" class="nav-tab nav-tab-active"><?php 
        esc_html_e( 'Basic Settings', 'squeeze' );
        ?></a>
                <a href="#squeeze_jpeg" class="nav-tab"><?php 
        esc_html_e( 'JPEG Settings', 'squeeze' );
        ?></a>
                <a href="#squeeze_png" class="nav-tab"><?php 
        esc_html_e( 'PNG Settings', 'squeeze' );
        ?></a>
                <a href="#squeeze_webp" class="nav-tab"><?php 
        esc_html_e( 'WEBP Settings', 'squeeze' );
        ?></a>
                <a href="#squeeze_avif" class="nav-tab"><?php 
        esc_html_e( 'AVIF Settings', 'squeeze' );
        ?></a>
                <a href="#squeeze_docs" class="nav-tab"><?php 
        esc_html_e( 'Documentation', 'squeeze' );
        ?></a>
                <?php 
        ?>
                    <a href="#squeeze_upgrade" class="nav-tab"><?php 
        esc_html_e( 'Upgrade', 'squeeze' );
        ?></a>
                <?php 
        ?>
                <?php 
        ?>
            </nav>
            <div class="tab-content">
                <form action="options.php" method="post" class="squeeze-settings-form">
                    <?php 
        settings_errors( 'squeeze_notices' );
        settings_fields( 'squeeze_options' );
        //do_settings_sections( 'squeeze_options' );
        ?>

                    <section id="squeeze_basic" class="squeeze-settings-basic">
                        <div class="squeeze-settings-layout">
                            <div class="squeeze-settings-main">
                                <div class="squeeze-card squeeze-card--settings">
                                    <div class="squeeze-card-header">
                                        <h2 class="squeeze-card-title"><?php 
        esc_html_e( 'Quick start', 'squeeze' );
        ?></h2>
                                        <p class="squeeze-card-desc"><?php 
        esc_html_e( 'Core options used on most sites.', 'squeeze' );
        ?></p>
                                    </div>
                                    <table class="form-table squeeze-form-table--card" role="presentation">
                                        <?php 
        do_settings_fields( 'squeeze_options', 'squeeze_basic_quick' );
        ?>
                                    </table>
                                </div>
                                <div class="squeeze-card squeeze-card--settings">
                                    <div class="squeeze-card-header">
                                        <h2 class="squeeze-card-title"><?php 
        esc_html_e( 'WebP delivery', 'squeeze' );
        ?></h2>
                                        <p class="squeeze-card-desc"><?php 
        esc_html_e( 'Choose how WebP files are stored and served. Pick one strategy.', 'squeeze' );
        ?></p>
                                    </div>
                                    <div class="squeeze-webp-delivery-fullwidth" role="group" aria-label="<?php 
        esc_attr_e( 'WebP delivery mode', 'squeeze' );
        ?>">
                                        <?php 
        $this->render_webp_delivery_field();
        ?>
                                    </div>
                                    <?php 
        ?>
                                </div>
                                <div class="squeeze-card squeeze-card--settings">
                                    <div class="squeeze-card-header">
                                        <h2 class="squeeze-card-title"><?php 
        esc_html_e( 'Thumbnails & limits', 'squeeze' );
        ?></h2>
                                        <p class="squeeze-card-desc"><?php 
        esc_html_e( 'Which generated sizes to squeeze, resize limits, and timeout.', 'squeeze' );
        ?></p>
                                    </div>
                                    <table class="form-table squeeze-form-table--card" role="presentation">
                                        <?php 
        do_settings_fields( 'squeeze_options', 'squeeze_basic_thumbs' );
        ?>
                                        <?php 
        do_settings_fields( 'squeeze_options', 'squeeze_basic_limits' );
        ?>
                                    </table>
                                </div>
                                <div class="squeeze-card squeeze-card--settings">
                                    <div class="squeeze-card-header">
                                        <h2 class="squeeze-card-title"><?php 
        esc_html_e( 'Exclusions', 'squeeze' );
        ?></h2>
                                        <p class="squeeze-card-desc"><?php 
        esc_html_e( 'Skip matching files during bulk or upload squeeze.', 'squeeze' );
        ?></p>
                                    </div>
                                    <table class="form-table squeeze-form-table--card" role="presentation">
                                        <?php 
        do_settings_fields( 'squeeze_options', 'squeeze_basic_exclusions' );
        ?>
                                    </table>
                                </div>
                                <table class="form-table squeeze-form-table--hidden" role="presentation" aria-hidden="true">
                                    <?php 
        do_settings_fields( 'squeeze_options', 'squeeze_basic_hidden' );
        ?>
                                </table>
                            </div>
                            <aside class="squeeze-settings-sidebar" aria-label="<?php 
        esc_attr_e( 'Summary and help', 'squeeze' );
        ?>">
                                <?php 
        $this->render_basic_settings_sidebar();
        ?>
                            </aside>
                        </div>
                    </section>
                    <section id="squeeze_jpeg">
                        <div class="squeeze-box squeeze-box--settings">
                            <div class="squeeze-box-header">
                                <div class="squeeze-box-header__col">
                                    <h2><?php 
        esc_html_e( 'JPEG Settings', 'squeeze' );
        ?></h2>
                                    <?php 
        $this->setting_jpeg_desc();
        ?>
                                </div>
                            </div>
                            <table class="form-table" role="presentation">
                                <?php 
        do_settings_fields( 'squeeze_options', 'squeeze_jpeg_settings' );
        ?>
                            </table>
                        </div>
                        <div class="squeeze-box">
                            <div class="squeeze-box-header">
                                <div class="squeeze-box-header__col">
                                    <h2><?php 
        esc_html_e( 'JPEG Advanced Settings', 'squeeze' );
        ?></h2>
                                    <?php 
        $this->setting_jpeg_advanced_desc();
        ?>
                                </div>
                            </div>
                            <table class="form-table" role="presentation">
                                <?php 
        do_settings_fields( 'squeeze_options', 'squeeze_jpeg_advanced_settings' );
        ?>
                            </table>
                        </div>
                    </section>
                    <section id="squeeze_png">
                        <div class="squeeze-box squeeze-box--settings">
                            <div class="squeeze-box-header">
                                <div class="squeeze-box-header__col">
                                    <h2><?php 
        esc_html_e( 'PNG Settings', 'squeeze' );
        ?></h2>
                                    <?php 
        $this->setting_png_desc();
        ?>
                                </div>
                            </div>
                            <table class="form-table" role="presentation">
                                <?php 
        do_settings_fields( 'squeeze_options', 'squeeze_png_settings' );
        ?>
                            </table>
                        </div>
                    </section>
                    <section id="squeeze_webp">
                        <div class="squeeze-box squeeze-box--settings">
                            <div class="squeeze-box-header">
                                <div class="squeeze-box-header__col">
                                    <h2><?php 
        esc_html_e( 'WEBP Settings', 'squeeze' );
        ?></h2>
                                    <?php 
        $this->setting_webp_desc();
        ?>
                                </div>
                            </div>
                            <table class="form-table" role="presentation">
                                <?php 
        do_settings_fields( 'squeeze_options', 'squeeze_webp_settings' );
        ?>
                            </table>
                        </div>
                    </section>
                    <section id="squeeze_avif">
                        <div class="squeeze-box squeeze-box--settings">
                            <div class="squeeze-box-header">
                                <div class="squeeze-box-header__col">
                                    <h2><?php 
        esc_html_e( 'AVIF Settings', 'squeeze' );
        ?></h2>
                                    <?php 
        $this->setting_avif_desc();
        ?>
                                </div>
                            </div>
                            <table class="form-table" role="presentation">
                                <?php 
        do_settings_fields( 'squeeze_options', 'squeeze_avif_settings' );
        ?>
                            </table>
                        </div>
                    </section>
                    <section id="squeeze_docs">
                        <div class="squeeze-box squeeze-box--settings">
                            <div class="squeeze-box-header">
                                <div class="squeeze-box-header__col">
                                    <h2><?php 
        esc_html_e( 'Documentation', 'squeeze' );
        ?></h2>
                                    <?php 
        echo '<p>' . esc_html__( 'Documentation for Squeeze plugin.', 'squeeze' ) . '</p>';
        ?>
                                </div>
                            </div>
                            <table class="form-table" role="presentation">
                                <tbody>
                                    <tr>
                                        <th scope="row" colspan="2">
                                            <?php 
        echo '<p>' . sprintf( __( 'For more information, please visit the <a href="%s" target="_blank">official documentation website</a>.', 'squeeze' ) . '&nbsp;↗', esc_url( self::$DOCS_URL ) ) . '</p>';
        ?>
                                        </th>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                    <?php 
        ?>
                    <section id="squeeze_upgrade">
                        <div class="squeeze-box squeeze-box--settings">
                            <div class="squeeze-box-header">
                                <div class="squeeze-box-header__col">
                                    <h2><?php 
        esc_html_e( 'Upgrade', 'squeeze' );
        ?></h2>
                                    <?php 
        $this->setting_upgrade_desc();
        ?>
                                </div>
                            </div>
                            <div class="squeeze-upgrade-features">
                                <?php 
        $features = [['icon-compare.svg', __( 'Image Comparison', 'squeeze' ), __( 'Compare original and Squeezed image directly in the Media Library.', 'squeeze' )], ['icon-resize.svg', __( 'Resize Original Image', 'squeeze' ), __( 'Set maximum width and height for the original image.', 'squeeze' )], ['icon-bulk-page.svg', __( 'Bulk Squeeze from a Page', 'squeeze' ), __( 'Compress all images from a specific page.', 'squeeze' )]];
        foreach ( $features as $feature ) {
            ?>
                                    <div class="squeeze-box--fieldset">
                                        <img src="<?php 
            echo esc_url( self::$PLUGIN_URL . 'assets/images/' . $feature[0] );
            ?>" alt="<?php 
            echo esc_attr( $feature[1] );
            ?>" />
                                        <h3><?php 
            echo esc_html( $feature[1] );
            ?></h3>
                                        <p><?php 
            echo esc_html( $feature[2] );
            ?></p>
                                    </div>
                                    <?php 
        }
        ?>
                            </div>
                            <div class="squeeze-box-footer">
                                <h3 style="text-align: center;">
                                    <?php 
        echo sprintf( __( 'To upgrade to the Premium version, <a href="%s" target="_blank">click here</a>.', 'squeeze' ), esc_url( self::CHECKOUT_URL ) );
        ?>&nbsp;↗
                                </h3>
                            </div>
                        </div>
                    </section>
                    <?php 
        ?>

                    <?php 
        ?>

                    <p class="submit squeeze-settings-submit">
                        <input type="submit" name="submit" id="submit" class="button button-primary" value="<?php 
        esc_attr_e( 'Save Changes', 'squeeze' );
        ?>">
                        <input name="squeeze_restore_button" class="button button-secondary" type="button" value="<?php 
        esc_attr_e( 'Restore defaults', 'squeeze' );
        ?>" />
                    </p>
                </form>
            </div>
        </div>
        <?php 
    }

    public function register_settings() {
        $auto_webp = self::$SqueezeHelpers->get_option( 'auto_webp' );
        $webp_lossless = self::$SqueezeHelpers->get_option( 'webp_lossless' );
        register_setting( 'squeeze_options', 'squeeze_options', [$this, 'options_validate'] );
        add_settings_section(
            'squeeze_basic_quick',
            '',
            '__return_false',
            'squeeze_options'
        );
        add_settings_field(
            'squeeze_setting_auto_compress',
            __( 'Squeeze on upload', 'squeeze' ),
            [$this, 'options_callback'],
            'squeeze_options',
            'squeeze_basic_quick',
            array(
                'label_for' => 'auto_compress',
                'class'     => 'squeeze_setting_auto_compress squeeze-settings-row',
                'type'      => 'checkbox',
            )
        );
        add_settings_field(
            'squeeze_setting_backup_original',
            __( 'Backup original image', 'squeeze' ),
            [$this, 'options_callback'],
            'squeeze_options',
            'squeeze_basic_quick',
            array(
                'label_for' => 'backup_original',
                'class'     => 'squeeze_setting_backup_original squeeze-settings-row',
                'type'      => 'checkbox',
            )
        );
        add_settings_field(
            'squeeze_setting_compress_formats',
            __( 'Image formats', 'squeeze' ) . self::$SqueezeHelpers->get_hint( __( 'Select which image formats you want to be squeezed.', 'squeeze' ) ),
            [$this, 'options_callback'],
            'squeeze_options',
            'squeeze_basic_quick',
            array(
                'label_for' => 'compress_formats',
                'class'     => 'squeeze_setting_compress_formats squeeze-settings-row',
                'type'      => 'formats_checkbox_group',
            )
        );
        add_settings_section(
            'squeeze_basic_webp',
            '',
            '__return_false',
            'squeeze_options'
        );
        add_settings_section(
            'squeeze_basic_thumbs',
            '',
            '__return_false',
            'squeeze_options'
        );
        add_settings_field(
            'squeeze_setting_compress_thumbs',
            __( 'Squeeze thumbnails', 'squeeze' ) . self::$SqueezeHelpers->get_hint( __( 'Choose which image thumbnail sizes you want to squeeze along with the original image.', 'squeeze' ) ),
            [$this, 'options_callback'],
            'squeeze_options',
            'squeeze_basic_thumbs',
            array(
                'label_for' => 'compress_thumbs',
                'class'     => 'squeeze_setting_compress_thumbs squeeze-settings-row',
                'type'      => 'thumbs_checkbox_group',
            )
        );
        add_settings_section(
            'squeeze_basic_limits',
            '',
            '__return_false',
            'squeeze_options'
        );
        add_settings_field(
            'squeeze_setting_max_width',
            __( 'Max. image width', 'squeeze' ) . self::$SqueezeHelpers->get_hint( __( 'Limit a width of an original image. Leave this field empty if you do not want to crop the image by width.', 'squeeze' ) ),
            [$this, 'options_callback'],
            'squeeze_options',
            'squeeze_basic_limits',
            array(
                'label_for' => 'max_width',
                'class'     => 'squeeze_setting_max_width squeeze-settings-row',
                'type'      => 'placeholder',
            )
        );
        add_settings_field(
            'squeeze_setting_max_height',
            __( 'Max. image height', 'squeeze' ) . self::$SqueezeHelpers->get_hint( __( 'Limit a height of an original image. Leave this field empty if you do not want to crop the image by height.', 'squeeze' ) ),
            [$this, 'options_callback'],
            'squeeze_options',
            'squeeze_basic_limits',
            array(
                'label_for' => 'max_height',
                'class'     => 'squeeze_setting_max_height squeeze-settings-row',
                'type'      => 'placeholder',
            )
        );
        add_settings_field(
            'squeeze_setting_timeout',
            __( 'Squeeze timeout', 'squeeze' ) . self::$SqueezeHelpers->get_hint( __( 'Time limit for squeezing an image. If you get an error during image squeezing, try to increase this value.', 'squeeze' ) ),
            [$this, 'options_callback'],
            'squeeze_options',
            'squeeze_basic_limits',
            array(
                'label_for' => 'timeout',
                'class'     => 'squeeze_setting_timeout squeeze-settings-row squeeze-inline-limit',
                'type'      => 'number',
                'units'     => 'sec',
                'min'       => 1,
            )
        );
        add_settings_section(
            'squeeze_basic_exclusions',
            '',
            '__return_false',
            'squeeze_options'
        );
        add_settings_field(
            'squeeze_setting_excluded_images',
            __( 'Excluded images', 'squeeze' ) . self::$SqueezeHelpers->get_hint( __( 'Enter a list of images that you want to exclude from squeezing. Both full URLs and partial strings can be used. One URL per line.', 'squeeze' ) ),
            [$this, 'options_callback'],
            'squeeze_options',
            'squeeze_basic_exclusions',
            array(
                'label_for' => 'excluded_images',
                'class'     => 'squeeze_setting_excluded_images squeeze-settings-row',
                'type'      => 'textarea',
            )
        );
        add_settings_section(
            'squeeze_basic_hidden',
            '',
            '__return_false',
            'squeeze_options'
        );
        add_settings_field(
            'squeeze_setting_restore_defaults',
            '',
            [$this, 'options_callback'],
            'squeeze_options',
            'squeeze_basic_hidden',
            array(
                'label_for' => 'restore_defaults',
                'class'     => 'squeeze_setting_restore_defaults',
                'type'      => 'hidden',
            )
        );
        add_settings_section(
            'squeeze_jpeg_settings',
            __( 'JPEG Settings', 'squeeze' ),
            'squeeze_setting_jpeg_desc',
            'squeeze_options',
            array(
                'section_class' => 'squeeze_jpeg',
            )
        );
        add_settings_field(
            'squeeze_setting_jpeg_quality',
            __( 'Quality', 'squeeze' ),
            [$this, 'options_callback'],
            'squeeze_options',
            'squeeze_jpeg_settings',
            array(
                'label_for' => 'jpeg_quality',
                'class'     => 'squeeze_setting_jpeg_quality',
                'type'      => 'range',
            )
        );
        add_settings_field(
            'squeeze_setting_jpeg_smoothing',
            __( 'Smoothing', 'squeeze' ),
            [$this, 'options_callback'],
            'squeeze_options',
            'squeeze_jpeg_settings',
            array(
                'label_for' => 'jpeg_smoothing',
                'class'     => 'squeeze_setting_jpeg_smoothing',
                'type'      => 'range',
            )
        );
        add_settings_field(
            'squeeze_setting_jpeg_baseline',
            __( 'Pointless spec compliance', 'squeeze' ),
            [$this, 'options_callback'],
            'squeeze_options',
            'squeeze_jpeg_advanced_settings',
            array(
                'label_for' => 'jpeg_baseline',
                'class'     => 'squeeze_setting_jpeg_baseline',
                'type'      => 'checkbox',
            )
        );
        // deactivated, because throws error when enabled
        //add_settings_field('squeeze_setting_jpeg_arithmetic', __('Arithmetic', 'squeeze'), [$this, 'options_callback'], 'squeeze_options', 'squeeze_jpeg_advanced_settings', array('label_for' => 'jpeg_arithmetic', 'class' => 'squeeze_setting_jpeg_arithmetic', 'type' => 'checkbox'));
        add_settings_field(
            'squeeze_setting_jpeg_progressive',
            __( 'Progressive rendering', 'squeeze' ),
            [$this, 'options_callback'],
            'squeeze_options',
            'squeeze_jpeg_advanced_settings',
            array(
                'label_for' => 'jpeg_progressive',
                'class'     => 'squeeze_setting_jpeg_progressive',
                'type'      => 'checkbox',
            )
        );
        add_settings_field(
            'squeeze_setting_jpeg_optimize_coding',
            __( 'Optimize Huffman table', 'squeeze' ),
            [$this, 'options_callback'],
            'squeeze_options',
            'squeeze_jpeg_advanced_settings',
            array(
                'label_for' => 'jpeg_optimize_coding',
                'class'     => 'squeeze_setting_jpeg_optimize_coding',
                'type'      => 'checkbox',
            )
        );
        add_settings_field(
            'squeeze_setting_jpeg_color_space',
            __( 'Channels', 'squeeze' ),
            [$this, 'options_callback'],
            'squeeze_options',
            'squeeze_jpeg_advanced_settings',
            array(
                'label_for' => 'jpeg_color_space',
                'class'     => 'squeeze_setting_jpeg_color_space',
                'type'      => 'select',
                'options'   => array(
                    '3' => 'YCbCr',
                    '1' => 'Grayscale',
                    '2' => 'RGB',
                ),
            )
        );
        add_settings_field(
            'squeeze_setting_jpeg_quant_table',
            __( 'Quantization', 'squeeze' ),
            [$this, 'options_callback'],
            'squeeze_options',
            'squeeze_jpeg_advanced_settings',
            array(
                'label_for' => 'jpeg_quant_table',
                'class'     => 'squeeze_setting_jpeg_quant_table',
                'type'      => 'select',
                'options'   => array(
                    '0' => 'JPEG Annex K',
                    '1' => 'Flat',
                    '2' => 'MSSIM-tuned Kodak',
                    '3' => 'ImageMagick',
                    '4' => 'PSNR-HVS-M-tuned Kodak',
                    '5' => 'Klein et al',
                    '6' => 'Watson et al',
                    '7' => 'Ahumada et al',
                    '8' => 'Peterson et al',
                ),
            )
        );
        add_settings_field(
            'squeeze_setting_jpeg_trellis_multipass',
            __( 'Trellis multipass', 'squeeze' ),
            [$this, 'options_callback'],
            'squeeze_options',
            'squeeze_jpeg_advanced_settings',
            array(
                'label_for' => 'jpeg_trellis_multipass',
                'class'     => 'squeeze_setting_jpeg_trellis_multipass',
                'type'      => 'checkbox',
            )
        );
        add_settings_field(
            'squeeze_setting_jpeg_trellis_opt_zero',
            __( 'Optimize zero block runs', 'squeeze' ),
            [$this, 'options_callback'],
            'squeeze_options',
            'squeeze_jpeg_advanced_settings',
            array(
                'label_for' => 'jpeg_trellis_opt_zero',
                'class'     => 'squeeze_setting_jpeg_trellis_opt_zero',
                'type'      => 'checkbox',
            )
        );
        add_settings_field(
            'squeeze_setting_jpeg_trellis_opt_table',
            __( 'Optimize after trellis quantization', 'squeeze' ),
            [$this, 'options_callback'],
            'squeeze_options',
            'squeeze_jpeg_advanced_settings',
            array(
                'label_for' => 'jpeg_trellis_opt_table',
                'class'     => 'squeeze_setting_jpeg_trellis_opt_table',
                'type'      => 'checkbox',
            )
        );
        add_settings_field(
            'squeeze_setting_jpeg_trellis_loops',
            __( 'Trellis quantization passes', 'squeeze' ),
            [$this, 'options_callback'],
            'squeeze_options',
            'squeeze_jpeg_advanced_settings',
            array(
                'label_for' => 'jpeg_trellis_loops',
                'class'     => 'squeeze_setting_jpeg_trellis_loops',
                'type'      => 'range',
                'min'       => 1,
                'max'       => 50,
            )
        );
        add_settings_field(
            'squeeze_setting_jpeg_auto_subsample',
            __( 'Auto subsample chroma', 'squeeze' ),
            [$this, 'options_callback'],
            'squeeze_options',
            'squeeze_jpeg_advanced_settings',
            array(
                'label_for' => 'jpeg_auto_subsample',
                'class'     => 'squeeze_setting_jpeg_auto_subsample',
                'type'      => 'checkbox',
            )
        );
        add_settings_field(
            'squeeze_setting_jpeg_chroma_subsample',
            __( 'Subsample chroma by', 'squeeze' ),
            [$this, 'options_callback'],
            'squeeze_options',
            'squeeze_jpeg_advanced_settings',
            array(
                'label_for' => 'jpeg_chroma_subsample',
                'class'     => 'squeeze_setting_jpeg_chroma_subsample',
                'type'      => 'range',
                'min'       => 1,
                'max'       => 4,
            )
        );
        add_settings_field(
            'squeeze_setting_jpeg_separate_chroma_quality',
            __( 'Separate chroma quality', 'squeeze' ),
            [$this, 'options_callback'],
            'squeeze_options',
            'squeeze_jpeg_advanced_settings',
            array(
                'label_for' => 'jpeg_separate_chroma_quality',
                'class'     => 'squeeze_setting_jpeg_separate_chroma_quality',
                'type'      => 'checkbox',
            )
        );
        add_settings_field(
            'squeeze_setting_jpeg_chroma_quality',
            __( 'Chroma quality', 'squeeze' ),
            [$this, 'options_callback'],
            'squeeze_options',
            'squeeze_jpeg_advanced_settings',
            array(
                'label_for' => 'jpeg_chroma_quality',
                'class'     => 'squeeze_setting_jpeg_chroma_quality',
                'type'      => 'range',
            )
        );
        add_settings_section(
            'squeeze_png_settings',
            __( 'PNG Settings', 'squeeze' ),
            'squeeze_setting_png_desc',
            'squeeze_options',
            array(
                'section_class' => 'squeeze_png',
            )
        );
        add_settings_field(
            'squeeze_setting_png_quality',
            __( 'Quality', 'squeeze' ),
            [$this, 'options_callback'],
            'squeeze_options',
            'squeeze_png_settings',
            array(
                'label_for' => 'png_quality',
                'class'     => 'squeeze_setting_png_quality',
                'type'      => 'range',
                'min'       => 0.01,
                'max'       => 1,
                'step'      => 0.01,
            )
        );
        add_settings_section(
            'squeeze_webp_settings',
            __( 'WEBP Settings', 'squeeze' ),
            'squeeze_setting_webp_desc',
            'squeeze_options',
            array(
                'section_class' => 'squeeze_webp',
            )
        );
        add_settings_field(
            'squeeze_setting_webp_method',
            __( 'Effort', 'squeeze' ),
            [$this, 'options_callback'],
            'squeeze_options',
            'squeeze_webp_settings',
            array(
                'label_for' => 'webp_method',
                'class'     => 'squeeze_setting_webp_method',
                'type'      => 'range',
                'min'       => 0,
                'max'       => 6,
            )
        );
        add_settings_field(
            'squeeze_setting_webp_quality',
            __( 'Quality', 'squeeze' ),
            [$this, 'options_callback'],
            'squeeze_options',
            'squeeze_webp_settings',
            array(
                'label_for' => 'webp_quality',
                'class'     => 'squeeze_setting_webp_quality',
                'type'      => 'range',
                'min'       => 0,
                'max'       => 100,
                'hidden'    => ( $webp_lossless ? true : '' ),
            )
        );
        add_settings_field(
            'squeeze_setting_webp_lossless',
            __( 'Lossless', 'squeeze' ),
            [$this, 'options_callback'],
            'squeeze_options',
            'squeeze_webp_settings',
            array(
                'label_for' => 'webp_lossless',
                'class'     => 'squeeze_setting_webp_lossless',
                'type'      => 'checkbox',
            )
        );
        add_settings_field(
            'squeeze_setting_webp_near_lossless',
            __( 'Near lossless', 'squeeze' ),
            [$this, 'options_callback'],
            'squeeze_options',
            'squeeze_webp_settings',
            array(
                'label_for' => 'webp_near_lossless',
                'class'     => 'squeeze_setting_webp_near_lossless',
                'type'      => 'range',
                'min'       => 0,
                'max'       => 100,
            )
        );
        add_settings_section(
            'squeeze_avif_settings',
            __( 'AVIF Settings', 'squeeze' ),
            'squeeze_setting_avif_desc',
            'squeeze_options',
            array(
                'section_class' => 'squeeze_avif',
            )
        );
        add_settings_field(
            'squeeze_setting_avif_cqLevel',
            __( 'Quality', 'squeeze' ),
            [$this, 'options_callback'],
            'squeeze_options',
            'squeeze_avif_settings',
            array(
                'label_for' => 'avif_cqLevel',
                'class'     => 'squeeze_setting_avif_cqLevel',
                'type'      => 'range',
                'min'       => 1,
                'max'       => 100,
            )
        );
    }

    /**
     * Map stored options to a single WebP delivery mode for the settings UI.
     *
     * @param array $options squeeze_options array.
     * @return string direct|sidecar|sidecar_replace (internal keys; UI labels use "Separate WebP folder".)
     */
    protected function get_webp_delivery_mode( $options ) {
        $direct = !empty( $options['direct_webp'] );
        $auto = !empty( $options['auto_webp'] );
        $replace = !empty( $options['webp_replace_urls'] );
        if ( $direct ) {
            return 'direct';
        }
        if ( $auto && $replace ) {
            return 'sidecar_replace';
        }
        if ( $auto ) {
            return 'sidecar';
        }
        return 'direct';
    }

    /**
     * Unified WebP delivery control (radios + collapsible examples).
     */
    public function render_webp_delivery_field() {
        $options = get_option( 'squeeze_options' );
        if ( !is_array( $options ) ) {
            $options = array();
        }
        $mode = $this->get_webp_delivery_mode( $options );
        ?>
        <div class="squeeze-webp-delivery-ui">
            <fieldset class="squeeze-webp-modes" role="radiogroup">
                <legend class="screen-reader-text"><?php 
        esc_html_e( 'WebP delivery mode', 'squeeze' );
        ?></legend>
                <label class="squeeze-webp-mode-card<?php 
        echo ( $mode === 'direct' ? ' is-selected' : '' );
        ?>">
                    <input type="radio" class="squeeze-webp-mode-input" name="squeeze_options[webp_delivery_mode]" value="direct" <?php 
        checked( $mode, 'direct' );
        ?> />
                    <span class="squeeze-webp-mode-badge"><?php 
        esc_html_e( 'Recommended', 'squeeze' );
        ?></span>
                    <span class="squeeze-webp-mode-title"><?php 
        esc_html_e( 'Direct WebP', 'squeeze' );
        ?></span>
                    <span class="squeeze-webp-mode-desc"><?php 
        esc_html_e( 'Replace originals with .webp on disk. Lowest storage; URLs change to .webp.', 'squeeze' );
        ?></span>
                </label>
                <label class="squeeze-webp-mode-card<?php 
        echo ( $mode === 'sidecar_replace' ? ' is-selected' : '' );
        ?>">
                    <input type="radio" class="squeeze-webp-mode-input" name="squeeze_options[webp_delivery_mode]" value="sidecar_replace" <?php 
        checked( $mode, 'sidecar_replace' );
        ?> />
                    <span class="squeeze-webp-mode-badge"><?php 
        esc_html_e( 'PHP / any host', 'squeeze' );
        ?></span>
                    <span class="squeeze-webp-mode-title"><?php 
        esc_html_e( 'Rewrite <img> src to WebP URLs in HTML', 'squeeze' );
        ?></span>
                    <span class="squeeze-webp-mode-desc"><?php 
        esc_html_e( 'Keeps JPEG/PNG in uploads and WebP copies under squeeze-webp. Squeeze changes src and srcset in the page HTML to the WebP path. Best when .htaccess rewrites are missing (Nginx, CDN, etc.).', 'squeeze' );
        ?></span>
                </label>
                <label class="squeeze-webp-mode-card<?php 
        echo ( $mode === 'sidecar' ? ' is-selected' : '' );
        ?>">
                    <input type="radio" class="squeeze-webp-mode-input" name="squeeze_options[webp_delivery_mode]" value="sidecar" <?php 
        checked( $mode, 'sidecar' );
        ?> />
                    <span class="squeeze-webp-mode-badge"><?php 
        esc_html_e( 'Apache / .htaccess', 'squeeze' );
        ?></span>
                    <span class="squeeze-webp-mode-title"><?php 
        esc_html_e( 'Keep JPEG/PNG URLs — server serves WebP', 'squeeze' );
        ?></span>
                    <span class="squeeze-webp-mode-desc"><?php 
        esc_html_e( 'Keeps originals in uploads; WebP files go to squeeze-webp. Page HTML still shows .jpg/.png URLs. The server rewrite rules send WebP bytes when the browser supports it — no HTML changes.', 'squeeze' );
        ?></span>
                </label>
            </fieldset>
            <?php 
        if ( \SqueezeFree\SqueezeOffloadMedia::is_active() ) {
            ?>
            <div class="squeeze-notice squeeze-notice--warning squeeze-offload-htaccess-warning<?php 
            echo ( $mode !== 'sidecar' ? ' squeeze-notice--hidden' : '' );
            ?>" role="alert">
                <span class="squeeze-notice-icon" aria-hidden="true">⚠️</span>
                <div class="squeeze-notice-body">
                    <strong><?php 
            esc_html_e( 'Not compatible with WP Offload Media', 'squeeze' );
            ?></strong>
                    <p><?php 
            esc_html_e( 'The "Keep JPEG/PNG URLs — server serves WebP" mode relies on Apache .htaccess rewrite rules that only work for requests reaching your origin server. When WP Offload Media is active, image URLs point to an external CDN (S3, GCS, DigitalOcean Spaces, etc.) and those requests never pass through your .htaccess — so WebP files will not be served.', 'squeeze' );
            ?></p>
                    <p><?php 
            echo wp_kses( __( 'Please switch to <strong>Direct WebP</strong> conversion — it converts images to WebP in-place and WP Offload Media handles uploading automatically.', 'squeeze' ), array(
                'strong' => array(),
            ) );
            ?></p>
                </div>
            </div>
            <div class="squeeze-notice squeeze-notice--warning squeeze-offload-sidecar-warning<?php 
            echo ( $mode !== 'sidecar_replace' ? ' squeeze-notice--hidden' : '' );
            ?>" role="alert">
                <span class="squeeze-notice-icon" aria-hidden="true">⚠️</span>
                <div class="squeeze-notice-body">
                    <strong><?php 
            esc_html_e( 'Not compatible with WP Offload Media', 'squeeze' );
            ?></strong>
                    <p><?php 
            esc_html_e( 'The "Rewrite <img> src to WebP URLs in HTML" mode is not compatible with WP Offload Media. WebP sidecar files are stored in a local squeeze-webp/ folder and are never pushed to your external storage provider (S3, GCS, DigitalOcean Spaces, etc.), so they cannot be served from your CDN URL.', 'squeeze' );
            ?></p>
                    <p><?php 
            echo wp_kses( __( 'Please switch to <strong>Direct WebP</strong> conversion — it converts images to WebP in-place and WP Offload Media handles uploading automatically.', 'squeeze' ), array(
                'strong' => array(),
            ) );
            ?></p>
                </div>
            </div>
            <?php 
        }
        ?>
            <details class="squeeze-webp-example">
                <summary><?php 
        esc_html_e( 'Show example: Direct WebP (file sizes)', 'squeeze' );
        ?></summary>
                <div class="squeeze-webp-example-inner">
                    <pre class="squeeze-webp-code-sample"><span class="squeeze-webp-pre-callout"><?php 
        echo esc_html( __( 'Direct WebP: on disk, files use the .webp extension instead of .jpg / .png for the same attachment paths.', 'squeeze' ) );
        ?></span>
<span class="squeeze-webp-pre-heading"><?php 
        echo esc_html( __( 'Before', 'squeeze' ) );
        ?></span>
/wp-content/uploads/2025/07/image.jpg           <span class="squeeze-webp-size squeeze-webp-size--before">~500 KB</span>
/wp-content/uploads/2025/07/image-300x300.jpg   <span class="squeeze-webp-size squeeze-webp-size--before">~230 KB</span>

<span class="squeeze-webp-pre-heading"><?php 
        echo esc_html( __( 'After', 'squeeze' ) );
        ?></span>
/wp-content/uploads/2025/07/image.webp          <span class="squeeze-webp-size squeeze-webp-size--after">~50 KB</span>
/wp-content/uploads/2025/07/image-300x300.webp  <span class="squeeze-webp-size squeeze-webp-size--after">~20 KB</span></pre>
                </div>
            </details>
            <details class="squeeze-webp-example">
                <summary><?php 
        esc_html_e( 'Show example: Rewrite <img> src to WebP URLs in HTML', 'squeeze' );
        ?></summary>
                <div class="squeeze-webp-example-inner">
                    <pre class="squeeze-webp-code-sample"><span class="squeeze-webp-pre-callout"><?php 
        echo esc_html( __( 'Before: the page outputs a normal uploads URL for the JPEG.', 'squeeze' ) );
        ?></span>
&lt;img src="//yoursite.example/wp-content/uploads/2025/07/photo.jpg" alt="…" /&gt;

<span class="squeeze-webp-pre-callout"><?php 
        echo esc_html( __( 'After: the same img tag in the markup, but PHP rewrites src to the WebP path under squeeze-webp when that file exists.', 'squeeze' ) );
        ?></span>
&lt;img src="//yoursite.example/wp-content/squeeze-webp/uploads/2025/07/photo.jpg.webp" alt="…" /&gt;</pre>
                </div>
            </details>
            <details class="squeeze-webp-example">
                <summary><?php 
        esc_html_e( 'Show example: Keep JPEG/PNG URLs — server serves WebP', 'squeeze' );
        ?></summary>
                <div class="squeeze-webp-example-inner">
                    <pre class="squeeze-webp-code-sample"><span class="squeeze-webp-pre-callout"><?php 
        echo esc_html( __( 'The published HTML keeps the usual uploads URL on the img (still ends in .jpg or .png).', 'squeeze' ) );
        ?></span>
&lt;img src="//yoursite.example/wp-content/uploads/2025/07/photo.jpg" alt="…" /&gt;

<span class="squeeze-webp-pre-callout"><?php 
        echo esc_html( __( 'When the browser advertises WebP and your server rewrite rules apply, that same URL can be served as a WebP response from the file under squeeze-webp, without changing the markup.', 'squeeze' ) );
        ?></span>

<span class="squeeze-webp-pre-heading"><?php 
        echo esc_html( __( 'On disk (after optimization)', 'squeeze' ) );
        ?></span>
/wp-content/uploads/2025/07/image.jpg                    <span class="squeeze-webp-size squeeze-webp-size--before">~500 KB</span>  <span class="squeeze-webp-pre-note"><?php 
        echo esc_html( __( 'original', 'squeeze' ) );
        ?></span>
/wp-content/squeeze-webp/uploads/2025/07/image.jpg.webp    <span class="squeeze-webp-size squeeze-webp-size--after">~50 KB</span>  <span class="squeeze-webp-pre-note"><?php 
        echo esc_html( __( 'sidecar WebP', 'squeeze' ) );
        ?></span></pre>
                </div>
            </details>
        </div>
        <?php 
    }

    /**
     * Sidebar summary on Basic settings (read-only hints).
     */
    public function render_basic_settings_sidebar() {
        $options = get_option( 'squeeze_options' );
        if ( !is_array( $options ) ) {
            $options = array();
        }
        $mode = $this->get_webp_delivery_mode( $options );
        $mode_label = __( 'Direct WebP', 'squeeze' );
        if ( 'sidecar' === $mode ) {
            $mode_label = __( 'Keep JPEG/PNG URLs — server serves WebP', 'squeeze' );
        } elseif ( 'sidecar_replace' === $mode ) {
            $mode_label = __( 'Rewrite <img> src to WebP URLs in HTML', 'squeeze' );
        }
        $upload_on = !empty( $options['auto_compress'] );
        $backup_on = !empty( $options['backup_original'] );
        ?>
        <div class="squeeze-card squeeze-card--aside">
            <div class="squeeze-card-header">
                <h2 class="squeeze-card-title"><?php 
        esc_html_e( 'Current profile', 'squeeze' );
        ?></h2>
            </div>
            <div class="squeeze-card-body">
                <?php 
        $profile_bits = array('<strong>' . esc_html( $mode_label ) . '</strong>');
        if ( $upload_on ) {
            $profile_bits[] = esc_html__( 'Squeeze on upload', 'squeeze' );
        }
        if ( $backup_on ) {
            $profile_bits[] = esc_html__( 'Backup on', 'squeeze' );
        }
        echo '<p>' . wp_kses( implode( ' · ', $profile_bits ), array(
            'strong' => array(),
        ) ) . '</p>';
        ?>
                <ul class="squeeze-aside-list">
                    <?php 
        if ( 'direct' === $mode ) {
            ?>
                        <li><?php 
            esc_html_e( 'Best for storage savings on new uploads.', 'squeeze' );
            ?></li>
                        <li><?php 
            esc_html_e( 'If you deactivate the plugin, hard-coded .jpg/.png links may need updating.', 'squeeze' );
            ?></li>
                    <?php 
        } elseif ( 'sidecar' === $mode ) {
            ?>
                        <li><?php 
            esc_html_e( 'HTML keeps normal .jpg/.png URLs; WebP is chosen by the server when the browser supports it.', 'squeeze' );
            ?></li>
                        <li><?php 
            esc_html_e( 'Needs working .htaccess rewrite rules (Apache mod_rewrite or equivalent).', 'squeeze' );
            ?></li>
                    <?php 
        } elseif ( 'sidecar_replace' === $mode ) {
            ?>
                        <li><?php 
            esc_html_e( 'Originals stay in uploads; page HTML points at WebP under squeeze-webp.', 'squeeze' );
            ?></li>
                        <li><?php 
            esc_html_e( 'Works without .htaccess — PHP rewrites image URLs on each page load.', 'squeeze' );
            ?></li>
                    <?php 
        }
        ?>
                </ul>
            </div>
        </div>
        <div class="squeeze-card squeeze-card--aside">
            <div class="squeeze-card-header">
                <h2 class="squeeze-card-title"><?php 
        esc_html_e( 'Documentation', 'squeeze' );
        ?></h2>
            </div>
            <div class="squeeze-card-body">
                <p>
                    <a href="<?php 
        echo esc_url( self::$DOCS_URL );
        ?>" target="_blank" rel="noopener noreferrer"><?php 
        esc_html_e( 'Squeeze documentation', 'squeeze' );
        ?></a>
                </p>
            </div>
        </div>
        <?php 
    }

    public function options_validate( $input ) {
        if ( isset( $input['webp_delivery_mode'] ) && is_string( $input['webp_delivery_mode'] ) ) {
            $mode = sanitize_text_field( wp_unslash( $input['webp_delivery_mode'] ) );
            unset($input['webp_delivery_mode']);
            switch ( $mode ) {
                case 'sidecar':
                case 'sidecar_picture':
                    $input['direct_webp'] = false;
                    $input['auto_webp'] = true;
                    $input['webp_replace_urls'] = false;
                    break;
                case 'sidecar_replace':
                    $input['direct_webp'] = false;
                    $input['auto_webp'] = true;
                    $input['webp_replace_urls'] = true;
                    break;
                case 'direct':
                default:
                    $input['direct_webp'] = true;
                    $input['auto_webp'] = false;
                    $input['webp_replace_urls'] = false;
                    break;
            }
        }
        $input['jpeg_quality'] = absint( $input['jpeg_quality'] );
        $input['jpeg_smoothing'] = ( isset( $input['jpeg_smoothing'] ) ? absint( $input['jpeg_smoothing'] ) : self::$SqueezeHelpers->get_default_value( 'jpeg_smoothing' ) );
        $input['jpeg_color_space'] = ( isset( $input['jpeg_color_space'] ) ? absint( $input['jpeg_color_space'] ) : self::$SqueezeHelpers->get_default_value( 'jpeg_color_space' ) );
        $input['jpeg_quant_table'] = ( isset( $input['jpeg_quant_table'] ) ? absint( $input['jpeg_quant_table'] ) : self::$SqueezeHelpers->get_default_value( 'jpeg_quant_table' ) );
        $input['jpeg_trellis_loops'] = ( isset( $input['jpeg_trellis_loops'] ) ? absint( $input['jpeg_trellis_loops'] ) : self::$SqueezeHelpers->get_default_value( 'jpeg_trellis_loops' ) );
        $input['jpeg_chroma_subsample'] = ( isset( $input['jpeg_chroma_subsample'] ) ? absint( $input['jpeg_chroma_subsample'] ) : self::$SqueezeHelpers->get_default_value( 'jpeg_chroma_subsample' ) );
        $input['jpeg_chroma_quality'] = ( isset( $input['jpeg_chroma_quality'] ) ? absint( $input['jpeg_chroma_quality'] ) : self::$SqueezeHelpers->get_default_value( 'jpeg_chroma_quality' ) );
        $input['png_level'] = ( isset( $input['png_level'] ) ? absint( $input['png_level'] ) : self::$SqueezeHelpers->get_default_value( 'png_level' ) );
        $input['png_quality'] = ( isset( $input['png_quality'] ) ? floatval( $input['png_quality'] ) : self::$SqueezeHelpers->get_default_value( 'png_quality' ) );
        $input['webp_method'] = ( isset( $input['webp_method'] ) ? absint( $input['webp_method'] ) : self::$SqueezeHelpers->get_default_value( 'webp_method' ) );
        $input['webp_quality'] = ( isset( $input['webp_quality'] ) ? absint( $input['webp_quality'] ) : self::$SqueezeHelpers->get_default_value( 'webp_quality' ) );
        $input['webp_near_lossless'] = ( isset( $input['webp_near_lossless'] ) ? absint( $input['webp_near_lossless'] ) : self::$SqueezeHelpers->get_default_value( 'webp_near_lossless' ) );
        $input['avif_cqLevel'] = ( isset( $input['avif_cqLevel'] ) ? absint( $input['avif_cqLevel'] ) : self::$SqueezeHelpers->get_default_value( 'avif_cqLevel' ) );
        $input['jpeg_baseline'] = ( isset( $input['jpeg_baseline'] ) ? boolval( $input['jpeg_baseline'] ) : '0' );
        //$input[ 'jpeg_arithmetic' ] = isset($input[ 'jpeg_arithmetic' ]) ? boolval($input[ 'jpeg_arithmetic' ]) : '0';
        $input['jpeg_progressive'] = ( isset( $input['jpeg_progressive'] ) ? boolval( $input['jpeg_progressive'] ) : '0' );
        $input['jpeg_optimize_coding'] = ( isset( $input['jpeg_optimize_coding'] ) ? boolval( $input['jpeg_optimize_coding'] ) : '0' );
        $input['jpeg_trellis_multipass'] = ( isset( $input['jpeg_trellis_multipass'] ) ? boolval( $input['jpeg_trellis_multipass'] ) : '0' );
        $input['jpeg_trellis_opt_zero'] = ( isset( $input['jpeg_trellis_opt_zero'] ) ? boolval( $input['jpeg_trellis_opt_zero'] ) : '0' );
        $input['jpeg_trellis_opt_table'] = ( isset( $input['jpeg_trellis_opt_table'] ) ? boolval( $input['jpeg_trellis_opt_table'] ) : '0' );
        $input['jpeg_auto_subsample'] = ( isset( $input['jpeg_auto_subsample'] ) ? boolval( $input['jpeg_auto_subsample'] ) : '0' );
        $input['jpeg_separate_chroma_quality'] = ( isset( $input['jpeg_separate_chroma_quality'] ) ? boolval( $input['jpeg_separate_chroma_quality'] ) : '0' );
        $input['png_interlace'] = ( isset( $input['png_interlace'] ) ? boolval( $input['png_interlace'] ) : '0' );
        $input['webp_lossless'] = ( isset( $input['webp_lossless'] ) ? boolval( $input['webp_lossless'] ) : '0' );
        $input['auto_compress'] = ( isset( $input['auto_compress'] ) ? boolval( $input['auto_compress'] ) : '0' );
        // TBD: maybe get default value from the database
        $input['auto_webp'] = ( isset( $input['auto_webp'] ) ? boolval( $input['auto_webp'] ) : '0' );
        $input['webp_replace_urls'] = ( isset( $input['webp_replace_urls'] ) && $input['auto_webp'] ? boolval( $input['webp_replace_urls'] ) : '0' );
        $input['direct_webp'] = ( isset( $input['direct_webp'] ) ? boolval( $input['direct_webp'] ) : '0' );
        if ( isset( $input['cdn_url'] ) ) {
            $cdn_raw = trim( wp_unslash( (string) $input['cdn_url'] ) );
            $input['cdn_url'] = ( $cdn_raw === '' ? '' : esc_url_raw( $cdn_raw ) );
        } else {
            $input['cdn_url'] = '';
        }
        $input['backup_original'] = ( isset( $input['backup_original'] ) ? boolval( $input['backup_original'] ) : '0' );
        $input['compress_formats'] = ( isset( $input['compress_formats'] ) && is_array( $input['compress_formats'] ) ? $this->validate_image_formats( $input['compress_formats'], $input['direct_webp'] ) : array() );
        $input['compress_thumbs'] = ( isset( $input['compress_thumbs'] ) && is_array( $input['compress_thumbs'] ) ? $input['compress_thumbs'] : array() );
        $input['max_width'] = ( isset( $input['max_width'] ) && $input['max_width'] > 0 ? absint( $input['max_width'] ) : '' );
        $input['max_height'] = ( isset( $input['max_height'] ) && $input['max_height'] > 0 ? absint( $input['max_height'] ) : '' );
        $input['excluded_images'] = ( isset( $input['excluded_images'] ) ? $input['excluded_images'] : '' );
        $input['timeout'] = ( isset( $input['timeout'] ) && $input['timeout'] > 0 ? absint( $input['timeout'] ) : 1 );
        $input['restore_defaults'] = ( isset( $input['restore_defaults'] ) ? $input['restore_defaults'] : '0' );
        if ( !isset( $input['restore_defaults'] ) || $input['restore_defaults'] !== '1' ) {
            add_settings_error(
                'squeeze_notices',
                'settings_updated',
                __( 'Settings have been updated.', 'squeeze' ),
                'success'
            );
        }
        unset($input['webp_picture_markup']);
        return $input;
    }

    protected function validate_image_formats( $input, $is_direct_webp = false ) {
        $formats = self::ALLOWED_IMAGE_FORMATS;
        if ( !isset( $input ) || !is_array( $input ) ) {
            return array();
        }
        // remove all formats that are not in the allowed formats list
        $input = array_filter( $input, function ( $format ) use($formats) {
            //check by key
            return array_key_exists( $format, $formats );
        }, ARRAY_FILTER_USE_KEY );
        // if direct webp conversion is enabled, webp format is mandatory
        if ( $is_direct_webp && !array_key_exists( 'webp', $input ) ) {
            $input['webp'] = 'on';
        }
        return $input;
    }

    public function options_callback( $args ) {
        $label_for = ( isset( $args['label_for'] ) ? $args['label_for'] : '' );
        if ( empty( $label_for ) ) {
            return;
        }
        $type = ( isset( $args['type'] ) ? $args['type'] : 'text' );
        $class = ( isset( $args['class'] ) ? $args['class'] : '' );
        $default = self::$SqueezeHelpers->get_default_value( $label_for );
        $options = get_option( 'squeeze_options' );
        $is_hidden = ( isset( $args['hidden'] ) && $args['hidden'] ? 'hidden' : '' );
        $extra_classes = [];
        if ( $is_hidden ) {
            $extra_classes[] = 'squeeze-hidden';
        }
        $extra_classes = implode( ' ', $extra_classes );
        switch ( $type ) {
            case 'text':
                $value = ( isset( $options[$label_for] ) ? $options[$label_for] : $default );
                $placeholder = ( isset( $args['placeholder'] ) ? $args['placeholder'] : '' );
                echo "<input class='" . esc_attr( $extra_classes ) . "' id='squeeze_setting_" . esc_attr( $label_for ) . "' name='squeeze_options[" . esc_attr( $label_for ) . "]' type='text' value='" . esc_attr( $value ) . "' placeholder='" . esc_attr( $placeholder ) . "' />";
                break;
            case 'number':
                $value = ( isset( $options[$label_for] ) ? $options[$label_for] : $default );
                $units = ( isset( $args['units'] ) ? $args['units'] : '' );
                $min = ( isset( $args['min'] ) ? $args['min'] : '' );
                $max = ( isset( $args['max'] ) ? $args['max'] : '' );
                echo "<input class='" . esc_attr( $extra_classes ) . "' id='squeeze_setting_" . esc_attr( $label_for ) . "' name='squeeze_options[" . esc_attr( $label_for ) . "]' type='number' value='" . esc_attr( $value ) . "' " . (( $min !== '' && $min !== null ? "min='" . esc_attr( $min ) . "'" : "" )) . " " . (( $max !== '' && $max !== null ? "max='" . esc_attr( $max ) . "'" : "" )) . " />";
                if ( $units ) {
                    echo "<span class='squeeze-setting-units'>" . esc_html( $units ) . "</span>";
                }
                break;
            case 'range':
                $value = ( isset( $options[$label_for] ) ? $options[$label_for] : $default );
                $min = ( isset( $args['min'] ) ? $args['min'] : 0 );
                $max = ( isset( $args['max'] ) ? $args['max'] : 100 );
                $step = ( isset( $args['step'] ) ? $args['step'] : 1 );
                echo "<input class='" . esc_attr( $extra_classes ) . "' id='squeeze_setting_" . esc_attr( $label_for ) . "' name='squeeze_options[" . esc_attr( $label_for ) . "]' min='" . (int) $min . "' max='" . (int) $max . "' step='" . floatval( $step ) . "' type='range' value='" . esc_attr( $value ) . "' />";
                echo '<output id="squeeze_setting_' . esc_attr( $label_for ) . '_value"></output>';
                ?>
                <script>
                    (function () {
                        const value = document.querySelector("#squeeze_setting_<?php 
                echo esc_attr( $label_for );
                ?>_value")
                        const input = document.querySelector("#squeeze_setting_<?php 
                echo esc_attr( $label_for );
                ?>")
                        value.textContent = input.value
                        input.addEventListener("input", (event) => {
                            value.textContent = event.target.value
                        })
                    })()
                </script>
                <?php 
                break;
            case 'checkbox':
                $value = ( isset( $options[$label_for] ) ? (bool) $options[$label_for] : $default );
                //echo (bool)$options[ $label_for ];
                echo "<input class='squeeze-ios8-switch " . esc_attr( $extra_classes ) . "' id='squeeze_setting_" . esc_attr( $label_for ) . "' name='squeeze_options[" . esc_attr( $label_for ) . "]' type='checkbox' " . checked( $value, true, false ) . " />";
                echo '<label for="squeeze_setting_' . esc_attr( $label_for ) . '"></label>';
                break;
            case 'select':
                $value = ( isset( $options[$label_for] ) ? $options[$label_for] : $default );
                echo "<select class='" . esc_attr( $extra_classes ) . "' id='squeeze_setting_" . esc_attr( $label_for ) . "' name='squeeze_options[" . esc_attr( $label_for ) . "]'>";
                foreach ( $args['options'] as $key => $option ) {
                    echo "<option value='" . esc_attr( $key ) . "'" . selected( $value, $key, false ) . ">" . esc_html( $option ) . "</option>";
                }
                echo "</select>";
                break;
            case 'thumbs_checkbox_group':
                $thumbs = array();
                $value = ( isset( $options[$label_for] ) ? (array) $options[$label_for] : $default );
                $available_sizes = wp_get_registered_image_subsizes();
                foreach ( $available_sizes as $key => $size ) {
                    $thumbs[$key] = ucwords( str_replace( '_', ' ', $key ) ) . ' (' . $size['width'] . 'x' . $size['height'] . ')';
                }
                // Add the scaled image size option
                $big_image_size_threshold = apply_filters( 'big_image_size_threshold', 2560 );
                $thumbs['full'] = 'Scaled (' . $big_image_size_threshold . 'x' . $big_image_size_threshold . ')';
                echo '<div class="squeeze-thumb-toolbar">';
                echo '<button type="button" class="button button-small" id="squeeze-thumbs-select-all">' . esc_html__( 'Select all', 'squeeze' ) . '</button>';
                echo '<button type="button" class="button button-small" id="squeeze-thumbs-clear-all">' . esc_html__( 'Clear all', 'squeeze' ) . '</button>';
                echo '<button type="button" class="button button-small" id="squeeze-thumbs-wp-defaults">' . esc_html__( 'WordPress defaults', 'squeeze' ) . '</button>';
                echo '</div>';
                echo '<div class="squeeze-box squeeze-box--fieldset squeeze-thumb-grid-wrap">';
                echo '<div class="squeeze-box-content squeeze-thumb-grid">';
                foreach ( $thumbs as $key => $option ) {
                    echo '<div class="squeeze-suboption squeeze-thumb-grid-item">';
                    echo "<input class='squeeze-ios8-switch' id='squeeze_setting_" . esc_attr( $label_for ) . "_" . esc_attr( $key ) . "' name='squeeze_options[" . esc_attr( $label_for ) . "][" . esc_attr( $key ) . "]' type='checkbox' " . checked( array_key_exists( $key, $value ), true, false ) . " /> ";
                    echo "<label for='squeeze_setting_" . esc_attr( $label_for ) . "_" . esc_attr( $key ) . "'>" . esc_html( $option ) . "</label>";
                    echo '</div>';
                }
                echo '</div>';
                echo '</div>';
                break;
            case 'formats_checkbox_group':
                $is_direct_webp = ( isset( $options['direct_webp'] ) ? (bool) $options['direct_webp'] : false );
                $formats = self::ALLOWED_IMAGE_FORMATS;
                $value = ( isset( $options[$label_for] ) ? (array) $options[$label_for] : $default );
                echo '<div class="squeeze-box squeeze-box--fieldset squeeze-format-chips-wrap">';
                echo '<div class="squeeze-box-content squeeze-format-chips">';
                foreach ( $formats as $key => $option ) {
                    echo '<div class="squeeze-suboption squeeze-format-chip ' . (( $is_direct_webp && $key === 'webp' ? 'squeeze-disabled' : '' )) . '">';
                    echo "<input class='squeeze-ios8-switch' id='squeeze_setting_" . esc_attr( $label_for ) . "_" . esc_attr( $key ) . "' name='squeeze_options[" . esc_attr( $label_for ) . "][" . esc_attr( $key ) . "]' type='checkbox' " . checked( array_key_exists( $key, $value ), true, false ) . " /> ";
                    echo "<label for='squeeze_setting_" . esc_attr( $label_for ) . "_" . esc_attr( $key ) . "'>" . esc_html( $key ) . "</label>";
                    if ( $is_direct_webp && $key === 'webp' ) {
                        echo '<span class="squeeze-hint">' . __( '(mandatory when Direct WebP is enabled)', 'squeeze' ) . '</span>';
                    }
                    echo '</div>';
                }
                echo '</div>';
                echo '</div>';
                break;
            case 'hidden':
                $value = ( isset( $options[$label_for] ) ? $options[$label_for] : $default );
                echo "<input id='squeeze_setting_" . esc_attr( $label_for ) . "' name='squeeze_options[" . esc_attr( $label_for ) . "]' type='hidden' value='" . esc_attr( $value ) . "' />";
                break;
            case 'textarea':
                $value = ( isset( $options[$label_for] ) ? $options[$label_for] : $default );
                echo "<textarea class='" . esc_attr( $extra_classes ) . "' id='squeeze_setting_" . esc_attr( $label_for ) . "' name='squeeze_options[" . esc_attr( $label_for ) . "]'>" . esc_textarea( $value ) . "</textarea>";
                break;
            case 'placeholder':
                echo '<p>' . sprintf( __( 'This feature is available only in the <a href="%s">premium version</a>.', 'squeeze' ), esc_url( self::$UPGRADE_URL ) ) . '</p>';
                break;
        }
    }

    public function setting_basic_desc() {
        echo '<p>' . esc_html__( 'Basic squeezing settings.', 'squeeze' ) . '</p>';
    }

    public function setting_jpeg_desc() {
        echo '<p>' . esc_html__( 'Squeezing settings for JPEG images.', 'squeeze' ) . '</p>';
    }

    public function setting_jpeg_advanced_desc() {
        echo '<p>' . esc_html__( 'More precise settings for experienced users.', 'squeeze' ) . '</p>';
    }

    public function setting_png_desc() {
        echo '<p>' . esc_html__( 'Squeezing settings for PNG images.', 'squeeze' ) . '</p>';
    }

    public function setting_webp_desc() {
        echo '<p>' . esc_html__( 'Squeezing settings for WebP images.', 'squeeze' ) . '</p>';
    }

    public function setting_avif_desc() {
        echo '<p>' . esc_html__( 'Squeezing settings for Avif images.', 'squeeze' ) . '</p>';
    }

    public function setting_upgrade_desc() {
        echo '<p>' . esc_html__( 'Upgrade to premium version for more features.', 'squeeze' ) . '</p>';
    }

    public function setting_license_desc() {
    }

    public function restore_defaults( $old_value, $value ) {
        if ( isset( $value['restore_defaults'] ) && $value['restore_defaults'] === '1' ) {
            $result = delete_option( 'squeeze_options', "" );
            if ( $result ) {
                add_settings_error(
                    'squeeze_notices',
                    'settings_restored',
                    __( 'Settings have been restored.', 'squeeze' ),
                    'success'
                );
            } else {
                add_settings_error(
                    'squeeze_notices',
                    'settings_not_restored',
                    __( 'Settings have not been restored.', 'squeeze' ),
                    'error'
                );
            }
        }
    }

    public function flush_rewrite_rules( $old_value, $value ) {
        if ( isset( $value['auto_webp'] ) && $value['auto_webp'] !== $old_value['auto_webp'] ) {
            flush_rewrite_rules();
            add_settings_error(
                'squeeze_notices',
                'rewrite_rules_flushed',
                __( 'Rewrite rules have been flushed.', 'squeeze' ),
                'success'
            );
        }
    }

    public function add_custom_field_to_attachment( $form_fields, $post ) {
        $all_formats = self::ALLOWED_IMAGE_FORMATS;
        $all_mimes = self::$SqueezeHelpers->get_image_formats( true, $all_formats );
        if ( in_array( $post->post_mime_type, $all_mimes ) ) {
            $selected_mimes = self::$SqueezeHelpers->get_image_formats( true );
            $is_compressed = get_post_meta( $post->ID, 'squeeze_is_compressed', true );
            $compression_failed = get_post_meta( $post->ID, 'squeeze_compression_failed', true );
            $can_restore = self::$SqueezeHelpers->can_restore( $post->ID );
            $is_excluded = false;
            $url = wp_get_original_image_url( $post->ID );
            if ( $url ) {
                $excluded_images = self::$SqueezeHelpers->get_excluded_images();
                $is_excluded = self::$SqueezeHelpers->is_excluded_image( $url, $excluded_images );
            }
            $form_fields['squeeze_is_compressed'] = array(
                'label' => __( 'Squeeze', 'squeeze' ),
                'input' => 'html',
                'html'  => ( !in_array( $post->post_mime_type, $selected_mimes ) ? '<span class="squeeze_status"><span style="padding-top: 0; line-height: 1; color: gray;" class="dashicons dashicons-info"></span>&nbsp;' . __( 'Image format is not selected for compression in the plugin settings', 'squeeze' ) . '</span><br>' : (( $is_excluded ? '<span class="squeeze_status"><span style="padding-top: 0; line-height: 1; color: #6c757d;" class="dashicons dashicons-hidden"></span>&nbsp;' . __( 'Image is excluded from compression', 'squeeze' ) . ' (' . esc_html__( 'found substring: ', 'squeeze' ) . $is_excluded['exclude_reason'] . ')</span>' : (( $compression_failed === 'larger_than_original' ? '<p><span class="squeeze_status"><span style="padding-top: 0; line-height: 1; color: #FFA500;" class="dashicons dashicons-warning"></span>&nbsp;' . sprintf( __( 'Could not compress — result was larger than original. Try <a href="%s" target="_blank">adjusting compression settings</a>, then re-squeeze.', 'squeeze' ), self::$SETTINGS_URL . '#squeeze_' . pathinfo( get_attached_file( $post->ID ), PATHINFO_EXTENSION ) ) . '</span></p>' . (( $can_restore ? '<p><button name="squeeze_restore" type="button" class="button button-secondary squeeze-restore-button" data-attachment="' . $post->ID . '">' . __( 'Restore original image', 'squeeze' ) . '</button></p>' : '' )) . '<p><button name="squeeze_compress_single" type="button" class="button button-secondary squeeze-compress-button" data-attachment="' . $post->ID . '">' . __( 'Re-Squeeze image', 'squeeze' ) . '</button></p>' : (( $is_compressed ? '<p><span class="squeeze_status"><span style="padding-top: 0; line-height: 1; color: #6BCB77;" class="dashicons dashicons-performance"></span>&nbsp;' . __( 'Squeezed', 'squeeze' ) . '</span></p>' . (( $can_restore ? '
                    <p><button name="squeeze_restore" type="button" class="button button-secondary squeeze-restore-button" data-attachment="' . $post->ID . '">' . __( 'Restore original image', 'squeeze' ) . '</button></p>' : '' )) . '
                    <p><button name="squeeze_compress_again" type="button" class="button button-primary squeeze-compress-button" data-attachment="' . $post->ID . '">' . __( 'Re-Squeeze image', 'squeeze' ) . '</button></p>' : '<p><span class="squeeze_status"><span style="padding-top: 0; line-height: 1; color: #FFD93D; scale: -1 1;" class="dashicons dashicons-performance"></span>&nbsp;' . __( 'Not squeezed', 'squeeze' ) . '</span></p>
                    <p><button name="squeeze_compress_single" type="button" class="button button-primary squeeze-compress-button" data-attachment="' . $post->ID . '">' . __( 'Squeeze Now', 'squeeze' ) . '</button></p>' )) )) )) ),
            );
        }
        return $form_fields;
    }

    public function add_media_columns( $posts_columns ) {
        $posts_columns['squeeze'] = __( 'Squeeze', 'squeeze' );
        return $posts_columns;
    }

    public function media_custom_column( $column_name, $post_id ) {
        if ( 'squeeze' !== $column_name ) {
            return;
        }
        $form_fields = $this->add_custom_field_to_attachment( array(), get_post( $post_id ) );
        if ( $form_fields ) {
            echo wp_kses_post( $form_fields['squeeze_is_compressed']['html'] );
        }
    }

    public function sortable_columns( $columns ) {
        $columns['squeeze'] = 'squeeze';
        return $columns;
    }

    public function sortable_columns_orderby( $query ) {
        if ( !is_admin() || !$query->is_main_query() ) {
            return;
        }
        $orderby = $query->get( 'orderby' );
        if ( 'squeeze' === $orderby ) {
            // Define the allowed image formats
            $allowed_formats = self::$SqueezeHelpers->get_image_formats( true );
            // include all media
            $query->set( 'meta_query', array(
                'relation' => 'OR',
                array(
                    'key'     => 'squeeze_is_compressed',
                    'compare' => 'NOT EXISTS',
                ),
                array(
                    'key'     => 'squeeze_is_compressed',
                    'compare' => 'EXISTS',
                ),
            ) );
            // Add the meta_query to filter by specific image formats
            //$query->set('post_mime_type', $allowed_formats);
            $query->set( 'orderby', 'meta_value' );
        }
    }

    public function media_filter_dropdown() {
        global $wp_query;
        $post_type = 'attachment';
        if ( isset( $_GET['post_type'] ) ) {
            $post_type = sanitize_text_field( wp_unslash( $_GET['post_type'] ) );
        }
        if ( 'attachment' !== $post_type ) {
            return;
        }
        $selected = ( isset( $_GET['squeeze_filter'] ) ? sanitize_text_field( wp_unslash( $_GET['squeeze_filter'] ) ) : '' );
        $options = array(
            'all'          => __( 'Squeeze: All images', 'squeeze' ),
            'non-squeezed' => __( 'Non Squeezed Images', 'squeeze' ),
        );
        echo '<select name="squeeze_filter" id="squeeze-filter">';
        foreach ( $options as $value => $label ) {
            printf(
                '<option value="%s"%s>%s</option>',
                esc_attr( $value ),
                selected( $selected, $value, false ),
                esc_html( $label )
            );
        }
        echo '</select>';
    }

    public function media_filter_query( $query ) {
        global $current_screen;
        if ( !is_admin() || !empty( $current_screen ) && 'upload' !== $current_screen->base || 'attachment' !== $query->get( 'post_type' ) ) {
            return $query;
        }
        if ( isset( $_GET['squeeze_filter'] ) ) {
            $squeeze_filter = sanitize_text_field( wp_unslash( $_GET['squeeze_filter'] ) );
            if ( 'non-squeezed' === $squeeze_filter ) {
                $query->set( 'meta_query', array(
                    'relation' => 'OR',
                    array(
                        'key'     => 'squeeze_is_compressed',
                        'compare' => '!=',
                        'value'   => '1',
                    ),
                    array(
                        'key'     => 'squeeze_is_compressed',
                        'compare' => 'NOT EXISTS',
                    ),
                ) );
                $query->set( 'orderby', 'meta_value' );
                $query->set( 'post_mime_type', self::$SqueezeHelpers->get_image_formats( true ) );
            }
        }
        return $query;
    }

    public function media_filter_ajax_query( $query ) {
        if ( !isset( $_POST['query']['squeeze_filter'] ) ) {
            return $query;
        }
        $squeeze_filter = sanitize_text_field( wp_unslash( $_POST['query']['squeeze_filter'] ) );
        if ( 'non-squeezed' === $squeeze_filter ) {
            $query['meta_query'] = array(
                'relation' => 'OR',
                array(
                    'key'     => 'squeeze_is_compressed',
                    'compare' => '!=',
                    'value'   => '1',
                ),
                array(
                    'key'     => 'squeeze_is_compressed',
                    'compare' => 'NOT EXISTS',
                ),
            );
            $query['orderby'] = 'meta_value';
            $query['post_mime_type'] = self::$SqueezeHelpers->get_image_formats( true );
        }
        return $query;
    }

    public function svg_sprite_output() {
        global $pagenow;
        if ( $pagenow === 'upload.php' && isset( $_GET['page'] ) && $_GET['page'] === 'squeeze-bulk' ) {
            include self::$PLUGIN_DIR . 'assets/images/sprite.svg';
        }
    }

    public function add_preview_button_placeholder( $post ) {
        if ( !wp_attachment_is_image( $post->ID ) ) {
            return;
        }
        echo '<div class="squeeze-preview-button is-placeholder">';
        echo '<input type="checkbox" disabled class="squeeze-ios8-switch" id="squeeze-ios8-switch"><label for="squeeze-ios8-switch" title="' . esc_attr__( "Image comparison with Squeeze", "squeeze" ) . '">' . esc_html__( "Compare Squeeze", "squeeze" ) . ' ';
        echo sprintf( __( '(<a href="%s" target="_blank">premium only</a>)', 'squeeze' ), esc_url( self::$UPGRADE_URL ) ) . '</label>';
        echo '</div>';
    }

    public function incompatibility_notices() {
        // Bail if we're not in the admin or the screen helper isn't available.
        if ( !is_admin() || !function_exists( 'get_current_screen' ) ) {
            return;
        }
        $screen = get_current_screen();
        // List of screen IDs where we want the warning.
        $target_screens = array(
            'settings_page_squeeze',
            // options-general.php?page=squeeze
            'media_page_squeeze-bulk',
            // upload.php?page=squeeze-bulk
            'upload',
            // the core Media → Library (list table)
            'media',
            // the core Media → Add New
            'plugins',
        );
        if ( !in_array( $screen->id, $target_screens ) ) {
            return;
        }
        // check if webp-express/webp-express.php plugin is active and show a notice
        if ( is_plugin_active( 'webp-express/webp-express.php' ) ) {
            ?>
            <div class="notice notice-warning is-dismissible">
                <p>
                    <?php 
            echo __( 'The WebP Express plugin is active. Please deactivate it in order to use correct WebP serving from <strong>Squeeze plugin</strong>.', 'squeeze' );
            ?>
                </p>
            </div>
            <?php 
        }
        // check if image-converter-webp/image-converter-webp.php plugin is active and show a notice
        if ( is_plugin_active( 'image-converter-webp/image-converter-webp.php' ) ) {
            ?>
            <div class="notice notice-warning is-dismissible">
                <p>
                    <?php 
            echo __( 'The Image Converter for WebP plugin is active. Please deactivate it in order to use correct WebP serving from <strong>Squeeze plugin</strong>.', 'squeeze' );
            ?>
                </p>
            </div>
            <?php 
        }
    }

}
