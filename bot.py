import os, smtplib, time
from email.mime.text import MIMEText
from datetime import datetime

SENDER_EMAIL = os.getenv("EMAIL_USER")       
SENDER_PASSWORD = os.getenv("EMAIL_PASS")    
RECEIVER_EMAIL = os.getenv("EMAIL_TO")       

def send_email(subject, body):
    try:
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = SENDER_EMAIL
        msg["To"] = RECEIVER_EMAIL
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, RECEIVER_EMAIL, msg.as_string())
        print(f"EMAIL SENT: {subject}")
        time.sleep(5) # wait for delivery
    except Exception as e:
        print("EMAIL FAILED:", e)

print("Bot starting...")
send_email("Bot CONNECTED", f"Bot started at {datetime.now()}")

print("Bot running... waiting 10s")
time.sleep(10) # simulate bot working

send_email("Bot FINISHED", f"Bot finished successfully at {datetime.now()}")
print("Bot done")
