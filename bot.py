import asyncio
import websockets
import json
import ssl
import os
import smtplib
from email.mime.text import MIMEText
from datetime import datetime

TOKEN = os.getenv("DERIV_TOKEN") 
APP_ID = os.getenv("DERIV_APP_ID", "1089")
URL = f"wss://ws.derivws.com/websockets/v3?app_id={APP_ID}"

# EMAIL SETTINGS
SENDER_EMAIL = os.getenv("EMAIL_USER")       
SENDER_PASSWORD = os.getenv("EMAIL_PASS")    
RECEIVER_EMAIL = os.getenv("EMAIL_TO")       

TARGET_7_COUNT = 20      # Signal if we get 20 sevens
COOLDOWN_TICKS = 2       
RESET_AFTER_TICKS = 50   # CHECK EVERY 50 TICKS NOW

seven_count = 0
cooldown = 0
ssl_context = ssl.create_default_context()

def send_email(subject, body):
    try:
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = SENDER_EMAIL
        msg["To"] = RECEIVER_EMAIL
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, RECEIVER_EMAIL, msg.as_string())
        print("Email sent!")
    except Exception as e:
        print("Email error:", e)

async def run_bot():
    global seven_count, cooldown
    print("Bot Starting...")
    while True:
        try:
            async with websockets.connect(URL, ssl=ssl_context, ping_interval=20, ping_timeout=20) as ws:
                print("Connected to Deriv")
                await ws.send(json.dumps({"authorize": TOKEN}))
                await ws.recv()
                await ws.send(json.dumps({"ticks": "R_100", "subscribe": 1}))
                
                while True:
                    msg = await ws.recv()
                    data = json.loads(msg)
                    if "tick" in data:
                        last_digit = int(str(data["tick"]["quote"])[-1])
                        now = datetime.now().strftime("%H:%M:%S")
                        
                        if last_digit == 7: 
                            seven_count += 1
                        
                        cooldown += 1
                        print(f"[{now}] Tick | LastDigit: {last_digit} | 7s: {seven_count}/{TARGET_7_COUNT} | Tick: {cooldown}/{RESET_AFTER_TICKS}")
                        
                        # CHECK EVERY 50 TICKS
                        if cooldown >= RESET_AFTER_TICKS:
                            if seven_count >= TARGET_7_COUNT:
                                # MATCH FOUND
                                message = f"SIGNAL! 7 appeared {seven_count} times in {RESET_AFTER_TICKS} ticks at {now}. Time to trade R_100"
                                print(message)
                                send_email("Deriv Bot SIGNAL - MATCH FOUND", message)
                            else:
                                # NO MATCH FOUND
                                message = f"No Match. Only got {seven_count}/{TARGET_7_COUNT} sevens in {RESET_AFTER_TICKS} ticks at {now}. Waiting for next window."
                                print(message)
                                send_email("Deriv Bot - NO MATCH", message)
                            
                            # Reset for next window
                            seven_count = 0
                            cooldown = 0

        except Exception as e:
            print("Connection lost:", e)
            send_email("Deriv Bot ERROR", f"Bot disconnected: {e}")
            await asyncio.sleep(5)

asyncio.run(run_bot())
