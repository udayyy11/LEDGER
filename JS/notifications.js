/**
 * Browser Push Notifications & Reminders Module
 * Requests notification permissions and schedules periodic check-in alerts.
 */

const NotificationsModule = {
  isSupported: 'Notification' in window,
  permission: 'Notification' in window ? Notification.permission : 'denied',

  init() {
    this.updateUI();
  },

  async requestPermission() {
    if (!this.isSupported) {
      showToast('Notifications are not supported by your browser.', 'error');
      return false;
    }

    try {
      const res = await Notification.requestPermission();
      this.permission = res;
      this.updateUI();

      if (res === 'granted') {
        showToast('Notifications enabled!', 'success');
        this.sendNotification('LEDGER Notifications Enabled', {
          body: 'You will receive daily check-in reminders for your tasks & habits.',
          icon: 'assets/logo.svg'
        });
        return true;
      } else {
        showToast('Notification permission denied.', 'error');
        return false;
      }
    } catch (e) {
      console.warn("Notification error:", e);
      return false;
    }
  },

  sendNotification(title, options = {}) {
    if (this.permission === 'granted') {
      new Notification(title, {
        icon: 'assets/logo.svg',
        ...options
      });
    }
  },

  updateUI() {
    const btn = document.getElementById('notifToggleBtn');
    if (btn) {
      if (this.permission === 'granted') {
        btn.textContent = '🔔 Notifications Active';
        btn.style.color = 'var(--teal)';
      } else {
        btn.textContent = '🔕 Enable Reminders';
        btn.style.color = 'var(--ink-dim)';
      }
    }
  }
};

window.NotificationsModule = NotificationsModule;
