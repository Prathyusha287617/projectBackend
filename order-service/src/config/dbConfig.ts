// src/config/dbConfig.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import syncCounter from '../models/syncCounter';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || '');
    console.log(`MongoDB connected`);

    await syncCounter();
    console.log('counter synchronized');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
