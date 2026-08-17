const express = require("express");
const { getTranslations } = require("../controllers/translationController");

const router = express.Router();

router.get("/:lang", getTranslations);

module.exports = router;
