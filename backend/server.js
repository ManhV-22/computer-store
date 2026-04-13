const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

app.use(cors());
app.use(express.json());

// PHỤC VỤ FILE TĨNH: Giúp xem được ảnh từ frontend/assets
const assetsPath = path.join(__dirname, '../frontend/assets');
app.use('/assets', express.static(assetsPath));
console.log("Server đang đọc ảnh tại:", assetsPath);

// Khai báo Routes
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/users", require("./routes/userRoutes")); 
app.use("/api/orders", require("./routes/orderRoutes"));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/brands', require('./routes/brandRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/system', require('./routes/systemRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
// app.use('/api/brands', require('./routes/brandRoutes'));

app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});