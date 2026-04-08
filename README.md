# FlashMind AI — AI-Powered Flashcard Learning App

## Problem Statement

Students and self-learners often struggle to create effective study materials efficiently. Traditional flashcard creation is time-consuming and may not cover topics comprehensively. **FlashMind AI** solves this by combining manual flashcard management with AI-powered generation, allowing users to instantly create high-quality Q&A flashcards on any topic with detailed explanations.

## Tech Stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| **Frontend** | React 18 (via Next.js)              |
| **Styling**  | Tailwind CSS 3 with dark mode       |
| **Routing**  | Client-side SPA (single page.tsx)   |
| **Backend**  | Next.js 14 API Routes (App Router)  |
| **Database** | MongoDB Atlas (Mongoose ODM)        |
| **AI**       | OpenAI GPT-4o-mini (Vercel AI SDK)  |
| **Hosting**  | Vercel                              |

## Features

- **AI Flashcard Generation** — Enter any topic and AI creates comprehensive Q&A flashcards with detailed explanations
- **Manual CRUD** — Create, read, update, and delete flashcards through an intuitive modal interface
- **Study Mode** — Sequential study flow with flip-to-reveal animation; cards disappear once studied
- **Smart Filtering** — Filter by category, difficulty, and keyword search
- **Dark Mode Toggle** — Full dark/light theme support with system preference detection
- **Responsive Design** — Mobile-first layout that adapts seamlessly from phone to desktop
- **Card Flip Animation** — Smooth 3D CSS flip animation for revealing answers
- **Glassmorphism UI** — Modern frosted-glass header and polished visual design
- **Toast Notifications** — Real-time feedback for all CRUD operations
- **Input Validation** — Client-side and server-side validation with helpful error messages

## Folder Structure

```
flashcard-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with metadata and toast provider
│   │   ├── page.tsx            # Main SPA page (all views rendered here)
│   │   ├── globals.css         # Global styles, animations, Tailwind layers
│   │   └── api/
│   │       ├── flashcards/
│   │       │   ├── route.ts    # GET all / POST create
│   │       │   └── [id]/
│   │       │       └── route.ts # GET one / PUT update / DELETE
│   │       └── ai/
│   │           └── generate/
│   │               └── route.ts # POST — AI flashcard generation
│   ├── components/
│   │   ├── Header.tsx          # Navigation bar with tabs and dark mode toggle
│   │   ├── FlashcardCard.tsx   # Individual card with flip animation
│   │   ├── CreateEditModal.tsx # Modal form for creating/editing flashcards
│   │   ├── AIGenerator.tsx     # AI generation panel with topic suggestions
│   │   └── StudyMode.tsx       # Sequential study flow with progress tracking
│   ├── hooks/
│   │   └── useFlashcards.ts    # Custom hook for state management and API calls
│   ├── lib/
│   │   └── mongodb.ts          # MongoDB connection singleton (serverless-safe)
│   └── models/
│       └── Flashcard.ts        # Mongoose schema and model definition
├── data/
│   └── flashcards_export.json  # Sample database export (seed data)
├── scripts/
│   └── seed.mjs               # Database seed script
├── public/                     # Static assets
├── package.json
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
└── .env.example                # Environment variable template
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works)
- OpenAI API key (optional, for AI generation feature)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd flashcard-app

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your MongoDB URI and OpenAI key

# (Optional) Seed the database with sample data
npm run seed

# Start development server
npm run dev
```

### Deploy to Vercel

1. Push your repo to GitHub
2. Import the project on [vercel.com](https://vercel.com)
3. Add `MONGODB_URI` and `OPENAI_API_KEY` as environment variables
4. Deploy — Vercel auto-detects Next.js

## CRUD Operations

| Operation | Endpoint                  | Method | Description                    |
| --------- | ------------------------- | ------ | ------------------------------ |
| Create    | `/api/flashcards`         | POST   | Create a new flashcard         |
| Read      | `/api/flashcards`         | GET    | List all flashcards (filtered) |
| Read      | `/api/flashcards/:id`     | GET    | Get a single flashcard         |
| Update    | `/api/flashcards/:id`     | PUT    | Update a flashcard             |
| Delete    | `/api/flashcards/:id`     | DELETE | Delete a flashcard             |
| AI Gen    | `/api/ai/generate`        | POST   | Generate flashcards with AI    |

## Challenges Overcome

Building a performant single-page application with Next.js App Router required careful handling of client-side state to avoid full page reloads — all three views (Cards, Study, AI) are rendered within a single `page.tsx` and switched via React state. Implementing the 3D card flip animation with CSS `transform-style: preserve-3d` and `backface-visibility` demanded precise layering to prevent visual glitches across browsers. Integrating the Vercel AI SDK with structured JSON output from GPT-4o-mini required robust parsing with fallback handling for inconsistent AI responses. Finally, managing the MongoDB connection in a serverless environment (Vercel Functions) was solved by implementing a global connection cache to prevent connection pool exhaustion during hot reloads.
