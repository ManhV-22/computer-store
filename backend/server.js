// server.js (Copy toàn bộ dán đè lên file hiện tại)
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Import các file routes
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes"); 

// Khai báo đường dẫn API
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes); 

// XÓA HẾT CÁC ĐOẠN app.post(...) Ở ĐÂY ĐI NHÉ!

app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});