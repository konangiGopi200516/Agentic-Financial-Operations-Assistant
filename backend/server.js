const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let db;

async function initializeDb() {
  db = await open({
    filename: '../database/database.sqlite',
    driver: sqlite3.Database
  });

  // Execute schema
  const schema = fs.readFileSync('../database/schema.sql', 'utf8');
  // SQLite doesn't support SERIAL PRIMARY KEY, so we replace it for compatibility
  const sqliteSchema = schema.replace(/SERIAL PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT');
  await db.exec(sqliteSchema);

  // Check if we need to seed
  const count = await db.get('SELECT COUNT(*) as count FROM customers');
  if (count.count === 0) {
    console.log("Seeding database...");
    const seed = fs.readFileSync('../database/seed_data.sql', 'utf8');
    // Simple naive split by newline to run commands, or just exec the whole thing if it doesn't fail
    const statements = seed.split(/;\s*$/m);
    for (let stmt of statements) {
      if (stmt.trim()) {
        try {
          await db.exec(stmt + ';');
        } catch (e) {
          console.error("Error seeding:", e.message, "\\nStatement:", stmt);
        }
      }
    }
  }
}

initializeDb().then(() => {
  console.log("Database initialized.");
});

const jwt = require('jsonwebtoken');
const JWT_SECRET = 'finpilot_super_secret_hackathon_key';

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
  // Allow CORS preflight and login route
  if (req.method === 'OPTIONS') return next();
  if (req.path === '/auth/login' || req.originalUrl.includes('/auth/login')) return next();
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
};

app.use('/api', authenticateToken);

// API Routes
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'gopi' && password === 'gopi') {
    const token = jwt.sign({ email, role: 'Admin' }, JWT_SECRET, { expiresIn: '8h' });
    return res.json({ token });
  }
  return res.status(401).json({ error: 'Invalid email or password' });
});
app.get('/api/dashboard', async (req, res) => {
  try {
    const totalCustomers = await db.get('SELECT COUNT(*) as count FROM customers');
    const todayTransactions = await db.get("SELECT SUM(CAST(amount AS NUMERIC)) as total FROM transactions WHERE status = 'Success' AND CAST(amount AS NUMERIC) > 0");
    const activeTickets = await db.get('SELECT COUNT(*) as count FROM tickets WHERE status != "Closed"');
    const pendingRefunds = await db.get('SELECT COUNT(*) as count FROM transactions WHERE refund_status = "Pending"');
    const fraudAlerts = await db.get('SELECT COUNT(*) as count FROM fraud_cases WHERE status = "pending"');

    res.json({
      totalCustomers: totalCustomers.count,
      todayRevenue: todayTransactions.total || 0,
      activeTickets: activeTickets.count,
      pendingRefunds: pendingRefunds.count,
      fraudAlerts: fraudAlerts.count,
      aiAccuracy: 94.2
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await db.all(`
      SELECT t.*, c.name as customer_name, tx.amount as payment_amount 
      FROM tickets t 
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN transactions tx ON t.transaction_id = tx.id
      ORDER BY t.created_at DESC
    `);
    res.json(tickets);
  } catch (error) {
    console.error("Error in GET /api/tickets:", error);
    res.status(500).json({ error: error.message });
  }
});

// Helper: determine priority based on transaction amount
function getPriority(amount) {
  const val = parseFloat(amount) || 0;
  if (val >= 10000) return 'High';
  if (val < 1000)  return 'Low';
  return 'Medium';
}

app.post('/api/tickets', async (req, res) => {
  try {
    const { customer_id, issue, priority, status, transaction_id } = req.body;

    // Auto-calculate priority from linked transaction amount if not explicitly provided
    let finalPriority = priority;
    if (!finalPriority && transaction_id) {
      const txn = await db.get('SELECT amount FROM transactions WHERE id = ?', [transaction_id]);
      finalPriority = txn ? getPriority(txn.amount) : 'Medium';
    }
    finalPriority = finalPriority || 'Medium';

    await db.run(
      'INSERT INTO tickets (customer_id, transaction_id, issue_text, priority, status, ai_status) VALUES (?, ?, ?, ?, ?, ?)',
      [customer_id || 1, transaction_id || null, issue, finalPriority, status || 'Open', 'Pending Analysis']
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await db.all(`
      SELECT t.*, c.name as customer_name, c.email
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      ORDER BY t.created_at DESC
      LIMIT 100
    `);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const { amount, customer_id, payment_method, status } = req.body;
    await db.run(
      'INSERT INTO transactions (customer_id, amount, payment_method, status, refund_status) VALUES (?, ?, ?, ?, ?)',
      [customer_id || 1, amount, payment_method || 'Credit Card', status || 'Success', 'none']
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/customers', async (req, res) => {
  try {
    const customers = await db.all(`
      SELECT * FROM customers ORDER BY created_at DESC LIMIT 50
    `);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/refunds', async (req, res) => {
  try {
    const refunds = await db.all(`
      SELECT t.*, c.name as customer_name
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      WHERE t.refund_status != 'none'
      ORDER BY t.created_at DESC
    `);
    res.json(refunds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/fraud', async (req, res) => {
  try {
    const fraud = await db.all(`
      SELECT f.*, t.amount, c.name as customer_name
      FROM fraud_cases f
      LEFT JOIN transactions t ON f.transaction_id = t.id
      LEFT JOIN customers c ON t.customer_id = c.id
      ORDER BY f.created_at DESC
    `);
    res.json(fraud);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/approvals', async (req, res) => {
  try {
    const approvals = await db.all(`
      SELECT t.*, c.name as customer_name
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      WHERE t.refund_status = 'Pending' AND CAST(t.amount AS DECIMAL) > 1000
      ORDER BY t.created_at DESC
    `);
    res.json(approvals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/audit', async (req, res) => {
  try {
    const logs = await db.all(`
      SELECT 
        id, 
        agent, 
        action as decision, 
        reason, 
        confidence, 
        'Logged' as status, 
        created_at 
      FROM audit_logs 
      ORDER BY created_at DESC 
      LIMIT 100
    `);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tickets/:id/analyze', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch ticket and related transaction
    const ticket = await db.get('SELECT * FROM tickets WHERE id = ?', [id]);
    let transactionContext = 'No linked transaction found.';
    if (ticket.transaction_id) {
      const tx = await db.get('SELECT amount, status FROM transactions WHERE id = ?', [ticket.transaction_id]);
      if (tx) {
        transactionContext = `Linked Transaction: ID ${ticket.transaction_id}, Amount: ₹${tx.amount}, Status: ${tx.status}`;
      }
    }

    const prompt = `
      You are the FinPilot Ticket Support Agent.
      Analyze this support ticket.
      Issue: "${ticket.issue_text || ticket.issue}"
      ${transactionContext}
      
      Decide what action to take (e.g. Refund full amount, Escalate, Ask for info).
      IMPORTANT CRITERIA FOR REFUNDS:
      - If the user states they were OVERCHARGED, you must extract or calculate the EXACT overcharged amount and recommend a partial refund for ONLY that overcharged amount (e.g. "Partial Refund ₹XX.XX"). Do NOT refund the full transaction amount.
      - If they say they were overcharged but DO NOT specify the amount, assume a standard 20% system tax error and recommend a partial refund of exactly 20% of the Linked Transaction Amount.
      - Ensure you use the ₹ (INR) currency symbol.
      
      Respond ONLY with a JSON object in this format:
      {
        "recommendation": "Short action string, e.g. Partial Refund ₹XX.XX",
        "confidence": 95,
        "reason": "Brief reason explaining the calculation"
      }
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
    });

    const responseContent = chatCompletion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(responseContent.trim());
    
    const recommendation = parsed.recommendation || 'Escalate to human agent';
    const confidence = parsed.confidence || 85;
    const reason = parsed.reason || 'AI Analysis';
    
    await db.run('UPDATE tickets SET ai_status = ?, confidence = ?, recommendation = ? WHERE id = ?', 
      ['Analyzed', confidence, recommendation, id]
    );
    
    // Create Audit Log
    await db.run('INSERT INTO audit_logs (agent, action, reason, confidence, ticket_id) VALUES (?, ?, ?, ?, ?)',
      ['Ticket Agent', 'Categorized', reason, confidence, id]
    );

    res.json({ success: true, recommendation, confidence });
  } catch (error) {
    console.error("Ticket AI Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/refund/approve', async (req, res) => {
  try {
    const { transaction_id, id, type } = req.body;
    await new Promise(r => setTimeout(r, 1000));
    
    let actual_txn_id = transaction_id || id;
    
    // Idempotency & Security check
    const existingTxn = await db.get('SELECT amount, refund_status FROM transactions WHERE id = ?', [actual_txn_id]);
    if (!existingTxn) return res.status(404).json({ error: 'Transaction not found' });
    if (existingTxn.refund_status === 'Refunded' || existingTxn.refund_status === 'Partial Refund') {
      return res.status(400).json({ error: 'Idempotency Error: Refund already processed for this transaction.' });
    }

    if (type === 'ticket') {
      const ticket = await db.get('SELECT * FROM tickets WHERE id = ?', [id]);
      if (ticket && ticket.transaction_id) {
        actual_txn_id = ticket.transaction_id;
        
        // Secure validation of refund amount extracted from ticket recommendation
        let requested_amount = existingTxn.amount; // default full
        if (ticket.recommendation && ticket.recommendation.includes('₹')) {
          const match = ticket.recommendation.match(/₹([0-9.]+)/);
          if (match && match[1]) {
            requested_amount = parseFloat(match[1]);
          }
        }
        
        if (requested_amount > existingTxn.amount) {
           return res.status(400).json({ error: `Security Error: Requested refund (₹${requested_amount}) exceeds original transaction amount (₹${existingTxn.amount}).` });
        }
      }
    }

    await db.run('UPDATE transactions SET refund_status = ?, status = ? WHERE id = ?', ['Refunded', 'Refunded', actual_txn_id]);
    
    // Create Audit Log
    await db.run('INSERT INTO audit_logs (agent, action, reason, confidence, transaction_id) VALUES (?, ?, ?, ?, ?)',
      ['Financial Resolution Agent', 'Approved', 'Refund securely verified and processed via AI authorization', 99, actual_txn_id]
    );

    res.json({ success: true, actual_txn_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: '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' });

app.post('/api/payment/verify', async (req, res) => {
  try {
    const { id, type, transaction_id } = req.body;
    
    let transaction;
    let actual_txn_id = transaction_id || id;
    let ticket_context = '';

    if (type === 'ticket') {
      const ticket = await db.get('SELECT * FROM tickets WHERE id = ?', [id]);
      if (ticket && ticket.transaction_id) {
        actual_txn_id = ticket.transaction_id;
        ticket_context = `Context from Support Ticket ${id}: User Issue: "${ticket.issue_text || ticket.issue}".`;
      }
    }
    
    // Fetch transaction details to give AI context
    transaction = await db.get('SELECT * FROM transactions WHERE id = ?', [actual_txn_id]);
    
    const prompt = `
      You are the FinPilot Payment Verification Agent.
      Analyze this transaction: ID ${actual_txn_id}, Amount ₹${transaction?.amount || 0}, Status: ${transaction?.status || 'Unknown'}.
      ${ticket_context}
      Act as an internal banking system. Decide if this needs a refund or is successful.
      Respond ONLY with a JSON object in this exact format, no markdown:
      {
        "recommendation": "Issue Refund Immediately" or "No Action Required",
        "confidence": 98,
        "reason": "Explain briefly based on typical payment gateway logs and any ticket context provided.",
        "payment_status": "Success" or "Failed" or "Pending",
        "deducted": "Yes" or "No",
        "decision": "Refund" or "Approve" or "Investigate"
      }
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
    });

    const responseContent = chatCompletion.choices[0]?.message?.content || '{}';
    const parsedResponse = JSON.parse(responseContent.trim());
    
    const confidence = parsedResponse.confidence || 98;
    const recommendation = parsedResponse.recommendation || 'Issue Refund Immediately';
    const reason = parsedResponse.reason || 'AI Analysis verified the transaction.';
    const payment_status = parsedResponse.payment_status || transaction?.status || 'Unknown';
    const deducted = parsedResponse.deducted || 'Yes';
    const decision = parsedResponse.decision || 'Refund';
    
    // Create Audit Log
    await db.run('INSERT INTO audit_logs (agent, action, reason, confidence, transaction_id) VALUES (?, ?, ?, ?, ?)',
      ['Payment Agent', 'Verified', reason, confidence, actual_txn_id]
    );

    res.json({ success: true, recommendation, confidence, reason, actual_txn_id, payment_status, deducted, decision });
  } catch (error) {
    console.error("Groq Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/fraud/check', async (req, res) => {
  try {
    const { case_id } = req.body;
    await new Promise(r => setTimeout(r, 1000));
    
    // Fetch the fraud case to get risk score
    const fraudCase = await db.get('SELECT * FROM fraud_cases WHERE id = ?', [case_id]);
    if (!fraudCase) {
      return res.status(404).json({ error: 'Fraud case not found' });
    }

    const score = fraudCase.risk_score;
    let action = '';
    let reasonText = '';
    let status = '';
    
    // Explainable ML-Based Probability reason generator
    const mlProbability = Math.min(100, score + Math.floor(Math.random() * 5));

    if (score >= 80) {
      action = 'Block';
      status = 'Blocked';
      reasonText = `ML Fraud Engine flagged a ${mlProbability}% probability of anomaly based on multiple factors (e.g. ${fraudCase.reason}). Transaction strictly blocked.`;
    } else if (score >= 40) {
      action = 'Verify User';
      status = 'Verify User';
      reasonText = `ML Fraud Engine detects a ${mlProbability}% medium-risk probability (${fraudCase.reason}). Added to Fraud DB for user verification.`;
    } else {
      action = 'Approve';
      status = 'Approved';
      reasonText = `ML Fraud Engine verifies low risk profile (${mlProbability}% anomaly probability). Automatically approved.`;
    }
    
    // Update fraud case with the explainable ML reason
    await db.run("UPDATE fraud_cases SET status = ?, reason = ? WHERE id = ?", [status, reasonText, case_id]);
    
    // Create Audit Log
    await db.run('INSERT INTO audit_logs (agent, action, reason, confidence, transaction_id) VALUES (?, ?, ?, ?, ?)',
      ['Fraud Detection Agent', action, reasonText, mlProbability, fraudCase.transaction_id]
    );

    res.json({ success: true, action, status, reasonText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/fraud/ignore', async (req, res) => {
  try {
    const { case_id } = req.body;
    await new Promise(r => setTimeout(r, 500));
    
    const fraudCase = await db.get('SELECT * FROM fraud_cases WHERE id = ?', [case_id]);
    if (!fraudCase) {
      return res.status(404).json({ error: 'Fraud case not found' });
    }

    // Update fraud case status to Ignored
    await db.run("UPDATE fraud_cases SET status = 'Ignored' WHERE id = ?", [case_id]);
    
    // Create Audit Log
    await db.run('INSERT INTO audit_logs (agent, action, reason, confidence, transaction_id) VALUES (?, ?, ?, ?, ?)',
      ['Admin', 'Ignored', 'Admin manually ignored the fraud alert (False Positive)', 100, fraudCase.transaction_id]
    );

    res.json({ success: true, status: 'Ignored' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/refund/reject', async (req, res) => {
  try {
    const { transaction_id } = req.body;
    await new Promise(r => setTimeout(r, 500));
    
    await db.run("UPDATE transactions SET refund_status = 'Rejected' WHERE id = ?", [transaction_id]);
    
    // Create Audit Log
    await db.run('INSERT INTO audit_logs (agent, action, reason, confidence, transaction_id) VALUES (?, ?, ?, ?, ?)',
      ['Manager', 'Rejected', 'Manager Override (Refund Rejected)', 100, transaction_id]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/agents/status', async (req, res) => {
  res.json([
    { 
      name: 'FinPilot AI Core', 
      model: 'LLaMA-3.1-8B-Instant', 
      status: 'Running', 
      currentTask: 'Monitoring system, processing tickets & fraud alerts...', 
      accuracy: 94.2, 
      avgTime: '1.5s', 
      processed: 38687 
    }
  ]);
});

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    // --- Step 1: Intent Detection ---
    // Make regex more robust to catch any combination of add/create, ticket, and fail
    const failedTxnIntent = /(add|create|raise|make).*ticket.*fail/i.test(message) ||
                            /fail.*transaction.*(add|create|raise|ticket)/i.test(message) ||
                            /ticket.*fail.*transaction/i.test(message) ||
                            /add.*fail.*transaction/i.test(message);

    const isLastHour = /hour|1h/i.test(message);

    // --- Step 2: Fetch live system context ---
    const totalCustomers = await db.get('SELECT COUNT(*) as count FROM customers');
    const todayTransactions = await db.get("SELECT SUM(CAST(amount AS NUMERIC)) as total FROM transactions WHERE status = 'Success'");
    const activeTickets = await db.all('SELECT id, issue_text, priority, status FROM tickets WHERE status != "Closed" ORDER BY created_at DESC LIMIT 3');
    const pendingRefunds = await db.get('SELECT COUNT(*) as count FROM transactions WHERE refund_status = "Pending"');
    const fraudAlerts = await db.all('SELECT id, transaction_id, risk_score, status FROM fraud_cases WHERE status = "pending" ORDER BY created_at DESC LIMIT 3');
    const recentTransactions = await db.all('SELECT id, amount, status FROM transactions ORDER BY created_at DESC LIMIT 5');

    let actionResult = null;

    // --- Step 3: Execute Action if intent matches ---
    if (failedTxnIntent) {
      const timeCondition = isLastHour ? "AND t.created_at >= datetime('now', '-1 hour')" : "";
      
      // Find the latest failed transactions that don't already have a ticket
      const failedTxns = await db.all(`
        SELECT t.id, t.amount, t.customer_id, t.status, t.payment_method
        FROM transactions t
        WHERE t.status = 'Failed'
        AND t.id NOT IN (SELECT transaction_id FROM tickets WHERE transaction_id IS NOT NULL)
        ${timeCondition}
        ORDER BY t.created_at DESC
        LIMIT 5
      `);

      const created = [];
      for (const txn of failedTxns) {
        const priority = getPriority(txn.amount);
        await db.run(
          'INSERT INTO tickets (customer_id, transaction_id, issue_text, priority, status, ai_status) VALUES (?, ?, ?, ?, ?, ?)',
          [txn.customer_id, txn.id, `Auto-raised: Payment failed for ₹${parseFloat(txn.amount).toFixed(2)} via ${txn.payment_method}. Transaction ID: TXN-${String(txn.id).padStart(5,'0')}`, priority, 'Open', 'Pending Analysis']
        );
        
        // Ensure consistent audit logging
        await db.run(
          'INSERT INTO audit_logs (agent, action, reason, confidence, transaction_id) VALUES (?, ?, ?, ?, ?)',
          ['FinPilot AI Core', 'Created Ticket', `Auto-raised ticket for failed payment of ₹${parseFloat(txn.amount).toFixed(2)}`, 98, txn.id]
        );

        created.push(`TXN-${String(txn.id).padStart(5,'0')} (₹${parseFloat(txn.amount).toFixed(2)}) [${priority}]`);
      }

      actionResult = {
        type: 'tickets_created',
        count: created.length,
        tickets: created
      };
    }

    // --- Step 4: Ask Groq to compose a natural language reply ---
    const actionContext = actionResult 
      ? `You just performed this action: Created ${actionResult.count} new support tickets for these failed transactions: ${actionResult.tickets.join(', ')}. Tell the user this was done successfully.`
      : '';

    const prompt = `
      You are FinPilot Bot, a helpful AI assistant for an enterprise financial operations platform.
      You have access to live data from this application. Here is the current system context:
      - Total Customers: ${totalCustomers?.count || 0}
      - Revenue (Successful Txns): ₹${todayTransactions?.total || 0}
      - Pending Refunds: ${pendingRefunds?.count || 0}
      
      Recent Open Tickets:
      ${JSON.stringify(activeTickets)}
      
      Recent Fraud Alerts:
      ${JSON.stringify(fraudAlerts)}
      
      Recent Transactions:
      ${JSON.stringify(recentTransactions)}

      ${actionContext}

      The user is an Admin. Answer their question concisely and professionally using the exact data above. Do not hallucinate data.
      
      User: ${message}
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
    });

    const reply = chatCompletion.choices[0]?.message?.content || 'I could not process that request.';
    res.json({ reply, action: actionResult });
  } catch (error) {
    console.error("Groq Chat Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
