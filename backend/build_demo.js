const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../database/database.sqlite');

async function buildDemo() {
  db.serialize(() => {
    // 1. Insert a transaction for Aarav Patel
    db.run(`INSERT INTO transactions (id, customer_id, amount, status, payment_method, refund_status) VALUES (?, ?, ?, ?, ?, ?)`,
      [9999, 10, 5000.00, 'Success', 'Credit Card', 'none']
    );
    
    // 2. Insert the customer if missing (Customer 10 usually exists in seed, but we can update it to be Aarav Patel)
    db.run(`UPDATE customers SET name = 'Aarav Patel', email = 'aarav.patel@example.com' WHERE id = 10`);

    // 3. Create a golden path ticket for double-charge
    const issue = "I was charged twice for my premium subscription! The actual cost is ₹2500 but my card was charged ₹5000. Please refund the extra ₹2500 immediately.";
    
    db.run(`INSERT INTO tickets (id, customer_id, issue_text, status, priority, transaction_id, ai_status, recommendation, confidence) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [9999, 10, issue, 'Open', 'High', 9999, 'Pending', '', 0]
    );

    console.log("Golden Path Demo Incident Created Successfully: Ticket ID 9999, Transaction ID 9999 for Aarav Patel.");
  });
}

buildDemo();
