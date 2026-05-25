# FlashMind AI — an AI Flashcard Learning App
[![Full-Stack: Next.js](https://img.shields.io/badge/Frontend-Next.js-black?style=flat&logo=next.js)](https://nextjs.org/)
[![DB: MongoDB](https://img.shields.io/badge/DB-MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

## Problem Statement

Students and self-learners often struggle to create effective study materials efficiently. Traditional flashcard creation is time-consuming and may not cover topics comprehensively. **FlashMind AI** solves this by combining manual flashcard management with AI-powered generation, a chat-based "Discuss with AI" feature for deeper understanding, and a full authentication layer with role-based admin tools — so a teacher or platform owner can see how students are engaging with the content.

## Tech Stack

| Layer            | Technology                                                       |
| ---------------- | ---------------------------------------------------------------- |
| **Frontend**     | React 18 (via Next.js 14 App Router)                             |
| **Styling**      | Tailwind CSS 3 with full dark-mode support                       |
| **Routing**      | Client-side SPA — single `page.tsx`, tabs swap React subtrees    |
| **Animation**    | `@react-spring/web` (3D card flip, study deck transitions)       |
| **Backend**      | Next.js API Routes (App Router, serverless functions on Vercel)  |
| **Database**     | MongoDB Atlas (with Mongoose ODM)                                |
| **Auth**         | `bcryptjs` for password hashing · `jsonwebtoken` (JWT in httpOnly cookies) |
| **AI**           | OpenAI GPT-4o-mini via the Vercel AI SDK                         |
| **Analytics**    | Vercel Web Analytics                                             |
| **Hosting**      | Vercel                                                           |

## Features

### Flashcard learning (core)
- **Manual CRUD on flashcards** — create, edit, delete, browse via an intuitive modal interface
- **AI flashcard generation** — type any topic and OpenAI returns a batch of Q&A cards with detailed explanations
- **3D book-shelf metaphor** — each category renders as a 3D book; clicking opens it to reveal the cards inside
- **Card flip with `@react-spring/web`** — tactile spring-physics flip animation to reveal the answer
- **Study Mode** — sequential study flow with progress bar; cards exit the deck once marked as studied
- **Discuss with AI** — per-card chat panel that stores the conversation in MongoDB as embedded `notes`

### Search & filtering
- **Live full-text search** across question and answer fields, case-insensitive, with debounced state
- **Difficulty filter** — easy / medium / hard / all, combinable with search
- **Category navigation** — handled via the book shelf so each book IS a category filter

### Authentication & user accounts
- **Sign Up / Sign In modal** — username, email, password with both client-side and server-side validation
- **Passwords hashed with `bcryptjs`** at 12 salt rounds via a Mongoose pre-save hook — plaintext passwords are never stored
- **JWT session tokens** signed with `jsonwebtoken`, set as `httpOnly` cookies with a 7-day expiry, immune to XSS exfiltration
- **`/api/auth/me`** endpoint re-verifies the session on every page load so refresh keeps you signed in

### Admin tools (role-gated)
- **Admin tab** only renders when `user.role === "admin"` — both in the navigation and as a server-side guard on every admin API call
- **Dashboard summary** — four KPI tiles: Total Users · Total Cards · Cards by Users · Legacy/Anonymous Cards
- **Per-user statistics** — Cards Created · AI-Generated · Total Actions · Cards Viewed · Cards Studied · Discussions · Joined date · Last Active
- **Learning activity log** — every view/study/discuss action is logged to `view-history` with timestamps and shown to the admin in chronological order
- **User deletion** — with a confirmation modal and cascading delete of the user's learning history

### Polish & UX
- **Dark mode toggle** with system-preference detection and `localStorage` persistence
- **Mobile-first responsive design** — adapts from phone to desktop with no horizontal scroll
- **Toast notifications** (`react-hot-toast`) for every CRUD operation, success and failure
- **Loading states** — skeleton/spinner placeholders during async fetches
- **Form validation** — both client-side (immediate feedback) and server-side (Mongoose schema validators)
- **Animated transitions** — fade-in/scale-in/slide-down keyframes for tab switches and modals

## Folder Structure

```
flashcard-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout (Toaster, Vercel Analytics, fonts)
│   │   ├── page.tsx             # Main SPA — all views (cards/study/ai/admin) rendered here
│   │   ├── globals.css          # Tailwind layers, animations, design tokens
│   │   └── api/
│   │       ├── flashcards/
│   │       │   ├── route.ts                 # GET list / POST create
│   │       │   └── [id]/
│   │       │       ├── route.ts             # GET one / PUT update / DELETE
│   │       │       └── discuss/route.ts     # POST discuss-with-AI per card
│   │       ├── ai/generate/route.ts         # POST AI flashcard generation
│   │       ├── auth/
│   │       │   ├── register/route.ts        # POST sign-up
│   │       │   ├── login/route.ts           # POST sign-in
│   │       │   ├── logout/route.ts          # POST sign-out
│   │       │   ├── me/route.ts              # GET current session
│   │       │   └── profile/route.ts         # PATCH update email / password
│   │       ├── view-history/route.ts        # GET list / POST log learning event
│   │       └── admin/users/route.ts         # GET all users + stats / DELETE user (admin only)
│   ├── components/
│   │   ├── Header.tsx           # Sticky nav: tabs, dark mode toggle, user dropdown
│   │   ├── FlashcardCard.tsx    # Card with flip animation + edit/delete/discuss/onView
│   │   ├── StudyDeck.tsx        # Study mode with useTransition card animations
│   │   ├── CreateEditModal.tsx  # Modal for create/edit flashcard
│   │   ├── AIGenerator.tsx      # AI flashcard generation panel
│   │   ├── DiscussPanel.tsx     # Per-card AI chat drawer
│   │   ├── AuthModal.tsx        # Sign in / Sign up modal
│   │   ├── ProfileModal.tsx     # Edit email / change password modal
│   │   ├── AdminPanel.tsx       # Admin dashboard, user list, activity log
│   │   └── BookCard.tsx         # 3D book on the shelf
│   ├── hooks/
│   │   ├── useFlashcards.ts     # CRUD + AI generate + discuss + state
│   │   └── useAuth.ts           # Login / register / logout / session / log history
│   ├── lib/
│   │   ├── mongodb.ts           # Serverless-safe Mongoose connection cache
│   │   └── auth.ts              # JWT sign/verify + cookie helpers
│   └── models/
│       ├── Flashcard.ts         # Card schema with notes[] + createdBy
│       ├── User.ts              # User schema with bcrypt pre-save + comparePassword
│       └── ViewHistory.ts       # Per-user learning event log
├── data/
│   └── flashcards_export.json   # Sample database export (seed data)
├── scripts/
│   ├── seed.mjs                 # Seed flashcards from JSON
│   ├── seed-admin.mjs           # Create the default admin user
│   └── list-users.mjs           # Diagnostic — list all users + their roles
├── public/                       # Static assets
├── package.json
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
└── .env.example                  # Environment variable template
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works)
- OpenAI API key (only required for AI generation + Discuss features)

### Installation

```bash
# Clone the repository
git clone https://github.com/hellojasmine-work/flash-ai.git
cd flash-ai

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your values:
#   MONGODB_URI=mongodb+srv://...
#   OPENAI_API_KEY=sk-...
#   JWT_SECRET=<long random string — generate with `openssl rand -hex 32`>

# Seed the flashcard data (optional, but populates the demo)
npm run seed

# Create the default admin user
npm run seed-admin
# → admin@flashmind.com / admin123

# Start the dev server
npm run dev
```

Open http://localhost:3000.

### Deploy to Vercel

1. Push to GitHub.
2. Import the project at [vercel.com](https://vercel.com).
3. Add the same three env vars (`MONGODB_URI`, `OPENAI_API_KEY`, `JWT_SECRET`) in Vercel project settings.
4. In MongoDB Atlas → Network Access, whitelist `0.0.0.0/0` so Vercel's serverless functions can connect.
5. Run `npm run seed-admin` locally against the same Atlas cluster to provision the production admin user.

## API Endpoints

### Flashcards (all CRUD)
| Method | Path                              | Description                          |
| ------ | --------------------------------- | ------------------------------------ |
| GET    | `/api/flashcards`                 | List all (search/category/difficulty)|
| POST   | `/api/flashcards`                 | Create a new card                    |
| GET    | `/api/flashcards/:id`             | Read one card                        |
| PUT    | `/api/flashcards/:id`             | Update                               |
| DELETE | `/api/flashcards/:id`             | Delete                               |
| POST   | `/api/flashcards/:id/discuss`     | Send a discussion message            |
| POST   | `/api/ai/generate`                | AI-generate a batch of cards         |

### Auth
| Method | Path                          | Description                            |
| ------ | ----------------------------- | -------------------------------------- |
| POST   | `/api/auth/register`          | Sign up — bcrypt hash + JWT issued     |
| POST   | `/api/auth/login`             | Sign in — bcrypt compare + JWT issued  |
| POST   | `/api/auth/logout`            | Clear the JWT cookie                   |
| GET    | `/api/auth/me`                | Return the current session user        |
| PATCH  | `/api/auth/profile`           | Update email or password               |

### Admin (role-gated)
| Method | Path                                  | Description                                       |
| ------ | ------------------------------------- | ------------------------------------------------- |
| GET    | `/api/admin/users`                    | List users + per-user stats + dashboard summary   |
| DELETE | `/api/admin/users?id=...`             | Delete a user (cascade-deletes their history)     |

### View history (logged-in users)
| Method | Path                  | Description                              |
| ------ | --------------------- | ---------------------------------------- |
| GET    | `/api/view-history`   | Recent activity (admins see all)         |
| POST   | `/api/view-history`   | Log a view/study/discuss event           |

## Security Notes

- **Passwords are hashed with bcrypt at 12 salt rounds** before insert. Plaintext never reaches the database.
- **Session tokens are JWTs signed with a server-side secret**, stored as `httpOnly` cookies so JavaScript on the page cannot read them — defends against XSS token theft. Cookies are marked `Secure` in production and `SameSite=Lax`.
- **Admin actions verify role on the server** — the frontend's hidden Admin tab is a UX hint, not a security boundary. Every admin endpoint re-checks `session.role === "admin"` and returns 403 otherwise.
- **Input validation runs on both sides** — client-side for immediate feedback, server-side via Mongoose schema validators (regex on emails, length checks, enum constraints).

## Team

| Member | Responsibilities |
|--------|-----------------|
| **Katherine** | `StudyDeck.tsx` · `AdminPanel.tsx` · `ViewHistory` model · `api/view-history` · `api/admin/users` · `api/flashcards/route.ts` (user isolation fix) · `page.tsx` (refetch on auth) |
| **Hedy** | `AuthModal.tsx` · `ProfileModal.tsx` · `useAuth.ts` · `lib/auth.ts` · `lib/mongodb.ts` · `User` model · `api/auth/` |
| **Prachi** | `FlashcardCard.tsx` · `BookCard.tsx` · `CreateEditModal.tsx` · `Flashcard` model · `api/flashcards/` |
| **Jasmine** | `AIGenerator.tsx` · `DiscussPanel.tsx` · `api/ai/generate` · `api/flashcards/[id]/discuss` |
| **May** | `page.tsx` · `Header.tsx` · `useFlashcards.ts` · `StudyMode.tsx` · `layout.tsx` · `globals.css` · `tailwind.config.ts` |

## Challenges Overcome

Building a performant single-page application with Next.js App Router required careful client-side state management to avoid full page reloads — all four views (Cards, Study, AI Generate, Admin) live inside a single `page.tsx` and switch via React state. The 3D card flip animation needed precise stacking with `transform-style: preserve-3d` and `backface-visibility` to avoid visual glitches across browsers. Integrating the Vercel AI SDK with structured JSON output from GPT-4o-mini required robust parsing with markdown-fence stripping. Managing MongoDB connections in a serverless environment was solved by caching the Mongoose connection on `globalThis` to survive between Vercel Function invocations. Finally, this codebase was merged from two separate repositories (one branch added auth + admin features while the main branch refactored animations and seed data), which was resolved with a careful three-way merge plus history scrubbing to remove a leaked API key surfaced by GitHub's secret-scanning.
