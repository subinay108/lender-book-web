# LenderBook

A full-stack web application for local money lenders to manage borrowers, track loans, and monitor payments digitally.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Firebase (Authentication + Firestore)
- **State**: React Hooks + Context API
- **UI**: Mobile-first responsive design with custom components

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout + AuthProvider
│   ├── page.tsx                # Root redirect
│   ├── globals.css
│   ├── login/page.tsx          # Login page
│   ├── signup/page.tsx         # Signup page
│   ├── dashboard/page.tsx      # Dashboard with stats
│   ├── borrowers/
│   │   ├── page.tsx            # Borrowers list (search + filter)
│   │   ├── new/page.tsx        # Add borrower form
│   │   └── [id]/
│   │       ├── page.tsx        # Borrower detail + payment history
│   │       └── edit/page.tsx   # Edit borrower
│   ├── dues/page.tsx           # Overdue + upcoming dues
│   └── settings/page.tsx       # Profile + logout
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx          # Button variants
│   │   ├── Input.tsx           # Input, Select, Textarea
│   │   ├── Card.tsx            # Card, StatCard
│   │   └── index.tsx           # Badge, Avatar, Spinner, EmptyState, Alert
│   ├── borrowers/
│   │   ├── BorrowerForm.tsx    # Add/Edit borrower form
│   │   └── BorrowerCard.tsx    # Card + Row display variants
│   ├── payments/
│   │   ├── PaymentForm.tsx     # Record payment form
│   │   └── PaymentHistory.tsx  # Payment list timeline
│   └── layout/
│       └── AppShell.tsx        # Sidebar, MobileHeader, BottomNav, PageWrapper
│
├── context/
│   └── AuthContext.tsx         # Firebase auth state + useAuth hook
│
└── lib/
    ├── firebase/
    │   ├── config.ts           # Firebase initialization
    │   ├── auth.ts             # Auth functions (email, Google, logout)
    │   └── firestore.ts        # Full CRUD for borrowers + payments
    ├── hooks/
    │   ├── useBorrowers.ts     # Data fetching hooks
    │   ├── usePayments.ts      # Payment fetching hook
    │   └── withAuth.tsx        # Protected route HOC
    ├── types/
    │   └── index.ts            # TypeScript interfaces
    └── utils/
        ├── dates.ts            # Date formatting + comparison helpers
        └── index.ts            # cn(), getInitials(), formatCurrency()
```

---

## Setup Instructions

### 1. Clone and install

```bash
git clone <your-repo>
cd lenderbook
npm install
```

### 2. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add Project** → give it a name → Continue
3. Disable Google Analytics (optional) → Create Project

### 3. Enable Authentication

1. In Firebase Console → **Authentication** → **Get Started**
2. Under **Sign-in method**, enable:
   - **Email/Password**
   - **Google** (optional — set your project's public name + support email)

### 4. Create Firestore Database

1. Firebase Console → **Firestore Database** → **Create database**
2. Choose **Start in production mode** (or test mode for development)
3. Select your region → Done
4. Go to **Rules** tab and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Get Firebase config

1. Firebase Console → **Project Settings** (gear icon) → **Your apps**
2. Click **Add app** → Web (`</>`) → Register app
3. Copy the `firebaseConfig` object values

### 6. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Firebase values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 7. Run the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Firestore Data Model

```
users/
  {userId}/
    borrowers/
      {borrowerId}/
        name: string
        phone: string
        address: string
        loanAmount: number
        interestRate: number        # % per month (0 = interest-free)
        startDate: Timestamp
        dueDate: Timestamp
        repaymentFrequency: string  # daily | weekly | monthly | one-time
        notes?: string
        createdAt: Timestamp
        updatedAt: Timestamp

        payments/
          {paymentId}/
            amount: number
            type: string            # principal | interest | both
            date: Timestamp
            notes?: string
            createdAt: Timestamp
```

---

## Features

| Feature | Status |
|---|---|
| Email/password signup & login | ✅ |
| Google OAuth login | ✅ |
| Protected routes (auth guard) | ✅ |
| Dashboard with summary stats | ✅ |
| Add / Edit / Delete borrowers | ✅ |
| Search borrowers by name/phone | ✅ |
| Filter by All / Overdue / Due Today / Closed | ✅ |
| Borrower detail with loan summary | ✅ |
| Payment tracking (principal + interest) | ✅ |
| Payment history timeline | ✅ |
| Recovery progress bar | ✅ |
| Overdue detection | ✅ |
| Upcoming dues (30-day window) | ✅ |
| Due Tracker page | ✅ |
| Settings / Profile / Logout | ✅ |
| Password reset via email | ✅ |
| Responsive (mobile + desktop) | ✅ |
| Bottom nav (mobile) | ✅ |
| Sidebar (desktop) | ✅ |
| Loading states & error handling | ✅ |
| TypeScript throughout | ✅ |

---

## Deployment

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add all `NEXT_PUBLIC_FIREBASE_*` environment variables in the Vercel dashboard under **Project → Settings → Environment Variables**.

### Deploy to Firebase Hosting

```bash
npm run build
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

---

## Development Notes

- All Firebase calls are in `src/lib/firebase/` — easy to swap or extend
- `withAuth()` HOC wraps every protected page — no boilerplate in each page
- `BorrowerWithStats` enriches raw Firestore data with computed payment totals on the client
- Tailwind `brand-*` color scale maps to an amber/gold palette suitable for financial apps
- `formatCurrency()` uses `Intl.NumberFormat` with `en-IN` locale for Indian Rupee formatting
