def send_email(subject, body):
    if not SENDER_EMAIL or not RECEIVER_EMAIL or not SENDER_PASSWORD:
        print("EMAIL ERROR: One of the secrets is empty. Check EMAIL_USER, EMAIL_PASS, EMAIL_TO")
        return
        
    print("TRYING TO SEND EMAIL...")
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
