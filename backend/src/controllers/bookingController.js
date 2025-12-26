const prisma = require('../config/database');
const { validateBooking } = require('../utils/validation');

const createBooking = async (req, res, next) => {
  try {
    const { error, value } = validateBooking(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { scheduleId, seatNumbers } = value;
    const userId = req.user.id;

    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        route: true,
        bookings: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
          select: {
            seatNumbers: true,
          },
        },
      },
    });

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    if (schedule.status !== 'SCHEDULED') {
      return res.status(400).json({ error: 'Schedule is not available for booking' });
    }

    const bookedSeats = schedule.bookings.flatMap(b => b.seatNumbers);
    const conflictingSeats = seatNumbers.filter(seat => bookedSeats.includes(seat));

    if (conflictingSeats.length > 0) {
      return res.status(400).json({ 
        error: 'Some seats are already booked',
        conflictingSeats,
      });
    }

    if (schedule.availableSeats < seatNumbers.length) {
      return res.status(400).json({ error: 'Not enough available seats' });
    }

    const totalAmount = schedule.price * seatNumbers.length;

    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          userId,
          scheduleId,
          seatNumbers,
          totalAmount,
          status: 'PENDING',
        },
        include: {
          schedule: {
            include: {
              route: true,
            },
          },
        },
      });

      await tx.schedule.update({
        where: { id: scheduleId },
        data: {
          availableSeats: {
            decrement: seatNumbers.length,
          },
        },
      });

      return newBooking;
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        schedule: {
          include: {
            route: true,
          },
        },
        payment: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (!isAdmin && booking.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ booking });
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        schedule: true,
        payment: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (!isAdmin && booking.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    if (booking.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Cannot cancel completed booking' });
    }

    const updatedBooking = await prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          schedule: {
            include: {
              route: true,
            },
          },
          payment: true,
        },
      });

      await tx.schedule.update({
        where: { id: booking.scheduleId },
        data: {
          availableSeats: {
            increment: booking.seatNumbers.length,
          },
        },
      });

      if (booking.payment && booking.payment.status === 'COMPLETED') {
        await tx.payment.update({
          where: { id: booking.payment.id },
          data: { status: 'REFUNDED' },
        });
      }

      return updated;
    });

    res.json({
      message: 'Booking cancelled successfully',
      booking: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

const getAllBookings = async (req, res, next) => {
  try {
    const { status, scheduleId } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (scheduleId) where.scheduleId = scheduleId;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        schedule: {
          include: {
            route: true,
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookingById,
  cancelBooking,
  getAllBookings,
};
