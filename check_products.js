const mysql = require('mysql2/promise');

async function checkProducts() {
  try {
    const db = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'computer_store'
    });

    const [products] = await db.query('SELECT id, name FROM products LIMIT 5');
    console.log('Available products:');
    products.forEach(p => console.log(`${p.id}: ${p.name}`));

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}
checkProducts();