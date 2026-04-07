// server.js
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Import các file routes
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes"); // Thêm dòng này

// Khai báo đường dẫn API
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes); // Thêm dòng này

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});