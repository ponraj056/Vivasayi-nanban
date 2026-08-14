require("dotenv").config();
const express = require("express");
const cors = require("cors");
const prisma = require("./config/prisma");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const whatsappRoutes = require("./whatsapp/whatsappRoutes");
const machineRoutes = require("./routes/machineRoutes");
// const cropPriceRoutes = require("./routes/cropPriceRoutes");
const diseaseRoutes = require("./routes/diseaseRoutes");
const dealerRoutes = require("./routes/dealerRoutes");
const locationRoutes = require("./routes/locationRoutes");
const farmerRoutes = require("./routes/farmerRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const productRoutes = require("./routes/productRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const broadcastRoutes = require("./routes/broadcastRoutes");
const { startCronJobs } = require("./cronService");

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/machines", machineRoutes);
// app.use("/api/crop-price", cropPriceRoutes);
app.use("/api/disease", diseaseRoutes);
app.use("/api/dealer", dealerRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/farmers", farmerRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/broadcast", broadcastRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ success: true, message: "Vivasayi Nanban API is running" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Server error" });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("PostgreSQL database connected via Prisma");
    
    startCronJobs(); // Initialize scheduled tasks
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Database connection error:", err.message);
    process.exit(1);
  }
}

startServer();