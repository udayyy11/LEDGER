/**
 * Chart.js & Visualization Manager Module
 * Manages interactive Monthly & Daily performance charts with theme awareness.
 */

const ChartsModule = {
  monthChartInstance: null,
  dailyChartInstance: null,

  renderCharts(yearDays) {
    if (typeof Chart === 'undefined') {
      console.warn("Chart.js not loaded. Visualizing fallback SVG charts.");
      return;
    }

    this.renderMonthChart(yearDays);
    this.renderDailyChart(yearDays);
  },

  renderMonthChart(yearDays) {
    const ctx = document.getElementById('monthChartCanvas');
    if (!ctx) return;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthAvg = [];

    for (let m = 0; m < 12; m++) {
      const inMonth = yearDays.filter(d => d.month === m && d.score !== null);
      monthAvg.push(inMonth.length ? Math.round(inMonth.reduce((a, b) => a + b.score, 0) / inMonth.length) : null);
    }

    const amber = cssVar('--amber') || '#e8a94a';
    const teal = cssVar('--teal') || '#49c8b8';
    const textDim = cssVar('--ink-dim') || '#8b98a3';
    const lineSoft = cssVar('--line-soft') || '#232c34';

    if (this.monthChartInstance) {
      this.monthChartInstance.destroy();
    }

    this.monthChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Monthly Avg Score',
          data: monthAvg,
          borderColor: amber,
          backgroundColor: 'rgba(73, 200, 184, 0.15)',
          borderWidth: 2.5,
          tension: 0.35,
          fill: true,
          pointBackgroundColor: teal,
          pointBorderColor: amber,
          pointRadius: 4,
          spanGaps: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `Avg Score: ${ctx.raw}/100`
            }
          }
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            grid: { color: lineSoft },
            ticks: { color: textDim, font: { family: 'IBM Plex Mono' } }
          },
          x: {
            grid: { display: false },
            ticks: { color: textDim, font: { family: 'IBM Plex Mono' } }
          }
        }
      }
    });
  },

  renderDailyChart(yearDays) {
    const ctx = document.getElementById('dailyChartCanvas');
    if (!ctx) return;

    const labels = yearDays.map(d => d.key);
    const data = yearDays.map(d => d.score);

    const violet = cssVar('--violet') || '#9b8cf2';
    const textDim = cssVar('--ink-dim') || '#8b98a3';
    const lineSoft = cssVar('--line-soft') || '#232c34';

    if (this.dailyChartInstance) {
      this.dailyChartInstance.destroy();
    }

    this.dailyChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Daily Score',
          data: data,
          borderColor: violet,
          borderWidth: 1.5,
          tension: 0.1,
          pointRadius: 2,
          pointHoverRadius: 5,
          spanGaps: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ctx.raw !== null ? `Score: ${ctx.raw}/100` : 'No log'
            }
          }
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            grid: { color: lineSoft },
            ticks: { color: textDim, font: { family: 'IBM Plex Mono' } }
          },
          x: {
            grid: { display: false },
            ticks: {
              color: textDim,
              font: { family: 'IBM Plex Mono' },
              maxTicksLimit: 12
            }
          }
        }
      }
    });
  }
};

window.ChartsModule = ChartsModule;
