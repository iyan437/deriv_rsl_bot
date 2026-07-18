# deriv_tv_bot

Automated Deriv trading signal bot using RSI strategy. 
Runs on GitHub Actions for free 24/7. Sends email alerts when RSI < 30 = BUY or RSI > 70 = SELL.

## How it works
1.  Connects to Deriv API via WebSocket
2.  Scans forex symbols every 5 minutes
3.  Calculates RSI on last 50 ticks
4.  Sends email to `EMAIL_USER` if overbought/oversold signal is found

## Setup - Free on GitHub Actions

### 1. Get API Keys
- **Deriv Token**: https://app.deriv.com/account/api-token → Create → Tick `Read` + `Trade`
- **Gmail App Password**: https://myaccount.google.com/apppasswords → Generate 16-digit code

### 2. Add GitHub Secrets
Go to `Repo Settings > Secrets and variables > Actions > New repository secret`
Add these 3:
