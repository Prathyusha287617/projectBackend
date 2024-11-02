// syncCounter.ts
import Product from './productModel'; // Update path accordingly
import Counter from './counter';

async function syncCounter() {
  try {
    // Find the highest `productShortId` currently in the collection
    const lastProduct = await Product.findOne({})
      .sort({ productShortId: -1 })
      .exec();

    // Check if lastProduct is found
    if (lastProduct && lastProduct.productShortId) {
      const lastCounterValue = parseInt(lastProduct.productShortId.split('-')[1], 10);

      // Update the counter if the last recorded value is higher
      await Counter.findOneAndUpdate(
        { name: 'productCounter' },
        { $max: { value: lastCounterValue } }, // Ensures the counter never goes below the current max
        { upsert: true }
      );
    } else {
      console.log('No products found, skipping counter synchronization.');
    }
  } catch (error) {
    console.error('Error synchronizing counter:', error);
  }
}
export default syncCounter;
