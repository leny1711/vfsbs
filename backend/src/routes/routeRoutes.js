const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const { authenticateUser, requireAdmin } = require('../middlewares/auth');

router.get('/', routeController.getAllRoutes);
router.get('/:id', routeController.getRouteById);
router.post('/', authenticateUser, requireAdmin, routeController.createRoute);
router.put('/:id', authenticateUser, requireAdmin, routeController.updateRoute);
router.delete('/:id', authenticateUser, requireAdmin, routeController.deleteRoute);

module.exports = router;
