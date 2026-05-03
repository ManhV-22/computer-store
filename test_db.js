const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

async function test() {
  try {
    const db = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'computer_store'
    });

    const [users] = await db.query('SELECT * FROM users LIMIT 1');
    if (users.length > 0) {
      const user = users[0];
      const token = jwt.sign({ id: user.id, role: user.role }, 'YOUR_SECRET_KEY', { expiresIn: '1d' });
      console.log('User found:', user.email);
      console.log('Token:', token);
    } else {
      console.log('No users found');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}
test();