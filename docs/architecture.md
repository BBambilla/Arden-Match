
# Architecture & Data Flow

This document outlines the technical architecture of the **Arden Match** MVP.

## 1. High-Level Architecture

```mermaid
graph TD
    User[Student] --> UI[React UI]
    UI --> State[Local State (React)]
    State --> Logic[3-Tier Matching Engine]
    Logic --> Data[jobs.ts (Static DB)]
    
    subgraph AI Processing
    Logic -- Tier 1 Context --> Gemini[Google Gemini API]
    Gemini -- Persona Analysis --> Logic
    end
    
    subgraph Data Persistence
    UI -- Survey Answers --> GoogleSheets[Google Apps Script]
    Admin[Admin User] -- View Data --> Sheet[Google Sheet]
    end
```

## 2. Component Structure (`index.tsx`)

The app logic is built around a **3-Tier Deck Refill System** to ensure high student engagement:

1.  **Tier 1: Personalized AI Roles (5 Cards)**
    *   On startup, Gemini 3 Flash generates 5 bespoke roles based on user input (Passions, Strengths, Happiness Triggers).
2.  **Tier 2: Curated Industry Roles (70 Cards)**
    *   If Tier 1 is swiped through without 5 matches, the deck refills with a high-quality list of 70 predefined roles found in `specialPositions`.
3.  **Tier 3: Global Discovery Pool (180 Cards)**
    *   If the user is still swiping, the app generates a massive pool of 180 cards based on the 20 core professional archetypes, ensuring the app never goes blank.

## 3. Data Syncing
Data is synced in real-time to a Google Sheet via a `doPost` endpoint on a Google Apps Script, ensuring zero data loss and easy admin access.
