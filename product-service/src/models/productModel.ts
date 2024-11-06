import mongoose, { Document, Schema } from 'mongoose';
import Counter from './counter';   // Ensure Counter model exists and is correctly configured

// Define the IProduct interface
interface IProduct extends Document {
  productShortId: string;
  productName: string;
  brandName: string;
  productQuantity: number;
  threshold: number;
  restockQuantity: number;
  needsRestock: boolean; // Flag for low stock
  description: string;
  category: string;
  actualPrice: number;
  sellingPrice: number;
  profit: number;       // Auto-calculated in middleware
  branchShortId: string[];
}

// Define the product schema
const productSchema = new Schema<IProduct>(
  {
    productName: { type: String, required: true },
    brandName: { type: String, required: true },
    productQuantity: { type: Number, default: 0 },
    threshold: { type: Number, default: 10 },
    restockQuantity: { type: Number, default: 20 },
    needsRestock: { type: Boolean, default: false },
    description: { type: String, required: true },
    category: { type: String, required: true },
    actualPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    profit: { type: Number },
    branchShortId: { type: [String], required: true },
    productShortId:{type:String,required:false}
  },
  { timestamps: true }
);
// Static method to get the total count of all products
productSchema.statics.totalProductCount = async function () {
  return await this.countDocuments();
};

// Pre-save middleware to handle productShortId, profit, and needsRestock
productSchema.pre<IProduct>('save', async function (next) {
  try {
    // Generate unique productShortId if not present
    if (!this.productShortId) {
      const counter = await Counter.findOneAndUpdate(
        { name: 'productCounter' },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
      );
      this.productShortId = `PROD-${counter.value.toString().padStart(4, '0')}`;
    }

    // Calculate profit based on actualPrice and sellingPrice
    if (this.actualPrice && this.sellingPrice) {
      this.profit = this.sellingPrice - this.actualPrice;
    }

    // Determine needsRestock based on productQuantity and threshold
    this.needsRestock = this.productQuantity <= this.threshold;

    next();
  } catch (error: any) {
    next(error);
  }
});

// Export the Product model
const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;
