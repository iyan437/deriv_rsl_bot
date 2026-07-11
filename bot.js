const fetch = require('node-fetch');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegram(message) {
  const url = https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message })
  });
}

async function checkDeriv() {
  // Your Deriv RSI logic here
  const message = RSI Alert: Buy signal on Volatility 100 Index;
  await sendTelegram(message);
}

checkDeriv();
