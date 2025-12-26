const prisma = require('../config/database');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user.id;

    if (!bookingId) {
      return res.status(400).json({ error: 'Booking ID is required' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payment: true,
        schedule: {
          include: {
            route: true,
          },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({ error: 'Booking is not pending payment' });
    }

    if (booking.payment && booking.payment.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Booking is already paid' });
    }

    const amountInCents = Math.round(booking.totalAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        bookingId: booking.id,
        userId: userId,
        scheduleId: booking.scheduleId,
      },
      description: `Bus booking: ${booking.schedule.route.origin} to ${booking.schedule.route.destination}`,
    });

    const payment = await prisma.payment.upsert({
      where: { bookingId: booking.id },
      create: {
        bookingId: booking.id,
        amount: booking.totalAmount,
        currency: 'usd',
        paymentMethod: 'stripe',
        stripePaymentId: paymentIntent.id,
        status: 'PENDING',
      },
      update: {
        stripePaymentId: paymentIntent.id,
        status: 'PENDING',
      },
    });

    res.json({
      message: 'Payment intent created successfully',
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
    });
  } catch (error) {
    next(error);
  }
};

const confirmPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.body;
    const userId = req.user.id;

    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            schedule: {
              include: {
                route: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.booking.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (payment.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Payment already completed' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(
      payment.stripePaymentId
    );

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ 
        error: 'Payment not successful',
        status: paymentIntent.status,
      });
    }

    const updatedPayment = await prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(),
        },
      });

      await tx.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CONFIRMED' },
      });

      return updated;
    });

    res.json({
      message: 'Payment confirmed successfully',
      payment: updatedPayment,
    });
  } catch (error) {
    next(error);
  }
};

const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            schedule: {
              include: {
                route: true,
              },
            },
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (!isAdmin && payment.booking.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ payment });
  } catch (error) {
    next(error);
  }
};

const handleWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const payment = await prisma.payment.findFirst({
          where: { stripePaymentId: paymentIntent.id },
        });

        if (payment && payment.status !== 'COMPLETED') {
          await prisma.$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: payment.id },
              data: {
                status: 'COMPLETED',
                paidAt: new Date(),
              },
            });

            await tx.booking.update({
              where: { id: payment.bookingId },
              data: { status: 'CONFIRMED' },
            });
          });
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        const failedPaymentRecord = await prisma.payment.findFirst({
          where: { stripePaymentId: failedPayment.id },
        });

        if (failedPaymentRecord) {
          await prisma.payment.update({
            where: { id: failedPaymentRecord.id },
            data: { status: 'FAILED' },
          });
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  getPaymentById,
  handleWebhook,
};
