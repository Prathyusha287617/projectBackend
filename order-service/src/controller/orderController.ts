// src/controllers/orderController.ts
import { Request, Response } from 'express';
import Order from '../models/Order';
import { getCustomerByShortId } from '../service/customerServiceClient'; // Import the updated customer service client

// Create Order Controller
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderData = req.body;

    // Create a new order instance
    const order = new Order(orderData);

    // Save the order to the database
    await order.save();

    // Respond with a success message
    res.status(201).json({ message: 'Order created successfully!', order });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'An error occurred while creating the order.' });
  }
};



// Get all orders
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (error) {
        console.error("Error fetching all orders:", error);
        res.status(500).json({ message: 'Error fetching all orders', error });
    }
};

// Get a specific order by ID
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error });
  }
};

// Get all orders by customerShortId
export const getOrdersByCustomerShortId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { customerShortId } = req.params;
        const orders = await Order.find({ customerId: customerShortId });  // assuming customerId field holds shortId
        res.json(orders);
    } catch (error) {
        console.error("Error fetching orders by customerShortId:", error);
        res.status(500).json({ message: 'Error fetching orders by customerShortId', error });
    }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { transactionStatus: status, updatedAt: new Date() },
      { new: true }
    );
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error });
  }
};

// Delete an order by ID
export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order', error });
  }
};

// Get an order by orderShortID
export const getOrderByShortId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { shortId } = req.params;
        const order = await Order.findOne({ orderShortID: shortId });
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        res.json(order);
    } catch (error) {
        console.error("Error fetching order by shortId:", error);
        res.status(500).json({ message: 'Error fetching order', error });
    }
};

// Update an order by orderShortID
export const updateOrderByShortId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { shortId } = req.params;
        const updateData = req.body;

        const order = await Order.findOneAndUpdate(
            { orderShortID: shortId },
            { ...updateData, updatedAt: new Date() },
            { new: true }
        );

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        res.json(order);
    } catch (error) {
        console.error("Error updating order by shortId:", error);
        res.status(500).json({ message: 'Error updating order', error });
    }
};

// Delete an order by orderShortID
export const deleteOrderByShortId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { shortId } = req.params;
        const order = await Order.findOneAndDelete({ orderShortID: shortId });

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error("Error deleting order by shortId:", error);
        res.status(500).json({ message: 'Error deleting order', error });
    }
};