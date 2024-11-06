import mongoose, { Document, Schema } from 'mongoose';
import Counter from './CustomerCounter';

// Define the ICustomer interface
interface ICustomer extends Document {
    customerShortId?: string; // Make this optional for pre-save logic
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    branchShortId: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// Define the customer schema
const customerSchema = new Schema<ICustomer>(
    {
        customerShortId: { type: String, unique: true },
        customerName: { type: String, required: true },
        customerEmail: { type: String, required: true, unique: true },
        customerPhone: { type: String, required: true },
        branchShortId: { type: String, required: true },
    },
    { timestamps: true } // Automatically manage createdAt and updatedAt
);
// Static method to get the total count of all products
customerSchema.statics.totalCustomerCount = async function () {
    return await this.countDocuments();
  };
// Pre-save hook for generating customerShortId
customerSchema.pre<ICustomer>('save', async function (next) {
        // Only generate customerShortId if it's not already set
        if (!this.customerShortId) {
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const shortName = "CUST"; // Updated short name for customers
  
            const counter = await Counter.findOneAndUpdate(
                { name: 'customerCounter' },
                { $inc: { value: 1 } },
                { new: true, upsert: true }
            );

            this.customerShortId = `${year}${shortName}${counter.value.toString().padStart(5, '0')}`;
            console.log('Generated Custom ID for Customer:', this.customerShortId);
        }
        
        next(); 
});


// Create the Customer model
const Customer = mongoose.model<ICustomer>('Customer', customerSchema);
export default Customer;
