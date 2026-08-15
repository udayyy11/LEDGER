/**
 * Calendar View & Navigation Module
 * Renders an interactive monthly matrix modal with color-coded score badges.
 */

const CalendarModule = {
  viewYear: new Date().getFullYear(),
  viewMonth: new Date().getMonth(), // 0-indexed

  init() {
    this.bindEvents();
  },

  bindEvents() {
    const prevBtn = document.getElementById('calPrevMonth');
    const nextBtn = document.getElementById('calNextMonth');
    if (prevBtn) prevBtn.onclick = () => this.changeMonth(-1);
    if (nextBtn) nextBtn.onclick = () => this.changeMonth(1);
  },

  open() {
    const modal = document.getElementById('calendarModal');
    if (modal) {
      modal.classList.add('active');
      this.render();
    }
  },

  close() {
    const modal = document.getElementById('calendarModal');
    if (modal) modal.classList.remove('active');
  },

  changeMonth(delta) {
    this.viewMonth += delta;
    if (this.viewMonth < 0) {
      this.viewMonth = 11;
      this.viewYear--;
    } else if (this.viewMonth > 11) {
      this.viewMonth = 0;
      this.viewYear++;
    }
    this.render();
  },

  render() {
    const titleEl = document.getElementById('calTitle');
    const gridEl = document.getElementById('calGrid');
    if (!titleEl || !gridEl) return;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    titleEl.textContent = `${monthNames[this.viewMonth]} ${this.viewYear}`;

    gridEl.innerHTML = '';

    // Day headers
    const daysHeader = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    daysHeader.forEach(d => {
      const h = document.createElement('div');
      h.className = 'cal-day-header';
      h.textContent = d;
      gridEl.appendChild(h);
    });

    const firstDayIndex = new Date(this.viewYear, this.viewMonth, 1).getDay();
    const totalDays = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
    const todayKey = window.todayStr ? window.todayStr() : '';

    // Empty cells before start of month
    for (let i = 0; i < firstDayIndex; i++) {
      const empty = document.createElement('div');
      gridEl.appendChild(empty);
    }

    // Month days
    for (let d = 1; d <= totalDays; d++) {
      const dateKey = `${this.viewYear}-${String(this.viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayData = StorageModule.state.days[dateKey];
      const hasData = !!dayData;
      const score = hasData ? computeScore(dayData) : null;

      const cell = document.createElement('div');
      cell.className = 'cal-day-cell' + (dateKey === todayKey ? ' today' : '');

      const num = document.createElement('span');
      num.textContent = d;
      cell.appendChild(num);

      if (score !== null) {
        const badge = document.createElement('div');
        badge.className = 'cal-score-badge';
        badge.textContent = score;
        badge.style.backgroundColor = scoreToColor(score);
        badge.style.color = '#0b0e11';
        cell.appendChild(badge);
      }

      cell.onclick = () => {
        window.currentDate = dateKey;
        if (window.renderAll) window.renderAll();
        if (window.switchTab) window.switchTab('today');
        this.close();
        showToast(`Navigated to ${dateKey}`, 'info');
      };

      gridEl.appendChild(cell);
    }
  }
};

window.CalendarModule = CalendarModule;
