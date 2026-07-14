const WebSocket = require('ws');
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');

const PHONE = process.env.WHATSAPP_PHONE; 
const APIKEY = process.env.WHATSAPP_KEY;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const APP_ID = '1089';

let prices = [];
const RSI_PERIOD = 14;

async function sendWhatsApp(message) {
  const url = `https://api.callmebot.com/whatsapp.php?phone=${PHONE}&text=${encodeURIComponent(message)}&apikey=${APIKEY}`;
  await fetch(url);
}

async function sendEmail(message) {
  let transporter = nodemailer.createTransport({service: 'gmail', auth: {user: EMAIL_USER, pass: EMAIL_PASS}});
  await transporter.sendMail({from: EMAIL_USER, to: EMAIL_USER, subject: 'Deriv RSI Signal', text: message});
}

function calculateRSI(p) { /* same as before */ }

const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${APP_ID}`);
ws.on('open', () => { sendWhatsApp("✅ Bot LIVE 24/7"); ws.send(JSON.stringify({ticks: "R_100", subscribe: 1})); });

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.tick) {
    const price = parseFloat(msg.tick.quote);
    prices.push(price);
    if (prices.length > RSI_PERIOD) prices.shift();
    if (prices.length === RSI_PERIOD) {
      const rsi = calculateRSI(prices);
      if (rsi < 30) { const m = `📈 BUY RSI:${rsi.toFixed(2)} Price:${price}`; sendWhatsApp(m); sendEmail(m); }
      if (rsi > 70) { const m = `📉 SELL RSI:${rsi.toFixed(2)} Price:${price}`; sendWhatsApp(m); sendEmail(m); }
    }
  }
});

// Keep alive ping so Replit doesn't sleep
setInterval(()=>{console.log("Bot alive")}, 60000);
