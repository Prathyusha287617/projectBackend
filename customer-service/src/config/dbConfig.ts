import mongoose from 'mongoose';
import dotenv from 'dotenv';
import syncCounter from '../models/syncCounter';


dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('MongoDB connected');

        await syncCounter();
        console.log('counter synchronized');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit process with failure
    }
};

export default connectDB;
