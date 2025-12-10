import express from 'express';
import {
    getTrips,
    getTrip,
    createTrip,
    updateTrip,
    deleteTrip,
    startTrip,
    completeTrip
} from '../controllers/trip.controller.js';
import isAuthenticated from '../middlewares/auth.middleware.js';
import authorizedRoles from '../middlewares/authorize.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { CompleteTripSchema, StartTripSchema, TripSchema } from '../validation/trip.schema.js';

const router = express.Router();
router.use(isAuthenticated);

router.get('/', authorizedRoles('admin'), getTrips);
router.get('/:id', authorizedRoles('admin'), getTrip);
router.post('/', authorizedRoles('admin'), validate(TripSchema), createTrip);
router.put('/:id', validate(TripSchema), updateTrip);
router.delete('/:id', authorizedRoles('admin'), deleteTrip);
router.patch('/:id/start', authorizedRoles('admin'), validate(StartTripSchema), startTrip);
router.patch('/:id/complete', authorizedRoles('admin'), validate(CompleteTripSchema), completeTrip);

export default router;
