const prisma = require('../config/database');
const { validateRoute } = require('../utils/validation');

const getAllRoutes = async (req, res, next) => {
  try {
    const routes = await prisma.route.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    res.json({ routes });
  } catch (error) {
    next(error);
  }
};

const getRouteById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const route = await prisma.route.findUnique({
      where: { id },
      include: {
        schedules: {
          where: {
            departureTime: { gte: new Date() },
            status: 'SCHEDULED',
          },
          orderBy: { departureTime: 'asc' },
          take: 10,
        },
      },
    });

    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json({ route });
  } catch (error) {
    next(error);
  }
};

const createRoute = async (req, res, next) => {
  try {
    const { error, value } = validateRoute(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const route = await prisma.route.create({
      data: value,
    });

    res.status(201).json({
      message: 'Route created successfully',
      route,
    });
  } catch (error) {
    next(error);
  }
};

const updateRoute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = validateRoute(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const route = await prisma.route.update({
      where: { id },
      data: value,
    });

    res.json({
      message: 'Route updated successfully',
      route,
    });
  } catch (error) {
    next(error);
  }
};

const deleteRoute = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.route.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
};
