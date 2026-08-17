const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  let user = await prisma.users.findUnique({ where: { phone: '919876543210' } });
  if (!user) {
    user = await prisma.users.create({
      data: {
        phone: '919876543210',
        name: 'Test Farmer Webhook',
        password_hash: '123',
        role: 'farmer'
      }
    });
    console.log("Created user:", user);
  } else {
    console.log("User already exists:", user);
  }
}

main().finally(() => prisma.$disconnect());
