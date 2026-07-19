import nodemailer from 'nodemailer';

const SENDER_EMAIL = process.env.EMAIL_USER;
const SENDER_PASS = process.env.EMAIL_PASS;
const RECEIVER_EMAIL = process.env.EMAIL_TO;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SENDER_EMAIL,
    pass: SENDER_PASS // this must be Gmail App Password
  }
});

async function sendEmail(subject, body) {
  try {
    await transporter.sendMail({
      from: SENDER_EMAIL,
      to: RECEIVER_EMAIL,
      subject: subject,
      text: body
    });
    console.log(`EMAIL SENT: ${subject}`);
    await new Promise(r => setTimeout(r, 5000)); // wait 5s for delivery
  } catch (e) {
    console.log("EMAIL FAILED:", e);
  }
}

async function main() {
  try {
    console.log("Bot starting...");
    await sendEmail("Bot CONNECTED", `Bot started at ${new Date().toISOString()}`);
    
    // YOUR BOT LOGIC HERE
    await new Promise(r => setTimeout(r, 3000));
    
    await sendEmail("Bot FINISHED", `Bot finished at ${new Date().toISOString()}`);
    console.log("Bot done");
  } catch (e) {
    await sendEmail("Bot CRASHED", e.toString());
    throw e;
  }
}

main();
