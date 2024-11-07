// src/controllers/productController.ts
import { Request, Response } from 'express';
import Product from '../models/productModel';
import axios from 'axios';

// Method to get the total count of products by branchShortId
export const getProductCountsByBranch = async (req: Request, res: Response) => {
  try {
      // Aggregating to group by branchShortId and count products
      const productCounts = await Product.aggregate([
          { $unwind: "$branchShortId" },
          { $group: { _id: "$branchShortId", totalProducts: { $sum: 1 } } },
          { $project: { branchShortId: "$_id", totalProducts: 1, _id: 0 } }
      ]);

      res.status(200).json(productCounts);
  } catch (error) {
      console.error("Error fetching product counts by branch:", error);
      res.status(500).json({ error: "An error occurred while fetching product counts by branch" });
  }
};
// Controller function for getting aging products by category
export const getAgingProductsByCategory = async (req: Request, res: Response): Promise<void> => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 1);

  try {
    const agingProducts = await Product.aggregate([
      { $match: { updatedAt: { $lt: thirtyDaysAgo } } }, // Products not updated in the last 30 days
      { $group: { _id: '$category', agingCount: { $sum: 1 } } }, // Group by category with count
    ]);

    res.status(200).json({ success: true, data: agingProducts });
  } catch (error) {
    console.error('Error fetching aging products:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve aging products' });
  }
};

// Controller method to fetch the total count of all products
export const fetchTotalProductCount = async (req: Request, res: Response) => {
  try {
      const count = await Product.countDocuments(); // Directly using countDocuments
      res.status(200).json({ totalProducts: count });
  } catch (error) {
      console.error('Error fetching total product count:', error);
      res.status(500).json({ message: 'Failed to fetch total product count' });
  }
};

export const getTotalProducts = async (req: Request, res: Response) => {
  const { branchShortId } = req.params;

  try {
    const totalProducts = await Product.countDocuments({ branchShortId });
    res.json({ totalProducts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching total products', error });
  }
};

// Function to get product count for each brand in a specific branch
export const getProductCountByBrandAndBranch = async (req: Request, res: Response) => {
  const { branchShortId, brandName } = req.params;

  try {
    const count = await Product.countDocuments({ branchShortId, brandName });
    res.status(200).json(count);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product count', error });
  }
};

// Endpoint to fetch all productShortIds and productNames
export const getAllProductShortIds = async (req: Request, res: Response) => {
  try {
    // Fetch only productShortId and productName for all products
    const products = await Product.find({}, 'productShortId productName').exec();
    
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product IDs', error });
  }
};

// productController.ts
export const getProductQuantityHistory = async (req: Request, res: Response) => {
  const { productShortId } = req.params;

  try {
    const history = await Product.aggregate([
      { $match: { productShortId } },
      { $project: { date: "$createdAt", quantity: "$productQuantity" } },
      { $sort: { date: 1 } } // Sort by date
    ]);

    if (history.length === 0) {
      return res.status(404).json({ message: 'No quantity history found for this product.' });
    }

    res.json(history);
  } catch (error:any) {
    res.status(500).json({ message: error.message });
  }
};

// Controller function to get historical product quantity data
export const getQuantityHistory = async (req: Request, res: Response) => {
  try {
    const { productShortId } = req.params;

    // Find the product by its productShortId
    const product = await Product.findOne({ productShortId });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Assuming you have a history collection or have recorded timestamps in your Product
    const history = await Product.aggregate([
      { $match: { productShortId } },
      { $project: { timestamps: "$createdAt", productQuantity: 1 } },
      { $sort: { timestamps: 1 } } // Sort by time
    ]);

    res.json(history);
  } catch (error:any) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch all products if the user is a business retailer
export const getAllProductsForBusinessRetailer = async (req: Request, res: Response) => {
  try {

    // Fetch all products from all branches
    const products = await Product.find();
    return res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: 'Server error: unable to fetch products.' });
  }
};

export const updateProductStockQuantity = async (req: Request, res: Response) => {
  const { productShortId } = req.params; // Get the productShortId from the request parameters
  const { quantity } = req.body; // Get the quantity to reduce from the request body

  try {
    // Find the product by its short ID
    const product = await Product.findOne({ productShortId });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Calculate the new quantity based on the current quantity and the quantity to reduce
    const newQuantity = product.productQuantity - quantity;

    // Ensure the new quantity is not negative
    if (newQuantity < 0) {
      return res.status(400).json({ error: 'Insufficient stock for this product' });
    }

    // Update the product quantity
    product.productQuantity = newQuantity;

    // Save the updated product to the database
    const updatedProduct = await product.save();

    // Respond with the updated product information
    res.status(200).json({ message: 'Product quantity updated', updatedProduct });
  } catch (error: any) {
    // Handle errors appropriately
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

export const updateProductQuantity = async (req: Request, res: Response) => {
  const { productShortId } = req.params; // Get the productShortId from the request parameters
  const { quantity } = req.body;
 
  try {
    // Find the product by its short ID
    const product = await Product.findOne({ productShortId });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
 
    // Calculate the new quantity based on the current quantity and restock quantity
    const newQuantity = product.productQuantity + quantity;
 
    // Update the product quantity
    product.productQuantity = newQuantity;
 
    // Save the updated product to the database
    const updatedProduct = await product.save();
 
    // Respond with the updated product information
    res.status(200).json({ message: 'Product quantity updated', updatedProduct });
  } catch (error:any) {
    // Handle errors appropriately
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// Controller to fetch products by branchShortId
export const getProductsByBranch = async (req: Request, res: Response) => {
  try {
      const { branchShortId } = req.params;

      // Find products with the specified branchShortId
      const products = await Product.find({ branchShortId });

      if (!products.length) {
          return res.status(404).json({ message: 'No products found for this branch.' });
      }

      res.json(products);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
};

// Function to fetch all unique brand names based on branchShortId
export const getBrandsByBranch = async (req: Request, res: Response) => {
  const { branchShortId } = req.params;

  try {
    const brands = await Product.distinct('brandName', { branchShortId: branchShortId });
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching brand names', error });
  }
};

// Fetch distinct categories for a given branchShortId and brandName
export const getCategoriesByBranchAndBrand = async (req: Request, res: Response) => {
  const { branchShortId, brandName } = req.params;

  try {
    const categories = await Product.distinct('category', {
      branchShortId,
      brandName,
    });

    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories', error });
  }
};

// Trigger a manual restock request (for managers only)
export async function triggerRestockRequest(req: Request, res: Response) {
  const { productShortId } = req.params;
  try {
    const product = await Product.findOne({ productShortId });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    product.needsRestock = true; // Mark as needing restock
    await product.save();
    res.json({ message: 'Restock request triggered', product });
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
}

// Update product details (e.g., for price adjustments)
export async function updateProductDetails(req: Request, res: Response) {
  const { productShortId } = req.params;
  const { sellingPrice, actualPrice, ...otherDetails } = req.body;
  try {
    const product = await Product.findOne({ productShortId });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (sellingPrice && actualPrice) {
      product.sellingPrice = sellingPrice;
      product.actualPrice = actualPrice;
      product.profit = sellingPrice - actualPrice; // Calculate profit
    }

    Object.assign(product, otherDetails);
    await product.save();
    res.json({ message: 'Product details updated', product });
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
}

// Create a new product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Error creating product', error });
  }
};

// Get all products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

// Get a single product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
};

// Get a single product by productShortId
export const getProductByShortId = async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({ productShortId: req.params.productShortId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
};

// Get a single product by productShortId from query parameters
export const getProductByHeaderShortId = async (req: Request, res: Response) => {
  try {
    const productShortId = req.query.productShortId as string;

    // Check if productShortId is provided
    if (!productShortId) {
      return res.status(400).json({ message: 'Product short ID is required' });
    }

    console.log('Searching for product with short ID:', productShortId); // Debugging log

    // Find the product using productShortId
    const product = await Product.findOne({ productShortId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
};


// Update a product by ID
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Error updating product', error });
  }
};

// Delete a product by ID
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
};

// Get products by brand name
export const getProductsByBrand = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ brandName: req.params.brandName });
    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found for this brand' });
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products by brand', error });
  }
};

// Get products by category
export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ category: req.params.category });
    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found in this category' });
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products by category', error });
  }
};

/*
// Replace with the base URL of the Inventory microservice
const INVENTORY_SERVICE_URL = 'http://localhost:5002/api/inventory';

export const getCategoriesByBrand = async (req: Request, res: Response) => {
  try {
    const { brandName } = req.params;

    // Step 2: Call Inventory Service to get inventoryShortId by brandName
    const inventoryResponse = await axios.get(`${INVENTORY_SERVICE_URL}/brand/${brandName}`);
    const inventory = inventoryResponse.data;

    if (!inventory || !inventory.inventoryId) {
      return res.status(404).json({ error: 'Brand not found in Inventory Service' });
    }

    // Step 3: Find products by inventoryShortId and get unique categories
    const products = await Product.find({ inventoryShortId: inventory.inventoryShortId });

    const categories = Array.from(
      new Set(products.map(product => product.category))
    ).map(category => ({ name: category }));

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const addProductByBrand = async (req: Request, res: Response) => {
  const { brandName } = req.params;
  const productData = req.body; // assuming product data is passed in the request body

  try {
    // Step 2: Call Inventory Service to get inventoryShortId by brandName
    const inventoryResponse = await axios.get(`${INVENTORY_SERVICE_URL}/brand/${brandName}`);
    const inventory = inventoryResponse.data;

    if (!inventory || !inventory.inventoryId) {
      return res.status(404).json({ error: 'Brand not found in Inventory Service' });
    }

    // Step 3: Create new product using product data and inventoryShortId
    const newProduct = new Product({
      ...productData,
      inventoryShortId: inventory.inventoryId, // Assign the inventoryShortId from the Inventory Service
    });

    await newProduct.save();

    res.status(201).json(newProduct);
  } catch (error:any) {
    console.log(error.message)
    res.status(500).json({ error: 'Failed to add product' });
  }
};

export const getCategoriesByBrandName = async (req: Request, res: Response) => {
  try {
    const { brandName } = req.params;

    // Step 1: Fetch inventory details from the Inventory service
    const inventoryResponse = await axios.get(`${INVENTORY_SERVICE_URL}/brand/${brandName}`);
    
    if (inventoryResponse.status !== 200 || !inventoryResponse.data) {
      return res.status(404).json({ message: 'Brand not found in Inventory service' });
    }

    const { inventoryId } = inventoryResponse.data;

    // Step 2: Find products by the inventory ID in the Product service
    const products = await Product.find({ inventoryShortId: inventoryId });

    // Step 3: Extract unique categories from the products
    const categories = Array.from(new Set(products.map(product => product.category)));

    res.status(200).json({ brandName, categories });
  } catch (error) {
    console.error('Error fetching categories by brand name:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

// Create a new product
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productName, description, category, price, inventoryShortId } = req.body;

    const product = new Product({
      productName,
      description,
      category,
      price,
      inventoryShortId,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error });
  }
};

// Get a single product by ID
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
};

// Get all products
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

// Update a product by ID
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productName, description, category, price, inventoryShortId } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { productName, description, category, price, inventoryShortId, updatedAt: new Date() },
      { new: true }
    );

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error });
  }
};

// Delete a product by ID
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
};

// Get a single branch by shortId
export const getProductByShortId = async (req: Request, res: Response): Promise<void> => {
  try {
      const branch = await Product.findOne({ productShortId: req.params.shortId });
      if (!branch) {
          res.status(404).json({ message: 'Branch not found' });
      } else {
          res.json(branch);
      }
  } catch (error) {
      res.status(500).json({ message: 'Error fetching branch by shortId', error });
  }
};
*/