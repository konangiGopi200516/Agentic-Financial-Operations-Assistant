# 🚀 FinPilot — AI-Powered Financial Operations Platform

> An intelligent full-stack financial operations dashboard where AI agents analyze transactions, auto-raise support tickets, detect fraud, and assist admins with real-time decision making.

---

## 📸 Features at a Glance

| Feature | Description |
|---------|-------------|
| 🔐 **Secure Login** | JWT-based authentication (`gopi` / `gopi`) |
| 📊 **Live Dashboard** | Real-time revenue, tickets, fraud alerts, refund stats |
| 💳 **Transactions** | View, simulate, and export all payments to CSV |
| 🎫 **Smart Tickets** | Auto-priority based on amount, AI analysis per ticket |
| 🤖 **AI Bot** | Chat bot that reads live DB data and can take real actions |
| 🔍 **Payment Verifier** | AI agent verifies transactions by TXN or Ticket ID |
| 🛡️ **Fraud Detection** | Risk-scored fraud cases with freeze action |
| ✅ **Approval Queue** | High-value refunds requiring manager sign-off |
| 💸 **Pay Client** | Send payouts from dashboard, recorded in transactions |

---

## 🛠️ Tech Stack

### Backend
- **Node.js + Express** — REST API server
- **SQLite** — Lightweight relational database
- **Groq SDK (LLaMA-3.1-8B)** — AI/LLM engine
- **JWT** — Stateless authentication

### Frontend
- **React 18 + Vite** — Fast modern UI
- **TanStack React Query** — Data fetching & caching
- **Recharts** — Revenue & analytics charts
- **Lucide React** — Icon library
- **Tailwind CSS** — Utility-first styling

---

## 📁 Project Structure

```
Ai agentic financial operation/
├── backend/
│   ├── server.js          # Main Express API server
│   └── fix_priorities.js  # One-time DB migration script
├── database/
│   ├── schema.sql         # DB table definitions
│   ├── seed_data.sql      # 200 customers, 200 transactions, 50 tickets
│   └── database.sqlite    # Live SQLite database
└── frontend/
    └── src/
        ├── api/client.ts           # Axios API client
        ├── components/
        │   ├── Sidebar.tsx         # Navigation sidebar
        │   └── AIAssistant.tsx     # Bot chat widget (navbar)
        ├── layouts/
        │   └── DashboardLayout.tsx # Main layout wrapper
        ├── lib/
        │   └── currency.ts         # ₹ Indian currency formatter
        └── pages/
            ├── Login.tsx           # Admin login page
            ├── Dashboard.tsx       # Overview + Pay Client
            ├── Transactions.tsx    # Payment records + Simulate Payment
            ├── Tickets.tsx         # Support tickets + AI Analyze
            ├── RefundCenter.tsx    # Pending/processed refunds
            ├── Approvals.tsx       # High-value refund approvals
            ├── FraudDetection.tsx  # Flagged fraud cases
            ├── PaymentAgent.tsx    # AI payment verifier tool
            ├── Customers.tsx       # Customer profiles
            ├── AIAgents.tsx        # Agent status monitor
            └── AuditLogs.tsx       # AI decision history
```

---

## 🗄️ Database Schema

### `customers` — 200 records
| Column | Type |
|--------|------|
| id | INTEGER PK |
| name | VARCHAR |
| email | VARCHAR (unique) |
| phone | VARCHAR |
| created_at | TIMESTAMP |

### `transactions` — 200 records
| Column | Type | Values |
|--------|------|--------|
| id | INTEGER PK | — |
| customer_id | FK | links to customers |
| amount | DECIMAL | ₹21 — ₹4,989 |
| status | VARCHAR | `Success` / `Failed` / `Pending` / `Suspicious` |
| payment_method | VARCHAR | Credit Card, Debit Card, PayPal, UPI, Bank Transfer |
| refund_status | VARCHAR | `none` / `Pending` / `Refunded` / `Rejected` |

### `tickets` — 50+ records (grows dynamically)
| Column | Type |
|--------|------|
| id | INTEGER PK |
| customer_id | FK |
| transaction_id | FK |
| issue_text | TEXT |
| priority | VARCHAR | Auto: `High` ≥₹10k, `Medium` ₹1k-₹9.9k, `Low` <₹1k |
| status | VARCHAR | `Open` / `In Progress` / `Closed` |
| ai_status | VARCHAR | `Pending Analysis` / `Analyzed` |
| recommendation | TEXT | AI-generated (e.g. "Refund ₹4,500.00") |
| confidence | DECIMAL | 0–100 |

### `fraud_cases` — 20 records
| Column | Type |
|--------|------|
| id | INTEGER PK |
| transaction_id | FK |
| risk_score | INTEGER | 79–98 |
| reason | TEXT | IP anomaly, card velocity, etc. |
| status | VARCHAR | `pending` / `Frozen` |

### `audit_logs` — Dynamic
Logs every AI action (ticket analysis, refund approval, fraud freeze).

---

## 🤖 AI Agent Capabilities

### 1. FinPilot Bot (Chat)
Lives in the top navbar. Reads live DB context on every message.

**Example commands:**
```
"Add the latest failed transaction to tickets"
"How many pending refunds are there?"
"Show recent fraud alerts"
```

When you say **"add failed transaction to tickets"**, the bot:
1. Finds the most recent `Failed` transaction with no existing ticket
2. Inserts a new ticket with auto-calculated priority
3. Refreshes the Tickets page instantly
4. Confirms in a green action card in the chat

### 2. Ticket Analyzer
Click **Analyze** on any ticket row. The AI:
- Reads the customer complaint text
- Fetches the linked transaction amount
- Returns a specific recommendation (e.g. "Refund ₹2,165.08")
- Records confidence score to the audit log

### 3. Payment Verification Agent
Enter a `TXN-XXXXX` or `TKT-XXXXX` ID. The AI:
- Fetches real transaction/ticket data from DB
- Returns: Payment Status, Amount Deducted, Decision (Refund/Approve/Investigate)

---

## ⚙️ Smart Priority Logic

Ticket priority is **automatically calculated** from the linked transaction amount:

| Amount | Priority |
|--------|----------|
| ₹10,000 and above | 🔴 **High** |
| ₹1,000 – ₹9,999 | 🟡 **Medium** |
| Below ₹1,000 | 🟢 **Low** |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm

### 1. Start Backend
```bash
cd backend
npm install
node server.js
# Server runs on http://localhost:3000
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

### 3. Login
```
Username: gopi
Password: gopi
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login → returns JWT |
| GET | `/api/dashboard` | Revenue, tickets, fraud stats |
| GET | `/api/transactions` | All transactions with customer info |
| POST | `/api/transactions` | Simulate a new payment |
| GET | `/api/tickets` | All tickets with payment amount |
| POST | `/api/tickets` | Create a new ticket |
| POST | `/api/tickets/:id/analyze` | AI analyze a ticket |
| GET | `/api/refunds` | Pending/refunded transactions |
| GET | `/api/approvals` | High-value refunds needing approval |
| POST | `/api/refund/approve` | Approve a refund (AI-backed) |
| POST | `/api/refund/reject` | Reject a refund |
| GET | `/api/fraud` | All fraud cases |
| POST | `/api/fraud/check` | Freeze a fraud case |
| GET | `/api/customers` | All customers |
| POST | `/api/payment/verify` | AI payment verification agent |
| POST | `/api/ai/chat` | AI bot — reads DB + can create tickets |
| GET | `/api/audit` | AI decision audit logs |

---

## 👨‍💻 Built By

FinPilot was built as a **Hackathon Project** demonstrating:
- Full-stack AI integration with a live database
- Agentic AI that takes real actions (not just chat)
- Financial domain operations with enterprise-grade UI
- Real-time data flow from DB → AI → UI

---

> **Stack:** Node.js · Express · SQLite · React · Vite · Groq AI (LLaMA-3.1-8B-Instant)
