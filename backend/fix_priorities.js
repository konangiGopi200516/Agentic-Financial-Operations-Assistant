const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

async function fix() {
  const db = await open({ filename: '../database/database.sqlite', driver: sqlite3.Database });
  
  // Update all tickets linked to a transaction based on that transaction's amount
  await db.run(`
    UPDATE tickets
    SET priority = CASE
      WHEN (SELECT CAST(amount AS REAL) FROM transactions WHERE id = tickets.transaction_id) >= 10000 THEN 'High'
      WHEN (SELECT CAST(amount AS REAL) FROM transactions WHERE id = tickets.transaction_id) < 1000  THEN 'Low'
      ELSE 'Medium'
    END
    WHERE transaction_id IS NOT NULL
  `);

  // Tickets with no transaction: default to Medium
  await db.run(`UPDATE tickets SET priority = 'Medium' WHERE transaction_id IS NULL AND priority = 'High'`);

  const result = await db.all('SELECT priority, COUNT(*) as count FROM tickets GROUP BY priority ORDER BY priority');
  console.log('Priority distribution after fix:');
  result.forEach(r => console.log(' ', r.priority, '->', r.count, 'tickets'));
  await db.close();
}

fix().catch(console.error);
