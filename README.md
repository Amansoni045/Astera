<div align="center">

# 🌌 Astera

### Autonomous Deep Research Workspace & Evidence Synthesis Engine

*Research anything. Astera searches the web, reads trusted sources, reconciles evidence, and writes comprehensive research reports.*

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-1.0-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Auth.js](https://img.shields.io/badge/Auth.js-v5.0_beta-purple)](https://authjs.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 📌 Overview

**Astera** is an open-source deep research application designed to turn complex research prompts into clear, highly structured, evidence-backed reports. 

Unlike standard conversational search bots that summarize snippet search results, Astera behaves as an autonomous research team:
1. **Plans Research Strategy**: Breaks a prompt into multiple distinct search angles.
2. **Discovers & Scores Sources**: Ranks web domains by authority and trust.
3. **Scrapes Full Web Pages**: Reads full text rather than relying on brief snippets.
4. **Reconciles Evidence**: Compares facts, removes duplicate citations, and drafts report sections.
5. **Evaluates Completeness**: Runs a Critic agent pass to verify quality before delivering the final report.

Astera supports both **anonymous users** (zero storage, transient sessions) and **authenticated users** (persistent cloud history, multi-turn follow-up conversations, search, and title auto-generation).

---

## ⚡ Why Astera?

Traditional search engines leave you clicking through dozens of tabs, while standard LLMs are prone to hallucinating facts or citing superficial snippets.

**How Astera is different:**
- **Evidence-First**: Every report section is built directly from scraped web content.
- **Multi-Turn Workspace**: Continue any research session by asking follow-up questions beneath the original report, exactly like ChatGPT.
- **Authority Ranking**: Filters out clickbait and content farms by scoring domain authority (`.gov`, `.edu`, trusted journalism, academic portals).
- **Cloud-Synced History**: Authenticated users can restore, search, pin, rename, or archive past research sessions effortlessly.

---

## ✨ Features

- 🔍 **Multi-Query Expansion**: Automatically plans 3-4 distinct search queries per topic.
- 🌐 **Deep Web Reading**: Scrapes full article content from top authority sources.
- ⚡ **Real-Time Progress Streaming**: Emits live Server-Sent Events (SSE) detailing every step (`Searching`, `Reading X/Y`, `Writing`, `Checking`).
- 💬 **Continuous Multi-Turn Chat**: Follow-up prompts append seamlessly without losing past research reports.
- 🔐 **Production Auth.js (NextAuth v5)**: OAuth sign-in via Google & GitHub, with zero-friction anonymous access.
- 🗄️ **Supabase PostgreSQL & Prisma ORM**: Scalable schema built for conversations, messages, sessions, sources, bookmarks, and tags.
- 📱 **Mobile-First & Accessible**: Fully responsive drawer sidebar, touch controls, keyboard navigation, and ARIA live regions.
- 🎨 **Modern Aesthetics**: Sleek dark mode, glassmorphism, auto-expanding textarea, and domain favicons.

---

## 🏗️ Architecture

Astera connects a high-performance **FastAPI multi-agent backend** with a **Next.js App Router frontend**.

```mermaid
graph TD
    User["👤 User / Browser"] -->|Next.js App Router| Frontend["💻 Next.js Frontend (React 19)"]
    Frontend -->|Auth.js v5| Auth["🔐 Auth.js (Google / GitHub)"]
    Auth -->|Prisma Client| DB[("🗄️ Supabase PostgreSQL")]
    
    Frontend -->|SSE Progress / GET| Backend["⚡ FastAPI Backend (Python)"]
    Backend -->|Multi-Query Planner| Planner["🎯 Query Generator"]
    Planner -->|Search API| Tavily["🔍 Tavily Web Search"]
    Tavily -->|Domain Authority Ranking| Scraper["🌐 Playwright / BeautifulSoup Scraper"]
    
    Scraper -->|Full Text Context| Writer["✍️ Writer Agent (LLM)"]
    Writer -->|Draft Report| Critic["🧐 Critic Review Agent"]
    Critic -->|Final Verified Result| Frontend
```

---

## 📁 Repository Structure

```text
Astera/
├── .github/                      # Issue & PR templates
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
├── agents/                       # Multi-agent definitions (Planner, Scraper, Writer, Critic)
├── chains/                       # LangChain execution chains
├── models/                       # Multi-provider LLM connector (Groq, Cerebras, Gemini, Mistral)
├── pipelines/                    # Deep research orchestrator & SSE generator
├── tools/                        # Web search & deep scraping tools
├── api.py                        # FastAPI production application
├── ui/                           # Next.js App Router frontend
│   ├── app/                      # App router pages, routes & metadata
│   ├── components/               # React UI components (Sidebar, SearchInput, ChatContainer)
│   ├── hooks/                    # Custom React hooks (useConversation, useResearch)
│   ├── lib/                      # Auth.js, Prisma, API clients, TypeScript definitions
│   └── prisma/
│       └── schema.prisma         # Production Supabase PostgreSQL schema
├── CONTRIBUTING.md               # Contribution guidelines
├── LICENSE                       # MIT License
├── SECURITY.md                   # Security reporting policy
└── requirements.txt              # Backend Python dependencies
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion |
| **Authentication** | Auth.js (NextAuth v5), Google OAuth, GitHub OAuth |
| **Database & ORM** | Supabase PostgreSQL, Prisma ORM (v6) |
| **Backend API** | Python 3.11+, FastAPI, Uvicorn, SSE Streaming |
| **Agent Orchestration** | LangChain, Pydantic, Custom Evidence Pipeline |
| **Web Search & Scraping** | Tavily API, BeautifulSoup4, Playwright |
| **Deployment** | Vercel (Frontend), Railway (Backend), Supabase (Database) |

---

## 🚀 Local Installation & Setup

### Prerequisites
- **Node.js**: v20+ and `npm`
- **Python**: v3.11+
- **Database**: PostgreSQL connection URI (e.g. Supabase)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/Astera.git
cd Astera
```

### 2. Backend Setup
```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
```

Fill your API keys in `.env`:
```env
TAVILY_API_KEY=tvly-your-key
GROQ_API_KEY=gsk_your_key
GEMINI_API_KEY=your_key
ALLOWED_ORIGINS=http://localhost:3000
```

Start the backend server:
```bash
python api.py
```
*Backend runs on `http://localhost:8000` (Docs available at `http://localhost:8000/docs`).*

### 3. Frontend Setup
Open a new terminal window:
```bash
cd ui

# Install dependencies
npm install

# Setup local environment
cp .env.example .env.local
```

Configure `ui/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
DATABASE_URL=postgresql://postgres:password@localhost:5432/astera
DIRECT_URL=postgresql://postgres:password@localhost:5432/astera

AUTH_SECRET=your-random-auth-secret
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret
```

Generate Prisma Client & run migrations:
```bash
npm exec prisma generate
```

Start Next.js dev server:
```bash
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

---

## 🌐 Production Deployment

### Frontend (Vercel)
1. Push your repository to GitHub.
2. Import project into Vercel and select root directory `ui`.
3. Set Environment Variables (`NEXT_PUBLIC_API_URL`, `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, etc.).
4. Deploy!

### Backend (Railway)
1. Deploy root directory to Railway using the included `Dockerfile` or `Procfile`.
2. Add environment variables (`TAVILY_API_KEY`, `GROQ_API_KEY`, `GEMINI_API_KEY`, `ALLOWED_ORIGINS`).

---

## 🗺️ Roadmap

- [x] Multi-query research strategy & authority scoring
- [x] Real-time SSE progress streaming
- [x] Auth.js (NextAuth v5) Google & GitHub OAuth integration
- [x] Supabase PostgreSQL & Prisma ORM persistent storage
- [x] Continuous multi-turn conversation feed & auto-expanding input
- [ ] Bookmark specific report sections
- [ ] Group conversations into Folders & Collections
- [ ] One-click PDF & Markdown export
- [ ] Public shared conversation links

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

---

## 🙏 Acknowledgements

- [Tavily AI](https://tavily.com/) for precision search API.
- [Vercel](https://vercel.com) & [Next.js](https://nextjs.org/) for modern web primitives.
- [Auth.js](https://authjs.dev/) for open-source authentication.
- [Prisma](https://www.prisma.io/) & [Supabase](https://supabase.com/) for database infrastructure.
