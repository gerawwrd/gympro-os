import express from 'express';
import {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
} from '../controllers/planController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public read access (members can view plans, e.g., for upgrade options)
router.get('/', getPlans);
router.get('/:id', getPlanById);

// Admin-only write access
router.post('/', protect, authorize('admin'), createPlan);
router.put('/:id', protect, authorize('admin'), updatePlan);
router.delete('/:id', protect, authorize('admin'), deletePlan);

export default router;