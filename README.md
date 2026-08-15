# LEDGER — Daily Ops & Year Dashboard

**LEDGER** is a high-performance, privacy-first personal operational dashboard and daily score tracking system. Track priorities, habits, to-dos, meals, water intake, expenses, and mood with a dynamic year ring visualization and trend engine.

![LEDGER Banner](assets/logo.svg)

## Features

- ⚡ **Daily Ops Score Engine**: Real-time scoring based on completion of priorities, habits, scheduled blocks, water intake, mood, and focus ratings.
- ⭕ **Year Ring & Analytics**: Visual 365-day heat ring, Chart.js monthly/daily score trends, habit consistency breakdown, and linear regression projections.
- 🔒 **Firebase Authentication & Firestore Cloud Sync**: Supports Email/Password & Google Sign-In with real-time multi-device cloud synchronization.
- 💾 **Offline & Local-Only Demo Mode**: Works fully offline with zero setup using browser `localStorage` when Firebase is not connected.
- 📅 **Interactive Calendar Modal**: Heatmap calendar grid allowing fast jumps to any day of the year.
- 🔔 **Browser Notifications**: Configurable daily task and habit check-in reminders.
- 🎨 **Dark / Light Theme System**: Glassmorphic UI with animated floating ambient background mesh.
- 📱 **Fully Responsive**: Optimized for phones, tablets, laptops, and desktop screens.

## Project Structure

```
ledger/
├── index.html              # Main dashboard application shell
├── login.html              # Authentication & login interface
├── assets/
│   └── logo.svg            # SVG vector logo asset
├── css/
│   ├── stly.css            # Base styles, CSS variables, glassmorphism, animations
│   ├── auth.css            # Login/signup page styles
│   └── responsive.css      # Mobile, tablet & desktop media queries
├── js/
│   ├── firebase-config.js  # Firebase SDK configuration & demo mode fallback
│   ├── auth.js             # Firebase Authentication handlers
│   ├── storage.js          # Unified storage layer (Firestore + LocalStorage)
│   ├── scoring.js          # Day scoring logic & linear regression engine
│   ├── ui.js               # Today view interactive UI renderers
│   ├── dashboard.js        # Year Ring & analytics dashboards
│   ├── charts.js           # Chart.js visualization management
│   ├── calendar.js         # Interactive calendar grid modal
│   ├── notifications.js    # Browser Push Notifications API integration
│   └── app.js              # Application entry point & event wiring
├── README.md
└── .gitignore
```

## How to Run Locally

1. Clone or download the repository.
2. Open `index.html` directly in any web browser, or serve it using a local static web server:
   ```bash
   npx serve .
   # or Python HTTP server
   python -m http.server 8000
   ```
3. Open `http://localhost:8000` in your browser.

## Firebase Setup (Optional)

To enable Cloud Backup & Sync:
1. Create a free project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Email/Password & Google providers).
3. Create a **Cloud Firestore** database in test/production mode.
4. Replace the credentials in `js/firebase-config.js` with your Firebase web app configuration object.
5. Click **Cloud Sync** in the header or visit `login.html` to log in!

## GitHub Pages Deployment

1. Push your repository to GitHub.
2. Navigate to **Settings** > **Pages** in your GitHub repository.
3. Select `main` branch and root `/` folder as the build source.
4. Save and your site will be live at `https://<username>.github.io/<repo-name>/`!

---

License: MIT
