/**
 * UI Renderer Module
 * Handles rendering and user interaction for the Today Ops view.
 */

function fmtDateLabel(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return d.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}

function renderScoreStamp() {
  const day = StorageModule.getDay(window.currentDate);
  const score = computeScore(day);
  const circumference = 2 * Math.PI * 15;
  const offset = circumference - (score / 100) * circumference;

  const arc = document.getElementById('stampArc');
  if (arc) {
    arc.setAttribute('stroke-dasharray', circumference.toFixed(1));
    arc.setAttribute('stroke-dashoffset', offset.toFixed(1));
    arc.setAttribute('stroke', scoreToColor(score));
  }

  const valEl = document.getElementById('stampVal');
  if (valEl) valEl.textContent = score;

  const bigEl = document.getElementById('stampBig');
  if (bigEl) bigEl.textContent = score + '/100';
}

function makeItemRow(section, item, extra) {
  const row = document.createElement('div');
  row.className = 'item-row';

  const chk = document.createElement('div');
  chk.className = 'chk' + (item.done ? ' on' : '');
  chk.onclick = () => {
    item.done = !item.done;
    StorageModule.saveState();
    window.renderAll();
    if (item.done) showToast('Task completed!', 'success');
  };
  row.appendChild(chk);

  if (extra && extra.timed) {
    const t = document.createElement('input');
    t.className = 'item-time';
    t.value = item.time || '';
    t.placeholder = '--:--';
    t.oninput = () => {
      item.time = t.value;
      StorageModule.saveState();
    };
    row.appendChild(t);
  }

  const txt = document.createElement('input');
  txt.className = 'item-text' + (item.done ? ' done' : '');
  txt.value = item.text || '';
  txt.placeholder = 'Item details...';
  txt.oninput = () => {
    item.text = txt.value;
    StorageModule.saveState();
  };
  row.appendChild(txt);

  const rm = document.createElement('button');
  rm.className = 'rm-btn';
  rm.textContent = '✕';
  rm.title = 'Remove item';
  rm.onclick = () => {
    const arr = extra && extra.arr;
    if (arr) {
      const idx = arr.indexOf(item);
      if (idx > -1) arr.splice(idx, 1);
      StorageModule.saveState();
      window.renderAll();
    }
  };
  row.appendChild(rm);

  return row;
}

function renderPriorities() {
  const day = StorageModule.getDay(window.currentDate);
  const c = document.getElementById('priorityItems');
  if (!c) return;
  c.innerHTML = '';

  day.priorities.forEach((p, idx) => {
    const row = document.createElement('div');
    row.className = 'item-row';

    const chk = document.createElement('div');
    chk.className = 'chk' + (p.done ? ' on' : '');
    chk.onclick = () => {
      p.done = !p.done;
      StorageModule.saveState();
      window.renderAll();
    };
    row.appendChild(chk);

    const txt = document.createElement('input');
    txt.className = 'item-text' + (p.done ? ' done' : '');
    txt.value = p.text || '';
    txt.placeholder = `Priority #${idx + 1}...`;
    txt.oninput = () => {
      p.text = txt.value;
      StorageModule.saveState();
    };
    row.appendChild(txt);

    c.appendChild(row);
  });
}

function renderHabits() {
  const day = StorageModule.getDay(window.currentDate);
  const c = document.getElementById('habitItems');
  if (!c) return;
  c.innerHTML = '';

  const habits = StorageModule.state.habits || [];

  if (!habits.length) {
    const p = document.createElement('div');
    p.style.cssText = 'font-size:12px;color:var(--ink-faint);padding:4px 0;';
    p.textContent = 'No habits added yet — create one below.';
    c.appendChild(p);
    return;
  }

  habits.forEach(h => {
    const row = document.createElement('div');
    row.className = 'item-row';

    const isDone = !!day.habitDone[h.id];
    const chk = document.createElement('div');
    chk.className = 'chk' + (isDone ? ' on' : '');
    chk.onclick = () => {
      day.habitDone[h.id] = !isDone;
      StorageModule.saveState();
      window.renderAll();
      if (!isDone) showToast(`Habit finished: ${h.name}`, 'success');
    };
    row.appendChild(chk);

    const txt = document.createElement('div');
    txt.style.cssText = `flex:1;font-size:13px;${isDone ? 'color:var(--ink-faint);text-decoration:line-through;' : 'color:var(--ink);'}`;
    txt.textContent = h.name;
    row.appendChild(txt);

    const rm = document.createElement('button');
    rm.className = 'rm-btn';
    rm.textContent = '✕';
    rm.title = 'Delete habit';
    rm.onclick = () => {
      StorageModule.state.habits = StorageModule.state.habits.filter(x => x.id !== h.id);
      StorageModule.saveState();
      window.renderAll();
    };
    row.appendChild(rm);

    c.appendChild(row);
  });
}

function addHabit() {
  const inp = document.getElementById('habitInput');
  if (!inp) return;
  const v = inp.value.trim();
  if (!v) return;

  const id = Math.random().toString(36).slice(2, 9);
  StorageModule.state.habits.push({ id, name: v });
  inp.value = '';
  StorageModule.saveState();
  window.renderAll();
  showToast('New habit added', 'info');
}

function renderListSection(key) {
  const day = StorageModule.getDay(window.currentDate);
  const c = document.getElementById(key + 'Items');
  if (!c) return;
  c.innerHTML = '';

  const extra = { timed: LIST_SECTIONS[key].timed, arr: day[key] };
  (day[key] || []).forEach(item => {
    c.appendChild(makeItemRow(key, item, extra));
  });
}

function addItem(key) {
  const day = StorageModule.getDay(window.currentDate);
  const inp = document.getElementById(key + 'Input');
  if (!inp) return;
  const v = inp.value.trim();
  if (!v) return;

  const item = { text: v, done: false };
  if (LIST_SECTIONS[key].timed) {
    const timeInp = document.getElementById(key === 'schedule' ? 'scheduleTimeInput' : 'apptTimeInput');
    if (timeInp) {
      item.time = timeInp.value.trim();
      timeInp.value = '';
    }
  }

  if (!day[key]) day[key] = [];
  day[key].push(item);
  inp.value = '';
  StorageModule.saveState();
  window.renderAll();
}

function renderWater() {
  const day = StorageModule.getDay(window.currentDate);
  const row = document.getElementById('waterRow');
  if (!row) return;
  row.innerHTML = '';

  for (let i = 1; i <= 8; i++) {
    const cup = document.createElement('div');
    cup.className = 'cup' + (i <= day.water ? ' filled' : '');
    cup.title = `${i} cup(s)`;
    cup.onclick = () => {
      // Toggle logic: click highest active cup to decrement, otherwise set to clicked i
      day.water = (day.water === i) ? i - 1 : i;
      StorageModule.saveState();
      window.renderAll();
    };
    row.appendChild(cup);
  }

  const lbl = document.getElementById('waterLabel');
  if (lbl) lbl.textContent = `${day.water} / 8 cups (${(day.water * 250)} ml)`;
}

function renderMeals() {
  const day = StorageModule.getDay(window.currentDate);
  ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(m => {
    const el = document.getElementById(`meal-${m}`);
    if (el) el.value = day.meals[m] || '';
  });
}

function updateMeal(k, v) {
  const day = StorageModule.getDay(window.currentDate);
  day.meals[k] = v;
  StorageModule.saveState();
}

function renderExpenses() {
  const day = StorageModule.getDay(window.currentDate);
  const list = document.getElementById('expList');
  if (!list) return;
  list.innerHTML = '';

  let total = 0;
  (day.expenses || []).forEach((e, idx) => {
    total += Number(e.amount) || 0;
    const row = document.createElement('div');
    row.className = 'exp-item';
    row.innerHTML = `<span>${e.desc}</span><span class="mono">₹${e.amount}</span>`;

    const rm = document.createElement('button');
    rm.className = 'rm-btn';
    rm.style.opacity = '1';
    rm.textContent = '✕';
    rm.onclick = () => {
      day.expenses.splice(idx, 1);
      StorageModule.saveState();
      window.renderAll();
    };
    row.appendChild(rm);
    list.appendChild(row);
  });

  const totalEl = document.getElementById('expTotal');
  if (totalEl) totalEl.textContent = '₹' + total;

  const moneyInp = document.getElementById('moneyReported');
  if (moneyInp) moneyInp.value = day.moneyReported || '';
}

function addExpense() {
  const day = StorageModule.getDay(window.currentDate);
  const descEl = document.getElementById('expDesc');
  const amtEl = document.getElementById('expAmt');
  if (!descEl || !amtEl) return;

  const desc = descEl.value.trim();
  const amt = amtEl.value;
  if (!desc || !amt) return;

  if (!day.expenses) day.expenses = [];
  day.expenses.push({ desc, amount: amt });

  descEl.value = '';
  amtEl.value = '';
  StorageModule.saveState();
  window.renderAll();
}

function updateMoneyReported(v) {
  const day = StorageModule.getDay(window.currentDate);
  day.moneyReported = v;
  StorageModule.saveState();
}

function renderMood() {
  const day = StorageModule.getDay(window.currentDate);
  const row = document.getElementById('moodRow');
  if (!row) return;
  row.innerHTML = '';

  MOODS.forEach(m => {
    const b = document.createElement('div');
    b.className = 'mood-btn' + (day.mood === m.k ? ' on' : '');
    b.textContent = m.e;
    b.title = m.label;
    b.onclick = () => {
      day.mood = (day.mood === m.k) ? null : m.k;
      StorageModule.saveState();
      window.renderAll();
    };
    row.appendChild(b);
  });
}

function renderStars() {
  const day = StorageModule.getDay(window.currentDate);
  const row = document.getElementById('starRow');
  if (!row) return;
  row.innerHTML = '';

  for (let i = 1; i <= 5; i++) {
    const s = document.createElement('span');
    s.className = 'star' + (i <= day.priorityLevel ? ' on' : '');
    s.textContent = '★';
    s.title = `Focus Level ${i}`;
    s.onclick = () => {
      day.priorityLevel = (day.priorityLevel === i) ? i - 1 : i;
      StorageModule.saveState();
      window.renderAll();
    };
    row.appendChild(s);
  }
}

function renderNotes() {
  const day = StorageModule.getDay(window.currentDate);
  const el = document.getElementById('notesTomorrow');
  if (el) el.value = day.notesTomorrow || '';
}

function updateNotes(v) {
  const day = StorageModule.getDay(window.currentDate);
  day.notesTomorrow = v;
  StorageModule.saveState();
}

window.fmtDateLabel = fmtDateLabel;
window.renderScoreStamp = renderScoreStamp;
window.renderPriorities = renderPriorities;
window.renderHabits = renderHabits;
window.addHabit = addHabit;
window.renderListSection = renderListSection;
window.addItem = addItem;
window.renderWater = renderWater;
window.renderMeals = renderMeals;
window.updateMeal = updateMeal;
window.renderExpenses = renderExpenses;
window.addExpense = addExpense;
window.updateMoneyReported = updateMoneyReported;
window.renderMood = renderMood;
window.renderStars = renderStars;
window.renderNotes = renderNotes;
window.updateNotes = updateNotes;
