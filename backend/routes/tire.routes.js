import express from 'express';
import {
    getTires,
    getTire,
    createTire,
    updateTire,
    deleteTire,
    updateTireStatus,
    getAvailableTires
} from '../controllers/tire.controller.js';
import isAuthenticated from '../middlewares/auth.middleware.js';
import authorizedRoles from '../middlewares/authorize.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { TireSchema, UpdateTireStatusSchema } from '../validation/tire.schema.js';
import validateObjectId from '../middlewares/objectId.middelware.js';

const router = express.Router();
router.use(isAuthenticated);

router.get('/', authorizedRoles('admin'), getTires);
router.get('/available', getAvailableTires);
router.get('/:id', validateObjectId(), getTire);
router.post('/', authorizedRoles('admin'), validate(TireSchema), createTire);
router.put('/:id', validateObjectId(), validate(TireSchema), updateTire);
router.delete('/:id', validateObjectId(), authorizedRoles('admin'), deleteTire);
router.patch('/:id/status', validateObjectId(), validate(UpdateTireStatusSchema), updateTireStatus);

export default router;
