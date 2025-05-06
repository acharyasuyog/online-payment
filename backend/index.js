const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db");
const paymentRoutes = require("./routes/payment");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/payment", paymentRoutes);
app.get("/", (req, res) => {
  res.send("API is running...");
});
connectDB();
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
