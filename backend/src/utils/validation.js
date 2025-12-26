const Joi = require('joi');

const validateRegister = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().min(2).required(),
    lastName: Joi.string().min(2).required(),
    phoneNumber: Joi.string().optional(),
  });
  return schema.validate(data);
};

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  return schema.validate(data);
};

const validateRoute = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    origin: Joi.string().required(),
    destination: Joi.string().required(),
    originLat: Joi.number().required(),
    originLng: Joi.number().required(),
    destinationLat: Joi.number().required(),
    destinationLng: Joi.number().required(),
    distance: Joi.number().required(),
    duration: Joi.number().required(),
    basePrice: Joi.number().required(),
  });
  return schema.validate(data);
};

const validateSchedule = (data) => {
  const schema = Joi.object({
    routeId: Joi.string().uuid().required(),
    departureTime: Joi.date().iso().required(),
    arrivalTime: Joi.date().iso().required(),
    busNumber: Joi.string().required(),
    totalSeats: Joi.number().integer().min(1).required(),
    price: Joi.number().required(),
  });
  return schema.validate(data);
};

const validateBooking = (data) => {
  const schema = Joi.object({
    scheduleId: Joi.string().uuid().required(),
    seatNumbers: Joi.array().items(Joi.string()).min(1).required(),
  });
  return schema.validate(data);
};

module.exports = {
  validateRegister,
  validateLogin,
  validateRoute,
  validateSchedule,
  validateBooking,
};
