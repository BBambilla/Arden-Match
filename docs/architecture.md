# Architecture & Data Flow

This document outlines the technical architecture of the **Arden Match** MVP. The application is designed as a **Client-Side Single Page Application (SPA)** to ensure low latency and offline resilience during festival events.

## 1. High-Level Architecture

```mermaid
graph TD
    User[Student] --> UI[React UI]
    UI --> State[Local State (React)]
    State --> Logic[Matching Engine]
    Logic --> Data[jobs.ts (Static DB)]
    
    subgraph AI Processing
    Logic -- Matches + User Profile --> Gemini[Google Gemini API]
    Gemini -- Persona Analysis --> Logic
    end
    
    subgraph Data Persistence
    UI -- Survey Answers --> LocalStorage[Browser LocalStorage]
    Admin[Admin User] -- Request Export --> CSV[CSV Generator]
    CSV <-- Read Data -- LocalStorage
    end
```

## 2. Component Structure (`index.tsx`)

The app is orchestrated by a single `App` component that manages the screen transitions via state.

1.  **IntroScreen:** Landing page with branding and "Start" trigger. Contains the hidden Admin CSV download button.
2.  **SetupScreen:** 
    *   Collects Name, Program, Passions, Happiness Triggers, Strengths.
    *   **AvatarSelection:** Sub-component handling visual identity. Logic switches clothing assets based on `ProgramType`.
3.  **SwipingScreen:**
    *   **Deck Logic:** initializes a stack of cards filtered by the user's `ProgramType`.
    *   **SwipeCard:** Renders the job profile. Uses `framer-motion` for gesture physics (drag, velocity check).
    *   **Refill Logic:** If the user swipes through all industry-specific jobs, the deck refills with "Wildcard" jobs from other sectors to encourage broader discovery.
4.  **ResultsScreen:**
    *   **AI Integration:** Constructs a prompt sending `userProfile` + `matchedJobs` to Gemini.
    *   **Rendering:** Displays the AI-generated "Persona Title" and "Analysis".
5.  **SurveyScreen:** Multi-step form capturing UX feedback and qualitative career realizations.
6.  **EmailScreen:** Final step to capture contact info and commit data to storage.

## 3. Data Model

### User Profile
```typescript
interface UserProfile {
  name: string;
  program: 'Business' | 'Health & Care' | 'Hospitality & Tourism';
  passions: [string, string];
  happiness: [string, string];
  strengths: [string, string];
  avatarUrl: string;
}
```

### Job Profile (`jobs.ts`)
The database is a static TypeScript array containing ~102 profiles per sector (306 total).
```typescript
interface JobProfile {
  id: string;
  title: string;
  program: ProgramType;
  image: string; // Unsplash URL
  bio: string;
  lookingFor: string;
  loveLanguage: string[]; // 4 bullet points
  swipeRightIf: string[]; // 3 bullet points
  funFact: string;
  tags: string[]; // Used for matching logic/analysis
}
```

## 4. AI Prompt Engineering

We use **Google Gemini 2.5 Flash** for speed and low cost.

**System Instruction:**
"You are a lively, witty career psychologist at a university festival. Tone: Exciting, personalized, like a 'Spotify Wrapped' for careers."

**Input Context:**
*   User's Name, Passions, Strengths, Happiness Triggers.
*   List of Matched Job Titles and Tags.

**Output Requirement:**
Strict JSON format containing `title`, `analysis` (connecting specific user inputs to job traits), and `trait`.

## 5. Storage Strategy (MVP)

*   **Database:** `localStorage` key `arden_survey_data`.
*   **Format:** Array of JSON objects.
*   **Export:** The `downloadCSV` function parses this JSON array into a comma-separated string and triggers a browser download event.
*   **Reasoning:** Removes the need for a backend server setup during the MVP phase, ensuring the app can run on any static host (Vercel/Netlify) instantly.
