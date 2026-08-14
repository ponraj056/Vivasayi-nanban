const axios = require('axios');
const path = require('path');
const fs = require('fs');
const prisma = require('../config/prisma');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const detectDisease = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    const imagePath = req.file.path;
    const mlServiceUrl = process.env.ML_SERVICE_URL;

    let result;

    if (mlServiceUrl) {
      // Future Real Integration
      // const formData = new FormData();
      // formData.append('file', fs.createReadStream(imagePath));
      // const response = await axios.post(mlServiceUrl, formData, {
      //   headers: { 'Content-Type': 'multipart/form-data' }
      // });
      // result = response.data;
    } else {
      // Mocked Response for testing
      await new Promise(resolve => setTimeout(resolve, 2000)); // simulate delay
      result = {
        disease: "Leaf Blight (Mock)",
        confidence: 0.92,
        recommendation: "Apply fungicide spray. Ensure proper field drainage and re-check in 3-4 days."
      };
    }

    // Save report to database
    if (req.user && req.user.role === 'farmer') {
      await prisma.diseaseReport.create({
        data: {
          farmerId: req.user.id,
          imageUrl: imagePath, // in a real app, upload to S3 and save URL
          diseaseName: result.disease,
          confidence: result.confidence,
          treatmentAdvice: result.recommendation
        }
      });
    }

    // Clean up the file after processing to save space
    fs.unlinkSync(imagePath);

    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('Disease detection error:', error);
    // Cleanup on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ success: false, message: 'Failed to analyze image.' });
  }
};

const getDiseaseReports = async (req, res) => {
  try {
    const reports = await prisma.diseaseReport.findMany({
      include: {
        farmer: {
          select: {
            name: true,
            phone: true,
            farmerProfile: { select: { district: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { detectDisease, getDiseaseReports };
