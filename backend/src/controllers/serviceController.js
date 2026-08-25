const prisma = require('../config/prisma');
const { successResponse } = require('../utils/response');

const handleGetServices = async (req, res, next) => {
  try {
    const mechanicId = req.query.mechanicId ? parseInt(req.query.mechanicId, 10) : undefined;
    const services = await prisma.service.findMany({
      where: mechanicId ? { mechanicId } : undefined,
      include: {
        mechanic: { select: { id: true, name: true } }
      }
    });
    return successResponse(res, { services }, 'Services retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleGetServices
};
