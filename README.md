# SariSariPos

Expo React Native POS app with Firebase Auth + Firestore.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure Firebase env vars in your shell or `.env` (Expo public vars):
   - `EXPO_PUBLIC_FIREBASE_API_KEY`
   - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
   - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `EXPO_PUBLIC_FIREBASE_APP_ID`
3. Run:
   ```bash
   npm run start
   ```

## Features Implemented

- Firebase email/password auth flow with loading gate.
- Firestore `onSnapshot` sync for `users/{uid}/inventory` and `users/{uid}/sales`.
- 6 tabs: POS, Cart, Inventory, Utang, Today, Reports.
- Required modals: variant picker, custom item, product form, utang prompt, record payment, receipt, confirmations.
- Core POS logic:
  - stock-aware cart management
  - checkout with cash/balance/change and utang tagging
  - inventory stock deduction on checkout
  - FIFO utang payment application
  - cash-basis analytics for Today and Reports.
