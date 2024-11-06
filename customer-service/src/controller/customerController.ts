import { Request, Response } from 'express';
import Customer from '../models/customer'; // Adjust the import according to your folder structure
import { getOrdersByCustomerShortId } from '../services/orderServiceClient'; // Adjust the import according to your folder structure
import axios from 'axios';
 
export const getTotalCustomers = async (req: Request, res: Response) => {
    const { branchShortId } = req.params;
  
    try {
      const totalCustomers = await Customer.countDocuments({ branchShortId });
      res.json({ totalCustomers });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching total customers', error });
    }
  };

  // Controller method to fetch count of all customers
export const fetchTotalCustomerCount = async (req: Request, res: Response) => {
    try {
        const customerCount = await Customer.countDocuments();
        res.status(200).json({ totalCustomers: customerCount });
    } catch (error) {
        console.error('Error fetching customer count:', error);
        res.status(500).json({ message: 'Failed to fetch customer count' });
    }
};

// 1. Create a Customer
export const createCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        // Destructure the request body without customerShortId
        const { customerName, customerEmail, customerPhone, branchShortId } = req.body;
 
        const newCustomer = new Customer({
            customerName,
            customerEmail,
            customerPhone,
            branchShortId
        });
 
        await newCustomer.save();
        res.status(201).json(newCustomer);
    } catch (error: any) {
        console.error("Error creating customer:", error);
        res.status(500).json({ message: 'Error creating customer', error: error.message });
    }
};
 
// 2. Get a Customer by customerShortId
export const getCustomerByShortId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { shortId } = req.params; // Destructure the shortId from req.params
        const customer = await Customer.findOne({ customerShortId: shortId }); // Use shortId in the query
        if (!customer) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }
        res.json(customer);
    } catch (error: any) {
        console.error("Error fetching customer:", error);
        res.status(500).json({ message: 'Error fetching customer', error: error.message });
    }
};
 
// 3. Get a Customer by MongoDB ObjectId
export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params; // Get the customer ID from request parameters
        const customer = await Customer.findById(id); // Use MongoDB ObjectId to find the customer
        if (!customer) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }
        res.json(customer);
    } catch (error:any) {
        console.error("Error fetching customer by ID:", error);
        res.status(500).json({ message: 'Error fetching customer', error: error.message });
    }
};
 
 
// 4. Get All Customers
export const getAllCustomers = async (req: Request, res: Response): Promise<void> => {
    try {
        const customers = await Customer.find();
        res.json(customers);
    } catch (error:any) {
        console.error("Error fetching customers:", error);
        res.status(500).json({ message: 'Error fetching customers', error: error.message });
    }
};
 
// 5. Update a Customer by customerShortId
export const updateCustomerByShortId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { shortId } = req.params; // Get the customerShortId from the request params
        const updatedCustomer = await Customer.findOneAndUpdate(
            { customerShortId: shortId },
            req.body,
            { new: true, runValidators: true } // Return the updated document and validate
        );
        if (!updatedCustomer) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }
        res.json(updatedCustomer);
    } catch (error:any) {
        console.error("Error updating customer:", error);
        res.status(500).json({ message: 'Error updating customer', error: error.message });
    }
};
 
// 6. Delete a Customer by customerShortId
export const deleteCustomerByShortId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { shortId } = req.params; // Get the customerShortId from the request params
        const deletedCustomer = await Customer.findOneAndDelete({ customerShortId: shortId });
        if (!deletedCustomer) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }
        res.json({ message: 'Customer deleted successfully' });
    } catch (error:any) {
        console.error("Error deleting customer:", error);
        res.status(500).json({ message: 'Error deleting customer', error: error.message });
    }
};
 
// Get all orders for a specific customer
export const getCustomerOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const { shortId } = req.params; // Get customerShortId from request params
       
        // Fetch orders by customerShortId using the order service client
        const orders = await getOrdersByCustomerShortId(shortId);
       
        // Return the fetched orders
        res.json(orders);
    } catch (error: any) {
        console.error("Error fetching customer orders:", error);
        res.status(500).json({ message: 'Error fetching customer orders', error: error.message });
    }
};
 
export const checkCustomerByEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const customerEmail = req.query.customerEmail as string;
        const customer = await Customer.findOne({ customerEmail: customerEmail });
 
        if (customer) {
            res.status(200).json(customer);
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        console.error("Error checking customer:", error);
        res.status(500).json({ message: 'Error checking customer', error });
    }
};
 
export const addCustomerByEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { customerEmail } = req.query;
        const { customerShortId, customerName, customerPhone, branchShortId} = req.body;
 
        // Check if email is provided
        if (!customerEmail) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }
 
        if (!customerName || !customerPhone || !branchShortId) {
            res.status(400).json({ message: 'Name, Phone and Branch Short Id are required' });
            return;
        }
 
        // Create a new customer object
        const newCustomer = new Customer({
        customerEmail: customerEmail as string,
        customerName,
        customerPhone,
        branchShortId,
            // Include other required fields for customer creation, such as name, address, etc.
        });
 
        // Save the customer to the database
        await newCustomer.save();
 
        // Respond with the newly created customer data
        res.status(201).json(newCustomer);
    } catch (error: any) {
        console.error("Error adding customer:", error);
        res.status(500).json({ message: 'Error adding customer', error: error.message });
    }
};
 