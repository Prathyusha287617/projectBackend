// src/routes/productRoutes.ts
import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductByShortId,
  getProductsByBrand,
  getProductsByCategory,
  getBrandsByBranch,
  getCategoriesByBranchAndBrand,
  updateProductQuantity,
  triggerRestockRequest,
  updateProductDetails,
  getProductsByBranch,
  getProductByHeaderShortId,
  updateProductStockQuantity,
  getAllProductsForBusinessRetailer,
  getQuantityHistory,
  getProductQuantityHistory,
  getAllProductShortIds,
  getProductCountByBrandAndBranch,
  getTotalProducts,
  fetchTotalProductCount,
  getAgingProductsByCategory,
  getProductCountsByBranch
} from '../controller/productController';

const router = express.Router();

// Route to get product counts by branch
router.get('/counts-by-branch', getProductCountsByBranch);
// Define route to get aging products by category
router.get('/aging-by-category', getAgingProductsByCategory);
router.get('/count/all',fetchTotalProductCount)
router.get('/count/:branchShortId', getTotalProducts);
router.get('/all-product-ids', getAllProductShortIds);
// productRoutes.ts
router.get('/quantity-history/:productShortId', getProductQuantityHistory as any);

// Define the route for fetching quantity history
router.get('/api/product/quantity-history/:productShortId', getQuantityHistory as any);

router.get('/all',  getAllProductsForBusinessRetailer as any);
router.get('/id', getProductByHeaderShortId as any);
router.put('/shortId/:productShortId', updateProductQuantity as any);
router.put('/:productShortId', updateProductStockQuantity as any);


router.post('/', createProduct); // Create a new product
router.get('/', getAllProducts); // Get all products
router.get('/:id', getProductById as any); // Get a single product by ID
router.put('/:id', updateProduct as any); // Update a product by ID
router.delete('/:id', deleteProduct as any); // Delete a product by ID
router.get('/shortId/:productShortId',getProductByShortId as any)
router.get('/brand/:brandName', getProductsByBrand as any); // Get products by brand name
router.get('/category/:category', getProductsByCategory as any); // Get products by category

router.get('/brands/branch/:branchShortId', getBrandsByBranch);
router.get('/categories/branch/:branchShortId/brand/:brandName', getCategoriesByBranchAndBrand);

router.put('/products/:productShortId/quantity', updateProductQuantity as any);
router.post('/products/:productShortId/restock', triggerRestockRequest as any);
router.put('/products/:productShortId', updateProductDetails as any);

router.get('/branch/:branchShortId', getProductsByBranch as any);

router.get('/count/:branchShortId/:brandName', getProductCountByBrandAndBranch as any);
// Route to get a product by short ID from headers


/*
router.post('/', createProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

router.get('/shortId/:shortId', getProductByShortId);

router.get('/categories/:brandName', getCategoriesByBrandName as any);

router.get('/brand/:brandName/categories', getCategoriesByBrand as any);

router.post('/brand/:brandName/categories', addProductByBrand as any);
*/

export default router;
