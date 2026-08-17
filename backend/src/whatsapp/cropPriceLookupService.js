const prisma = require("../config/prisma");

/**
 * Fetch the latest crop price from the database.
 */
async function getLatestPrice(cropName, district) {
  if (!cropName) return null;

  try {
    const where = {
      crop_name: { contains: cropName, mode: "insensitive" }
    };
    if (district) {
      where.district = { contains: district, mode: "insensitive" };
    }

    const priceRecord = await prisma.crop_prices.findFirst({
      where,
      orderBy: { price_date: "desc" }
    });

    if (!priceRecord) return null;

    return {
      market: priceRecord.market || priceRecord.district,
      modalPrice: priceRecord.modal_price,
      date: priceRecord.price_date.toISOString().slice(0, 10),
    };
  } catch (error) {
    console.error("Error looking up crop price:", error);
    return null;
  }
}

module.exports = { getLatestPrice };