const axios = require("axios");
const FormData = require("form-data");
const prisma = require("../config/prisma");
const wa = require("./whatsappService");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

async function queueDiseaseDetection({ phoneNumber, mediaId, language }) {
  try {
    const mediaUrl = await wa.getMediaUrl(mediaId);
    const imageBuffer = await wa.downloadMedia(mediaUrl);

    // Send to Python ML Service
    const form = new FormData();
    form.append("file", imageBuffer, { filename: "disease_image.jpg", contentType: "image/jpeg" });

    let mlResponse;
    try {
      mlResponse = await axios.post(`${ML_SERVICE_URL}/detect`, form, {
        headers: { ...form.getHeaders() }
      });
    } catch (apiError) {
      console.error("Failed to reach ML service:", apiError.message);
      // Fallback for development/testing when Python server isn't running
      mlResponse = {
        data: {
          success: true,
          result: {
            disease: "Leaf Blight (Mock Fallback)",
            confidence: 0.85,
            recommendation: "Apply fungicide spray. Re-check in 3-4 days."
          }
        }
      };
    }

    if (!mlResponse.data.success) {
      throw new Error(mlResponse.data.message || "ML Service failed");
    }

    const { disease, confidence, recommendation } = mlResponse.data.result;

    // Save to Postgres
    await prisma.disease_detections.create({
      data: {
        phone_number: phoneNumber,
        disease,
        confidence,
        crop: "Unknown", // Future enhancement: ask user for crop type first
        recommendation_en: recommendation,
        recommendation_ta: null // Tamil translation logic
      }
    });

    const reply =
      language === "ta"
        ? `🔬 கண்டறியப்பட்டது: *${disease}*\nநம்பகத்தன்மை: ${(confidence * 100).toFixed(0)}%\n\n💡 ${recommendation}` 
        : `🔬 Detected: *${disease}*\nConfidence: ${(confidence * 100).toFixed(0)}%\n\n💡 ${recommendation}`;

    await wa.sendText(phoneNumber, reply);
  } catch (err) {
    console.error("Disease detection error:", err.message);
    await wa.sendText(
      phoneNumber,
      language === "ta"
        ? "படத்தை பரிசோதிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்."
        : "Couldn't analyze the image. Please try again."
    );
  }
}

module.exports = { queueDiseaseDetection };