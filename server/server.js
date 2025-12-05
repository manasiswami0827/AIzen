import "dotenv/config";
import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import aiRouter from "./routes/aiRoutes.js";
import userRouter from "./routes/userRoutes.js";
import { connectCloudinary } from "./configs/cloudinary.js";
import { auth } from "./middlewares/auth.js";

const app = express();

// Run Cloudinary connection inside a function, not top-level await
(async () => {
  await connectCloudinary();
})();

app.use(cors());
app.use(express.json());

// Clerk middleware
app.use(clerkMiddleware());

// Test route
app.get("/", (req, res) => res.send("Server is live!"));

// Routes
app.use("/api/ai", auth, aiRouter);
app.use("/api/user", auth, userRouter);

// Vercel requires export, not continuous listening in serverless mode
const PORT = process.env.PORT || 3000;

if (process.env.VERCEL) {
  // Serverless mode: do NOT call listen()
  console.log("Running in Vercel serverless mode");
} else {
  // Local development
  app.listen(PORT, () => console.log("Server running on", PORT));
}

export default app;