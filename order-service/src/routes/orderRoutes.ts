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
    fetchTotalOrderCount
} from '../controller/orderController';

const router = express.Router();

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
