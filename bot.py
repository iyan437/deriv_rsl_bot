import os, smtplib
from email.mime.text import MIMEText

SENDER_EMAIL = os.getenv("EMAIL_USER")       
SENDER_PASSWORD = os.getenv("EMAIL_PASS")    
RECEIVER_EMAIL = os.getenv("EMAIL_TO")       

print(f"SENDING FROM: {SENDER_EMAIL}")
print(f"SENDING TO: {RECEIVER_EMAIL}")

msg = MIMEText("This is a test from Deriv Bot")
msg["Subject"] = "TEST EMAIL FROM GITHUB"
msg["From"] = SENDER_EMAIL
msg["To"] = RECEIVER_EMAIL

try:
    print("Connecting to gmail...")
    server = smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10)
    print("Logging in...")
    server.login(SENDER_EMAIL, SENDER_PASSWORD)
    print("Sending...")
    server.sendmail(SENDER_EMAIL, RECEIVER_EMAIL, msg.as_string())
    server.quit()
    print("SUCCESS: Email sent!")
except Exception as e:
    print("FAILED:", type(e).__name__, e)
