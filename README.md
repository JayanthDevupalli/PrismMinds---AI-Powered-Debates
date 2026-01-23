# PrismMinds 🧠

**Revolutionary AI-Powered Debate Platform for Critical Thinking**

PrismMinds is an innovative platform that leverages artificial intelligence to facilitate structured, multi-perspective debates. It empowers users to explore ideas from different angles, challenge assumptions, and make informed decisions through intelligent discourse.

**🌐 Live Demo:** [https://prismminds.vercel.app](https://prismminds.vercel.app)

---

## ✨ Key Features

*   **AI vs AI Debates:** Watch AI personas (Supportive, Opposing, Neutral) engage in structured debates.
*   **Human vs AI Challenges:** Test your arguments against an AI opponent with real-time feedback.
*   **Dynamic Arguments:** AI generates concise arguments, counter-arguments, and evidence-based justifications.
*   **Consensus Synthesis:** AI summarizes debates, highlighting agreements, disagreements, and insights.
*   **Performance Analytics:** Detailed metrics on argumentation quality, logical consistency, and personalized feedback.
*   **Smart Library & Export:** Save debates, search history, and export to PDF.

---

## 🏗️ Tech Stack

### Frontend
*   **Framework:** Next.js 16 + TypeScript
*   **Styling:** Tailwind CSS, Framer Motion, GSAP
*   **State:** React Context, custom hooks
*   **Integrations:** Firebase Auth, jsPDF, html2canvas

### Backend
*   **Runtime:** Node.js, Express 5.1
*   **AI:** Google Generative AI (Gemini)
*   **Database:** Firebase Realtime Database
*   **Services:** Firebase Admin SDK, EmailJS

---

## 🚀 Getting Started

### Prerequisites
*   Node.js 16+
*   Firebase project credentials
*   Google Gemini API key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/JayanthDevupalli/PrismMinds---AI-Powered-Debates.git
    ```

2.  **Backend Setup:**
    ```bash
    cd PrismMinds/prismminds-server
    npm install
    # Create .env with: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, GOOGLE_AI_API_KEY
    npm start
    ```

3.  **Frontend Setup:**
    ```bash
    cd PrismMinds/prismmindsclient
    npm install
    # Create .env.local with Firebase config (NEXT_PUBLIC_FIREBASE_*)
    npm run dev
    ```

---

## 📁 Project Structure

```
PrismMinds/
├── prismminds-server/          # Express Backend & AI Services
│   ├── config/                 # Firebase & Auth Config
│   ├── routes/                 # API Routes (Debates, Auth, Chat)
│   └── services/               # Gemini AI & Email Services
│
└── prismmindsclient/           # Next.js Frontend
    ├── app/                    # App Router Pages (Dashboard, Features)
    ├── components/             # UI Components (Debate Interface, Charts)
    └── lib/                    # Utilities & Firebase Client
```

---

## 📝 License
ISC License

## 📧 Contact
For support or inquiries, please visit the [Contact Us](https://prismminds.vercel.app/contactus) page.
