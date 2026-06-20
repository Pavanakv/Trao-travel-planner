import express from 'express';
import {
  createTrip,
  listTrips,
  getTrip,
  deleteTrip,
  regeneratePlan,
  regenerateDay,
  updateDayActivities,
  togglePackingItem,
  addPackingItem,
} from '../controllers/tripController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createTrip);
router.get('/', listTrips);
router.get('/:id', getTrip);
router.delete('/:id', deleteTrip);

router.post('/:id/regenerate-plan', regeneratePlan);
router.post('/:id/days/:dayNumber/regenerate', regenerateDay);
router.patch('/:id/days/:dayNumber/activities', updateDayActivities);
router.patch('/:id/packing/:index', togglePackingItem);
router.post('/:id/packing', addPackingItem);

export default router;
