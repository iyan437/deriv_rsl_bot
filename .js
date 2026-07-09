const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const SYMBOL = "R_100";
const APP_ID = 1089;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegram(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message })
  });
}

async function getRSI() {
  const res = await fetch("https://ws.derivws.com/candles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      app_id: APP_ID, ticks_history: SYMBOL, count: 15,
      end: "latest", style: "candles", granularity: 60
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  const candles = data.candles;
  const rsi = calculateRSI(candles);
  const price = candles.at(-1).close;

  let action = 'HOLD';
  if (rsi < 30) action = 'BUY 🔥';
  if (rsi > 70) action = 'SELL 🔥';

  const message = `📊 Deriv Bot Alert
Symbol: ${SYMBOL}
RSI: ${rsi.toFixed(2)}
Price: ${price}
Signal: ${action}
Time: ${new Date().toLocaleTimeString()}`;

  console.log(message);

  // Only send Telegram if it's BUY or SELL
  if(action!== 'HOLD') {
    await sendTelegram(message);
  }
}

function calculateRSI(candles) {
  let gains = 0; let losses = 0;
  for (let i = 1; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff > 0) gains += diff; else losses += Math.abs(diff);
  }
  const avgGain = gains / 14; const avgLoss = losses / 14;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

getRSI().catch(e => console.error("Error:", e.message));
