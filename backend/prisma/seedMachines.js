const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding dummy machines...");

  // 1. Ensure we have a machine owner
  let owner = await prisma.users.findFirst({ where: { role: 'machineOwner' } });
  if (!owner) {
    const passwordHash = await bcrypt.hash('password123', 10);
    owner = await prisma.users.create({
      data: {
        phone: '919876543212',
        password_hash: passwordHash,
        name: 'Test Owner',
        role: 'machineOwner',
      }
    });
  }

  // 2. Ensure we have a farmer
  let farmer = await prisma.users.findFirst({ where: { role: 'farmer' } });
  if (!farmer) {
    const passwordHash = await bcrypt.hash('password123', 10);
    farmer = await prisma.users.create({
      data: {
        phone: '919876543210',
        password_hash: passwordHash,
        name: 'Test Farmer',
        role: 'farmer',
      }
    });
  }

  // 3. Create dummy machines
  const dummyMachines = [
    {
      owner_id: owner.id,
      machine_type: 'tractor',
      name: 'Mahindra 575 DI',
      description: '45 HP Tractor for ploughing and transport',
      price_per_day: 1500.0,
      district: 'Madurai',
      location: 'Thirumangalam',
      is_available: true,
    },
    {
      owner_id: owner.id,
      machine_type: 'harvester',
      name: 'Kubota Harvester',
      description: 'Paddy harvester',
      price_per_day: 4000.0,
      district: 'Thanjavur',
      location: 'Kumbakonam',
      is_available: true,
    },
    {
      owner_id: owner.id,
      machine_type: 'sprayer',
      name: 'Battery Sprayer',
      description: '16L Knapsack Sprayer',
      price_per_day: 300.0,
      district: 'Madurai',
      location: 'Usilampatti',
      is_available: true,
    }
  ];

  for (const machine of dummyMachines) {
    await prisma.machines.create({ data: machine });
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
