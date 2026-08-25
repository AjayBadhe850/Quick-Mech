const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.get('/', authenticateUser, vehicleController.handleGetVehicles);
router.post('/', authenticateUser, vehicleController.handleCreateVehicle);

module.exports = router;
