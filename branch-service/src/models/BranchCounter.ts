import mongoose, { Document, Schema } from 'mongoose';

interface ICounter extends Document {
  name: string;
  value: number;
}

const counterSchema = new Schema<ICounter>({
  name: { type: String, required: true, unique: true },
  value: { type: Number, required: true, default: 0 },
});

const Counter = mongoose.model<ICounter>('Counter', counterSchema);

export default Counter;
