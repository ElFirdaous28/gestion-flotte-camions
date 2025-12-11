import express from 'express';
import {
    createMaintenanceRule,
    getMaintenanceRules,
    getMaintenanceRule,
    updateMaintenanceRule,
    deleteMaintenanceRule
} from '../controllers/maintenanceRule.controller.js';

import isAuthenticated from '../middlewares/auth.middleware.js';
import authorizedRoles from '../middlewares/authorize.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import validateObjectId from '../middlewares/objectId.middelware.js';
import { MaintenanceRuleSchema } from '../validation/maintenanceRule.schema.js';

const router = express.Router();
router.use(isAuthenticated);

router.get('/', authorizedRoles('admin'), getMaintenanceRules);
router.get('/:id', validateObjectId(), getMaintenanceRule);
router.post('/', authorizedRoles('admin'), validate(MaintenanceRuleSchema), createMaintenanceRule);
router.put('/:id', validateObjectId(), authorizedRoles('admin'), validate(MaintenanceRuleSchema), updateMaintenanceRule);
router.delete('/:id', validateObjectId(), authorizedRoles('admin'), deleteMaintenanceRule);

export default router;
