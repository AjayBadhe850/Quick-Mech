const prisma = require('../config/prisma');
const { calculateHaversineDistanceKm } = require('../utils/distance');

/**
 * Gets all mechanics with optional filters and sorting
 */
const getAllMechanics = async (filters = {}) => {
  const { search, category, certified, hasOffer, isNew, minRating } = filters;

  const where = {};

  if (category && category !== 'All') {
    where.category = { contains: category, mode: 'insensitive' };
  }

  if (certified === 'true' || certified === true) {
    where.certified = true;
  }

  if (isNew === 'true' || isNew === true) {
    where.isNew = true;
  }

  if (hasOffer === 'true' || hasOffer === true) {
    where.offer = { not: null };
  }

  if (minRating) {
    where.rating = { gte: parseFloat(minRating) };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } }
    ];
  }

  const mechanics = await prisma.mechanic.findMany({
    where,
    include: {
      services: true,
      reviews: {
        take: 5,
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { rating: 'desc' }
  });

  return mechanics;
};

/**
 * Gets a single mechanic by ID with full details
 */
const getMechanicById = async (id) => {
  const numericId = parseInt(id, 10);
  const mechanic = await prisma.mechanic.findUnique({
    where: { id: numericId },
    include: {
      services: true,
      reviews: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!mechanic) {
    throw { statusCode: 404, message: `Mechanic with ID ${id} not found`, code: 'MECHANIC_NOT_FOUND' };
  }

  return mechanic;
};

/**
 * Finds mechanics nearby a latitude/longitude coordinate within a radius (km)
 */
const getNearbyMechanics = async (lat, lng, radiusKm = 50, category = null) => {
  const allMechanics = await getAllMechanics({ category });

  const mechanicsWithDistance = allMechanics
    .map((mech) => {
      const distance = calculateHaversineDistanceKm(lat, lng, mech.lat, mech.lng);
      return {
        ...mech,
        distanceNumber: distance,
        distance: `${distance} km away`
      };
    })
    .filter((mech) => mech.distanceNumber <= radiusKm)
    .sort((a, b) => a.distanceNumber - b.distanceNumber);

  return mechanicsWithDistance;
};

/**
 * Creates a new mechanic
 */
const createMechanic = async (data) => {
  const { services, ...mechData } = data;

  const mechanic = await prisma.mechanic.create({
    data: {
      ...mechData,
      images: mechData.images || []
    }
  });

  if (Array.isArray(services) && services.length > 0) {
    for (const service of services) {
      await prisma.service.create({
        data: {
          mechanicId: mechanic.id,
          name: typeof service === 'string' ? service : service.name,
          price: service.price || 299,
          duration: service.duration || 30
        }
      });
    }
  }

  return getMechanicById(mechanic.id);
};

/**
 * Updates an existing mechanic
 */
const updateMechanic = async (id, data) => {
  const numericId = parseInt(id, 10);
  const { services, ...mechData } = data;

  const updated = await prisma.mechanic.update({
    where: { id: numericId },
    data: mechData
  });

  return updated;
};

/**
 * Appends images to mechanic gallery
 */
const addMechanicImages = async (id, newImages = []) => {
  const numericId = parseInt(id, 10);
  const mech = await getMechanicById(numericId);
  const existingImages = Array.isArray(mech.images) ? mech.images : [];
  const mergedImages = Array.from(new Set([...existingImages, ...newImages]));

  const updated = await prisma.mechanic.update({
    where: { id: numericId },
    data: { images: mergedImages }
  });

  return updated.images;
};

/**
 * Deletes a mechanic
 */
const deleteMechanic = async (id) => {
  const numericId = parseInt(id, 10);
  return prisma.mechanic.delete({ where: { id: numericId } });
};

module.exports = {
  getAllMechanics,
  getMechanicById,
  getNearbyMechanics,
  createMechanic,
  updateMechanic,
  addMechanicImages,
  deleteMechanic
};
