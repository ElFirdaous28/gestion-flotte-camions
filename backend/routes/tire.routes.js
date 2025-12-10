import express from 'express';
import {
    getTires,
    getTire,
    createTire,
    updateTire,
    deleteTire,
    updateTireStatus
} from '../controllers/tire.controller.js';
import isAuthenticated from '../middlewares/auth.middleware.js';
import authorizedRoles from '../middlewares/authorize.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { CreateTireSchema, UpdateTireSchema, UpdateTireStatusSchema } from '../validation/tire.schema.js';
import validateObjectId from '../middlewares/objectId.middelware.js';

const router = express.Router();
router.use(isAuthenticated);

router.get('/', authorizedRoles('admin'), getTires);
router.get('/:id', validateObjectId(), getTire);
router.post('/', authorizedRoles('admin'), validate(CreateTireSchema), createTire);
router.put('/:id', validateObjectId(), validate(UpdateTireSchema), updateTire);
router.delete('/:id', validateObjectId(), authorizedRoles('admin'), deleteTire);
router.patch('/:id/status', validateObjectId(), validate(UpdateTireStatusSchema), updateTireStatus);

export default router;
