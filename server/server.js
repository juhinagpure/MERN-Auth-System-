import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 4000;

// ✅ Connect Database
connectDB();

// ✅ Middlewares
app.use(express.json());
app.use(cookieParser());

// ❗ Corrected cors config
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend URL
    credentials: true, // ✅ lowercase 'credentials'
  })
);

// ✅ API Endpoints
app.get("/", (req, res) => res.send("API Working ✅"));
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// ✅ Start server
app.listen(port, () => console.log(`🚀 Server started on PORT: ${port}`));
