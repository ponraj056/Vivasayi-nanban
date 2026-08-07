/**
 * TODO: Replace this with a real call into your Crop Calendar +
 * Agmarknet Price module (the one already built). E.g.:
 *
 *   const CropPrice = require("../models/CropPrice");
 *   const record = await CropPrice.findOne({ crop: cropName, district })
 *     .sort({ date: -1 });
 *
 * Kept as a separate file so the bot flow never needs to change,
 * only this lookup function.
 */
async function getLatestPrice(cropName, district) {
  // Stubbed sample response — swap with real DB/API lookup.
  const sample = {
    market: district || "Karur",
    modalPrice: 2150,
    date: new Date().toISOString().slice(0, 10),
  };

  if (!cropName) return null;
  return sample;
}

module.exports = { getLatestPrice };