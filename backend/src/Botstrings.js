/**
 * Centralized bilingual strings so every flow pulls from one place.
 * Usage: strings.welcome[session.language]
 */
module.exports = {
  welcome: {
    ta: "🌾 வணக்கம்! *விவசாயி நண்பன்* -க்கு உங்களை வரவேற்கிறோம்.\nஎன்ன உதவி வேண்டும்?",
    en: "🌾 Welcome to *Vivasayi Nanban*!\nHow can I help you today?",
  },
  mainMenuButtons: {
    ta: [
      { id: "MENU_PRICE", title: "விலை பார்க்க" },
      { id: "MENU_DISEASE", title: "நோய் கண்டறிய" },
      { id: "MENU_MACHINE", title: "இயந்திரம் வாடகை" },
    ],
    en: [
      { id: "MENU_PRICE", title: "Check Price" },
      { id: "MENU_DISEASE", title: "Disease Check" },
      { id: "MENU_MACHINE", title: "Rent Machine" },
    ],
  },
  askRegisterName: {
    ta: "முதலில் பதிவு செய்வோம். உங்கள் பெயரை தெரிவிக்கவும்:",
    en: "Let's get you registered first. What's your name?",
  },
  askDistrict: {
    ta: "நீங்கள் எந்த மாவட்டம்?",
    en: "Which district are you from?",
  },
  askCropForPrice: {
    ta: "எந்த பயிரின் விலை தெரிந்துகொள்ள வேண்டும்?",
    en: "Which crop's price would you like to check?",
  },
  priceNotFound: {
    ta: "மன்னிக்கவும், இந்த பயிருக்கான விலை தகவல் இப்போது கிடைக்கவில்லை.",
    en: "Sorry, price data isn't available for this crop right now.",
  },
  askDiseaseImage: {
    ta: "📸 பயிர் இலையின் புகைப்படத்தை அனுப்பவும். நான் பரிசோதித்து பதில் தருகிறேன்.",
    en: "📸 Please send a photo of the affected leaf. I'll analyze it and reply.",
  },
  diseaseProcessing: {
    ta: "படத்தை பரிசோதிக்கிறேன், சிறிது நேரம் காத்திருக்கவும்... ⏳",
    en: "Analyzing your image, please wait... ⏳",
  },
  machineTypeAsk: {
    ta: "எந்த இயந்திரம் வேண்டும்?",
    en: "Which machine do you need?",
  },
  machineTypeRows: {
    ta: [
      { id: "MACHINE_TRACTOR", title: "டிராக்டர்" },
      { id: "MACHINE_HARVESTER", title: "அறுவடை இயந்திரம்" },
      { id: "MACHINE_SPRAYER", title: "மருந்து தெளிப்பான்" },
    ],
    en: [
      { id: "MACHINE_TRACTOR", title: "Tractor" },
      { id: "MACHINE_HARVESTER", title: "Harvester" },
      { id: "MACHINE_SPRAYER", title: "Sprayer" },
    ],
  },
  askBookingDate: {
    ta: "எந்த தேதிக்கு வேண்டும்? (DD-MM-YYYY வடிவில் அனுப்பவும்)",
    en: "Which date do you need it? (send as DD-MM-YYYY)",
  },
  bookingConfirmed: {
    ta: "✅ உங்கள் முன்பதிவு கோரிக்கை பதிவு செய்யப்பட்டது! உரிமையாளர் விரைவில் தொடர்பு கொள்வார்.",
    en: "✅ Your booking request is recorded! The owner will contact you shortly.",
  },
  invalidInput: {
    ta: "மன்னிக்கவும், புரியவில்லை. மீண்டும் முயற்சிக்கவும்.",
    en: "Sorry, I didn't understand that. Please try again.",
  },
  genericError: {
    ta: "ஏதோ தவறு நடந்துவிட்டது. சிறிது நேரம் கழித்து முயற்சிக்கவும்.",
    en: "Something went wrong. Please try again in a moment.",
  },
};