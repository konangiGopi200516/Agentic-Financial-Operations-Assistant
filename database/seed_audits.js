const fs = require('fs');

const agents = ['FinPilot AI Core', 'Payment Agent', 'Fraud Agent'];
const actions = ['Categorized Ticket', 'Refund Approved', 'Transaction Frozen', 'Created Ticket', 'Verified'];
const reasons = [
  'Auto-categorized issue as High priority based on keyword analysis',
  'Automated refund for duplicate charge detected within 1m timeframe',
  'Suspicious login attempt from unknown IP pattern',
  'Auto-raised ticket for failed payment',
  'Transaction is legitimate and user authorized the payment',
  'Flagged due to unusual device location',
  'Resolved customer inquiry autonomously',
  'Escalated to human agent due to low confidence',
];

const logs = [];
const now = Date.now();

for (let i = 0; i < 50; i++) {
  const agent = agents[Math.floor(Math.random() * agents.length)];
  const action = actions[Math.floor(Math.random() * actions.length)];
  const reason = reasons[Math.floor(Math.random() * reasons.length)];
  const confidence = (Math.random() * (99.9 - 85.0) + 85.0).toFixed(1);
  
  // Random time in the last 24 hours
  const timeOffset = Math.floor(Math.random() * 24 * 60 * 60 * 1000);
  const logTime = new Date(now - timeOffset);
  const formattedTime = logTime.toISOString().replace('T', ' ').replace('Z', '');

  logs.push(`INSERT INTO audit_logs (agent, action, reason, confidence, created_at) VALUES ('${agent}', '${action}', '${reason}', ${confidence}, '${formattedTime}');`);
}

let sql = fs.readFileSync('seed_data.sql', 'utf8');

// Remove previously added audit logs if they exist
const auditHeaderIndex = sql.indexOf('-- Audit Logs Dummy Data');
if (auditHeaderIndex !== -1) {
  sql = sql.substring(0, auditHeaderIndex);
}

sql += '\n-- Audit Logs Dummy Data\n';
sql += logs.join('\n') + '\n';

fs.writeFileSync('seed_data.sql', sql);
console.log('Added 50 realistic audit logs to seed_data.sql');
