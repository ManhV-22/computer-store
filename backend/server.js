// server.js 
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Import các file routes
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes"); 
const orderRoutes = require("./routes/orderRoutes"); // THÊM DÒNG NÀY
const adminRoutes = require('./routes/adminRoutes');

// Khai báo đường dẫn API
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes); 
app.use("/api/orders", orderRoutes); // THÊM DÒNG NÀY
app.use('/api/admin', adminRoutes);

app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});