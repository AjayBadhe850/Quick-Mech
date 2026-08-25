const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const initialMechanics = [
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
    services: ["Oil Change", "Brake Service", "Engine Repair"]
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
    services: ["Transmission", "Suspension", "General Service"]
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
    services: ["Electrical", "AC Service", "Tire Change"]
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
    services: ["AC Repair", "Wheel Alignment", "Battery Check", "Body Work"]
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
    services: ["Bike Repair", "Chain Service", "Brake Tune", "Oil Change", "Battery Check"]
  }
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Seed Admin User
  const adminUser = await prisma.user.upsert({
    where: { mobileNumber: '7396230359' },
    update: {},
    create: {
      username: 'Ajay_Badhe',
      mobileNumber: '7396230359',
      email: 'ajay@quickmech.com',
      role: 'ADMIN',
      referralCode: 'QMADMIN01',
      walletBalance: 1200
    }
  });
  console.log('👤 Admin user seeded:', adminUser.username);

  // Seed Mechanics & Services
  for (const mech of initialMechanics) {
    const { services, ...mechData } = mech;
    const mechanic = await prisma.mechanic.upsert({
      where: { id: mechData.id },
      update: {
        ...mechData,
        images: mechData.images
      },
      create: {
        ...mechData,
        images: mechData.images
      }
    });

    // Create services
    for (const sName of services) {
      await prisma.service.create({
        data: {
          mechanicId: mechanic.id,
          name: sName,
          price: 299,
          duration: 30,
          description: `Professional ${sName} service provided by ${mechanic.name}.`
        }
      });
    }

    console.log(`🔧 Seeded mechanic: ${mechanic.name} (${services.length} services)`);
  }

  // Seed Sample Reviews
  const sampleReviews = [
    { mechanicId: 1, rating: 4.8, comment: "Fast and reliable service when my car broke down.", username: "Ramesh P." },
    { mechanicId: 2, rating: 4.9, comment: "Great communication, on time, and quality repair.", username: "Priya S." },
    { mechanicId: 3, rating: 4.7, comment: "Good value for money and honest diagnostics.", username: "Amit K." },
    { mechanicId: 4, rating: 5.0, comment: "Excellent workshop with modern equipment in Indore.", username: "Vikram R." },
    { mechanicId: 5, rating: 4.6, comment: "Quick chain and oil service for my bike.", username: "Sneha M." }
  ];

  for (const rev of sampleReviews) {
    await prisma.review.create({
      data: {
        mechanicId: rev.mechanicId,
        rating: rev.rating,
        comment: rev.comment,
        username: rev.username
      }
    });
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
