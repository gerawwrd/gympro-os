import express from 'express';
import {
  getSettings,
  updateSettings,
  updateAdminPassword,
} from '../controllers/settingsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/', getSettings);
router.put('/', updateSettings);
router.put('/password', updateAdminPassword);

export default router;
