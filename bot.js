import { DerivAPI } from '@deriv/deriv-api';
import WebSocket from 'ws';
import nodemailer from 'nodemailer';

const app_id = 1089;
const token = process.env.DERIV_TOKEN;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${app_id}`);
const api = new DerivAPI({ connection: ws });

async function sendEmail(symbol, signal, rsi) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: EMAIL_USER, pass: EMAIL_PASS }
    });
    await transporter.sendMail({
        from: EMAIL_USER,
        to: EMAIL_USER,
        subject: `DERIV SIGNAL: ${signal} on ${symbol}`,
        text: `Signal: ${signal}\nSymbol: ${symbol}\nRSI: ${rsi.toFixed(2)}`
    });
    console.log('✅ Email sent');
}

async function runBot() {
    console.log('Bot starting...');
    await api.account.getAccountInfo();
    
    const symbols = ['frxEURUSD', 'frxGBPUSD', 'frxUSDJPY']; // add more if you want
    let ticks = [];

    for(const symbol of symbols){
        ticks = [];
        console.log(`Scanning ${symbol}`);
        await new Promise(resolve => {
            api.ticks.subscribe(symbol).then(sub => {
                sub.on('tick', (tick) => {
                    ticks.push(parseFloat(tick.quote));
                    if(ticks.length >= 50){
                        sub.unsubscribe();
                        resolve();
                    }
                });
            });
        });

        // RSI calculation
        let gains = 0, losses = 0;
        for(let i=1; i<ticks.length; i++){
            const diff = ticks[i] - ticks[i-1];
            if(diff > 0) gains += diff; else losses -= diff;
        }
        const rs = gains / (losses || 1);
        const rsi = 100 - (100 / (1 + rs));

        if(rsi < 30) await sendEmail(symbol, 'BUY', rsi);
        if(rsi > 70) await sendEmail(symbol, 'SELL', rsi);
    }
    ws.close();
}

runBot();  });
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
