const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateUser } = require('../middlewares/auth');

router.post('/create-intent', authenticateUser, paymentController.createPaymentIntent);
router.post('/confirm', authenticateUser, paymentController.confirmPayment);
router.get('/:id', authenticateUser, paymentController.getPaymentById);
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

module.exports = router;
