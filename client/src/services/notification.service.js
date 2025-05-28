import { ElMessage, ElNotification } from 'element-plus'

/**
 * Notification service for displaying alerts and notifications
 * All alerts will auto-dismiss after a specified duration
 */
class NotificationService {
  /**
   * Show a success message that auto-dismisses
   * @param {string} message - The message to display
   * @param {number} duration - Duration in ms before auto-dismiss (default: 3000ms)
   */
  success(message, duration = 3000) {
    ElMessage({
      message,
      type: 'success',
      duration,
      showClose: true
    })
  }

  /**
   * Show an error message that auto-dismisses
   * @param {string} message - The message to display
   * @param {number} duration - Duration in ms before auto-dismiss (default: 3000ms)
   */
  error(message, duration = 3000) {
    ElMessage({
      message,
      type: 'error',
      duration,
      showClose: true
    })
  }

  /**
   * Show a warning message that auto-dismisses
   * @param {string} message - The message to display
   * @param {number} duration - Duration in ms before auto-dismiss (default: 3000ms)
   */
  warning(message, duration = 3000) {
    ElMessage({
      message,
      type: 'warning',
      duration,
      showClose: true
    })
  }

  /**
   * Show an info message that auto-dismisses
   * @param {string} message - The message to display
   * @param {number} duration - Duration in ms before auto-dismiss (default: 3000ms)
   */
  info(message, duration = 3000) {
    ElMessage({
      message,
      type: 'info',
      duration,
      showClose: true
    })
  }

  /**
   * Show a more prominent notification with title and message
   * @param {string} title - The notification title
   * @param {string} message - The notification message
   * @param {string} type - The type of notification (success, error, warning, info)
   * @param {number} duration - Duration in ms before auto-dismiss (default: 4500ms)
   */
  notify(title, message, type = 'info', duration = 4500) {
    ElNotification({
      title,
      message,
      type,
      duration,
      showClose: true
    })
  }
}

export default new NotificationService()
