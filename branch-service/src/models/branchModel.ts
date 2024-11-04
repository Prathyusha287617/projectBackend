import mongoose, { Document, Schema } from 'mongoose';
import Counter from './BranchCounter';

interface IBranch extends Document {
  branchLocation: string;
  branchRegion: string;
  branchMobileNumber: number;
  branchEmail: string;
  branchShortId: string;
}

const branchSchema = new Schema<IBranch>(
  {
    branchLocation: {
      type: String,
      required: true,
    },
    branchRegion: {
      type: String,
      required: true,
    },
    branchMobileNumber: {
      type: Number,
      required: true,
    },
    branchEmail: {
      type: String,
      required: true,
      unique: true,
    },
    branchShortId: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

branchSchema.pre<IBranch>('save', async function (next) {
  try {
    const prefix = "PAI";

    // Retrieve and increment the counter value for branchShortId generation
    const counter = await Counter.findOneAndUpdate(
      { name: 'branchCounter' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    // Format branchShortId as "PAI" + counter padded to three digits
    this.branchShortId = `${prefix}${counter.value.toString().padStart(3, '0')}`;
    console.log('Generated Custom ID for Branch:', this.branchShortId);

    next();
  } catch (error: any) {
    next(error);
  }
});

const Branch = mongoose.model<IBranch>('Branch', branchSchema);
export default Branch;
