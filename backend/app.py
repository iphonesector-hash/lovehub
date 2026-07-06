from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os
from datetime import datetime, date

from config import Config
from database import get_db, init_db
from auth import generate_token, require_auth
from sector_ai import query_sector

app = Flask(__name__, static_folder='..', static_url_path='')
CORS(app)

# ============================================================
# سرویس فایل‌های استاتیک (HTML, CSS, JS)
# ============================================================
@app.route('/')
def index():
    return send_from_directory('..', 'index.html')

@app.route('/app')
def app_page():
    return send_from_directory('..', 'app.html')

# ============================================================
# احراز هویت
# ============================================================
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')
    
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    
    db = get_db()
    user = db.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    db.close()
    
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # بروزرسانی آخرین ورود
    db = get_db()
    db.execute("UPDATE users SET last_login = ? WHERE id = ?", 
               (datetime.now().isoformat(), user['id']))
    db.commit()
    db.close()
    
    token = generate_token(user['id'])
    
    return jsonify({
        'success': True,
        'token': token,
        'user': {
            'id': user['id'],
            'username': user['username'],
            'display_name': user['display_name'],
            'nickname': user['nickname']
        }
    })

@app.route('/api/auth/me', methods=['GET'])
@require_auth
def get_me():
    db = get_db()
    user = db.execute("SELECT * FROM users WHERE id = ?", (request.user_id,)).fetchone()
    db.close()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'success': True,
        'user': dict(user)
    })

@app.route('/api/auth/change-password', methods=['POST'])
@require_auth
def change_password():
    data = request.get_json()
    old_pass = data.get('old_password', '')
    new_pass = data.get('new_password', '')
    
    if len(new_pass) < 4:
        return jsonify({'error': 'Password too short (min 4)'}), 400
    
    db = get_db()
    user = db.execute("SELECT password_hash FROM users WHERE id = ?", (request.user_id,)).fetchone()
    
    if not check_password_hash(user['password_hash'], old_pass):
        db.close()
        return jsonify({'error': 'Old password incorrect'}), 401
    
    new_hash = generate_password_hash(new_pass)
    db.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hash, request.user_id))
    db.commit()
    db.close()
    
    return jsonify({'success': True, 'message': 'Password changed'})

# ============================================================
# پروفایل
# ============================================================
@app.route('/api/profile', methods=['POST'])
@require_auth
def update_profile():
    data = request.get_json()
    allowed = ['display_name', 'nickname', 'birth_date', 'gender', 
               'height_cm', 'weight_kg', 'blood_type', 'phone', 
               'email', 'bio', 'love_language']
    
    updates = []
    values = []
    for field in allowed:
        if field in data:
            updates.append(f"{field} = ?")
            values.append(data[field])
    
    if not updates:
        return jsonify({'error': 'No fields to update'}), 400
    
    values.append(request.user_id)
    db = get_db()
    db.execute(f"UPDATE users SET {', '.join(updates)} WHERE id = ?", values)
    db.commit()
    
    user = db.execute("SELECT * FROM users WHERE id = ?", (request.user_id,)).fetchone()
    db.close()
    
    return jsonify({'success': True, 'user': dict(user)})

# ============================================================
# چت
# ============================================================
@app.route('/api/chat', methods=['GET'])
@require_auth
def get_chat():
    db = get_db()
    messages = db.execute('''
        SELECT cm.*, u.display_name, u.username 
        FROM chat_messages cm 
        JOIN users u ON cm.sender_id = u.id 
        ORDER BY cm.created_at DESC 
        LIMIT 100
    ''').fetchall()
    db.close()
    return jsonify({'messages': [dict(m) for m in reversed(messages)]})

@app.route('/api/chat', methods=['POST'])
@require_auth
def send_chat():
    data = request.get_json()
    msg = data.get('message', '').strip()
    if not msg:
        return jsonify({'error': 'Empty message'}), 400
    
    db = get_db()
    c = db.execute("INSERT INTO chat_messages (sender_id, message) VALUES (?, ?)",
                   (request.user_id, msg))
    db.commit()
    msg_id = c.lastrowid
    db.close()
    
    return jsonify({'success': True, 'id': msg_id})

# ============================================================
# آرزوها
# ============================================================
@app.route('/api/wishes', methods=['GET'])
@require_auth
def get_wishes():
    db = get_db()
    wishes = db.execute("SELECT * FROM wishes WHERE user_id = ? ORDER BY created_at DESC",
                       (request.user_id,)).fetchall()
    db.close()
    return jsonify({'wishes': [dict(w) for w in wishes]})

@app.route('/api/wishes', methods=['POST'])
@require_auth
def add_wish():
    data = request.get_json()
    text = data.get('text', '').strip()
    if not text:
        return jsonify({'error': 'Empty text'}), 400
    
    db = get_db()
    db.execute("INSERT INTO wishes (user_id, text) VALUES (?, ?)",
               (request.user_id, text))
    db.commit()
    db.close()
    return jsonify({'success': True})

@app.route('/api/wishes/<int:wish_id>/toggle', methods=['POST'])
@require_auth
def toggle_wish(wish_id):
    db = get_db()
    db.execute('''
        UPDATE wishes 
        SET is_completed = CASE WHEN is_completed = 1 THEN 0 ELSE 1 END,
            completed_at = CASE WHEN is_completed = 1 THEN NULL ELSE ? END
        WHERE id = ? AND user_id = ?
    ''', (datetime.now().isoformat(), wish_id, request.user_id))
    db.commit()
    db.close()
    return jsonify({'success': True})

# ============================================================
# تایم‌لاین
# ============================================================
@app.route('/api/timeline', methods=['GET'])
@require_auth
def get_timeline():
    db = get_db()
    events = db.execute("SELECT * FROM timeline_events WHERE user_id = ? ORDER BY event_date DESC",
                       (request.user_id,)).fetchall()
    db.close()
    return jsonify({'events': [dict(e) for e in events]})

@app.route('/api/timeline', methods=['POST'])
@require_auth
def add_timeline():
    data = request.get_json()
    db = get_db()
    db.execute("INSERT INTO timeline_events (user_id, event_date, title, description) VALUES (?, ?, ?, ?)",
               (request.user_id, data.get('date'), data.get('title'), data.get('description', '')))
    db.commit()
    db.close()
    return jsonify({'success': True})

# ============================================================
# کپسول زمان
# ============================================================
@app.route('/api/capsules', methods=['GET'])
@require_auth
def get_capsules():
    db = get_db()
    capsules = db.execute("SELECT * FROM capsules WHERE user_id = ? ORDER BY unlock_time ASC",
                         (request.user_id,)).fetchall()
    db.close()
    return jsonify({'capsules': [dict(c) for c in capsules]})

@app.route('/api/capsules', methods=['POST'])
@require_auth
def add_capsule():
    data = request.get_json()
    msg = data.get('message', '').strip()
    unlock = data.get('unlock_time', '')
    
    if not msg or not unlock:
        return jsonify({'error': 'Missing data'}), 400
    
    db = get_db()
    db.execute("INSERT INTO capsules (user_id, message, unlock_time) VALUES (?, ?, ?)",
               (request.user_id, msg, unlock))
    db.commit()
    db.close()
    return jsonify({'success': True})

# ============================================================
# خلق و خو
# ============================================================
@app.route('/api/mood', methods=['GET'])
@require_auth
def get_mood():
    db = get_db()
    moods = db.execute("SELECT * FROM mood_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 30",
                      (request.user_id,)).fetchall()
    db.close()
    return jsonify({'moods': [dict(m) for m in moods]})

@app.route('/api/mood', methods=['POST'])
@require_auth
def add_mood():
    data = request.get_json()
    db = get_db()
    db.execute("INSERT INTO mood_history (user_id, mood, emoji, note) VALUES (?, ?, ?, ?)",
               (request.user_id, data.get('mood'), data.get('emoji'), data.get('note', '')))
    db.commit()
    db.close()
    return jsonify({'success': True})

# ============================================================
# چرخه سلامت
# ============================================================
@app.route('/api/cycle', methods=['GET'])
@require_auth
def get_cycle():
    db = get_db()
    cycle = db.execute("SELECT * FROM cycle_data WHERE user_id = ?", (request.user_id,)).fetchone()
    db.close()
    return jsonify({'cycle': dict(cycle) if cycle else None})

@app.route('/api/cycle', methods=['POST'])
@require_auth
def update_cycle():
    data = request.get_json()
    db = get_db()
    db.execute('''
        INSERT INTO cycle_data (user_id, last_period, cycle_length) 
        VALUES (?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET 
            last_period = excluded.last_period,
            cycle_length = excluded.cycle_length,
            updated_at = CURRENT_TIMESTAMP
    ''', (request.user_id, data.get('last_period'), data.get('cycle_length', 28)))
    db.commit()
    db.close()
    return jsonify({'success': True})

# ============================================================
# آمار بازی
# ============================================================
@app.route('/api/game-stats', methods=['GET'])
@require_auth
def get_game_stats():
    db = get_db()
    stats = db.execute("SELECT * FROM game_stats WHERE user_id = ?", (request.user_id,)).fetchall()
    db.close()
    return jsonify({'stats': [dict(s) for s in stats]})

@app.route('/api/game-stats', methods=['POST'])
@require_auth
def update_game_stats():
    data = request.get_json()
    game = data.get('game')
    result = data.get('result')  # win, loss, draw
    
    if result not in ['win', 'loss', 'draw']:
        return jsonify({'error': 'Invalid result'}), 400
    
    field = 'wins' if result == 'win' else ('losses' if result == 'loss' else 'draws')
    
    db = get_db()
    db.execute(f'''
        INSERT INTO game_stats (user_id, game_type, {field}) 
        VALUES (?, ?, 1)
        ON CONFLICT(user_id, game_type) DO UPDATE SET {field} = {field} + 1
    ''', (request.user_id, game))
    db.commit()
    db.close()
    return jsonify({'success': True})

# ============================================================
# مدیتیشن
# ============================================================
@app.route('/api/meditation', methods=['GET'])
@require_auth
def get_meditation():
    db = get_db()
    stats = db.execute("SELECT * FROM meditation_stats WHERE user_id = ?", (request.user_id,)).fetchone()
    db.close()
    return jsonify({'stats': dict(stats) if stats else {'sessions': 0, 'total_minutes': 0, 'streak': 0}})

@app.route('/api/meditation', methods=['POST'])
@require_auth
def complete_meditation():
    data = request.get_json()
    minutes = int(data.get('minutes', 0))
    today = date.today().isoformat()
    yesterday = (date.today() - __import__('datetime').timedelta(days=1)).isoformat()
    
    db = get_db()
    stats = db.execute("SELECT * FROM meditation_stats WHERE user_id = ?", (request.user_id,)).fetchone()
    
    if not stats:
        db.execute("INSERT INTO meditation_stats (user_id, sessions, total_minutes, streak, last_date) VALUES (?, 1, ?, 1, ?)",
                  (request.user_id, minutes, today))
    else:
        new_streak = stats['streak'] + 1 if stats['last_date'] == yesterday else 1
        db.execute('''UPDATE meditation_stats 
                     SET sessions = sessions + 1, total_minutes = total_minutes + ?, 
                         streak = ?, last_date = ? WHERE user_id = ?''',
                  (minutes, new_streak, today, request.user_id))
    
    db.commit()
    db.close()
    return jsonify({'success': True})

# ============================================================
# لمس
# ============================================================
@app.route('/api/touch', methods=['GET'])
@require_auth
def get_touch():
    db = get_db()
    stats = db.execute("SELECT * FROM touch_stats WHERE user_id = ?", (request.user_id,)).fetchone()
    db.close()
    return jsonify({'stats': dict(stats) if stats else {'touch_count': 0, 'total_seconds': 0}})

@app.route('/api/touch', methods=['POST'])
@require_auth
def update_touch():
    data = request.get_json()
    seconds = int(data.get('seconds', 0))
    
    db = get_db()
    db.execute('''
        INSERT INTO touch_stats (user_id, touch_count, total_seconds) 
        VALUES (?, 1, ?)
        ON CONFLICT(user_id) DO UPDATE SET 
            touch_count = touch_count + 1, 
            total_seconds = total_seconds + ?
    ''', (request.user_id, seconds, seconds))
    db.commit()
    db.close()
    return jsonify({'success': True})

# ============================================================
# سکتور AI
# ============================================================
@app.route('/api/sector', methods=['POST'])
@require_auth
def sector_query():
    data = request.get_json()
    message = data.get('message', '').strip()
    
    if not message:
        return jsonify({'error': 'Empty message'}), 400
    
    # دریافت context کاربر
    db = get_db()
    user = db.execute("SELECT display_name, bio, love_language FROM users WHERE id = ?", 
                     (request.user_id,)).fetchone()
    
    # دریافت نام پارتنر
    partner = db.execute("SELECT display_name FROM users WHERE id != ? LIMIT 1", 
                        (request.user_id,)).fetchone()
    db.close()
    
    context = f"نام کاربر: {user['display_name']}"
    if partner:
        context += f"، نام پارتنر: {partner['display_name']}"
    
    result = query_sector(message, context)
    return jsonify(result)

# ============================================================
# خاطرات
# ============================================================
@app.route('/api/memories', methods=['GET'])
@require_auth
def get_memories():
    db = get_db()
    memories = db.execute("SELECT * FROM memories WHERE user_id = ? ORDER BY created_at DESC",
                         (request.user_id,)).fetchall()
    db.close()
    return jsonify({'memories': [dict(m) for m in memories]})

@app.route('/api/memories', methods=['POST'])
@require_auth
def add_memory():
    data = request.get_json()
    db = get_db()
    db.execute("INSERT INTO memories (user_id, type, data, caption) VALUES (?, ?, ?, ?)",
               (request.user_id, data.get('type', 'text'), data.get('data', ''), data.get('caption', '')))
    db.commit()
    db.close()
    return jsonify({'success': True})

# ============================================================
# تست زبان عشق
# ============================================================
@app.route('/api/love-test', methods=['POST'])
@require_auth
def save_love_test():
    data = request.get_json()
    db = get_db()
    db.execute("INSERT INTO love_test_results (user_id, result_type) VALUES (?, ?)",
               (request.user_id, data.get('result_type')))
    db.execute("UPDATE users SET love_language = ? WHERE id = ?",
               (data.get('result_type'), request.user_id))
    db.commit()
    db.close()
    return jsonify({'success': True})

# ============================================================
# اجرای برنامه
# ============================================================
if __name__ == '__main__':
    init_db()
    app.run(host='127.0.0.1', port=5000, debug=False)

