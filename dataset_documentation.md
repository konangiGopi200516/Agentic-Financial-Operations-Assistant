# 📊 FinPilot — Dataset Documentation
### AI-Powered Financial Operations Platform | Hackathon Submission

---

## 🏗️ Database Architecture

The platform uses **SQLite** (relational) with **6 interconnected tables** simulating a real-world fintech backend. All data is seeded with realistic values and all AI agents (Groq LLaMA-3) operate on this live data in real time.

---

## 📋 Table 1: `users` — Admin Authentication

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment primary key |
| `name` | VARCHAR(100) | Admin full name |
| `email` | VARCHAR(100) | Unique login email |
| `password_hash` | VARCHAR(255) | Hashed password (JWT auth) |
| `role` | VARCHAR(50) | `manager` / `admin` |

**Records:** 1 admin user (`gopi` / `admin@finpilot.ai`)

---

## 📋 Table 2: `customers` — Customer Profiles

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment primary key |
| `name` | VARCHAR(100) | Customer full name |
| `email` | VARCHAR(100) | Unique customer email |
| `phone` | VARCHAR(20) | Contact phone number |
| `created_at` | TIMESTAMP | Account creation time |

**Records:** **200 customers** with diverse realistic names

**Sample Data:**
| ID | Name | Email | Phone |
|----|------|-------|-------|
| 1 | Trent Rodriguez | customer1@example.com | +15553370138 |
| 27 | Bob Doe | customer27@example.com | +15555947040 |
| 59 | Heidi Garcia | customer59@example.com | +15559062937 |
| 177 | John Doe | customer177@example.com | +15553926670 |

---

## 📋 Table 3: `transactions` — Payment Records

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment primary key |
| `customer_id` | INTEGER FK | Links to `customers.id` |
| `amount` | DECIMAL(10,2) | Transaction amount in USD |
| `status` | VARCHAR(50) | `Success` / `Failed` / `Pending` / `Suspicious` |
| `payment_method` | VARCHAR(50) | `Credit Card` / `Debit Card` / `PayPal` / `UPI` / `Bank Transfer` |
| `refund_status` | VARCHAR(50) | `none` / `Pending` / `Refunded` / `Rejected` |
| `created_at` | TIMESTAMP | Transaction timestamp |

**Records:** **200 transactions** across 200 customers

**Status Distribution:**

| Status | Approx. Count | Description |
|--------|---------------|-------------|
| `Success` | ~60 | Completed payments |
| `Failed` | ~55 | Failed payment attempts |
| `Pending` | ~55 | In-progress payments |
| `Suspicious` | ~30 | Flagged for fraud review |

**Amount Range:** $21.05 — $4,989.47

**Sample Data:**
| TXN ID | Customer | Amount | Method | Status | Refund |
|--------|----------|--------|--------|--------|--------|
| TXN-00001 | Trent Lopez | $4,102.37 | Debit Card | Suspicious | None |
| TXN-00009 | Jane Gonzalez | $1,769.84 | Credit Card | Failed | Refunded |
| TXN-00011 | Eve Martinez | $2,948.81 | PayPal | Success | None |
| TXN-00060 | Oscar Jones | $2,633.43 | Credit Card | Failed | Refunded |

---

## 📋 Table 4: `tickets` — Support Tickets

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment primary key |
| `customer_id` | INTEGER FK | Links to `customers.id` |
| `transaction_id` | INTEGER FK | Links to `transactions.id` |
| `issue_text` | TEXT | Customer complaint description |
| `priority` | VARCHAR(50) | `High` / `Medium` / `Low` |
| `status` | VARCHAR(50) | `Open` / `In Progress` / `Closed` |
| `ai_status` | VARCHAR(50) | `Pending Analysis` / `Analyzed` |
| `recommendation` | TEXT | AI-generated action (e.g. "Refund $599.99") |
| `confidence` | DECIMAL(5,2) | AI confidence score (0–100) |
| `created_at` | TIMESTAMP | Ticket raised timestamp |

**Records:** **50 pre-seeded tickets** + dynamically created by AI bot

**Issue Types Seeded:**
- "My payment failed but money was deducted."
- "I did not authorize this transaction."
- "I was overcharged for this transaction."
- "The merchant did not receive my payment."
- "I want to cancel and refund this transaction."

**Sample Data:**
| TKT ID | Customer | Transaction | Issue |
|--------|----------|-------------|-------|
| TKT-00001 | Charlie Gonzalez (106) | TXN-00011 | My payment failed but money was deducted. |
| TKT-00002 | Oscar Gonzalez (41) | TXN-00183 | I did not authorize this transaction. |
| TKT-00006 | Peggy Williams (31) | TXN-00067 | I want to cancel and refund this transaction. |

---

## 📋 Table 5: `fraud_cases` — Fraud Detection

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment primary key |
| `transaction_id` | INTEGER FK | Links to `transactions.id` |
| `risk_score` | INTEGER | Score 0–100 (higher = more dangerous) |
| `reason` | TEXT | Fraud reason detected |
| `status` | VARCHAR(50) | `pending` / `Frozen` |
| `created_at` | TIMESTAMP | Detection timestamp |

**Records:** **20 fraud cases**

**Fraud Reason Categories:**
| Reason | Count |
|--------|-------|
| Suspicious IP address | 6 |
| Large transaction size anomaly | 7 |
| Multiple login locations | 1 |
| Device changed recently | 2 |
| Card velocity too high | 4 |

**Risk Score Range:** 79 — 98

**Sample Data:**
| ID | TXN | Risk Score | Reason |
|----|-----|-----------|--------|
| 1 | TXN-00187 | 98 | Suspicious IP address |
| 6 | TXN-00168 | 91 | Multiple login locations |
| 15 | TXN-00135 | 93 | Card velocity too high |

---

## 📋 Table 6: `audit_logs` — AI Decision Trail

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment primary key |
| `agent` | VARCHAR(50) | AI agent name (e.g. "Ticket Agent") |
| `action` | TEXT | Action taken (e.g. "Categorized") |
| `reason` | TEXT | Reasoning provided by AI |
| `confidence` | DECIMAL(5,2) | Confidence score |
| `transaction_id` | INTEGER FK | Related transaction (if any) |
| `ticket_id` | INTEGER FK | Related ticket (if any) |
| `created_at` | TIMESTAMP | Log timestamp |

**Records:** Dynamically created on every AI analysis

---

## 🤖 AI Integration Summary

| Feature | Technology | Data Used |
|---------|-----------|-----------|
| Chat Bot | Groq LLaMA-3.1-8B | All 6 tables via live SQL queries |
| Ticket Analyzer | Groq LLaMA-3.1-8B | `tickets` + linked `transactions` |
| Payment Verifier | Groq LLaMA-3.1-8B | `transactions` + `tickets` |
| Auto-Ticket Creator | Intent Detection + SQL | `transactions` (Failed status) |
| Fraud Detector | Pre-seeded + Groq | `fraud_cases` + `transactions` |

---

## 📈 Dataset Statistics

| Metric | Value |
|--------|-------|
| Total Records | **~480+** |
| Customers | 200 |
| Transactions | 200 |
| Support Tickets | 50+ (grows dynamically) |
| Fraud Cases | 20 |
| Payment Methods | 5 (Credit Card, Debit Card, PayPal, UPI, Bank Transfer) |
| Transaction Amount Range | $21.05 — $4,989.47 |
| Max Fraud Risk Score | 98 / 100 |
| AI Models Used | LLaMA-3.1-8B-Instant (via Groq) |

---

## 🔗 Entity Relationship Diagram

```
customers (200)
     │
     ├──► transactions (200) ──► fraud_cases (20)
     │         │
     │         └──► tickets (50+) ──► audit_logs (dynamic)
     │
     └──► users (1 admin)
```

---

> **Built for:** Financial AI Hackathon  
> **Stack:** Node.js + Express + SQLite + React + Vite + Groq AI (LLaMA-3)  
> **Dataset Type:** Synthetically generated, realistic financial data
