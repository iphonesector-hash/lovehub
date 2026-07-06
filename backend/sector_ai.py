import requests
import random
from config import Config

def query_sector(message, user_context=None):
    if not Config.GROQ_API_KEY:
        return {'reply': rule_based_response(message), 'source': 'rule-based'}
    
    system_prompt = "تو سکتور هستی، دستیار هوشمند عشق برای یک زوج. لحن صمیمی و عاشقانه و حمایتگر دار. به فارسی پاسخ بده. از ایموجی استفاده کن. پاسخ‌ها کوتاه و کاربردی باشن (حداکثر ۳ جمله)."
    
    if user_context:
        system_prompt += f"\nاطلاعات: {user_context}"
    
    try:
        response = requests.post(
            Config.GROQ_API_URL,
            headers={
                'Authorization': f'Bearer {Config.GROQ_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': Config.GROQ_MODEL,
                'messages': [
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': message}
                ],
                'temperature': 0.8,
                'max_tokens': 300
            },
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            return {
                'reply': data['choices'][0]['message']['content'],
                'source': 'groq'
            }
    except Exception as e:
        print(f"Groq error: {e}")
    
    return {'reply': rule_based_response(message), 'source': 'rule-based'}

def rule_based_response(msg):
    msg_lower = msg.lower()
    
    rules = [
        (['سلام', 'هی', 'درود'], 
         ['سلام عشقم! 🌹 چطور می‌تونم کمکتون کنم؟', 
          'درود بر شما دو عزیز! 💕']),
        (['دوستت', 'عاشق', 'دلم تنگ'], 
         ['💕 عشق شما خاصه! یه پیام صوتی عاشقانه بفرست معجزه می‌کنه!', 
          '🌹 پیشنهاد: امروز یه سورپرایز کوچیک آماده کن!']),
        (['ناراحت', 'غمگین', 'خسته'], 
         ['💙 نگران نباش، یه بغل طولانی همه چیز رو بهتر می‌کنه!', 
          '🤗 موزیک آرام‌بخش بذارید و با هم حرف بزنید.']),
        (['قرار', 'ایده', 'پیشنهاد'], 
         ['🎬 قرار سینمایی خانگی با پتو و نور شمع!', 
          '🍳 با هم یه غذای جدید درست کنید!', 
          '⭐ شب برید پشت‌بوم و ستاره‌ها رو بشمارید!']),
        (['چطور', 'چه کار'], 
         ['💡 یه نامه عاشقانه بنویس و فردا بده!', 
          '🎵 پلی‌لیست مشترک از آهنگ‌های خاطره‌انگیز بساز!'])
    ]
    
    for keywords, responses in rules:
        for kw in keywords:
            if kw in msg_lower:
                return random.choice(responses)
    
    defaults = [
        '🤖 سکتور در حال تحلیل... رابطه شما در مسیر درستی قرار داره!',
        '✨ بهترین هدیه، وقت گذروندن با هم هست.',
        '💫 امروز یه خاطره جدید بسازید!'
    ]
    return random.choice(defaults)

