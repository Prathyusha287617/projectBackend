// src/utils/syncCustomerCounter.ts
import Customer from '../models/customer';
import Counter from './CustomerCounter';

async function syncCounter() {
  try {
    // Find the highest `customerShortId` currently in the collection
    const lastCustomer = await Customer.findOne({})
      .sort({ customerShortId: -1 })
      .exec();

    // Check if a customer record with a `customerShortId` exists
    if (lastCustomer && lastCustomer.customerShortId) {
      // Extract the counter part from the `customerShortId` (e.g., "2024CUST00001" -> 1)
      const lastCounterValue = parseInt(lastCustomer.customerShortId.slice(-5), 10);

      // Update the counter if the last recorded value is higher
      await Counter.findOneAndUpdate(
        { name: 'customerCounter' },
        { $max: { value: lastCounterValue } }, // Ensures counter starts from the highest existing ID
        { upsert: true }
      );
    } else {
      console.log('No customers found, skipping counter synchronization.');
    }
  } catch (error) {
    console.error('Error synchronizing customer counter:', error);
  }
}

export default syncCounter;
