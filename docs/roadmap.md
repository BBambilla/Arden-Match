# Project Roadmap: Arden Match

## ✅ Phase 1: The Festival MVP (Current Status)
**Goal:** Engage students at the career festival and collect initial data.

*   [x] **Core UI/UX:** Mobile-responsive design with Arden branding.
*   [x] **Gamification:** Tinder-style swiping mechanics with physics.
*   [x] **Content:** Database of 300+ detailed job profiles across 3 sectors.
*   [x] **Personalization:** Avatar builder with industry-specific costumes.
*   [x] **AI Integration:** Gemini API generating unique "Career Soulmates".
*   [x] **Data Capture:** Mandatory survey and email collection.
*   [x] **Admin:** Local CSV export functionality.

---

## 🚧 Phase 2: Engagement & Persistence (Post-Event)
**Goal:** Turn the one-time game into a persistent tool for the university.

*   [ ] **Cloud Database:** Migrate from `localStorage` to Firebase or Supabase to prevent data loss if browser cache is cleared.
*   [ ] **Social Sharing:** Generate a downloadable image of the "Persona Card" (using `html2canvas`) for students to share on Instagram/LinkedIn.
*   [ ] **Email Integration:** Automatically send the "Match Report" to the student's email via SendGrid or AWS SES (currently just captures the email).
*   [ ] **Expanded Content:** Add "Computing" and "Engineering" faculties.

---

## 🔮 Phase 3: The "Futures" Platform (Long Term)
**Goal:** Full integration with Arden University's career ecosystem.

*   [ ] **Live Job Feed:** Connect matching logic to real-time job boards or the university's handshake platform.
*   [ ] **Employer Portal:** Allow partner employers to sponsor "Super Cards" that appear in the deck.
*   [ ] **Dashboard:** Real-time analytics dashboard for University staff to see which careers are trending among students.
*   [ ] **AI Chat:** Allow students to "chat" with their matched Persona to ask advice (e.g., "How do I become a CEO?").
