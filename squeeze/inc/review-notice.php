<?php
namespace SqueezeFree;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Soft wordpress.org review prompt after several successful squeezes.
 */
class SqueezeReviewNotice extends SqueezeInit {

	const THRESHOLD   = 5;
	const SNOOZE_DAYS = 30;
	const OPTION_COUNT = 'squeeze_success_count';
	const USER_META    = 'squeeze_review_notice';
	const REVIEW_URL   = 'https://wordpress.org/support/plugin/squeeze/reviews/#new-post';

	public function __construct() {
		add_action( 'admin_notices', array( $this, 'maybe_render' ) );
		add_action( 'wp_ajax_squeeze_dismiss_review', array( $this, 'ajax_dismiss' ) );
		add_action( 'squeeze_successful_squeeze', array( $this, 'increment_success_count' ) );
	}

	/**
	 * Bump the site-wide success counter (one per successfully squeezed image).
	 */
	public function increment_success_count() {
		$count = get_option( self::OPTION_COUNT, null );
		if ( null === $count ) {
			$count = $this->seed_success_count();
		}
		update_option( self::OPTION_COUNT, (int) $count + 1, false );
	}

	/**
	 * @return int
	 */
	public function get_success_count() {
		$count = get_option( self::OPTION_COUNT, null );
		if ( null === $count ) {
			return $this->seed_success_count();
		}
		return (int) $count;
	}

	/**
	 * First-time seed from already-compressed attachments (existing installs).
	 *
	 * @return int
	 */
	private function seed_success_count() {
		global $wpdb;
		$seed = (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM {$wpdb->postmeta} WHERE meta_key = %s AND meta_value = %s",
				'squeeze_is_compressed',
				'1'
			)
		);
		update_option( self::OPTION_COUNT, $seed, false );
		return $seed;
	}

	/**
	 * @return bool
	 */
	public function should_display() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return false;
		}
		if ( ! $this->is_target_screen() ) {
			return false;
		}
		if ( $this->is_dismissed() ) {
			return false;
		}
		return $this->get_success_count() >= self::THRESHOLD;
	}

	/**
	 * @return bool
	 */
	private function is_target_screen() {
		if ( ! function_exists( 'get_current_screen' ) ) {
			return false;
		}
		$screen = get_current_screen();
		if ( ! $screen ) {
			return false;
		}
		$target_screens = array(
			'settings_page_squeeze',
			'media_page_squeeze-bulk',
			'upload',
			'attachment',
		);
		return in_array( $screen->id, $target_screens, true );
	}

	/**
	 * @return bool
	 */
	private function is_dismissed() {
		$user_id = get_current_user_id();
		if ( ! $user_id ) {
			return true;
		}
		$value = get_user_meta( $user_id, self::USER_META, true );
		if ( 'dismissed' === $value ) {
			return true;
		}
		if ( is_numeric( $value ) && (int) $value > time() ) {
			return true; // snoozed until timestamp
		}
		return false;
	}

	public function maybe_render() {
		if ( ! $this->should_display() ) {
			return;
		}

		$review_url = self::REVIEW_URL;
		?>
		<div class="notice notice-info squeeze-review-notice" id="squeeze-review-notice">
			<p>
				<strong><?php esc_html_e( 'Enjoying Squeeze?', 'squeeze' ); ?></strong>
				<?php esc_html_e( 'If the plugin helped you shrink your images, would you mind leaving a quick 5-star review? It really helps other WordPress users find it.', 'squeeze' ); ?>
			</p>
			<p>
				<a class="button button-primary" href="<?php echo esc_url( $review_url ); ?>" target="_blank" rel="noopener noreferrer">
					<?php esc_html_e( 'Leave a review', 'squeeze' ); ?>
				</a>
				&nbsp;
				<button type="button" class="button button-secondary" data-squeeze-review-dismiss="snooze">
					<?php esc_html_e( 'Maybe later', 'squeeze' ); ?>
				</button>
				&nbsp;
				<button type="button" class="button-link" data-squeeze-review-dismiss="dismiss">
					<?php esc_html_e( 'Already did / Don\'t show again', 'squeeze' ); ?>
				</button>
			</p>
		</div>
		<script>
		(function () {
			const notice = document.getElementById('squeeze-review-notice');
			if (!notice) return;
			notice.addEventListener('click', function (e) {
				const btn = e.target.closest('[data-squeeze-review-dismiss]');
				if (!btn) return;
				e.preventDefault();
				const action = btn.getAttribute('data-squeeze-review-dismiss');
				const body = new FormData();
				body.append('action', 'squeeze_dismiss_review');
				body.append('_ajax_nonce', <?php echo wp_json_encode( wp_create_nonce( 'squeeze-nonce' ) ); ?>);
				body.append('dismiss_action', action);
				fetch(<?php echo wp_json_encode( admin_url( 'admin-ajax.php' ) ); ?>, {
					method: 'POST',
					credentials: 'same-origin',
					body: body
				}).finally(function () {
					notice.style.display = 'none';
				});
			});
		})();
		</script>
		<?php
	}

	public function ajax_dismiss() {
		check_ajax_referer( 'squeeze-nonce', '_ajax_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( null, 403 );
		}

		$user_id = get_current_user_id();
		$action  = isset( $_POST['dismiss_action'] ) ? sanitize_key( wp_unslash( $_POST['dismiss_action'] ) ) : 'dismiss';

		if ( 'snooze' === $action ) {
			$until = time() + ( DAY_IN_SECONDS * self::SNOOZE_DAYS );
			update_user_meta( $user_id, self::USER_META, $until );
		} else {
			update_user_meta( $user_id, self::USER_META, 'dismissed' );
		}

		wp_send_json_success();
	}
}
