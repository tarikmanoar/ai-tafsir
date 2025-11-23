# AI Tafsir - Copilot Instructions

## Project Overview
**AI Tafsir** is a React-based web application that provides an AI-powered Quran reading and research experience. It combines static Quranic data (text, translations) with dynamic AI features (semantic search, Tafsir generation, Surah overviews) using Google's Gemini API.

## Tech Stack
- **Framework**: React 19 + Vite 6
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS (Dark mode support via `dark` class)
- **Icons**: `lucide-react`
- **AI**: Google GenAI SDK (`@google/genai`)
- **Data Source**: `api.alquran.cloud` for Quran text/metadata

## Architecture & Core Concepts

### 1. Service Layer (`/services`)
Isolate external API interactions here. Do not make API calls directly in components.
- **`quranService.ts`**: Handles fetching static Quran data (Surah lists, Ayahs, translations).
  - *Pattern*: Fetches multiple editions (Arabic, Bengali, English) in a single call where possible.
- **`geminiService.ts`**: Handles all AI interactions.
  - *Pattern*: Uses `responseSchema` to enforce strict JSON output from the LLM.
  - *Pattern*: Prompts are embedded directly in service methods.

### 2. State Management
- Currently uses **local state** in `App.tsx` for global app state (current Surah, Ayah, View Mode, Theme).
- **Navigation**: Single-page architecture. Navigation is handled by changing state (`viewMode`, `currentSurah`, `currentAyahNum`), not via a router.

### 3. Type Definitions (`types.ts`)
- Centralized type definitions.
- **API Types**: `QuranApiResponse`, `Surah`, `AyahContent`.
- **App Types**: `AyahDisplayData`, `SearchResult`, `TafsirData`.
- *Rule*: Always define interfaces for API responses and component props.

## Development Workflows

### Environment Setup
- Required Environment Variable: `GEMINI_API_KEY`
- Configured in `vite.config.ts` to be exposed as `process.env.GEMINI_API_KEY`.

### Commands
- **Dev Server**: `npm run dev`
- **Build**: `npm run build`

## Coding Conventions

### AI & Prompts
- When modifying AI features in `geminiService.ts`, always ensure the `responseSchema` matches the TypeScript interface.
- Prompts should explicitly request JSON output and specify the language (Bengali/English) based on the user's preference.

### Localization
- The app supports **Bengali ('bn')** and **English ('en')**.
- *Rule*: All new UI text must handle both languages using the `language` state.
- *Rule*: AI prompts must dynamically adjust the requested output language.

### Styling (Tailwind)
- Use `slate` for grays and `emerald` for primary colors.
- **Dark Mode**: Always include `dark:` variants for colors.
  - Example: `bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100`
- **Fonts**: Use `font-sans` for English/UI and `font-bengali` (if configured) or fallback for Bengali text.

### Error Handling
- Services should `throw` errors.
- UI components (specifically `App.tsx`) should `catch` errors and set an `error` state to display user-friendly messages.

## Navigation
- **Juz Navigation**: Sidebar supports switching between Surah and Juz (Para) lists.
- **Verse of the Day**: Displayed on the home/search screen.

## Key Files
- `App.tsx`: Main controller, layout, and state container.
- `services/geminiService.ts`: AI logic and prompt engineering.
- `services/quranService.ts`: Quran data fetching logic.
- `types.ts`: Shared interfaces.
