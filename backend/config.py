import os

class Config:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_DIR = os.path.join(os.path.dirname(BASE_DIR), 'data')
    DB_PATH = os.path.join(DATA_DIR, 'lovehub.db')
    
    SECRET_KEY = os.environ.get('SECRET_KEY', 'CHANGE_THIS_SECRET_KEY_2026_LOVEHUB_XYZ')
    JWT_ALGORITHM = 'HS256'
    JWT_EXPIRY_DAYS = 30
    
    GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')
    GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
    GROQ_MODEL = 'llama-3.3-70b-versatile'
    
    DEFAULT_USERS = [
        {'username': 'pourya', 'password': '12345', 'display_name': 'پوریا', 'nickname': 'عشقم'},
        {'username': 'sarina', 'password': '12345', 'display_name': 'سارینا', 'nickname': 'نفسم'}
    ]

