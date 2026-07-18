const WebSocket = require('ws');
const nodemailer = require('nodemailer');
require('dotenv').config();

const APP_TOKEN = process.env.DERIV_TOKEN;
const APP_ID = "1089";
const SYMBOL = "R_100";
const TARGET_DIGIT = 7;
const TICKS_TO_ANALYZE = 50;

let alertSent = false;

// Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // ianmunene1417@gmail.com
    pass: process.env.EMAIL_PASS  //umee qpcb odcd qssy
  }
});

function sendEmailAlert(message) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: '🚨 DERIV SIGNAL: MATCH 7 FOUND 🚨',
    text: message
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('❌ Email failed:', error);
    } else {
      console.log('✅ Email sent:', info.response);
      alertSent = true;
    }
  });
}

async function runBot() {
  console.log("Bot starting... Connecting to Deriv");
  
  while (true) {
    let digits = [];
    console.log("\n" + "=".repeat(40));
    console.log(`Starting new 50 tick scan for ${SYMBOL}`);

    const ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${APP_ID}`);

    ws.on('open', () => {
      ws.send(JSON.stringify({ authorize: APP_TOKEN }));
    });

    ws.on('message', (msg) => {
      const data = JSON.parse(msg);
      
      if (data.msg_type === 'authorize') {
        ws.send(JSON.stringify({ ticks: SYMBOL, subscribe: 1 }));
      }

      if (data.msg_type === 'tick') {
        const quote = data.tick.quote;
        const lastDigit = parseInt(quote.toString().slice(-1));
        digits.push(lastDigit);
        process.stdout.write(`Tick ${digits.length}/${TICKS_TO_ANALYZE} | Last digit: ${lastDigit}\r`);

        if (digits.length >= TICKS_TO_ANALYZE) {
          ws.close();
          
          const count7 = digits.filter(d => d === TARGET_DIGIT).length;
          console.log(`\nScan Complete! Digit ${TARGET_DIGIT}: ${count7}/50 times`);

          if (count7 < 4) {
            if (!alertSent) {
              const signalMsg = `🚨 MATCH 7 SIGNAL FOUND 🚨

Symbol: ${SYMBOL}
Analysis: ${count7} out of 50 ticks
Time: ${new Date().toLocaleString()}

Action: Place MATCH 7 trade NOW!`;
              console.log(signalMsg);
              sendEmailAlert(signalMsg);
            }
          } else {
            console.log("No signal. Waiting 10s for next scan...");
            alertSent = false;
          }

          setTimeout(runBot, 10000); // restart after 10s
        }
      }
    });

    ws.on('error', (err) => {
      console.log("Connection error:", err);
      setTimeout(runBot, 10000);
    });

    // wait until ws closes
    await new Promise(resolve => ws.on('close', resolve));
  }
}

runBot();
