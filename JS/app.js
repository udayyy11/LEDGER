/**
 * Main Application Bootstrapper & Controller
 * Orchestrates initialization, state loading, date navigation, tab switching, and event listeners.
 */

let currentDate = todayStr();
let currentYear = new Date().getFullYear();
let activeTab = 'today';

window.currentDate = currentDate;
window.currentYear = currentYear;

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
window.todayStr = todayStr;

function changeDate(delta) {
  const parts = window.currentDate.split('-');
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  d.setDate(d.getDate() + delta);
  window.currentDate = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  renderAll();
}

function jumpToday() {
  window.currentDate = todayStr();
  renderAll();
  showToast('Jumped to Today', 'info');
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  
  const todayView = document.getElementById('today');
  const dashView = document.getElementById('dashboard');

  if (todayView) todayView.style.display = tab === 'today' ? 'grid' : 'none';
  if (dashView) dashView.style.display = tab === 'dashboard' ? 'block' : 'none';

  if (tab === 'dashboard') {
    renderDashboard();
  }
}

function renderAll() {
  const dateLabel = document.getElementById('dateLabel');
  if (dateLabel) dateLabel.textContent = fmtDateLabel(window.currentDate);

  renderScoreStamp();
  renderPriorities();
  renderHabits();
  for (const key in LIST_SECTIONS) renderListSection(key);
  renderWater();
  renderMeals();
  renderExpenses();
  renderMood();
  renderStars();
  renderNotes();

  if (activeTab === 'dashboard') {
    renderDashboard();
  }
}

/* Theme Toggle */
function toggleTheme() {
  const isLight = document.body.classList.toggle('light-theme');
  localStorage.setItem('ledgerTheme', isLight ? 'light' : 'dark');
  const toggleBtn = document.getElementById('themeToggle');
  if (toggleBtn) toggleBtn.textContent = isLight ? '☀️' : '🌙';
  renderAll();
  showToast(`Switched to ${isLight ? 'Light' : 'Dark'} mode`, 'info');
}

function initTheme() {
  const saved = localStorage.getItem('ledgerTheme');
  if (saved === 'light') {
    document.body.classList.add('light-theme');
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) toggleBtn.textContent = '☀️';
  }
}

/* Toast Notifications */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icon = type === 'success' ? '✓' : type === 'error' ? '⚠️' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 3000);
}

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
  StorageModule.init();
  initTheme();
  AuthModule.init();
  CalendarModule.init();
  NotificationsModule.init();
  renderAll();
});

window.changeDate = changeDate;
window.jumpToday = jumpToday;
window.switchTab = switchTab;
window.renderAll = renderAll;
window.toggleTheme = toggleTheme;
window.showToast = showToast;
