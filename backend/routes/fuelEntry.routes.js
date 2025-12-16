import express from 'express';
import {
    createFuelEntry,
    getFuelEntries,
    getFuelEntry,
    updateFuelEntry,
    deleteFuelEntry,
    getFuelEntriesByTrip
} from '../controllers/fuelEntry.controller.js';

import isAuthenticated from '../middlewares/auth.middleware.js';
import authorizedRoles from '../middlewares/authorize.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import validateObjectId from '../middlewares/objectId.middelware.js';
import { FuelEntrySchema } from '../validation/fuelEntry.shcema.js';
import { uploadInvoice } from '../utils/multer.js';

const router = express.Router();
router.use(isAuthenticated);

router.get('/', authorizedRoles('admin'), getFuelEntries);
router.get('/:id', validateObjectId(), getFuelEntry);
router.post('/', authorizedRoles('admin'), validate(FuelEntrySchema), uploadInvoice.single('invoiceFile'), createFuelEntry);
router.put('/:id', validateObjectId(), authorizedRoles('admin'), validate(FuelEntrySchema), uploadInvoice.single('invoiceFile'), updateFuelEntry);
router.delete('/:id', validateObjectId(), authorizedRoles('admin'), deleteFuelEntry);
router.get('/trip/:tripId', validateObjectId('tripId'), getFuelEntriesByTrip);

export default router;
