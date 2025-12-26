const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateUser, requireAdmin } = require('../middlewares/auth');

router.post('/', authenticateUser, bookingController.createBooking);
router.get('/:id', authenticateUser, bookingController.getBookingById);
router.put('/:id/cancel', authenticateUser, bookingController.cancelBooking);
router.get('/', authenticateUser, requireAdmin, bookingController.getAllBookings);

module.exports = router;
