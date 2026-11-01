import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email_alert(to_email: str, car_title: str, price: float):
    """
    Функція надсилання реального email-сповіщення про новий підходящий автомобіль.
    """
    sender_email = "autoadvisor.system@gmail.com"
    sender_password = "your_app_password_here"  # Використовуйте змінні середовища (.env)
    
    subject = "🚗 Новий автомобіль відповідає вашим критеріям пошуку!"
    body = f"""
    Вітаємо!
    У системі з'явився новий варіант автомобіля, що повністю відповідає вашим збереженим налаштуванням:
    
    Модель: {car_title}
    Ціна: ${price:,.0f}
    
    Перейдіть у свій особистий кабінет на платформі AutoAdvisor, щоб переглянути деталі та оцінку ліквідності.
    """

    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        # Налаштування для SMTP сервера (наприклад, Gmail)
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()
        print(f"Лист успішно надіслано на {to_email}")
    except Exception as e:
        print(f"Помилка відправки email: {e}")