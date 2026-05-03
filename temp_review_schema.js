const db = require('./backend/config/db');
(async () => {
  try {
    const [rows] = await db.query('SHOW CREATE TABLE review');
    console.log(JSON.stringify(rows, null, 2));
  } catch (e) {
    console.error(e && e.message);
  } finally {
    process.exit();
  }
})();
