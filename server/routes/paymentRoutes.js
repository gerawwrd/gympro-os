import express from 'express';
import {
  getPayments,
  getPaymentById,
  recordPayment,
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/', getPayments);
router.get('/:id', getPaymentById);
router.post('/', recordPayment);

export default router;
