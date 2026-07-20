const express = require("express");
const cors = require("cors");
const { connectDB } = require("./src/config/db");
const authRoutes = require("./src/route/authRoute");
const productRoutes = require("./src/route/productRoute");
const cartRoutes = require("./src/route/cartRoute");
const orderRoutes = require("./src/route/orderRoute");
const reviewRoutes = require("./src/route/reviewRoute");
const addressRoutes = require("./src/route/addressRoute");
const adminRoutes = require("./src/route/adminRoute");
const shopRoutes = require("./src/route/shopRoute");
const shipperRoutes = require("./src/route/shipperRoute");
const paymentRoutes = require("./src/route/paymentRoute");

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/shipper", shipperRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/", (req, res) => res.send("Backend Fruit Shop"));
app.listen(5000, () => console.log("Server running at http://localhost:5000"));