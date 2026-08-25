const prisma = require('../config/prisma');
const { calculateHaversineDistanceKm } = require('../utils/distance');

const defaultMechanicsData = [
  {
    id: 1,
    name: "John Mechanic",
    rating: 4.8,
    reviewsCount: 245,
    category: "Car Repair",
    priceRange: "₹200 - ₹1200",
    featured: true,
    status: "Active",
    availability: "Available now",
    openingHours: "8:00 AM - 8:00 PM",
    image: "🔧",
    lat: 12.9716,
    lng: 77.5946,
    address: "123 Engine Lane, Auto City",
    description: "Expert mechanic for engine tuning, brake repairs, and routine service.",
    certified: true,
    offer: "10% OFF",
    isNew: false,
    contactPerson: "John Doe",
    contactNumber: "+91 98765 43210",
    googleMapsUrl: "https://maps.google.com/?q=12.9716,77.5946",
    images: [
      "https://images.unsplash.com/photo-1518173946682-0f53d1090c2a?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=900&q=80"
    ],
    services: [
      { name: "Oil Change", price: 299 },
      { name: "Brake Service", price: 499 },
      { name: "Engine Repair", price: 999 }
    ]
  },
  {
    id: 2,
    name: "Sarah Auto Care",
    rating: 4.9,
    reviewsCount: 312,
    category: "Full-Service",
    priceRange: "₹300 - ₹2000",
    featured: true,
    status: "Active",
    availability: "Available now",
    openingHours: "9:00 AM - 9:00 PM",
    image: "🛠️",
    lat: 12.9352,
    lng: 77.6245,
    address: "456 Service Drive, Motor Town",
    description: "Full-service auto care with transmission specialists and premium customer support.",
    certified: true,
    offer: "15% OFF",
    isNew: true,
    contactPerson: "Sarah Gupta",
    contactNumber: "+91 98765 43211",
    googleMapsUrl: "https://maps.google.com/?q=12.9352,77.6245",
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=80"
    ],
    services: [
      { name: "Transmission", price: 899 },
      { name: "Suspension", price: 699 },
      { name: "General Service", price: 499 }
    ]
  },
  {
    id: 3,
    name: "Mike's Auto Shop",
    rating: 4.7,
    reviewsCount: 189,
    category: "Auto Electrical",
    priceRange: "₹250 - ₹1500",
    featured: false,
    status: "Active",
    availability: "Available in 15 min",
    openingHours: "8:30 AM - 7:30 PM",
    image: "⚙️",
    lat: 12.9538,
    lng: 77.4909,
    address: "789 Repair Road, Gear District",
    description: "Reliable auto shop specializing in electrical repairs, AC service, and tires.",
    certified: false,
    offer: "Free inspection",
    isNew: false,
    contactPerson: "Mike Sharma",
    contactNumber: "+91 98765 43212",
    googleMapsUrl: "https://maps.google.com/?q=12.9538,77.4909",
    images: [
      "https://images.unsplash.com/photo-1511456131392-5b363df8e614?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80"
    ],
    services: [
      { name: "Electrical", price: 349 },
      { name: "AC Service", price: 599 },
      { name: "Tire Change", price: 199 }
    ]
  },
  {
    id: 4,
    name: "MEERA AUTOMOBILE & SERVICE CARE",
    rating: 4.7,
    reviewsCount: 162,
    category: "Car Service",
    priceRange: "₹300 - ₹2500",
    featured: true,
    status: "Active",
    availability: "Available now",
    openingHours: "9:00 AM - 8:00 PM",
    image: "🏁",
    lat: 22.293969,
    lng: 73.2939671,
    address: "MEERA AUTOMOBILE & SERVICE CARE, Indore, Madhya Pradesh",
    description: "Premium workshop with modern equipment, trusted technicians, and transparent pricing.",
    certified: true,
    offer: "20% OFF",
    isNew: false,
    contactPerson: "Meera",
    contactNumber: "+91 98765 43213",
    googleMapsUrl: "https://maps.app.goo.gl/7Ls2NgPtv6rzLPr88",
    images: [
      "https://images.unsplash.com/photo-1511919884226-0e2624d74f99?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80"
    ],
    services: [
      { name: "AC Repair", price: 699 },
      { name: "Wheel Alignment", price: 399 },
      { name: "Battery Check", price: 149 },
      { name: "Body Work", price: 1200 }
    ]
  },
  {
    id: 5,
    name: "Bikes and Bolts",
    rating: 4.6,
    reviewsCount: 124,
    category: "Bike Repair",
    priceRange: "₹150 - ₹900",
    featured: false,
    status: "Active",
    availability: "Available now",
    openingHours: "9:00 AM - 9:00 PM",
    image: "🚲",
    lat: 22.288498,
    lng: 73.3396974,
    address: "Bikes and Bolts, Indore, Madhya Pradesh",
    description: "Trusted bike repair shop offering quick diagnostics, parts, and service for daily commuters.",
    certified: false,
    offer: "Pickup service",
    isNew: true,
    contactPerson: "Ravi",
    contactNumber: "+91 98765 43214",
    googleMapsUrl: "https://maps.app.goo.gl/3TTFgeSbvQiCccEX7",
    images: [
      "https://images.unsplash.com/photo-1512872016327-7cca0aa5092a?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80"
    ],
    services: [
      { name: "Bike Repair", price: 299 },
      { name: "Chain Service", price: 149 },
      { name: "Brake Tune", price: 199 }
    ]
  }
];

let localMechanicsStore = [...defaultMechanicsData];

/**
 * Gets all mechanics with optional filters and sorting
 */
const getAllMechanics = async (filters = {}) => {
  const { search, category, certified, hasOffer, isNew, minRating } = filters;

  try {
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
        reviews: { take: 5, orderBy: { createdAt: 'desc' } }
      },
      orderBy: { rating: 'desc' }
    });

    if (mechanics.length > 0) {
      return mechanics;
    }
  } catch (err) {
    // Database offline or query failed
  }

  // Fallback to local memory data
  let filtered = [...localMechanicsStore];
  if (category && category !== 'All') {
    filtered = filtered.filter(m => m.category.toLowerCase().includes(category.toLowerCase()));
  }
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(m => 
      m.name.toLowerCase().includes(s) || 
      m.address.toLowerCase().includes(s) || 
      m.category.toLowerCase().includes(s)
    );
  }
  return filtered;
};

/**
 * Gets a single mechanic by ID with full details
 */
const getMechanicById = async (id) => {
  const numericId = parseInt(id, 10);

  try {
    const mechanic = await prisma.mechanic.findUnique({
      where: { id: numericId },
      include: {
        services: true,
        reviews: { orderBy: { createdAt: 'desc' } }
      }
    });

    if (mechanic) return mechanic;
  } catch (err) {
    // Fallback below
  }

  const fallback = localMechanicsStore.find(m => m.id === numericId);
  if (!fallback) {
    throw { statusCode: 404, message: `Mechanic with ID ${id} not found`, code: 'MECHANIC_NOT_FOUND' };
  }
  return fallback;
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
  try {
    const { services, ...mechData } = data;
    const mechanic = await prisma.mechanic.create({
      data: { ...mechData, images: mechData.images || [] }
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
  } catch (err) {
    const newMech = { id: Date.now(), ...data };
    localMechanicsStore.push(newMech);
    return newMech;
  }
};

/**
 * Updates an existing mechanic
 */
const updateMechanic = async (id, data) => {
  const numericId = parseInt(id, 10);
  try {
    const { services, ...mechData } = data;
    return await prisma.mechanic.update({
      where: { id: numericId },
      data: mechData
    });
  } catch {
    const index = localMechanicsStore.findIndex(m => m.id === numericId);
    if (index !== -1) {
      localMechanicsStore[index] = { ...localMechanicsStore[index], ...data };
      return localMechanicsStore[index];
    }
    return data;
  }
};

/**
 * Appends images to mechanic gallery
 */
const addMechanicImages = async (id, newImages = []) => {
  const numericId = parseInt(id, 10);
  try {
    const mech = await getMechanicById(numericId);
    const existingImages = Array.isArray(mech.images) ? mech.images : [];
    const mergedImages = Array.from(new Set([...existingImages, ...newImages]));

    const updated = await prisma.mechanic.update({
      where: { id: numericId },
      data: { images: mergedImages }
    });
    return updated.images;
  } catch {
    const mech = localMechanicsStore.find(m => m.id === numericId);
    if (mech) {
      mech.images = Array.from(new Set([...(mech.images || []), ...newImages]));
      return mech.images;
    }
    return newImages;
  }
};

/**
 * Deletes a mechanic
 */
const deleteMechanic = async (id) => {
  const numericId = parseInt(id, 10);
  try {
    return await prisma.mechanic.delete({ where: { id: numericId } });
  } catch {
    localMechanicsStore = localMechanicsStore.filter(m => m.id !== numericId);
    return { success: true };
  }
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
