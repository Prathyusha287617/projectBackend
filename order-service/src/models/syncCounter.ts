// src/utils/syncOrderCounter.ts
import Order from '../models/Order';
import Counter from './OrderCounter';

async function syncCounter() {
  try {
    // Find the highest `orderShortID` currently in the collection
    const lastOrder = await Order.findOne({})
      .sort({ orderShortID: -1 })
      .exec();

    // Check if lastOrder is found
    if (lastOrder && lastOrder.orderShortID) {
      const lastCounterValue = parseInt(lastOrder.orderShortID.split('-')[1], 10);

      // Update the counter if the last recorded value is higher
      await Counter.findOneAndUpdate(
        { name: 'orderCounter' },
        { $max: { value: lastCounterValue } }, // Ensures the counter never goes below the current max
        { upsert: true }
      );
    } else {
      console.log('No orders found, skipping counter synchronization.');
    }
  } catch (error) {
    console.error('Error synchronizing order counter:', error);
  }
}

export default syncCounter;
