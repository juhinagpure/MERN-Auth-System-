// import cookieParser from "cookie-parser";
// import cors from "cors";
// import "dotenv/config";
// import express from "express";
// import connectDB from "./config/mongodb.js";
// import authRouter from "./routes/authRoutes.js";
// import userRouter from "./routes/userRoutes.js";

// const app = express();
// const port = process.env.PORT || 4000;

// // Connect DB
// connectDB();

// const allowedOrigins = ["http://localhost:5173"];

// // Middlewares
// app.use(express.json());
// app.use(cookieParser());

// // CORS FIXED
// app.use(
//   cors({
//     origin: allowedOrigins,
//     credentials: true,
//   })
// );

// // API Endpoints
// app.get("/", (req, res) => res.send("API Working ✅"));
// app.use("/api/auth", authRouter);
// app.use("/api/user", userRouter);

// // Server Start
// app.listen(port, () => console.log(`🚀 Server started on PORT: ${port}`));

import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import serverless from "serverless-http";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();

// ✅ Connect DB
connectDB();

// ⭐ Add Vercel frontend URL here
const allowedOrigins = [
  "http://localhost:5173",
  "https://your-frontend-name.vercel.app",
];

// ⭐ Middlewares
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ⭐ API Routes
app.get("/", (req, res) => res.send("API Working on Vercel ✅"));
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// ❌ REMOVE app.listen()
// app.listen(port, () => console.log(`Server running on ${port}`));

// ⭐ Export serverless handler for Vercel
export const handler = serverless(app);
