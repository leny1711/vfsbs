const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vfsbs.com' },
    update: {},
    create: {
      email: 'admin@vfsbs.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phoneNumber: '+1234567890',
      role: 'ADMIN',
    },
  });

  console.log('✓ Admin user created:', admin.email);

  const customerPassword = await bcrypt.hash('customer123', 10);
  
  const customer = await prisma.user.upsert({
    where: { email: 'customer@vfsbs.com' },
    update: {},
    create: {
      email: 'customer@vfsbs.com',
      password: customerPassword,
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567891',
      role: 'CUSTOMER',
    },
  });

  console.log('✓ Customer user created:', customer.email);

  const route1 = await prisma.route.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'New York to Boston',
      origin: 'New York, NY',
      destination: 'Boston, MA',
      originLat: 40.7128,
      originLng: -74.0060,
      destinationLat: 42.3601,
      destinationLng: -71.0589,
      distance: 215.3,
      duration: 240,
      basePrice: 45.00,
    },
  });

  console.log('✓ Route created:', route1.name);

  const route2 = await prisma.route.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Boston to Washington DC',
      origin: 'Boston, MA',
      destination: 'Washington, DC',
      originLat: 42.3601,
      originLng: -71.0589,
      destinationLat: 38.9072,
      destinationLng: -77.0369,
      distance: 440.5,
      duration: 480,
      basePrice: 65.00,
    },
  });

  console.log('✓ Route created:', route2.name);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const schedule1 = await prisma.schedule.create({
    data: {
      routeId: route1.id,
      departureTime: tomorrow,
      arrivalTime: new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000),
      busNumber: 'BUS-001',
      totalSeats: 40,
      availableSeats: 40,
      price: 45.00,
      status: 'SCHEDULED',
    },
  });

  console.log('✓ Schedule created for:', route1.name);

  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  dayAfterTomorrow.setHours(14, 0, 0, 0);

  const schedule2 = await prisma.schedule.create({
    data: {
      routeId: route2.id,
      departureTime: dayAfterTomorrow,
      arrivalTime: new Date(dayAfterTomorrow.getTime() + 8 * 60 * 60 * 1000),
      busNumber: 'BUS-002',
      totalSeats: 45,
      availableSeats: 45,
      price: 65.00,
      status: 'SCHEDULED',
    },
  });

  console.log('✓ Schedule created for:', route2.name);

  console.log('\n✓ Database seeding completed successfully!');
  console.log('\nTest accounts:');
  console.log('Admin: admin@vfsbs.com / admin123');
  console.log('Customer: customer@vfsbs.com / customer123');
}

main()
  .catch((e) => {
    console.error('✗ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
