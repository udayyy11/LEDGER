/**
 * Authentication Module
 * Handles Firebase Authentication states, login, signup, and logout workflows.
 */

const AuthModule = {
  currentUser: null,

  init() {
    if (window.isFirebaseActive && window.firebaseAuth) {
      window.firebaseAuth.onAuthStateChanged((user) => {
        this.currentUser = user;
        this.updateAuthUI(user);

        if (user) {
          showToast(`Signed in as ${user.email || 'Google User'}`, 'success');
          // Trigger Firestore sync when authenticated
          if (window.StorageModule) {
            window.StorageModule.syncFromCloud();
          }
        } else {
          this.updateAuthUI(null);
        }
      });
    } else {
      this.updateAuthUI(null);
    }
  },

  updateAuthUI(user) {
    const badge = document.getElementById('userBadge');
    const badgeText = document.getElementById('userBadgeText');
    const statusDot = document.getElementById('userStatusDot');

    if (!badge || !badgeText || !statusDot) return;

    if (user) {
      badgeText.textContent = user.displayName || user.email.split('@')[0];
      statusDot.className = 'status-dot online';
      badge.title = `Logged in as ${user.email} (Click to manage)`;
    } else if (window.isFirebaseActive) {
      badgeText.textContent = 'Sign In';
      statusDot.className = 'status-dot local';
      badge.title = 'Click to sign in with Firebase';
    } else {
      badgeText.textContent = 'Local Demo';
      statusDot.className = 'status-dot local';
      badge.title = 'Running in Local Storage Mode';
    }
  },

  async signUpWithEmail(email, password) {
    if (!window.isFirebaseActive) {
      throw new Error('Firebase is not configured. Please add your credentials in js/firebase-config.js');
    }
    return await window.firebaseAuth.createUserWithEmailAndPassword(email, password);
  },

  async signInWithEmail(email, password) {
    if (!window.isFirebaseActive) {
      throw new Error('Firebase is not configured. Please add your credentials in js/firebase-config.js');
    }
    return await window.firebaseAuth.signInWithEmailAndPassword(email, password);
  },

  async signInWithGoogle() {
    if (!window.isFirebaseActive) {
      throw new Error('Firebase is not configured. Please add your credentials in js/firebase-config.js');
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    return await window.firebaseAuth.signInWithPopup(provider);
  },

  async logout() {
    if (window.isFirebaseActive && window.firebaseAuth) {
      await window.firebaseAuth.signOut();
      showToast('Logged out cleanly', 'info');
      window.location.reload();
    }
  }
};

window.AuthModule = AuthModule;
