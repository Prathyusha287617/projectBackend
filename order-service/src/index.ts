// src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/dbConfig'; // Import the database connection function
import orderRoutes from './routes/orderRoutes';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/orders', orderRoutes);

app.listen(PORT, () => {
  console.log(`Order service running on port ${PORT}`);
});
