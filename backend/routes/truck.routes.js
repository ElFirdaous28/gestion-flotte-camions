// routes/truckRoutes.js
import express from 'express';
import { createTruck, deleteTruck, getTruck, getTrucks, updateTruck, updateTruckStatus } from '../controllers/truck.controller.js';
import isAuthenticated from '../middlewares/auth.middleware.js';
import authorizedRoles from '../middlewares/authorize.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { createTruckSchema, updateTruckSchema, updateTruckStatusSchema } from '../validation/truck.schema.js';
import validateObjectId from '../middlewares/objectId.middelware.js';

const router = express.Router();

router.use(isAuthenticated);

router.get('/', authorizedRoles('admin'), getTrucks);
router.get('/:id', validateObjectId(), getTruck);
router.post('/', authorizedRoles('admin'), validate(createTruckSchema), createTruck);
router.put('/:id', validateObjectId(), authorizedRoles('admin'), validate(updateTruckSchema), updateTruck);
router.delete('/:id', validateObjectId(), authorizedRoles('admin'), deleteTruck);
router.patch('/:id/status', validateObjectId(), validate(updateTruckStatusSchema), updateTruckStatus);

export default router;
