const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authMiddleware');
const { apiLimiter } = require('../middleware/rateLimiter');
const { validateObjectId } = require('../middleware/validateObjectId');
const cycleController = require('../controllers/cycleController');
const { validateCreateCycle, validateUpdateCycle, validateAddBedika } = require('../middleware/cycleValidation');

// Apply middleware to all routes
router.use(apiLimiter);
router.use(authenticateUser);

// GET /api/cycles/active - Get active cycle (must be before /:id)
router.get('/active', cycleController.getActiveCycle);

// GET /api/cycles/vest-onot/upcoming - Get upcoming vest onot
router.get('/vest-onot/upcoming', cycleController.getUpcomingVestOnot);

// GET /api/cycles - Get all user cycles
router.get('/', cycleController.getUserCycles);

// POST /api/cycles - Create new cycle
router.post('/', validateCreateCycle, cycleController.createCycle);

// GET /api/cycles/:id - Get specific cycle
router.get('/:id', validateObjectId(), cycleController.getCycle);

// PUT /api/cycles/:id - Update cycle
router.put('/:id', validateObjectId(), validateUpdateCycle, cycleController.updateCycle);

// DELETE /api/cycles/:id - Delete cycle
router.delete('/:id', validateObjectId(), cycleController.deleteCycle);

// POST /api/cycles/:id/bedikot - Add bedika to cycle
router.post('/:id/bedikot', validateObjectId(), validateAddBedika, cycleController.addBedika);

module.exports = router;
