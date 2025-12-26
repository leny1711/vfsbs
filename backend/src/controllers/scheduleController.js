const prisma = require('../config/database');
const { validateSchedule } = require('../utils/validation');

/**
 * Get all schedules with optional filters
 */
const getAllSchedules = async (req, res, next) => {
  try {
    const { routeId, date, status } = req.query;
    
    const where = {};
    
    if (routeId) {
      where.routeId = routeId;
    }
    
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      where.departureTime = {
        gte: startDate,
        lte: endDate,
      };
    }
    
    if (status) {
      where.status = status;
    }

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        route: true,
      },
      orderBy: {
        departureTime: 'asc',
      },
    });

    res.json({ schedules });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single schedule by ID
 */
const getScheduleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        route: true,
        bookings: {
          select: {
            seatNumbers: true,
          },
        },
      },
    });

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const bookedSeats = schedule.bookings.flatMap(b => b.seatNumbers);
    
    res.json({ 
      schedule: {
        ...schedule,
        bookedSeats,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search schedules by origin, destination, and date
 */
const searchSchedules = async (req, res, next) => {
  try {
    const { origin, destination, date } = req.query;

    if (!origin || !destination || !date) {
      return res.status(400).json({ 
        error: 'Origin, destination, and date are required' 
      });
    }

    const searchDate = new Date(date);
    searchDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const schedules = await prisma.schedule.findMany({
      where: {
        route: {
          origin: { contains: origin, mode: 'insensitive' },
          destination: { contains: destination, mode: 'insensitive' },
          isActive: true,
        },
        departureTime: {
          gte: searchDate,
          lte: endDate,
        },
        status: 'SCHEDULED',
        availableSeats: { gt: 0 },
      },
      include: {
        route: true,
      },
      orderBy: {
        departureTime: 'asc',
      },
    });

    res.json({ schedules });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new schedule (admin only)
 */
const createSchedule = async (req, res, next) => {
  try {
    const { error, value } = validateSchedule(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const route = await prisma.route.findUnique({
      where: { id: value.routeId },
    });

    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    const schedule = await prisma.schedule.create({
      data: {
        ...value,
        availableSeats: value.totalSeats,
      },
      include: {
        route: true,
      },
    });

    res.status(201).json({
      message: 'Schedule created successfully',
      schedule,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update schedule (admin only)
 */
const updateSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const schedule = await prisma.schedule.update({
      where: { id },
      data: updateData,
      include: {
        route: true,
      },
    });

    res.json({
      message: 'Schedule updated successfully',
      schedule,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete schedule (admin only)
 */
const deleteSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.schedule.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    res.json({ message: 'Schedule cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSchedules,
  getScheduleById,
  searchSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};
