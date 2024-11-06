import { Router } from 'express';
import {
    createCustomer,
    getCustomerByShortId,
    getCustomerById,
    getAllCustomers,
    updateCustomerByShortId,
    deleteCustomerByShortId,
   getCustomerOrders,
   checkCustomerByEmail,
   addCustomerByEmail,
   getTotalCustomers,
   fetchTotalCustomerCount
} from '../controller/customerController'; // Adjust the import according to your folder structure
 
const customerRouter = Router();
 
customerRouter.get('/count/all', fetchTotalCustomerCount);
customerRouter.get('/count/:branchShortId', getTotalCustomers);
customerRouter.get('/checkCustomer',checkCustomerByEmail as any);
customerRouter.post('/addCustomer', addCustomerByEmail);
customerRouter.post('/', createCustomer); // Create a new customer
customerRouter.get('/shortId/:shortId', getCustomerByShortId); // Get a customer by customerShortId
customerRouter.get('/:id', getCustomerById); // Get a customer by MongoDB ObjectId
customerRouter.get('/', getAllCustomers); // Get all customers
customerRouter.put('/shortId/:shortId', updateCustomerByShortId); // Update a customer by customerShortId
customerRouter.delete('/shortId/:shortId', deleteCustomerByShortId); // Delete a customer by customerShortId
 
// New route to get orders for a customer
customerRouter.get('/:shortId/orders', getCustomerOrders);
 
 
export default customerRouter;