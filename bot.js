import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const TO = process.env.EMAIL_TO;
const FROM = process.env.EMAIL_USER;

async function sendEmail(subject, body) {
  const msg = { to: TO, from: FROM, subject, text: body };
  try {
    await sgMail.send(msg);
    console.log(`✅ EMAIL SENT: ${subject}`);
  } catch (e) {
    console.log(`❌ EMAIL FAILED: ${e.message}`);
  }
}

// This runs when the script exits for ANY reason
process.on('exit', (code) => {
  console.log(`Process exiting with code: ${code}`);
});

// This catches unhandled errors
process.on('uncaughtException', async (err) => {
  await sendEmail("Bot CRASHED", `Error: ${err.message}\n\n${err.stack}`);
  process.exit(1);
});

async function main() {
  const startTime = new Date();
  await sendEmail("Bot CONNECTED", `Bot started at ${startTime.toISOString()}`);

  // ===== PUT YOUR BOT LOGIC HERE =====
  console.log("Bot is running...");
  
  // TEST 1: Trigger success email
  await new Promise(r => setTimeout(r, 3000));
  
  // TEST 2: Uncomment this line to test crash email
  // throw new Error("This is a test crash");
  
  // ===== END BOT LOGIC =====

  const endTime = new Date();
  await sendEmail("Bot FINISHED", `Bot finished successfully\nStarted: ${startTime}\nEnded: ${endTime}`);
}

main();
