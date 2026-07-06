import os

class Config:
    # مسیرها
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_DIR = os.path.join(os.path.dirname(BASE_DIR), 'data')
    DB_PATH = os.path.join(DATA_DIR, 'lovehub.db')
    
    # امنیت - ⚠️ حتماً تغییر بده
    SECRET_KEY = os.environ.get('SECRET_KEY', 'CHANGE_THIS_SUPER_SECRET_KEY_2026_LOVEHUB')
    JWT_ALGORITHM = 'HS256'
    JWT_EXPIRY_DAYS = 30
    
    # Groq API - ⚠️ API key خودت رو اینجا بذار
    GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')
    GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
    GROQ_MODEL = 'llama-3.3-70b-versatile'
    
    # کاربران پیش‌فرض
    DEFAULT_USERS = [
        {
            'username': 'pourya',
            'password': '12345',
            'display_name': 'پوریا',
            'nickname': 'عشقم'
        },
        {
            'username': 'sarina',
            'password': '12345',
            'display_name': 'سارینا',
            'nickname': 'نفسم'
        }
    ]

