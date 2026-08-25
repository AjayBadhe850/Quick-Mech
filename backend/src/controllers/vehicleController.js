const prisma = require('../config/prisma');
const { successResponse } = require('../utils/response');

const handleGetVehicles = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return successResponse(res, { vehicles: [] }, 'No vehicles found');
    }
    const vehicles = await prisma.vehicle.findMany({
      where: { userId }
    });
    return successResponse(res, { vehicles }, 'Vehicles retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const handleCreateVehicle = async (req, res, next) => {
  try {
    const { make, model, year, licensePlate, type } = req.body;
    const vehicle = await prisma.vehicle.create({
      data: {
        userId: req.user.id,
        make,
        model,
        year: year ? parseInt(year, 10) : null,
        licensePlate,
        type: type || 'Car'
      }
    });
    return successResponse(res, { vehicle }, 'Vehicle added successfully', 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleGetVehicles,
  handleCreateVehicle
};
