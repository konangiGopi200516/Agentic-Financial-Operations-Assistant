const fs = require('fs');

const firstNames = ['Arjun', 'Aarav', 'Vihaan', 'Aditya', 'Rohan', 'Dhruv', 'Kartik', 'Rahul', 'Ananya', 'Diya', 'Ishita', 'Neha', 'Priya', 'Sneha', 'Shruti', 'Vikram', 'Raj', 'Amit', 'Karan', 'Pooja', 'Riya', 'Kriti', 'Simran', 'Tanvi', 'Anjali', 'Kavya', 'Siddharth', 'Pranav', 'Yash', 'Rishi', 'Kunal', 'Rajat', 'Ashish', 'Manish', 'Suresh', 'Ramesh', 'Harish', 'Gaurav', 'Saurabh', 'Nitin', 'Alok', 'Deepak', 'Sanjay', 'Sunil', 'Vijay', 'Ajay', 'Anil', 'Mukesh', 'Rajesh', 'Prakash', 'Mahesh'];
const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Das', 'Gupta', 'Verma', 'Reddy', 'Rao', 'Nair', 'Pillai', 'Mehta', 'Chopra', 'Joshi', 'Tiwari', 'Pandey', 'Mishra', 'Dubey', 'Yadav', 'Thakur', 'Chauhan', 'Rajput', 'Iyer', 'Menon', 'Bose', 'Chatterjee', 'Banerjee', 'Mukherjee', 'Sen', 'Dutta', 'Saha', 'Ghosh', 'Dasgupta', 'Sengupta', 'Kaur', 'Khatri', 'Ahuja', 'Bhatia', 'Malhotra', 'Kapoor', 'Khanna', 'Oberoi', 'Sethi', 'Bhasin', 'Narang', 'Grover'];

let names = new Set();
while(names.size < 200) {
  const f = firstNames[Math.floor(Math.random() * firstNames.length)];
  const l = lastNames[Math.floor(Math.random() * lastNames.length)];
  names.add(f + ' ' + l);
}
const uniqueNames = Array.from(names);

let sql = fs.readFileSync('seed_data.sql', 'utf8');
let newLines = [];
let customerIndex = 0;

for (const line of sql.split('\n')) {
  if (line.startsWith('INSERT INTO customers')) {
    const name = uniqueNames[customerIndex];
    const email = name.toLowerCase().replace(' ', '.') + (Math.floor(Math.random() * 99) + 1) + '@example.com';
    const phone = '+91' + (Math.floor(Math.random() * 900000000) + 9000000000);
    newLines.push(`INSERT INTO customers (name, email, phone) VALUES ('${name}', '${email}', '${phone}');`);
    customerIndex++;
  } else {
    newLines.push(line);
  }
}

fs.writeFileSync('seed_data.sql', newLines.join('\n'));
console.log('Done replacing names.');
