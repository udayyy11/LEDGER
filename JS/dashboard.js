/**
 * Dashboard & Year Analytics Engine
 * Renders SVG Year Ring, Stat Cards, Habit Breakdown, & Proactive AI Insights.
 */

function isLeap(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function daysInYear(y) {
  return isLeap(y) ? 366 : 365;
}

function changeYear(delta) {
  window.currentYear += delta;
  renderDashboard();
}

function renderDashboard() {
  const yearLabel = document.getElementById('yearLabel');
  if (yearLabel) yearLabel.textContent = window.currentYear;

  const yearDays = [];
  const total = daysInYear(window.currentYear);
  const d0 = new Date(window.currentYear, 0, 1);

  for (let i = 0; i < total; i++) {
    const dt = new Date(d0);
    dt.setDate(d0.getDate() + i);
    const key = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');

    const dayData = StorageModule.state.days[key];
    const hasData = !!dayData;
    const score = hasData ? computeScore(dayData) : null;
    yearDays.push({ key, score, month: dt.getMonth() });
  }

  buildYearRing(yearDays, total);
  buildStats(yearDays);
  buildHabitBreakdown(yearDays);
  buildInsights(yearDays);

  if (window.ChartsModule) {
    window.ChartsModule.renderCharts(yearDays);
  }
}

function buildYearRing(yearDays, total) {
  const svg = document.getElementById('yearRingSvg');
  if (!svg) return;

  const cx = 180, cy = 180, rInner = 110, rOuter = 155;
  let html = '';
  const todayKey = window.todayStr ? window.todayStr() : '';
  const noDataColor = cssVar('--ink-faint') || '#8b98a3';
  const labelColor = cssVar('--ink-dim') || '#8b98a3';

  yearDays.forEach((d, i) => {
    const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + rInner * Math.cos(angle);
    const y1 = cy + rInner * Math.sin(angle);
    const x2 = cx + rOuter * Math.cos(angle);
    const y2 = cy + rOuter * Math.sin(angle);

    let color = noDataColor;
    let opacity = 0.28;
    if (d.score !== null) {
      color = scoreToColor(d.score);
      opacity = 0.95;
    }

    const isToday = d.key === todayKey;
    html += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"
      stroke="${color}" stroke-width="${isToday ? 3.5 : 1.6}" stroke-linecap="round" opacity="${opacity}">
      <title>${d.key}${d.score !== null ? ' — score ' + d.score : ' — no data'}</title>
      </line>`;
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let m = 0; m < 12; m++) {
    const angle = (m / 12) * 2 * Math.PI - Math.PI / 2;
    const lx = cx + (rOuter + 18) * Math.cos(angle);
    const ly = cy + (rOuter + 18) * Math.sin(angle);
    html += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" fill="${labelColor}" font-size="10" font-family="IBM Plex Mono" text-anchor="middle" dominant-baseline="middle">${months[m]}</text>`;
  }

  html += `<circle cx="${cx}" cy="${cy}" r="${rInner - 8}" fill="none" stroke="${cssVar('--line')}" stroke-width="1"/>`;
  svg.innerHTML = html;

  svg.querySelectorAll('line').forEach((line, i) => {
    line.addEventListener('mouseenter', () => {
      const d = yearDays[i];
      const tooltip = document.getElementById('ringTooltip');
      if (tooltip) {
        tooltip.textContent = d.score !== null ? `${d.key} — Ops Score: ${d.score}` : `${d.key} — No data logged`;
      }
    });
  });
}

function buildStats(yearDays) {
  const logged = yearDays.filter(d => d.score !== null);
  const avg = logged.length ? Math.round(logged.reduce((a, b) => a + b.score, 0) / logged.length) : 0;
  const best = logged.length ? Math.max(...logged.map(d => d.score)) : 0;

  // Streak: consecutive logged days with score >= 50
  let streak = 0;
  const todayKey = window.todayStr ? window.todayStr() : '';
  let idx = yearDays.findIndex(d => d.key === todayKey);
  if (idx === -1) idx = yearDays.length - 1;

  for (let i = idx; i >= 0; i--) {
    if (yearDays[i].score !== null && yearDays[i].score >= 50) streak++;
    else break;
  }

  document.getElementById('statAvg').textContent = avg;
  document.getElementById('statStreak').textContent = streak;
  document.getElementById('statBest').textContent = best;
  document.getElementById('statLogged').textContent = logged.length;

  const projEl = document.getElementById('statProjected');
  const badge = document.getElementById('trendBadge');

  if (logged.length >= 3) {
    const pts = yearDays.map((d, i) => ({ x: i, y: d.score })).filter(p => p.y !== null);
    const reg = linearRegression(pts);
    if (reg) {
      const predicted = Math.round(Math.max(0, Math.min(100, reg.slope * (yearDays.length - 1) + reg.intercept)));
      projEl.textContent = predicted;

      const perMonth = reg.slope * 30;
      if (perMonth > 1) {
        badge.className = 'trend-badge up';
        badge.textContent = '↑ improving';
      } else if (perMonth < -1) {
        badge.className = 'trend-badge down';
        badge.textContent = '↓ declining';
      } else {
        badge.className = 'trend-badge flat';
        badge.textContent = '→ stable';
      }
    }
  } else {
    projEl.textContent = '—';
    badge.className = 'trend-badge flat';
    badge.textContent = 'log 3+ days';
  }
}

function buildHabitBreakdown(yearDays) {
  const c = document.getElementById('habitBreakdown');
  if (!c) return;
  c.innerHTML = '';

  const habits = StorageModule.state.habits || [];
  if (!habits.length) {
    c.innerHTML = '<div style="font-size:12px;color:var(--ink-faint);">Add habits in the Today view to see consistency analytics here.</div>';
    return;
  }

  habits.forEach(h => {
    let doneCount = 0, total = 0;
    yearDays.forEach(d => {
      const day = StorageModule.state.days[d.key];
      if (day) {
        total++;
        if (day.habitDone && day.habitDone[h.id]) doneCount++;
      }
    });

    const pct = total ? Math.round((doneCount / total) * 100) : 0;
    const row = document.createElement('div');
    row.className = 'habit-bar-row';
    row.innerHTML = `<div class="hlbl"><b>${h.name}</b><span>${pct}% (${doneCount}/${total})</span></div>
      <div class="hbar-track"><div class="hbar-fill" style="width:${pct}%;"></div></div>`;
    c.appendChild(row);
  });
}

function buildInsights(yearDays) {
  const list = document.getElementById('insightList');
  if (!list) return;
  list.innerHTML = '';

  const logged = yearDays.filter(d => d.score !== null);
  const insights = [];

  if (!logged.length) {
    insights.push(`No days logged yet for <b>${window.currentYear}</b>. Fill in today's ledger to start building your score engine.`);
  } else {
    const avg = Math.round(logged.reduce((a, b) => a + b.score, 0) / logged.length);
    insights.push(`Your average day score in <b>${window.currentYear}</b> is <b>${avg}/100</b> across ${logged.length} logged day(s).`);

    // Weakest category evaluation
    const catTotals = { priorities: 0, habits: 0, personalTodo: 0, calls: 0, todoLists: 0, water: 0, schedule: 0, mood: 0, priorityLevel: 0 };
    const catMax = { priorities: 20, habits: 20, personalTodo: 8, calls: 5, todoLists: 12, water: 10, schedule: 10, mood: 8, priorityLevel: 7 };
    let n = 0;

    logged.forEach(d => {
      const day = StorageModule.state.days[d.key];
      if (!day) return;
      n++;

      catTotals.priorities += ((day.priorities || []).filter(p => p && p.done).length / 3) * 20;
      const hIds = (StorageModule.state.habits || []).map(h => h.id);
      catTotals.habits += hIds.length ? (hIds.filter(id => day.habitDone && day.habitDone[id]).length / hIds.length) * 20 : 0;

      for (const key in LIST_SECTIONS) {
        if (LIST_SECTIONS[key].weight === 0) continue;
        const items = day[key] || [];
        catTotals[key] += items.length ? (items.filter(i => i && i.done).length / items.length) * LIST_SECTIONS[key].weight : 0;
      }

      catTotals.water += (Math.min(Number(day.water) || 0, 8) / 8) * 10;
      catTotals.mood += day.mood && MOOD_SCORE[day.mood] ? MOOD_SCORE[day.mood] : 0;
      catTotals.priorityLevel += (Number(day.priorityLevel) / 5) * 7;
    });

    let weakest = null, weakestPct = 101;
    const niceName = {
      priorities: 'Top Priorities', habits: 'Health & Fitness habits', personalTodo: 'Personal To-Dos',
      calls: 'Calls & Emails', todoLists: 'To-Do Lists', water: 'Water intake', schedule: 'Daily Schedule',
      mood: 'Daily Mood', priorityLevel: 'Focus rating'
    };

    if (n > 0) {
      for (const k in catTotals) {
        const pct = (catTotals[k] / (catMax[k] * n)) * 100;
        if (pct < weakestPct) {
          weakestPct = pct;
          weakest = k;
        }
      }
      if (weakest) {
        insights.push(`<b>${niceName[weakest]}</b> is your lowest performing category this year at <b>${Math.round(weakestPct)}%</b> completion. Great target for improvement!`);
      }
    }

    // Trend & Longest Streak Insights
    if (logged.length >= 3) {
      const pts = yearDays.map((d, i) => ({ x: i, y: d.score })).filter(p => p.y !== null);
      const reg = linearRegression(pts);
      if (reg) {
        const predicted = Math.round(Math.max(0, Math.min(100, reg.slope * (yearDays.length - 1) + reg.intercept)));
        const perMonth = reg.slope * 30;
        const direction = perMonth > 1 ? 'trending upward' : perMonth < -1 ? 'trending downward' : 'holding steady';
        insights.push(`Based on recent linear regression trends, your score is <b>${direction}</b> and projected to reach <b>${predicted}/100</b>.`);
      }
    }

    let bestStreak = 0, cur = 0;
    yearDays.forEach(d => {
      if (d.score !== null && d.score >= 50) {
        cur++;
        bestStreak = Math.max(bestStreak, cur);
      } else cur = 0;
    });
    insights.push(`Your longest streak of high performance (50+ score) this year is <b>${bestStreak} day(s)</b>.`);
  }

  insights.forEach(t => {
    const li = document.createElement('li');
    li.innerHTML = t;
    list.appendChild(li);
  });
}

window.changeYear = changeYear;
window.renderDashboard = renderDashboard;