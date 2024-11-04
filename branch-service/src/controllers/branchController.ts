import { Request, Response } from 'express';
import Branch from '../models/branchModel';

export const getBranchByLocation = async (req: Request, res: Response) => {
    try {
      // Get branchLocation from query parameters
      const { branchLocation } = req.query;
  
      if (!branchLocation) {
        return res.status(400).json({ message: 'branchLocation query parameter is required.' });
      }
  
      // Fetch branch details by branchLocation
      const branches = await Branch.find({ branchLocation: branchLocation });
  
      if (branches.length === 0) {
        return res.status(404).json({ message: 'No branches found for the specified location.' });
      }
  
      res.status(200).json(branches);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };
  

// Create a branch
export const createBranch = async (req: Request, res: Response): Promise<void> => {
    try {
        const { branchLocation, branchRegion, branchMobileNumber, branchEmail } = req.body;
        const branch = new Branch({ branchLocation, branchRegion, branchMobileNumber, branchEmail });
        await branch.save();
        res.status(201).json(branch);
    } catch (error) {
        res.status(500).json({ message: 'Error creating branch', error });
    }
};

// Get a single branch by _id
export const getBranchById = async (req: Request, res: Response): Promise<void> => {
    try {
        const branch = await Branch.findById(req.params.id);
        if (!branch) {
            res.status(404).json({ message: 'Branch not found' });
        } else {
            res.json(branch);
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching branch', error });
    }
};

// Get a single branch by shortId
export const getBranchByShortId = async (req: Request, res: Response): Promise<void> => {
    try {
        const branch = await Branch.findOne({ branchShortId: req.params.shortId });
        if (!branch) {
            res.status(404).json({ message: 'Branch not found' });
        } else {
            res.json(branch);
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching branch by shortId', error });
    }
};

// Get all branches
export const getAllBranches = async (req: Request, res: Response): Promise<void> => {
    try {
        const branches = await Branch.find();
        res.json(branches);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching branches', error });
    }
};

// Update a branch by _id
export const updateBranchById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { branchLocation, branchRegion, branchMobileNumber, branchEmail } = req.body;
        const branch = await Branch.findByIdAndUpdate(
            req.params.id,
            { branchLocation, branchRegion, branchMobileNumber, branchEmail, updatedAt: new Date() },
            { new: true }
        );
        if (!branch) {
            res.status(404).json({ message: 'Branch not found' });
        } else {
            res.json(branch);
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating branch by _id', error });
    }
};

// Update a branch by shortId
export const updateBranchByShortId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { branchLocation, branchRegion, branchManager, branchMobileNumber, branchEmail } = req.body;
        const branch = await Branch.findOneAndUpdate(
            { branchShortId: req.params.shortId },
            { branchLocation, branchRegion, branchManager, branchMobileNumber, branchEmail, updatedAt: new Date() },
            { new: true }
        );
        if (!branch) {
            res.status(404).json({ message: 'Branch not found' });
        } else {
            res.json(branch);
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating branch by shortId', error });
    }
};

// Delete a branch by _id
export const deleteBranchById = async (req: Request, res: Response): Promise<void> => {
    try {
        const branch = await Branch.findByIdAndDelete(req.params.id);
        if (!branch) {
            res.status(404).json({ message: 'Branch not found' });
        } else {
            res.json({ message: 'Branch deleted successfully' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting branch by _id', error });
    }
};

// Delete a branch by shortId
export const deleteBranchByShortId = async (req: Request, res: Response): Promise<void> => {
    try {
        const branch = await Branch.findOneAndDelete({ branchShortId: req.params.shortId });
        if (!branch) {
            res.status(404).json({ message: 'Branch not found' });
        } else {
            res.json({ message: 'Branch deleted successfully' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting branch by shortId', error });
    }
};
