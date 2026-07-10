const express = require("express");
const cors = require("cors");
const { connectDB } = require("./src/config/db");
const authRoutes = require("./src/route/authRoute");
const productRoutes = require("./src/route/productRoute");
const cartRoutes = require("./src/route/cartRoute");
const orderRoutes = require("./src/route/orderRoute");
const reviewRoutes = require("./src/route/reviewRoute");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.send("Backend Fruit Shop");
});

app.listen(PORT, () => {
  console.log("Server running at http://localhost:" + PORT);
});