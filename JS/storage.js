/**
 * Unified Storage Module
 * Manages LocalStorage persistence & real-time Cloud Firestore synchronization.
 */

const STORAGE_KEY = 'ledgerState';

function blankDay() {
  return {
    priorities: [{ text: '', done: false }, { text: '', done: false }, { text: '', done: false }],
    habitDone: {},
    personalTodo: [],
    calls: [],
    todoLists: [],
    schedule: [],
    appointments: [],
    water: 0,
    meals: { breakfast: '', lunch: '', dinner: '', snacks: '' },
    expenses: [],
    moneyReported: '',
    mood: null,
    priorityLevel: 0,
    notesTomorrow: ''
  };
}

const StorageModule = {
  state: null,
  firestoreUnsubscribe: null,

  init() {
    this.state = this.loadLocalState();
    return this.state;
  },

  loadLocalState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!parsed.habits) parsed.habits = [];
        if (!parsed.days) parsed.days = {};
        return parsed;
      }
    } catch (e) {
      console.warn("Failed loading state from LocalStorage:", e);
    }
    return { habits: [], days: {} };
  },

  saveState() {
    // 1. Save to LocalStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn("Failed saving state to LocalStorage:", e);
    }

    // 2. Save to Firestore if authenticated & active
    if (window.isFirebaseActive && window.firebaseAuth && window.firebaseAuth.currentUser) {
      const uid = window.firebaseAuth.currentUser.uid;
      const userRef = window.firebaseDb.collection('users').doc(uid);

      userRef.set({
        habits: this.state.habits,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true }).catch(err => console.error("Firestore user sync error:", err));

      // Sync active date's day object
      if (window.currentDate && this.state.days[window.currentDate]) {
        userRef.collection('days').doc(window.currentDate).set(
          this.state.days[window.currentDate]
        ).catch(err => console.error("Firestore day sync error:", err));
      }
    }
  },

  getDay(dateStr) {
    if (!this.state.days[dateStr]) {
      this.state.days[dateStr] = blankDay();
    }
    const d = this.state.days[dateStr];
    const b = blankDay();

    // Backfill missing keys cleanly
    for (const k in b) {
      if (d[k] === undefined) d[k] = b[k];
    }
    if (!d.meals) d.meals = b.meals;

    return d;
  },

  async syncFromCloud() {
    if (!window.isFirebaseActive || !window.firebaseAuth || !window.firebaseAuth.currentUser) return;

    const uid = window.firebaseAuth.currentUser.uid;
    const userRef = window.firebaseDb.collection('users').doc(uid);

    try {
      // Fetch user habits
      const userDoc = await userRef.get();
      if (userDoc.exists && userDoc.data().habits) {
        this.state.habits = userDoc.data().habits;
      }

      // Fetch all recorded days
      const daysSnapshot = await userRef.collection('days').get();
      daysSnapshot.forEach(doc => {
        this.state.days[doc.id] = doc.data();
      });

      this.saveState();
      if (window.renderAll) window.renderAll();
      showToast('Cloud data synchronized!', 'success');
    } catch (err) {
      console.error("Cloud sync failed:", err);
    }
  }
};

window.StorageModule = StorageModule;
window.blankDay = blankDay;
