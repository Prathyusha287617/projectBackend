// src/models/userModel.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    password: string;
    email: string;
    role: 'branch_retailer' | 'business_retailer' | 'admin' | 'sales_rep';
    branchShortId?: string;
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['branch_retailer', 'business_retailer', 'admin', 'sales_rep'] , required:true },
    branchShortId: { type: String, required: false },
});

export default mongoose.model<IUser>('User', UserSchema);
