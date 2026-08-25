const express = require('express');
const router = express.Router();
const mechanicController = require('../controllers/mechanicController');
const validate = require('../middleware/validateMiddleware');
const { nearbyMechanicsSchema, createMechanicSchema } = require('../validators/mechanicValidator');
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware');

// Get mechanics nearby a location coordinate
router.get('/nearby', validate(nearbyMechanicsSchema, 'query'), mechanicController.handleGetNearbyMechanics);

// Get all mechanics (with optional filters)
router.get('/', mechanicController.handleGetAllMechanics);

// Get specific mechanic details
router.get('/:id', mechanicController.handleGetMechanicById);

// Get mechanic uploaded gallery images
router.get('/:id/images', mechanicController.handleGetMechanicImages);

// Add images to mechanic (Admin)
router.post('/:id/images', mechanicController.handleAddMechanicImages);

// Create new mechanic (Admin)
router.post('/', authenticateUser, requireAdmin, validate(createMechanicSchema), mechanicController.handleCreateMechanic);

// Update mechanic (Admin)
router.put('/:id', authenticateUser, requireAdmin, mechanicController.handleUpdateMechanic);

// Delete mechanic (Admin)
router.delete('/:id', authenticateUser, requireAdmin, mechanicController.handleDeleteMechanic);

module.exports = router;
