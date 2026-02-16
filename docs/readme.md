
# Arden Match 🚀

**Arden Match** is a gamified, mobile-first web application designed to help university students discover their ideal career path through a "dating app" interface. Built for career festivals, it uses swipe mechanics and Generative AI to provide personalized career personas based on student preferences.

## 🌟 Core Features

*   **Gamified Discovery:** "Tinder-style" swiping interface (Right = Like, Left = Pass) to gauge interest in real-world job roles.
*   **Smart Deck Logic:** Job profiles are prioritized based on the student's study programme (Business, Health & Care, Hospitality & Tourism).
*   **AI-Powered Persona:** Uses **Google Gemini 2.5 Flash** to analyze matches, passions, and strengths, generating a witty "Career Soulmate" title and psychoanalysis.
*   **Dynamic Avatars:** Students select an avatar that adapts its clothing style to their chosen industry (e.g., Scrubs for Health, Blazers for Business).
*   **Data Collection:** Integrated mandatory survey and email capture to measure engagement and "lightbulb moments."
*   **Admin Tools:** Client-side CSV export functionality to download student data and survey responses directly from the browser.

## 🛠️ Tech Stack

*   **Frontend Framework:** React 18
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (Custom Arden Brand System: Navy, Yellow, Teal)
*   **Animations:** Framer Motion (Physics-based swipe gestures)
*   **AI Engine:** Google GenAI SDK (`@google/genai`)
*   **Icons:** Lucide React

## 🚀 Getting Started

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Setup:**
    Ensure you have a valid API Key for Google Gemini.
    ```env
    API_KEY=your_google_genai_key
    ```

3.  **Run Development Server:**
    ```bash
    npm run dev
    ```

## 📂 Project Structure

*   `index.tsx`: Main application entry point and logic controller.
*   `jobs.ts`: Static database of 180 curated job profiles (60 per sector).
*   `index.html`: HTML shell with Tailwind configuration and font imports.

## 🎨 Branding

The app uses a specific "Arden" color palette to ensure brand consistency:
*   **Background:** Arden Navy (`#002046`)
*   **Accents:** Arden Yellow (`#ffb600`) and Arden Teal (`#47c3d3`)
*   **Typography:** Inter (Google Fonts)

## 📊 Admin Access

To download the collected survey data:
1.  Go to the **Intro Screen** (Start Screen).
2.  Click the subtle **Download Icon** in the top-left corner.
3.  A `.csv` file named `arden_match_data.csv` will be downloaded to your device.
