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

SENDER_EMAIL = os.getenv("EMAIL_USER")       
SENDER_PASSWORD = os.getenv("EMAIL_PASS")    
RECEIVER_EMAIL = os.getenv("EMAIL_TO")       

TARGET_7_COUNT = 10      # Lowered for testing
RESET_AFTER_TICKS = 50   

seven_count = 0
cooldown = 0
ssl_context = ssl.create_default_context()

def send_email(subject, body):
    print(f"TRYING TO SEND EMAIL: {subject}") # debug log
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
    send_email("Deriv Bot STARTED", f"Bot started at {datetime.now()}") # 1. startup email
    
    while True:
        try:
            async with websockets.connect(URL, ssl=ssl_context, ping_interval=20, ping_timeout=20) as ws:
                print("Connected to Deriv")
                await ws.send(json.dumps({"authorize": TOKEN}))
                auth_res = await ws.recv()
                print("Auth response:", auth_res) # 2. check if token is valid
                
                await ws.send(json.dumps({"ticks": "R_100", "subscribe": 1}))
                
                while True:
                    msg = await ws.recv()
                    data = json.loads(msg)
                    if "tick" in data:
                        last_digit = int(str(data["tick"]["quote"])[-1])
                        now = datetime.now().strftime("%H:%M:%S")
                        
                        if last_digit == 7: seven_count += 1
                        cooldown += 1
                        print(f"[{now}] Tick | LastDigit: {last_digit} | 7s: {seven_count}/{TARGET_7_COUNT} | Tick: {cooldown}/{RESET_AFTER_TICKS}")
                        
                        if cooldown >= RESET_AFTER_TICKS:
                            if seven_count >= TARGET_7_COUNT:
                                message = f"SIGNAL! 7 appeared {seven_count} times in {RESET_AFTER_TICKS} ticks at {now}"
                                send_email("Deriv Bot SIGNAL", message)
                            else:
                                message = f"No Match. Only got {seven_count}/{TARGET_7_COUNT} sevens in {RESET_AFTER_TICKS} ticks at {now}"
                                send_email("Deriv Bot - NO MATCH", message)
                            seven_count = 0
                            cooldown = 0

        except Exception as e:
            print("CRASH:", e)
            send_email("Deriv Bot CRASHED", f"Error: {e}")
            await asyncio.sleep(10)

asyncio.run(run_bot())
