const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,

  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendMail = async (email, subject, content) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: subject,
      html: content,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        if (info && info.messageId) {
          console.log("Mail sent successfully, message ID:", info.messageId);
        } else {
          console.error("No messageId received in the response.");
        }
      }
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = {
  sendMail: sendMail,
};
