-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'manager'
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  payment_method VARCHAR(50),
  refund_status VARCHAR(50) DEFAULT 'none',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Support Tickets
CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  transaction_id INTEGER REFERENCES transactions(id),
  issue TEXT,
  complaint TEXT,
  issue_text TEXT,
  priority VARCHAR(50) DEFAULT 'Medium',
  status VARCHAR(50) DEFAULT 'Open',
  ai_status VARCHAR(50) DEFAULT 'Pending Analysis',
  recommendation TEXT,
  confidence DECIMAL(5, 2),
  ai_analysis JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fraud Cases
CREATE TABLE IF NOT EXISTS fraud_cases (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER REFERENCES transactions(id),
  customer_id INTEGER REFERENCES customers(id),
  risk_score INTEGER NOT NULL,
  reason TEXT NOT NULL,
  location VARCHAR(100),
  device_info VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs for AI decisions
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  agent VARCHAR(50),
  agent_used VARCHAR(50),
  action TEXT NOT NULL,
  reason TEXT NOT NULL,
  confidence DECIMAL(5, 2),
  transaction_id INTEGER REFERENCES transactions(id),
  ticket_id INTEGER REFERENCES tickets(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
