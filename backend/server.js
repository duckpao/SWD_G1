const express = require("express");
const cors = require("cors");
const { connectDB } = require("./src/config/db");
const authRoutes = require("./src/route/authRoute");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Backend Fruit Shop");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
