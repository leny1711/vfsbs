const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { authenticateUser, requireAdmin } = require('../middlewares/auth');

router.get('/', scheduleController.getAllSchedules);
router.get('/search', scheduleController.searchSchedules);
router.get('/:id', scheduleController.getScheduleById);
router.post('/', authenticateUser, requireAdmin, scheduleController.createSchedule);
router.put('/:id', authenticateUser, requireAdmin, scheduleController.updateSchedule);
router.delete('/:id', authenticateUser, requireAdmin, scheduleController.deleteSchedule);

module.exports = router;
