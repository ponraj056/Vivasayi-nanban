const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding dummy crop prices...");

  const dummyPrices = [
    {
      crop_name: 'தக்காளி', // Tomato in Tamil
      market: 'Madurai Market',
      district: 'Madurai',
      modal_price: 3500.0,
      price_date: new Date(),
    },
    {
      crop_name: 'நெல்', // Paddy in Tamil
      market: 'Thanjavur Market',
      district: 'Thanjavur',
      modal_price: 2150.0,
      price_date: new Date(),
    },
    {
      crop_name: 'Tomato',
      market: 'Madurai Market',
      district: 'Madurai',
      modal_price: 3500.0,
      price_date: new Date(),
    },
    {
      crop_name: 'Paddy',
      market: 'Thanjavur Market',
      district: 'Thanjavur',
      modal_price: 2150.0,
      price_date: new Date(),
    }
  ];

  for (const price of dummyPrices) {
    await prisma.crop_prices.create({
      data: price,
    });
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
