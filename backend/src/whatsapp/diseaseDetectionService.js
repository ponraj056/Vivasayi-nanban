const wa = require("./whatsappService");

/**
 * TODO: Replace the body of this function once the YOLOv8 disease
 * detection module is built. Real flow will look like:
 *
 *   1. mediaUrl = await wa.getMediaUrl(mediaId)
 *   2. imageBuffer = await wa.downloadMedia(mediaUrl)
 *   3. POST imageBuffer to your Python/YOLOv8 inference service
 *   4. Format the prediction and send it back via wa.sendText
 *
 * For now this just acknowledges receipt so the bot flow is testable
 * end-to-end without the ML service running.
 */
async function queueDiseaseDetection({ phoneNumber, mediaId, language }) {
  try {
    const mediaUrl = await wa.getMediaUrl(mediaId);
    const imageBuffer = await wa.downloadMedia(mediaUrl);

    // --- Placeholder result until YOLOv8 service is wired in ---
    const result = {
      disease: "Leaf Blight (sample)",
      confidence: 0.87,
      recommendation:
        language === "ta"
          ? "பூஞ்சைக் கொல்லி மருந்து தெளிக்கவும். 3-4 நாட்களில் மீண்டும் சரிபார்க்கவும்."
          : "Apply fungicide spray. Re-check in 3-4 days.",
    };

    const reply =
      language === "ta"
        ? `🔬 கண்டறியப்பட்டது: *${result.disease}*\nநம்பகத்தன்மை: ${(result.confidence * 100).toFixed(0)}%\n\n💡 ${result.recommendation}`
        : `🔬 Detected: *${result.disease}*\nConfidence: ${(result.confidence * 100).toFixed(0)}%\n\n💡 ${result.recommendation}`;

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