/**
 * Scoring & Statistical Regression Engine
 * Computes daily Ops score (0-100), trend line slope/intercept, and color scales.
 */

const LIST_SECTIONS = {
  personalTodo: { weight: 8 },
  calls: { weight: 5 },
  todoLists: { weight: 12 },
  schedule: { weight: 10, timed: true },
  appointments: { weight: 0, timed: true }
};

const MOODS = [
  { k: 'great', e: '😄', label: 'Great' },
  { k: 'good', e: '🙂', label: 'Good' },
  { k: 'okay', e: '😐', label: 'Okay' },
  { k: 'low', e: '😕', label: 'Low' },
  { k: 'rough', e: '😣', label: 'Rough' }
];

const MOOD_SCORE = { great: 8, good: 6.4, okay: 4.8, low: 2.4, rough: 0 };

function computeScore(day) {
  if (!day) return 0;
  let score = 0;

  // 1. Top Priorities (wt 20)
  const priorities = day.priorities || [];
  if (priorities.length > 0) {
    const pDone = priorities.filter(p => p && p.done).length;
    score += (pDone / priorities.length) * 20;
  }

  // 2. Health & Fitness Habits (wt 20)
  const habits = (window.StorageModule && window.StorageModule.state && window.StorageModule.state.habits) || [];
  if (habits.length > 0) {
    const habitDoneMap = day.habitDone || {};
    const doneCount = habits.filter(h => habitDoneMap[h.id]).length;
    score += (doneCount / habits.length) * 20;
  }

  // 3. List Sections (Personal Todo wt 8, Calls wt 5, Todo Lists wt 12, Schedule wt 10)
  for (const key in LIST_SECTIONS) {
    const w = LIST_SECTIONS[key].weight;
    if (w === 0) continue;
    const items = day[key] || [];
    if (items.length > 0) {
      const done = items.filter(i => i && i.done).length;
      score += (done / items.length) * w;
    }
  }

  // 4. Water Intake (wt 10, max 8 cups)
  const waterCount = Math.max(0, Number(day.water) || 0);
  score += (Math.min(waterCount, 8) / 8) * 10;

  // 5. Daily Mood (wt 8)
  if (day.mood && MOOD_SCORE[day.mood] !== undefined) {
    score += MOOD_SCORE[day.mood];
  }

  // 6. Focus / Intensity Level (wt 7, 0-5 stars)
  const level = Math.max(0, Math.min(5, Number(day.priorityLevel) || 0));
  score += (level / 5) * 7;

  return Math.round(Math.max(0, Math.min(100, score)));
}

function linearRegression(points) {
  const n = points.length;
  if (n < 2) return null;

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += points[i].x;
    sumY += points[i].y;
    sumXY += points[i].x * points[i].y;
    sumXX += points[i].x * points[i].x;
  }

  const denom = (n * sumXX - sumX * sumX);
  if (denom === 0) return { slope: 0, intercept: sumY / n };

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

function cssVar(name) {
  const v = getComputedStyle(document.body).getPropertyValue(name);
  return v ? v.trim() : '';
}

function scoreToColor(score) {
  if (score >= 70) return cssVar('--teal') || '#49c8b8';
  if (score >= 40) return cssVar('--amber') || '#e8a94a';
  return cssVar('--red') || '#e5533d';
}

window.LIST_SECTIONS = LIST_SECTIONS;
window.MOODS = MOODS;
window.MOOD_SCORE = MOOD_SCORE;
window.computeScore = computeScore;
window.linearRegression = linearRegression;
window.scoreToColor = scoreToColor;
window.cssVar = cssVar;
