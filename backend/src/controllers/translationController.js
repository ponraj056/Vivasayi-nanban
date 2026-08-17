const translations = require("../config/translations.json");

const getTranslations = (req, res) => {
  try {
    const lang = req.params.lang || "ta";
    
    // Default to 'ta' if language is not supported
    const data = translations[lang] ? translations[lang] : translations["ta"];
    
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching translations:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getTranslations,
};
