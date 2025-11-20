# Fake News Seminar Game

A Kahoot-style interactive game for university presentations about fake news detection, built with Next.js, Firebase, and Tailwind CSS.

## Features

- 🎮 Real-time multiplayer game experience with Firestore synchronization
- 📱 Mobile-first responsive design
- 🌍 Full localization support (English, Hebrew, Arabic) with automatic font switching
- 🎯 4 rounds of fake news detection gameplay
- 👥 Separate Admin and Player interfaces
- 📊 Leaderboard with ranking categories (Victim, Truth Explorer, Lie Investigator, Lie Hunter)
- 📱 QR code scanning for easy player joining
- ⏱️ Timer-based rounds with skip functionality
- 🎨 Playful, modern UI with framer-motion animations

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Set up Firebase:**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication → Sign-in method → Anonymous (enable it)
   - Enable Firestore Database → Create database → Start in test mode
   - Go to Project Settings → General → Your apps → Web app → Copy config
   - Create `.env.local` file in the root directory (see below)

3. **Configure environment variables:**
   Create `.env.local` with your Firebase config:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. **Run the development server:**
```bash
npm run dev
```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## How to Use

### Admin Flow:
1. Go to the home page and click "Create Game"
2. A QR code and PIN will be generated
3. Players scan the QR code or enter the PIN to join
4. Click "Start Game" when players are ready
5. Control rounds with "Next Round" button
6. View final results and leaderboard

### Player Flow:
1. Scan QR code or enter PIN from home page
2. Enter your name
3. Wait in lobby until admin starts the game
4. Answer sentences as Fake or True in each round
5. View your score and ranking at the end

## Game Rounds

- **Round 1:** 7 sentences (5 fake + 2 true) - 2 minute timer
- **Round 2:** 7 sentences (4 from Round 1: 3 fake + 1 true, 2 new fake + 1 new true)
- **Round 3:** 7 sentences (2 fake from Round 2, 2 rephrased fake, 1 new true, 1 new fake, 1 true from previous)
- **Results:** Final scores and leaderboard with categories

## Scoring Categories

- **Victim (0-59 points):** Needs more practice
- **Truth Explorer (60-79 points):** Good detector
- **Lie Investigator (80-89 points):** Excellent skills
- **Lie Hunter (90-100 points):** Master detector

## Technologies

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS 3.4.4** - Styling
- **Firebase Authentication** - Anonymous auth
- **Firestore** - Real-time database
- **framer-motion** - Animations
- **lucide-react** - Icons
- **qrcode.react** - QR code generation

## Localization

The app supports three languages:
- **English** (Ubuntu font) - LTR
- **Hebrew** (Heebo font) - RTL
- **Arabic** (Cairo font) - RTL

Language can be switched using the language selector in the top-right corner.

## License

This project is for educational purposes.

