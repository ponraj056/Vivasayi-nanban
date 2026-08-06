require("dotenv").config();
const sendEmail = require("./src/utils/sendEmail");

async function testMail() {
  try {
    const info = await sendEmail({
      to: "test@example.com",
      subject: "Test",
      text: "Testing nodemailer",
    });
    console.log("Mail Success:", info.response);
  } catch (err) {
    console.error("Mail Error:", err);
  }
}

testMail();
