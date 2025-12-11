import express from 'express';
import {
    createMaintenanceRecord,
    getMaintenanceRecords,
    getMaintenanceRecord,
    updateMaintenanceRecord,
    deleteMaintenanceRecord,
    getMaintenanceRecordsVehicle
} from '../controllers/maintenanceRecord.controller.js';

import isAuthenticated from '../middlewares/auth.middleware.js';
import authorizedRoles from '../middlewares/authorize.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import validateObjectId from '../middlewares/objectId.middelware.js';
import { MaintenanceRecordSchema } from '../validation/MaintenanceRecord.schema.js';

const router = express.Router();
router.use(isAuthenticated);

router.get('/', authorizedRoles('admin'), getMaintenanceRecords);
router.get('/vehicle', getMaintenanceRecordsVehicle);
router.get('/:id', validateObjectId(), getMaintenanceRecord);
router.post('/', authorizedRoles('admin'), validate(MaintenanceRecordSchema), createMaintenanceRecord);
router.put('/:id', validateObjectId(), authorizedRoles('admin'), validate(MaintenanceRecordSchema), updateMaintenanceRecord);
router.delete('/:id', validateObjectId(), authorizedRoles('admin'), deleteMaintenanceRecord);

export default router;
