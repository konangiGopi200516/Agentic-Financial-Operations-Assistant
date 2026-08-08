const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// Replace all $${ with ₹${
code = code.replace(/\$\$\{/g, '₹${');
// Replace all $ with ₹ in prompts, but not regex or internal syntax
// Better yet, let's just replace all occurrences of literal $ sign used for money
code = code.replace(/Amount: \$/g, 'Amount: ₹');
code = code.replace(/Refund \$/g, 'Refund ₹');
code = code.replace(/Amount \$/g, 'Amount ₹');
code = code.replace(/payment of \$/g, 'payment of ₹');

fs.writeFileSync('server.js', code);
console.log('Replaced $ with ₹ in server.js');
