const fetch = require('node-fetch');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegram(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message })
    });
    const data = await res.json();
    console.log('Telegram response:', JSON.stringify(data));
    if (!data.ok) console.error('❌ Telegram error:', data.description);
  } catch (e) {
    console.error('❌ Fetch failed:', e.message);
  }
}

async function checkDeriv() {
  // Your Deriv RSI logic here
  const message = 'RSI Alert: Buy signal on Volatility 100 Index';
  await sendTelegram(message);
}

checkDeriv();
