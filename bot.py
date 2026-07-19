import asyncio, websockets, json, ssl, os, smtplib
from email.mime.text import MIMEText
from datetime import datetime

TOKEN = os.getenv("DERIV_TOKEN") 
SENDER_EMAIL = os.getenv("EMAIL_USER")       
SENDER_PASSWORD = os.getenv("EMAIL_PASS")    
RECEIVER_EMAIL = os.getenv("EMAIL_TO")       

print("DEBUG: EMAIL_USER =", SENDER_EMAIL)
print("DEBUG: EMAIL_TO =", RECEIVER_EMAIL)
print("DEBUG: EMAIL_PASS length =", len(SENDER_PASSWORD) if SENDER_PASSWORD else 0)

def send_email(subject, body):
    print("TRYING TO LOGIN TO GMAIL...")
    server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
    server.login(SENDER_EMAIL, SENDER_PASSWORD) # <-- This will error here if wrong
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = SENDER_EMAIL
    msg["To"] = RECEIVER_EMAIL
    server.sendmail(SENDER_EMAIL, RECEIVER_EMAIL, msg.as_string())
    server.quit()
    print("Email sent!")

send_email("TEST EMAIL", "If you get this, email works")
print("Test done. Now starting bot...")

# ... rest of your bot code below
