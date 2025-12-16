import express from 'express';
import {
    getTrips,
    getTrip,
    createTrip,
    updateTrip,
    deleteTrip,
    startTrip,
    completeTrip,
    getDriverTrips
} from '../controllers/trip.controller.js';
import isAuthenticated from '../middlewares/auth.middleware.js';
import authorizedRoles from '../middlewares/authorize.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { CompleteTripSchema, StartTripSchema, TripSchema } from '../validation/trip.schema.js';
import validateObjectId from '../middlewares/objectId.middelware.js';

const router = express.Router();
router.use(isAuthenticated);

router.get('/', authorizedRoles('admin'), getTrips);
router.get('/driver/:driverId', getDriverTrips);
router.get('/:id', validateObjectId(), getTrip);
router.post('/', authorizedRoles('admin'), validate(TripSchema), createTrip);
router.put('/:id', validateObjectId(), authorizedRoles('admin'), validate(TripSchema), updateTrip);
router.delete('/:id', validateObjectId(), authorizedRoles('admin'), deleteTrip);
router.patch('/:id/start', validateObjectId(), validate(StartTripSchema), startTrip);
router.patch('/:id/complete', validateObjectId(), validate(CompleteTripSchema), completeTrip);

export default router;
