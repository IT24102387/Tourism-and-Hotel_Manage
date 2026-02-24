import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cors from "cors";
import dns from "node:dns";
import userRouter from "./routes/userRouter.js";
import reviewRouter from "./routes/reviewRouter.js";
import productRouter from "./routes/ProductRouter.js";
import inquiryRouter from "./routes/inquiryRouter.js";
import roomRouter from "./routes/roomRouter.js";
import bookingRouter from "./routes/bookingRouter.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

dotenv.config();

const app = express();

/* ================= CORS ================= */

app.use(cors({
  origin: "http://localhost:5173",   // your Vite frontend URL
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(bodyParser.json());

/* ================= JWT MIDDLEWARE ================= */

app.use((req, res, next) => {
  let token = req.header("Authorization");

  if (token) {
    token = token.replace("Bearer ", "");

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        req.user = null;   // ✅ explicitly null on invalid token
      } else {
        req.user = decoded;
      }
    });
  } else {
    req.user = null;       // ✅ explicitly null when no token
  }

  next();
});

/* ================= DATABASE CONNECTION ================= */

const mongoUrl = process.env.MONGO_URL;

if (!mongoUrl) {
  console.error("MONGO_URL is not defined in .env file");
  process.exit(1);         // ✅ stop server if no DB URL
}

mongoose.connect(mongoUrl).catch((error) => {
  console.error("MongoDB connection failed:", error.message);
  process.exit(1);         // ✅ stop server if DB connection fails
});

mongoose.connection.once("open", () => {
  console.log("MongoDB connection established successfully");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB error:", error.message);  // ✅ catch runtime DB errors
});

/* ================= ROUTES ================= */

app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/inquiries", inquiryRouter);

/* ================= 404 HANDLER ================= */

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });  // ✅ handle unknown routes
});

/* ================= GLOBAL ERROR HANDLER ================= */

app.use((error, req, res, next) => {
  console.error("Unhandled error:", error.message);
  res.status(500).json({ message: "Internal server error" }); // ✅ catch unexpected crashes
});

/* ================= SERVER ================= */

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});