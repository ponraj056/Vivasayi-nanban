const axios = require("axios");
const FormData = require("form-data");
const wa = require("./whatsappService");

const DISEASE_API_URL = process.env.DISEASE_API_URL;

async function queueDiseaseDetection({ phoneNumber, mediaId, language }) {
  try {
    // 1. Get the image from WhatsApp
    const mediaUrl = await wa.getMediaUrl(mediaId);
    const imageBuffer = await wa.downloadMedia(mediaUrl);

    // 2. Send it to the teammate's deployed YOLOv8 model
    const form = new FormData();
    form.append("file", imageBuffer, {
      filename: "leaf.jpg",
      contentType: "image/jpeg",
    });

    const response = await axios.post(`${DISEASE_API_URL}/predict`, form, {
      headers: form.getHeaders(),
      timeout: 30000, // Render free tier can be slow on cold start
    });

    const result = response.data;
    // result = { disease, confidence, crop, recommendation_en, recommendation_ta }

    const diseaseLabel = result.disease.replace(/_/g, " ");
    const recommendation =
      language === "ta" ? result.recommendation_ta : result.recommendation_en;

    const reply =
      language === "ta"
        ? `🔬 கண்டறியப்பட்டது: *${diseaseLabel}* (${result.crop})\nநம்பகத்தன்மை: ${(result.confidence * 100).toFixed(1)}%\n\n💡 ${recommendation}`
        : `🔬 Detected: *${diseaseLabel}* (${result.crop})\nConfidence: ${(result.confidence * 100).toFixed(1)}%\n\n💡 ${recommendation}`;

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