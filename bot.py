import os, smtplib
from email.mime.text import MIMEText

SENDER_EMAIL = os.getenv("EMAIL_USER")       
SENDER_PASSWORD = os.getenv("EMAIL_PASS")    
RECEIVER_EMAIL = os.getenv("EMAIL_TO")       

msg = MIMEText("Hello from GitHub Actions. If you get this, email works.")
msg["Subject"] = "GitHub Test Email"
msg["From"] = SENDER_EMAIL
msg["To"] = RECEIVER_EMAIL

try:
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, RECEIVER_EMAIL, msg.as_string())
    print("EMAIL SENT SUCCESSFULLY")
except Exception as e:
    print("EMAIL FAILED:", type(e).__name__, e)
