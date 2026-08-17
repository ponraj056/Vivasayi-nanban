const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start seeding...');

  // Create an admin user if it doesn't exist
  const adminPhone = '9999999999';
  const existingAdmin = await prisma.users.findUnique({
    where: { phone: adminPhone },
  });

  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('admin123', salt);

    const admin = await prisma.users.create({
      data: {
        name: 'Super Admin',
        phone: adminPhone,
        email: 'admin@vivasayinanban.com',
        password_hash,
        role: 'admin',
        is_active: true,
      },
    });
    console.log(`Created admin user: ${admin.name}`);
  } else {
    console.log('Admin user already exists.');
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
