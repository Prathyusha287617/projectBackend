// src/models/Order.ts
import mongoose, { Document, Schema } from 'mongoose';
import Counter from './OrderCounter';

export interface IOrder extends Document {
  orderShortID: string;
  customerShortId: string;
  branchShortId: string;
  productShortId: string;
  quantity: number;
  totalPrice: number;
  orderDate: Date;
  transactionStatus: 'Pending' | 'Completed';

}

const orderSchema = new Schema<IOrder>(
  {
    orderShortID: {
      type: String,
      unique: true,
    },
    customerShortId: {
      type: String,
      required: true,
    },
    branchShortId: {
      type: String,
      required: true,
    },
    productShortId: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    orderDate: {
      type: Date,
      required: true,
    },
    transactionStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Cancelled'],
      required: true,
    },
  },
  { timestamps: true }
);

// Pre-save middleware to generate unique orderShortID if not present
orderSchema.pre<IOrder>('save', async function (next) {
  try {
    // Generate unique orderShortID if not present
    if (!this.orderShortID) {
      const counter = await Counter.findOneAndUpdate(
        { name: 'orderCounter' },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
      );
      this.orderShortID = `ORD-${counter.value.toString().padStart(4, '0')}`;
    }
    next();
  } catch (error:any) {
    next(error);
  }
});

const Order = mongoose.model<IOrder>('Order', orderSchema);
export default Order;
