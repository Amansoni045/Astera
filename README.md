# Astera

**Astera** is an autonomous multi-agent research pipeline built with Python, LangChain (LCEL / Runnables), Groq LLM, Tavily Search, and BeautifulSoup. 

The system automates the research lifecycle from real-time web search and deep content scraping to structured report drafting and critical evaluation.

---

## 🌟 Architecture Overview

The backend executes a sequential 4-stage pipeline:

```text
  [ User Topic Input ]
           │
           ▼
┌──────────────────────┐
│  1. Search Agent     │ ── Tavily Web Search API (Titles, URLs, Snippets)
└──────────────────────┘
           │
           ▼
┌──────────────────────┐
│  2. Reader Agent     │ ── BeautifulSoup Scraping (Extracted page text)
└──────────────────────┘
           │
           ▼
┌──────────────────────┐
│  3. Writer Chain     │ ── LCEL Chain (Drafts structured report)
└──────────────────────┘
           │
           ▼
┌──────────────────────┐
│  4. Critic Chain     │ ── LCEL Chain (Evaluates & scores report)
└──────────────────────┘
           │
           ▼
   [ Final State Output ]
```

---

## ✨ Features

- **Autonomous Search Agent**: Queries recent web data using Tavily Search API.
- **Deep Web Reader**: Scrapes and cleans raw HTML page content for deep context extraction.
- **Structured Writer**: Synthesizes search results and scraped content into professional research reports.
- **Constructive Critic**: Performs rigorous evaluation, scoring, strength identification, and improvement recommendations.
- **Singleton LLM Architecture**: Shares a single, efficient `ChatGroq` instance across all agents and chains.
- **Typed State Management**: Type-safe pipeline data flow via `ResearchState` (`TypedDict`).
- **Resilient Error Handling**: Graceful fallback handling for API keys, timeouts, and network errors.

---

## 📁 Directory Structure

```text
Astera/
├── agents/
│   ├── reader_agent.py      # Reader Agent initialization (scrape_url tool)
│   └── search_agent.py      # Search Agent initialization (web_search tool)
├── chains/
│   ├── critic_chain.py      # LCEL chain for report evaluation
│   └── writer_chain.py      # LCEL chain for report generation
├── models/
│   └── llm.py               # Singleton ChatGroq LLM provider
├── pipelines/
│   └── research_pipeline.py # 4-stage research pipeline orchestrator
├── prompts/
│   ├── critic_prompt.py     # Prompt template for critic chain
│   └── writer_prompt.py     # Prompt template for writer chain
├── tools/
│   ├── scraper_tool.py      # BeautifulSoup web scraping tool
│   └── tavily_tool.py       # Tavily search tool
├── config.py                # Centralized project constants & configuration
├── main.py                  # CLI entrypoint
├── state.py                 # ResearchState TypedDict definition
├── requirements.txt         # Project dependencies
└── README.md                # Project documentation
```

---

## 🛠️ Tech Stack

- **Language**: Python 3.10+
- **LLM Provider**: [Groq](https://groq.com) (`openai/gpt-oss-120b`) via `langchain-groq`
- **Orchestration**: [LangChain Core & Agents](https://python.langchain.com) (LCEL / Runnables)
- **Web Search**: [Tavily API](https://tavily.com)
- **Scraping**: `BeautifulSoup4` + `requests`

---

## 🚀 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Amansoni045/Astera.git
   cd Astera
   ```

2. **Create and activate virtual environment**:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   GROQ_API_KEY="your-groq-api-key"
   TAVILY_API_KEY="your-tavily-api-key"
   ```

---

## 💻 Usage

Run the pipeline from the command line:

```bash
python main.py
```

Enter your research topic when prompted:
```text
What do you want to research about? Quantum Computing in Drug Discovery
```

The system will display logs and results for each stage (Search -> Scrape -> Write -> Critic).
