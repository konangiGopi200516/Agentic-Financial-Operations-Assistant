const fs = require('fs');

const NUM_CUSTOMERS = 200;
const NUM_TRANSACTIONS = 200;
const NUM_TICKETS = 50;
const NUM_FRAUD_CASES = 20;

const firstNames = ['John', 'Jane', 'Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy', 'Mallory', 'Oscar', 'Peggy', 'Trent', 'Victor', 'Walter'];
const lastNames = ['Smith', 'Doe', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez'];
const paymentMethods = ['Credit Card', 'Debit Card', 'PayPal', 'UPI', 'Bank Transfer'];
const statuses = ['Success', 'Failed', 'Pending', 'Suspicious'];
const refundStatuses = ['none', 'Pending', 'Refunded'];
const issueTypes = [
  'My payment failed but money was deducted.',
  'I was overcharged for this transaction.',
  'I did not authorize this transaction.',
  'The merchant did not receive my payment.',
  'I want to cancel and refund this transaction.'
];
const fraudReasons = [
  'Multiple login locations',
  'Large transaction size anomaly',
  'Device changed recently',
  'Suspicious IP address',
  'Card velocity too high'
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

let sql = `-- Dummy Data Insert Script\n\n`;

// 1. Users
sql += `-- Users\n`;
sql += `INSERT INTO users (name, email, password_hash, role) VALUES ('Admin User', 'admin@finpilot.ai', 'dummy_hash', 'manager');\n\n`;

// 2. Customers
sql += `-- Customers\n`;
for (let i = 1; i <= NUM_CUSTOMERS; i++) {
  const name = `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`;
  const email = `customer${i}@example.com`;
  const phone = `+1555${getRandomInt(1000000, 9999999)}`;
  sql += `INSERT INTO customers (name, email, phone) VALUES ('${name}', '${email}', '${phone}');\n`;
}
sql += '\n';

// 3. Transactions
sql += `-- Transactions\n`;
for (let i = 1; i <= NUM_TRANSACTIONS; i++) {
  const customerId = getRandomInt(1, NUM_CUSTOMERS);
  const amount = (Math.random() * 5000 + 10).toFixed(2);
  const status = getRandomElement(statuses);
  const method = getRandomElement(paymentMethods);
  let rStatus = 'none';
  if (status === 'Failed' && Math.random() > 0.5) rStatus = getRandomElement(['Pending', 'Refunded']);
  
  sql += `INSERT INTO transactions (customer_id, amount, status, payment_method, refund_status) VALUES (${customerId}, ${amount}, '${status}', '${method}', '${rStatus}');\n`;
}
sql += '\n';

// 4. Tickets
sql += `-- Tickets\n`;
for (let i = 1; i <= NUM_TICKETS; i++) {
  const customerId = getRandomInt(1, NUM_CUSTOMERS);
  const txId = getRandomInt(1, NUM_TRANSACTIONS);
  const issue = getRandomElement(issueTypes);
  sql += `INSERT INTO tickets (customer_id, transaction_id, issue_text) VALUES (${customerId}, ${txId}, '${issue}');\n`;
}
sql += '\n';

// 5. Fraud Cases
sql += `-- Fraud Cases\n`;
for (let i = 1; i <= NUM_FRAUD_CASES; i++) {
  const txId = getRandomInt(1, NUM_TRANSACTIONS);
  const score = getRandomInt(75, 99);
  const reason = getRandomElement(fraudReasons);
  sql += `INSERT INTO fraud_cases (transaction_id, risk_score, reason) VALUES (${txId}, ${score}, '${reason}');\n`;
}
sql += '\n';

fs.writeFileSync('seed_data.sql', sql);
console.log('seed_data.sql generated successfully.');
