const mechanicService = require('../services/mechanicService');
const { successResponse } = require('../utils/response');

const handleGetAllMechanics = async (req, res, next) => {
  try {
    const mechanics = await mechanicService.getAllMechanics(req.query);
    return successResponse(res, { mechanics }, 'Mechanics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const handleGetMechanicById = async (req, res, next) => {
  try {
    const mechanic = await mechanicService.getMechanicById(req.params.id);
    return successResponse(res, { mechanic }, 'Mechanic retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const handleGetNearbyMechanics = async (req, res, next) => {
  try {
    const { lat, lng, radius, category } = req.query;
    const mechanics = await mechanicService.getNearbyMechanics(
      parseFloat(lat),
      parseFloat(lng),
      radius ? parseFloat(radius) : 50,
      category
    );
    return successResponse(res, { mechanics }, 'Nearby mechanics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const handleCreateMechanic = async (req, res, next) => {
  try {
    const mechanic = await mechanicService.createMechanic(req.body);
    return successResponse(res, { mechanic }, 'Mechanic created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const handleUpdateMechanic = async (req, res, next) => {
  try {
    const mechanic = await mechanicService.updateMechanic(req.params.id, req.body);
    return successResponse(res, { mechanic }, 'Mechanic updated successfully');
  } catch (error) {
    next(error);
  }
};

const handleAddMechanicImages = async (req, res, next) => {
  try {
    const images = Array.isArray(req.body.images) ? req.body.images : [];
    const updatedImages = await mechanicService.addMechanicImages(req.params.id, images);
    return successResponse(res, { images: updatedImages }, 'Mechanic images updated successfully');
  } catch (error) {
    next(error);
  }
};

const handleGetMechanicImages = async (req, res, next) => {
  try {
    const mechanic = await mechanicService.getMechanicById(req.params.id);
    return successResponse(res, { images: mechanic.images || [] }, 'Mechanic images retrieved');
  } catch (error) {
    next(error);
  }
};

const handleDeleteMechanic = async (req, res, next) => {
  try {
    await mechanicService.deleteMechanic(req.params.id);
    return successResponse(res, {}, 'Mechanic deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleGetAllMechanics,
  handleGetMechanicById,
  handleGetNearbyMechanics,
  handleCreateMechanic,
  handleUpdateMechanic,
  handleAddMechanicImages,
  handleGetMechanicImages,
  handleDeleteMechanic
};
