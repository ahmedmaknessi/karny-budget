# Karny Budget

> Personal finance, under control — offline-first, cloud-synced, beautifully minimal.

Karny Budget is a mobile app for tracking expenses, managing budgets, and reaching savings goals. It works fully offline and syncs to the cloud in the background.

---

## Features

- **Expense & Income Tracking** — Log transactions across multiple accounts with categories, notes, and receipt photos
- **Budget Management** — Set monthly budgets per category with visual progress and alerts at 80% and 100% thresholds
- **Savings Goals** — Define goals with a target amount, deadline, and emoji — track progress over time
- **Multi-Account Support** — Manage cash, bank, and mobile wallet accounts in multiple currencies
- **Offline-First** — All data lives locally in SQLite; changes sync to the cloud automatically when online
- **CSV Export** — Export filtered transactions to a CSV file and share directly from the app
- **Biometric Login** — Face ID and fingerprint authentication support
- **Multi-Language** — English, French, and Arabic (with RTL support)
- **Dark & Light Theme** — System preference detection with manual override

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.85 · Expo 56 · Expo Router |
| Language | TypeScript |
| UI | NativeWind (Tailwind CSS) · Moti · Reanimated 4 |
| Charts | Victory Native · React Native Skia |
| State | Zustand · TanStack React Query |
| Local DB | Expo SQLite · Drizzle ORM |
| Backend | Supabase (Auth + PostgreSQL) |
| Auth | Email OTP · Google OAuth |
| Build | EAS Build |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)

### Install

```bash
git clone https://github.com/ahmedmaknessi/karny-budget.git
cd karny-budget
npm install
```

### Environment Variables

Create a `.env` file at the root:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
EXPO_PUBLIC_OPEN_EXCHANGE_RATES_APP_ID=your_app_id
```

### Run

```bash
npx expo start
```

### Build (Android APK)

```bash
# Cloud build via EAS
eas build --platform android --profile preview

# Local build (requires Android SDK)
npx expo prebuild --platform android
cd android && .\gradlew.bat assembleDebug
```

---

## Project Structure

```
app/
  (auth)/          # Login, OTP verification, onboarding
  (app)/           # Main screens behind auth guard
    index.tsx      # Dashboard
    transactions   # Transaction list & filters
    budgets        # Monthly budget tracking
    goals          # Savings goals
    settings       # Preferences & account
components/        # Reusable UI components
lib/
  auth/            # OTP + Google OAuth
  db/              # SQLite client & migrations
  hooks/           # Data fetching & mutations
  sync/            # Offline sync engine
  notifications/   # Budget alert triggers
store/             # Zustand state stores
i18n/              # Translations (en, fr, ar)
drizzle/           # DB schema & migrations
```

---

## Architecture

Karny Budget uses an **offline-first** architecture:

1. All writes go to local SQLite immediately
2. Changes are queued in a `syncQueue` table
3. A background sync engine processes the queue and upserts to Supabase
4. The UI reflects local state instantly — sync status is shown via a dot indicator

This means the app is fully functional without internet, and data eventually converges to the cloud.

---

## License

Private — all rights reserved.
