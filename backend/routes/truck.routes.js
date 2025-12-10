// routes/truckRoutes.js
import express from 'express';
import { createTruck, deleteTruck, getTruck, getTrucks, updateTruck, updateTruckStatus } from '../controllers/truck.controller.js';
import isAuthenticated from '../middlewares/auth.middleware.js';
import authorizedRoles from '../middlewares/authorize.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { createTruckSchema, updateTruckSchema, updateTruckStatusSchema } from '../validation/truck.schema.js';

const router = express.Router();

router.use(isAuthenticated);

router.get('/', authorizedRoles('admin'), getTrucks);
router.get('/:id', getTruck);
router.post('/', authorizedRoles('admin'), validate(createTruckSchema), createTruck);
router.patch('/:id', authorizedRoles('admin'), validate(updateTruckSchema), updateTruck);
router.delete('/:id', authorizedRoles('admin'), deleteTruck);
router.patch('/:id/status', authorizedRoles('admin'), validate(updateTruckStatusSchema), updateTruckStatus);

export default router;
