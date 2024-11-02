// src/controllers/userController.ts
import { Request, Response } from 'express';
import User, { IUser } from '../models/userModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Register a new user
export const register = async (req: Request, res: Response) => {
    const { username, password, email, role, branchShortId } = req.body;

    // Validate the username
    const usernameRegex = /^[A-Za-z][A-Za-z0-9_-]*$/; // Starts with a letter, then letters/numbers/underscores/hyphens
    if (!usernameRegex.test(username)) {
        return res.status(400).json({ message: 'Username must start with a letter and can contain letters, numbers, underscores, or hyphens.' });
    }

     // Validate the password
    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    // Validate the role
    const validRoles = ['branch_retailer', 'business_retailer', 'admin','sales_rep'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: `Role must be one of: ${validRoles.join(', ')}` });
    }

    // Handle branchShortId based on role
if (role !== 'business_retailer' && role !== 'admin' && !branchShortId) {
    return res.status(400).json({ message: 'BranchShortId is required for this role.' });
} else if (role === 'business_retailer' || role === 'admin') {
    // Set branchShortId to null if the user is a business retailer or an admin
    req.body.branchShortId = null;
}


    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser: IUser = new User({
        username,
        password: hashedPassword,
        email,
        role,
        branchShortId
    });

    try {
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
};

// Login user
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role, branchShortId:user.branchShortId }, process.env.JWT_SECRET || '', { expiresIn: '1h' });
    
    res.json({ token,branchShortId: user.branchShortId,role: user.role });
};

// Get branch-specific data
export const getBranchData = async (req: Request, res: Response) => {
    if (req.user?.role === 'business_retailer') {
        // Fetch data for all branches
        // Assuming you have a Branch model to fetch branches
        // const branches = await Branch.find();
        return res.json({ message: 'Data for all branches' }); // Replace with actual branches data
    } else if (req.user?.role === 'branch_retailer') {
        // Fetch data for specific branch using req.user.branchShortId
        // const branchData = await Branch.findOne({ shortId: req.user.branchShortId });
        return res.json({ message: `Data for branch ${req.user.branchShortId}` }); // Replace with actual branch data
    }
    
    res.status(403).json({ message: 'Forbidden' });
};
