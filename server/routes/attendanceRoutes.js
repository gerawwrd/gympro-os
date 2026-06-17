import express from 'express';
import {
  checkIn,
  checkOut,
  getAttendanceLogs,
  manualCheckOut,
  getActiveSessions,
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);
router.get('/', protect, authorize('admin'), getAttendanceLogs);
router.get('/active', protect, authorize('admin'), getActiveSessions);
router.post('/manual-checkout/:id', protect, authorize('admin'), manualCheckOut);

export default router;
