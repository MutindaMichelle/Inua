# INUA Frontend (React + Vite)

Browser-based Single-Page Application (SPA) for the **INUA Mentorship Platform**, exposing all functional requirements (`FR-01` through `FR-08`) across the three platform personas: **Mentee**, **Mentor**, and **Administrator**.

## Tech Stack
- **React 18** with functional components and hooks
- **React Router v6** with `<Private>` and `<RoleGuard>` route protection
- **Tailwind CSS 3** with custom sage-green humanistic theme
- **Axios** client (`src/api/client.js`) with automatic JWT Bearer token injection
- **Vite 5** dev server with `/api` proxy to FastAPI (`http://127.0.0.1:8000`)

## Application Routes & Screens

| Route | Persona | Component | Key Capabilities |
| :--- | :--- | :--- | :--- |
| `/` | Public | `LandingPage.jsx` | Platform overview, feature cards, research context |
| `/login` | Public | `LoginPage.jsx` | Email/password login + one-click Demo Credential buttons |
| `/register` | Public | `RegisterPage.jsx` | Mentee & Mentor registration with auto-login (`FR-01`) |
| `/mentors` | Mentee | `MentorsPage.jsx` | Searchable verified mentor directory + `BookingModal` (`FR-02`) |
| `/sessions` | Mentee | `SessionsPage.jsx` | Session status transitions (`FR-03`), `FeedbackModal` (`FR-04`), and `PredictionModal` with TreeSHAP explanations (`FR-05`, `FR-06`) |
| `/predict` | Mentee | `PredictPage.jsx` | Interactive AI Session Scorer across XGBoost, Random Forest, and AdaBoost |
| `/mentor/sessions` | Mentor | `MentorSessionsPage.jsx` | Assigned sessions dashboard, status filters, status updates, and student feedback viewer |
| `/mentor/quality` | Mentor | `MentorQualityPage.jsx` | Longitudinal quality profile, effectiveness rate, Likert score breakdown, and recent comments (`FR-07`) |
| `/admin/overview` | Administrator | `AdminOverviewPage.jsx` | Platform-wide KPI cards, satisfaction averages, status/prediction distributions, and top mentors (`FR-08`) |
| `/admin/mentors` | Administrator | `AdminMentorsPage.jsx` | Sortable & searchable mentor quality audit table with detail modal (`FR-07`, `FR-08`) |

## Development & Build

```bash
cd frontend
npm install

# Start development server at http://localhost:5173
npm run dev

# Build production bundle into dist/
npm run build
```
