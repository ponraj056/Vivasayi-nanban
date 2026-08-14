const cron = require('node-cron');
const prisma = require('./config/prisma'); // Using Prisma client
// const wa = require('./whatsappService');
// const cropPriceLookup = require('./Croppricelookupservice');

// This function will run every day at 8:00 AM
const startCronJobs = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('Running daily crop price notifications...');
    
    try {
      // 1. Fetch all farmers who are subscribed to alerts
      // const farmers = await User.find({ role: 'farmer', 'farmerProfile.wantsAlerts': true });
      
      // 2. For each farmer, look up their crops and get the latest price
      // for (const farmer of farmers) {
      //   const prices = await cropPriceLookup.getPricesForCrops(farmer.farmerProfile.crops);
      //   const message = formatPriceMessage(prices);
      //   await wa.sendText(farmer.phoneNumber, message);
      // }
      
      console.log('Cron job executed successfully (placeholder logic).');
    } catch (error) {
      console.error('Error in daily notification cron job:', error);
    }
  });
  
  console.log('Cron jobs initialized.');
};

module.exports = { startCronJobs };
