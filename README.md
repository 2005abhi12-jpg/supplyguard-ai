# 🛡️ SupplyGuard AI

**AI-Powered Supply Chain Intelligence Platform**

A real-time supply chain monitoring and disruption management dashboard built for the Google Solution Challenge. SupplyGuard AI helps logistics managers visualize their supply network, detect disruptions early, and get AI-powered recommendations to maintain operational stability.

---

## 🚀 Live Demo

Run locally at `http://localhost:3000` after setup.

---

## ✨ Features

### 📊 Operations Dashboard
- **Real-time KPI Cards** — Track Total Suppliers, Nodes at Risk, Active Disruptions, Avg Reliability, Active Routes, Warehouses, and Disruptions Resolved
- **Health Score Monitor** — Dynamic circular gauge (0–100) that updates based on network health with color-coded status badges (Good / At Risk / Critical)
- **Disruption Alert Banner** — Contextual warning banner with estimated loss, View Details (→ Network page), and Reset controls
- **Reliability Trend Chart** — Weekly reliability trend visualization with area chart
- **Disruption Severity Donut** — Interactive pie chart showing Normal / At Risk / Disrupted distribution
- **AI Recommendations** — Smart suggestion cards for rerouting, alternative suppliers, and transit time predictions

### 🗺️ Network Map
- **Interactive Node Visualization** — SVG-based supply chain map showing all suppliers, warehouses, and retailers across India
- **Disruption Simulation** — Click any node to simulate a disruption event and watch the network respond in real-time
- **AI Route Bypass** — Automatically calculates and displays alternative routes when disruptions are detected
- **Live Intelligence Feed** — Real-time alert stream showing network events and anomalies
- **Network Load Indicator** — Dynamic progress bar showing current network utilization

### 🤖 AI Chat Bot (Gemini-Powered)
- **Natural Language Queries** — Ask questions about your supply chain in plain English
- **Full Data Context** — AI has access to all supplier, warehouse, retailer, and route data
- **Quick Query Suggestions** — Pre-built prompts for common supply chain questions
- **Real-time Disruption Awareness** — AI responses factor in current disruptions and network state
- **Data Coverage Panel** — Shows connected data sources and entity counts

### 🔐 Login Page
- **Clean Authentication UI** — Professional login form with email and password
- **Demo Credentials** — Pre-filled admin credentials for quick demo access
- **Session Management** — Login/logout flow with localStorage persistence

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Frontend** | React 18, Tailwind CSS |
| **Charts** | Recharts |
| **AI Engine** | Google Gemini API (gemini-1.5-flash) |
| **State Management** | React Context + useReducer |
| **Design System** | Custom token-based system (`styles/designSystem.js`) |
| **Styling** | Tailwind CSS + Inline Styles |

---

## 📁 Project Structure

```
supply-chain-dashboard/
├── app/
│   ├── page.js              # Operations Dashboard
│   ├── layout.js             # Root layout
│   ├── globals.css           # Global styles
│   ├── login/page.js         # Login page
│   ├── map/page.js           # Network Map
│   ├── advisor/page.js       # AI Chat Bot
│   └── api/gemini/route.js   # Gemini API route
├── components/
│   ├── Navbar.js             # Sidebar navigation
│   ├── ClientLayout.js       # Layout wrapper
│   ├── KPICard.js            # KPI card component
│   ├── HealthScore.js        # Health score gauge
│   ├── ETAPredictor.js       # ETA prediction component
│   ├── ErrorCard.js          # API error display
│   ├── LoadingSkeleton.js    # Loading states
│   └── Toast.js              # Toast notifications
├── context/
│   └── SupplyChainContext.js  # Global state management
├── data/
│   └── mockData.js           # Supply chain mock data
├── styles/
│   └── designSystem.js       # Design tokens & theme
└── .env.local                # Environment variables (not tracked)
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Google Gemini API Key ([Get one here](https://aistudio.google.com/apikey))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/2005abhi12-jpg/supplyguard-ai.git
cd supplyguard-ai

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local
# Or manually create .env.local with:
# GEMINI_API_KEY=your_gemini_api_key_here

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Login
- **Email:** `admin@supplyguard.ai`
- **Password:** `admin123`

---

## 🔑 Environment Variables

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> ⚠️ Never commit your `.env.local` file. It is already included in `.gitignore`.

---

## 📱 Pages Overview

| Page | Route | Description |
|------|-------|-------------|
| **Operations** | `/` | Main dashboard with KPIs, charts, and AI recommendations |
| **Network** | `/map` | Interactive supply chain map with disruption simulation |
| **Chat Bot** | `/advisor` | AI-powered chat interface for supply chain queries |
| **Login** | `/login` | Authentication page |

---

## 🎨 Design System

The application uses a centralized design token system defined in `styles/designSystem.js`:

- **Color Palette** — Blue primary, green success, yellow warning, red error
- **Typography** — Inter font family with consistent sizing
- **Cards** — White background, subtle borders, soft shadows
- **Charts** — Coordinated color theme across all visualizations
- **Layout** — Fixed sidebar (w-64) + scrollable content area

---

## 🔄 Key Interactions

1. **Simulate Disruption** → Go to Network page → Click any node → Click "Simulate Event"
2. **View Impact** → Return to Operations → See updated KPIs, Health Score, and alert banner
3. **Ask AI** → Go to Chat Bot → Ask about risks, routes, or get a daily briefing
4. **Reset Network** → Click "Reset" button on the disruption banner

---

## 🏆 Built For

**Google Solution Challenge 2026**

This project demonstrates how AI can be applied to supply chain management to:
- Detect and respond to disruptions in real-time
- Provide intelligent route optimization
- Enable data-driven decision making through natural language interaction
- Visualize complex supply networks intuitively

---

## 👤 Author

**Abhishek** — [@2005abhi12-jpg](https://github.com/2005abhi12-jpg)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
