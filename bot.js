const WebSocket = require('ws');
const fetch = require('node-fetch');

const PHONE = process.env.WHATSAPP_PHONE; // +2547XXXXXXXX
const APIKEY = process.env.WHATSAPP_KEY;
const APP_ID = '1089';

let prices = [];
const RSI_PERIOD = 14;
let lastSignal = 0; // cooldown so it doesn't spam you

async function sendWhatsApp(message) {
  const url = `https://api.callmebot.com/whatsapp.php?phone=${PHONE}&text=${encodeURIComponent(message)}&apikey=${APIKEY}`;
  await fetch(url);
  console.log("WhatsApp Sent:", message);
}

function calculateRSI(prices) {
  let gains = 0, losses = 0;
  for (let i = 1; i < prices.length; i++) {
    let diff = prices[i] - prices[i-1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  if(losses === 0) return 100;
  let rs = gains / losses;
  return 100 - (100 / (1 + rs));
}

const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${APP_ID}`);

ws.on('open', () => {
  sendWhatsApp("✅ Bot connected to Deriv Volatility 100 (1s)");
  ws.send(JSON.stringify({ticks: "R_100", subscribe: 1}));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.tick) {
    const price = parseFloat(msg.tick.quote);
    prices.push(price);
    if (prices.length > RSI_PERIOD) prices.shift();
    
    if (prices.length === RSI_PERIOD) {
      const rsi = calculateRSI(prices);
      const now = Date.now();
      
      // Only send if 5 minutes passed since last signal
      if (now - lastSignal > 5 * 60 * 1000) {
        if (rsi < 30) {
          sendWhatsApp(`📈 BUY Signal!\nRSI: ${rsi.toFixed(2)}\nVol100(1s)\nPrice: ${price}`);
          lastSignal = now;
        }
        if (rsi > 70) {
          sendWhatsApp(`📉 SELL Signal!\nRSI: ${rsi.toFixed(2)}\nVol100(1s)\nPrice: ${price}`);
          lastSignal = now;
        }
      }
    }
  }
});
