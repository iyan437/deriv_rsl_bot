import os, smtplib
from email.mime.text import MIMEText

SENDER_EMAIL = os.getenv("EMAIL_USER")       
SENDER_PASSWORD = os.getenv("EMAIL_PASS")    
RECEIVER_EMAIL = os.getenv("EMAIL_TO")       

msg = MIMEText("Test from GitHub")
msg["Subject"] = "GITHUB TEST"
msg["From"] = SENDER_EMAIL
msg["To"] = RECEIVER_EMAIL

with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
    server.login(SENDER_EMAIL, SENDER_PASSWORD)
    result = server.sendmail(SENDER_EMAIL, RECEIVER_EMAIL, msg.as_string())
    
print("SENDMAIL RESULT:", result) # If this is {} it means Gmail accepted it
print("DONE")
