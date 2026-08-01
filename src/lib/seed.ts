import 'dotenv/config';
import { prisma } from './prisma';

async function main() {
  console.log("Seeding database...")
  
  // Create a customer
  const customer1 = await prisma.customer.create({
    data: {
      name: "María Gómez",
      phone: "+51 987654321",
      address: "Av. Larco 123, Miraflores"
    }
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: "Carlos Ruiz",
      phone: "+51 912345678",
      address: "Calle Bolognesi 456, San Isidro"
    }
  });

  // Create Staff
  const admin = await prisma.staff.upsert({
    where: { email: "admin@sazon.com" },
    update: { password: "admin123" },
    create: {
      name: "Admin Principal",
      email: "admin@sazon.com",
      password: "admin123", // Simple password for demo
      role: "ADMIN",
      phone: "+51 900000000"
    }
  });

  const rider = await prisma.staff.upsert({
    where: { email: "carlos@sazon.com" },
    update: { password: "rider123" },
    create: {
      name: "Carlos Motorizado",
      email: "carlos@sazon.com",
      password: "rider123",
      role: "RIDER",
      phone: "+51 999888777",
      vehicle: "Moto Honda / Placa ABC-123"
    }
  });

  // Create Orders
  await prisma.order.create({
    data: {
      trackingCode: "SAZ-001",
      status: "PENDING",
      totalAmount: 45.50,
      customerId: customer1.id,
      estimatedTime: new Date(Date.now() + 1000 * 60 * 45) // 45 mins from now
    }
  });

  await prisma.order.create({
    data: {
      trackingCode: "SAZ-002",
      status: "ON_THE_WAY",
      totalAmount: 120.00,
      customerId: customer2.id,
      riderId: rider.id,
      estimatedTime: new Date(Date.now() + 1000 * 60 * 15) // 15 mins from now
    }
  });

  console.log("Seeding complete!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
