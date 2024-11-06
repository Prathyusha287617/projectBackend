import express from 'express';
import {
    createOrder,
    getOrderById,
    getOrdersByCustomerShortId,
    updateOrderStatus,
    deleteOrder,
    getOrderByShortId,
    updateOrderByShortId,
    deleteOrderByShortId,
    getAllOrders,
    getTotalOrders,
    fetchTotalOrderCount,
    getOrdersByBranch,
    getOrderStatsByBranch,
    getOrderStatsByBranchShortId,
    getMostOrdersByDate,
    getAllOrdersOfBranches,
} from '../controller/orderController';

const router = express.Router();

// Route for fetching most orders based on dates for a specific branch
router.get('/branch/:branchShortId/date-orders', getMostOrdersByDate);

// Route for fetching all orders from all branches
router.get('/all', getAllOrdersOfBranches);
// Route to get order status counts by branch
router.get('/status-counts/:branchShortId', getOrderStatsByBranch);
// Route for fetching order stats by branchShortId
router.get('/order-stats/:branchShortId', getOrderStatsByBranchShortId as any);
// Define the route for fetching order stats by branch
router.get('/order-stats', getOrderStatsByBranch);
// Route to get orders by branchShortId
router.get('/branch/:branchShortId', getOrdersByBranch);
router.get('/count/all', fetchTotalOrderCount);
router.get('/count/:branchShortId', getTotalOrders);
// Existing routes
router.post('/', createOrder);
router.get('/:id', getOrderById);
router.get('/customer/shortid/:customerShortId', getOrdersByCustomerShortId)
router.put('/:id/status', updateOrderStatus);
router.delete('/:id', deleteOrder);
router.get('/', getAllOrders);

// CRUD by orderShortID
router.get('/shortid/:shortId', getOrderByShortId);         // Get order by orderShortID
router.put('/shortid/:shortId', updateOrderByShortId);      // Update order by orderShortID
router.delete('/shortid/:shortId', deleteOrderByShortId);   // Delete order by orderShortID

export default router;
