// src/controllers/orderController.ts
import { Request, Response } from 'express';
import Order from '../models/Order';
import { getCustomerByShortId } from '../service/customerServiceClient'; // Import the updated customer service client

// Method to get most orders based on dates for a specific branch using branchShortId
export const getMostOrdersByDate = async (req: Request, res: Response) => {
  const { branchShortId } = req.params;

  try {
    const orders = await Order.aggregate([
      { $match: { branchShortId } }, // Match by branchShortId
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } }, // Group by date
          totalOrders: { $sum: 1 }, // Count the number of orders for each date
        },
      },
      { $sort: { _id: -1 } }, // Sort by date in descending order
    ]);

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Error fetching most orders by date:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching most orders by date',
    });
  }
};

// Method to fetch all orders from all branches
export const getAllOrdersOfBranches = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find();

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching all orders',
    });
  }
};

// Controller to handle fetching order statistics by branchShortId
export const getOrderStatsByBranchShortId = async (req:Request, res:Response) => {
  const { branchShortId } = req.params; // Extract branchShortId from the URL parameter

  try {
    // Fetch order statistics for the given branchShortId
    const orderStats = await Order.find({ branchShortId });

    if (orderStats.length === 0) {
      return res.status(404).json({ message: 'No order stats found for this branch' });
    }

    // Return the order stats data
    res.json(orderStats);
  } catch (error:any) {
    res.status(500).json({ message: 'Failed to fetch order stats', error: error.message });
  }
};

export const getOrderStatsByBranch = async (req: Request, res: Response) => {
  try {
    // Aggregate orders by branchShortId
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: "$branchShortId",  // Group by branchShortId
          totalOrders: { $sum: 1 },  // Count the number of orders
          totalRevenue: { $sum: "$totalPrice" },  // Sum the total revenue
        }
      },
      {
        $project: {
          branchShortId: "$_id",
          totalOrders: 1,
          totalRevenue: 1,
          _id: 0
        }
      }
    ]);

    res.json(orderStats);  // Return the result to frontend
  } catch (error) {
    res.status(500).send('Error fetching order stats');
  }
};

// Method to fetch orders by branchShortId
export const getOrdersByBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { branchShortId } = req.params;
    const orders = await Order.find({ branchShortId });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
};

// Controller method to fetch count of all orders
export const fetchTotalOrderCount = async (req: Request, res: Response) => {
  try {
      const count = await Order.countDocuments();
      res.status(200).json({ totalOrders: count });
  } catch (error) {
      console.error('Error fetching total order count:', error);
      res.status(500).json({ message: 'Failed to fetch total order count' });
  }
};

export const getTotalOrders = async (req: Request, res: Response) => {
  const { branchShortId } = req.params;

  try {
    const totalOrders = await Order.countDocuments({ branchShortId });
    res.json({ totalOrders });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching total orders', error });
  }
};

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