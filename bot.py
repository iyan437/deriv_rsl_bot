import os, smtplib, traceback
from email.mime.text import MIMEText

SENDER_EMAIL = os.getenv("EMAIL_USER")       
SENDER_PASSWORD = os.getenv("EMAIL_PASS")    
RECEIVER_EMAIL = os.getenv("EMAIL_TO")       

def send_email(subject, body):
    try:
        if not RECEIVER_EMAIL:
            print("FATAL: EMAIL_TO is empty")
            return
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = SENDER_EMAIL
        msg["To"] = RECEIVER_EMAIL
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, RECEIVER_EMAIL, msg.as_string())
        print("Email sent")
    except Exception as e:
        print("Could not send email:", e)

try:
    print("Bot starting...")
    send_email("Bot CONNECTED", "Bot started successfully. Secrets are working.")
    
    # PUT YOUR BOT LOGIC HERE
    # for now just test
    raise Exception("This is a test crash")

except Exception as e:
    error_msg = traceback.format_exc()
    print("BOT CRASHED:", error_msg)
    send_email("Bot FAILED", f"Error: {e}\n\nTraceback:\n{error_msg}")
