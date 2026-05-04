# FlashMind AI — Q&A Prep for Tutorial Demo

---

## 1. Architecture & Tech Stack

**Q: Why did you choose Next.js over plain React?**

Next.js gives me both frontend and backend in one project. The API Routes act as serverless functions, so I don't need a separate Express or FastAPI server. This simplifies deployment on Vercel — I just push to GitHub and it auto-deploys. Next.js also handles things like automatic code splitting, image optimization, and TypeScript support out of the box.

**Q: Why MongoDB instead of MySQL?**

MongoDB's document model maps naturally to flashcards — each card is a self-contained JSON document with nested data like the `notes` array for AI discussions. With MySQL, I'd need a separate join table for notes. MongoDB Atlas also offers a free tier that integrates well with Vercel's serverless architecture — no connection pooling issues like you'd get with traditional SQL on serverless.

**Q: How does your app connect to the database in a serverless environment?**

In `src/lib/mongodb.ts`, I use a global connection cache. Since Vercel spins up a new function instance for each request, naively calling `mongoose.connect()` every time would exhaust the connection pool. My solution caches the connection on the global object — if a warm function instance already has a connection, it reuses it. If not, it creates a new one.

---

## 2. SPA Behavior

**Q: How is this a single-page application if you're using Next.js?**

Everything runs inside a single `page.tsx`. The three views — My Cards, Study, and AI Generate — are all rendered conditionally based on a React state variable called `activeTab`. When you click a tab, it updates `activeTab` and React re-renders the appropriate component. There's no page navigation or URL change — it's all client-side state swapping, which is the core SPA pattern.

**Q: Where is the routing handled?**

There's no traditional routing. I use `useState("cards")` for `activeTab`, and the main page renders different components based on its value: `"cards"` shows the book grid / card list, `"study"` shows StudyDeck, and `"ai"` shows AIGenerator. All within a single `page.tsx` file — no Next.js file-based routing is used for the frontend.

---

## 3. CRUD Operations

**Q: Walk me through the four CRUD operations in your app.**

- **Create**: Users can manually create a flashcard via the "New Card" button, which opens `CreateEditModal`. The form sends a POST to `/api/flashcards`. AI generation also creates cards via POST to `/api/ai/generate`.
- **Read**: On page load, `useFlashcards` hook calls GET `/api/flashcards` to fetch all cards. Users can also filter by category, difficulty, and search text — these are passed as query parameters.
- **Update**: Clicking the pencil icon on a card opens the same modal in edit mode. It sends a PUT to `/api/flashcards/[id]` with the updated fields.
- **Delete**: Clicking the trash icon shows a confirmation dialog. On confirm, it sends DELETE to `/api/flashcards/[id]`. The card is removed from state immediately for instant UI feedback.

**Q: How do you handle validation?**

Both client-side and server-side. The modal checks that question, answer, and category are non-empty before submitting. On the server, Mongoose schema validation enforces required fields, max lengths (e.g., question max 500 chars), and enum values for difficulty. If validation fails, the API returns a 400 error with a descriptive message.

---

## 4. AI Features

**Q: How does the AI flashcard generation work?**

The user enters a topic (e.g., "JavaScript Closures"), selects how many cards and difficulty level, and hits Generate. This calls POST `/api/ai/generate`, which sends a prompt to OpenAI's GPT-4o-mini model asking it to return a JSON array of flashcard objects with question, answer, and explanation. I parse the response, save each card to MongoDB with `isAIGenerated: true`, and update the frontend state.

**Q: What happens if the AI returns invalid JSON?**

I have a try-catch around `JSON.parse()`. Before parsing, I strip any markdown code fences (` ```json `) that the model sometimes wraps around the output. If it still fails, I return a 500 error with a user-friendly message: "AI returned invalid format. Please try again."

**Q: How does the "Discuss with AI" feature work?**

Each flashcard has a `notes` array that stores conversation messages. When a user opens the Discuss panel and sends a message, it goes to POST `/api/flashcards/[id]/discuss`. The API builds a conversation context from the card's question, answer, and explanation, includes previous discussion history, appends the new user message, and sends it all to GPT-4o-mini. The AI's response is saved as a new note on the card, creating a persistent discussion thread.

**Q: What if the OpenAI API key isn't configured?**

The AI endpoints check for `process.env.OPENAI_API_KEY` at the start of each request. If it's missing, they return a 503 status with a message saying AI features require the key. The core CRUD functionality works perfectly without it.

---

## 5. Frontend & UX

**Q: How did you implement the card flip animation?**

I use React Spring (`@react-spring/web`) for physics-based animations. Each `FlashcardCard` has a `useSpring` hook that interpolates `rotateY` between 0° and 180° with CSS `transform-style: preserve-3d`. The front and back faces use `backface-visibility: hidden` so only the facing side is visible. React Spring's tension/friction config gives it a natural, springy feel rather than a linear transition.

**Q: How does the Study mode work?**

When entering Study, users see their categories as 3D "book" cards. Clicking a book opens that deck. Cards appear in a stacked layout — you see the current card plus two behind it. Flip to see the answer, then hit "Got it!" to mark it studied. That card moves to a "studied pile" at the bottom. Once all cards are done, a completion screen shows up. The card disappears from the study queue after use, as required by the spec.

**Q: How did you handle dark mode?**

I use Tailwind's `darkMode: "class"` strategy. A `useEffect` in the Header checks `localStorage` first, then falls back to the system's `prefers-color-scheme` media query. Toggling adds/removes the `dark` class on `<html>`. All components use Tailwind's `dark:` prefix for dark variants. The preference persists across sessions via `localStorage`.

**Q: How is the app responsive?**

I use Tailwind's responsive prefixes (`sm:`, `lg:`, `xl:`) throughout. The card grid goes from 1 column on mobile to 2-3 on tablet to 4 on desktop. The search bar and filter controls stack vertically on mobile and go horizontal on desktop. The study card adjusts padding and font size with `sm:` breakpoints. The header hides tab labels on mobile, showing only icons.

---

## 6. State Management

**Q: How do you manage state across the app?**

I centralized all data and API logic in a custom hook called `useFlashcards`. It holds the flashcards array, loading/error states, and filter settings. It exposes functions like `createFlashcard`, `updateFlashcard`, `deleteFlashcard`, `generateWithAI`, and `discussWithAI`. The main `page.tsx` calls this hook once and passes data/callbacks down to child components as props.

**Q: Why not use Redux or Context API?**

The app is small enough that a single custom hook at the page level is sufficient. All state flows one way: `useFlashcards` → `page.tsx` → child components. There's no deeply nested prop drilling problem since the component tree is only 2 levels deep. Adding Redux would be over-engineering for this scope.

---

## 7. Database Design

**Q: Show me your data model.**

```javascript
{
  question: String (required, max 500),
  answer: String (required, max 2000),
  explanation: String (optional, max 3000),
  category: String (required, max 50),
  difficulty: "easy" | "medium" | "hard" (default: "medium"),
  isAIGenerated: Boolean (default: false),
  notes: [{
    role: "user" | "assistant",
    content: String (max 5000),
    createdAt: Date
  }],
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

I also have indexes on `category` and `createdAt` for efficient queries.

**Q: Why did you embed notes inside the flashcard document instead of a separate collection?**

Notes are always accessed alongside their parent flashcard — you never query notes independently. The notes array won't grow unboundedly since each card has a limited conversation. Embedding gives me atomic reads (one query gets everything) and avoids the need for `$lookup` joins. It also stays well within MongoDB's 16MB document limit.

---

## 8. Code Quality & Error Handling

**Q: How do you handle API errors on the frontend?**

Every API call in `useFlashcards` checks the response's `success` field. If false, it throws with the error message. The calling component catches this and shows a toast notification (via `react-hot-toast`). For the initial data load, there's a dedicated error state that shows a full-screen error message with a "Try again" button.

**Q: What happens if the database is down?**

The `connectDB()` function will throw, which is caught by the API route's try-catch. It returns a 500 JSON response with `{ success: false, error: "Failed to fetch flashcards" }`. On the frontend, the error state renders with a warning icon and message instead of a blank screen.

**Q: How is your code organized?**

- `/components` — 8 UI components, each with a single responsibility
- `/hooks` — Custom hook for data management and API calls
- `/lib` — Database connection utility
- `/models` — Mongoose schema definitions
- `/app/api` — 4 API route files handling all HTTP endpoints

Each file has JSDoc comments explaining its purpose, and complex logic blocks have inline comments.

---

## 9. Deployment

**Q: How did you deploy this?**

I pushed to a public GitHub repo and imported it into Vercel. Vercel auto-detects Next.js and configures the build. I added two environment variables in Vercel's dashboard: `MONGODB_URI` (pointing to MongoDB Atlas) and `OPENAI_API_KEY`. MongoDB Atlas is configured to allow access from any IP (0.0.0.0/0) since Vercel uses dynamic IPs — the database is still protected by credentials.

**Q: Any challenges with deployment?**

The main challenge was MongoDB connections in serverless. Each Vercel function invocation could create a new connection, potentially exhausting the pool. I solved it with the global connection cache pattern in `mongodb.ts`. Another issue was MongoDB Atlas's IP whitelist — Vercel doesn't have static IPs, so I had to allow all IPs and rely on authentication for security.
