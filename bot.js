const WebSocket = require('ws');
const nodemailer = require('nodemailer');

const APP_ID = '1089';
const DERIV_TOKEN = process.env.DERIV_TOKEN;
const EMAIL_USER = process.env.EMAIL_USER; // your gmail
const EMAIL_PASS = process.env.EMAIL_PASS; // 16 digit app password

let prices = [];
const RSI_PERIOD = 14;
let lastSignal = ''; // prevent spam

// Email setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { 
        user: EMAIL_USER, 
        pass: EMAIL_PASS 
    }
});

async function sendEmail(subject, message) {
    try {
        await transporter.sendMail({
            from: EMAIL_USER,
            to: EMAIL_USER, // sends to yourself
            subject: subject,
            text: message
        });
        console.log("📧 Email Sent:", subject);
    } catch(err) {
        console.log("Email error:", err);
    }
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

ws.on('open', async () => {
    await sendEmail("✅ Deriv Bot Connected", "Bot connected to Deriv Volatility 100 (1s)");
    ws.send(JSON.stringify({ticks: "R_100", subscribe: 1}));
});

ws.on('message', async (data) => {
    const msg = JSON.parse(data);
    if (msg.tick) {
        const price = parseFloat(msg.tick.quote);
        prices.push(price);
        if (prices.length > RSI_PERIOD) prices.shift();
        
        if (prices.length === RSI_PERIOD) {
            const rsi = calculateRSI(prices);
            let signal = '';
            
            if (rsi < 30) signal = 'BUY';
            if (rsi > 70) signal = 'SELL';
            
            // only send if new signal
            if(signal && signal!== lastSignal) {
                lastSignal = signal;
                const subject = `📊 DERIV SIGNAL: ${signal} on Vol100(1s)`;
                const body = `Signal: ${signal}\nSymbol: Volatility 100 (1s)\nRSI: ${rsi.toFixed(2)}\nPrice: ${price}`;
                await sendEmail(subject, body);
            }
        }
    }
});

ws.on('error', (err) => console.log('WS Error:', err));
