import express from 'express';
import cors from 'cors';
import "dotenv/config";
import { clerkMiddleware } from '@clerk/express';
import aiRouter from './routes/aiRoutes.js';
import userRouter from './routes/userRoutes.js';
import { connectCloudinary } from "./configs/cloudinary.js";

const app = express();

await connectCloudinary();

const corsOptions = {
  origin: ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('/{*splat}', cors(corsOptions));

app.use(express.json());
console.log("SECRET:", process.env.CLERK_SECRET_KEY);
app.use(clerkMiddleware());

app.get('/', (req, res) => {
  res.send('Server is Live!');
});

app.use('/api/ai', aiRouter);
app.use('/api/user', userRouter);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});