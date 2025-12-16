import express from 'express';
import {
    getTrailers,
    getTrailer,
    createTrailer,
    updateTrailer,
    deleteTrailer,
    updateTrailerStatus
} from '../controllers/trailer.controller.js';
import isAuthenticated from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import authorizedRoles from '../middlewares/authorize.middleware.js';
import { createTrailerSchema, updateTrailerSchema, updateTrailerStatusSchema } from '../validation/trailer.schema.js';
import validateObjectId from '../middlewares/objectId.middelware.js';

const router = express.Router();
router.use(isAuthenticated);

router.get('/', getTrailers);
router.get('/:id', validateObjectId(), getTrailer);
router.post('/', authorizedRoles('admin'), validate(createTrailerSchema), createTrailer);
router.put('/:id', validateObjectId(), authorizedRoles('admin'), validate(updateTrailerSchema), updateTrailer);
router.delete('/:id', validateObjectId(), authorizedRoles('admin'), deleteTrailer);
router.patch('/:id/status', validateObjectId(), validate(updateTrailerStatusSchema), updateTrailerStatus);

export default router;
