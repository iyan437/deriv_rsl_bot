ws.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.tick) {
    const price = parseFloat(msg.tick.quote);
    prices.push(price);
    if (prices.length > RSI_PERIOD) prices.shift();
    
    if (prices.length === RSI_PERIOD) {
      const rsi = calculateRSI(prices);
      console.log(`RSI: ${rsi.toFixed(2)} Price: ${price}`); // so you can see it in logs

      // BUY SIGNAL
      if (rsi < 30) {
        const msg = `📈 BUY Signal!\nRSI: ${rsi.toFixed(2)}\nVol100(1s)\nPrice: ${price}`;
        sendWhatsApp(msg);
        sendEmail(msg);
      }

      // SELL SIGNAL
      if (rsi > 70) {
        const msg = `📉 SELL Signal!\nRSI: ${rsi.toFixed(2)}\nVol100(1s)\nPrice: ${price}`;
        sendWhatsApp(msg);
        sendEmail(msg);
      }
    }
  }
});
