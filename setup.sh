#!/bin/bash
set -e

echo "🚀 LoveHub Setup Script"
echo "========================"

# رنگ‌ها
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 1. ساخت venv
echo -e "${YELLOW}[1/6] Creating Python virtual environment...${NC}"
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate

# 2. نصب dependencies
echo -e "${YELLOW}[2/6] Installing Python dependencies...${NC}"
pip install --upgrade pip
pip install -r backend/requirements.txt

# 3. ساخت پوشه data
echo -e "${YELLOW}[3/6] Creating data directory...${NC}"
mkdir -p data
chmod 755 data

# 4. مقداردهی اولیه دیتابیس
echo -e "${YELLOW}[4/6] Initializing database...${NC}"
cd backend
python database.py
cd ..

# 5. ساخت سرویس systemd
echo -e "${YELLOW}[5/6] Creating systemd service...${NC}"
SERVICE_FILE="/etc/systemd/system/lovehub.service"
sudo tee $SERVICE_FILE > /dev/null <<EOF
[Unit]
Description=LoveHub Flask Application
After=network.target

[Service]
User=$USER
WorkingDirectory=$PROJECT_DIR/backend
Environment="PATH=$PROJECT_DIR/venv/bin"
ExecStart=$PROJECT_DIR/venv/bin/gunicorn -w 2 -b 127.0.0.1:5000 --timeout 120 app:app
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# 6. تنظیم Nginx
echo -e "${YELLOW}[6/6] Configuring Nginx...${NC}"
NGINX_CONF="/etc/nginx/sites-available/lovehub"
sudo tee $NGINX_CONF > /dev/null <<EOF
server {
    listen 80;
    server_name _;
    
    root $PROJECT_DIR;
    index index.html;
    
    location /css/ {
        alias $PROJECT_DIR/css/;
        expires 1w;
    }
    
    location /js/ {
        alias $PROJECT_DIR/js/;
        expires 1w;
    }
    
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_read_timeout 120s;
    }
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location = /app {
        try_files /app.html =404;
    }
}
EOF

sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 7. فعال‌سازی سرویس
echo -e "${YELLOW}[7/7] Starting LoveHub service...${NC}"
sudo systemctl daemon-reload
sudo systemctl enable lovehub
sudo systemctl restart lovehub

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "🌐 Access LoveHub at: http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_SERVER_IP')"
echo ""
echo "📋 Default credentials:"
echo "   Username: pourya / sarina"
echo "   Password: 12345"
echo ""
echo "🔧 Useful commands:"
echo "   sudo systemctl status lovehub"
echo "   sudo journalctl -u lovehub -f"
echo "   sudo systemctl restart lovehub"
# ============================================================
# HTML FILES
# ============================================================

cat > index.html << 'HTMLEOF'
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>LOVEHUB // ACCESS TERMINAL</title>
    <link rel="stylesheet" href="css/cyber.css">
</head>
<body class="login-body">
    <canvas id="matrix"></canvas>
    <div class="boot-sequence"><div id="boot-log"></div></div>
    <div class="login-container" id="login-container" style="display:none;">
        <div class="terminal-window">
            <div class="terminal-header">
                <div class="terminal-dots">
                    <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
                </div>
                <div class="terminal-title">root@lovehub:~$ secure_login</div>
            </div>
            <div class="terminal-body">
                <div class="ascii-logo">
<pre>
██╗      ██████╗  ██████╗ ███████╗██╗  ██╗
██║     ██╔═══██╗██╔════╝ ██╔════╝██║  ██║
██║     ██║   ██║██║  ███╗█████╗  ███████║
██║     ██║   ██║██║   ██║██╔══╝  ██╔══██║
███████╗╚██████╔╝╚██████╔╝███████╗██║  ██║
╚══════╝ ╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝
        <span class="glitch">[ SECURE ACCESS v2.0 ]</span>
</pre>
                </div>
                <div class="system-info">
                    <div>> SYSTEM STATUS: <span class="online">ONLINE</span></div>
                    <div>> ENCRYPTION: <span class="cyan">AES-256</span></div>
                    <div>> CONNECTION: <span class="green">SECURED</span></div>
                    <div>> TIME: <span id="live-time"></span></div>
                </div>
                <form id="login-form" autocomplete="off">
                    <div class="input-group">
                        <label>> ENTER_USERNAME:</label>
                        <div class="input-wrapper">
                            <span class="prompt">$</span>
                            <input type="text" id="username" required placeholder="pourya / sarina">
                            <span class="cursor">▊</span>
                        </div>
                    </div>
                    <div class="input-group">
                        <label>> ENTER_PASSWORD:</label>
                        <div class="input-wrapper">
                            <span class="prompt">$</span>
                            <input type="password" id="password" required placeholder="•••••">
                            <span class="cursor">▊</span>
                        </div>
                    </div>
                    <div id="login-error" class="error-msg" style="display:none;">
                        <span class="blink">⚠ ACCESS DENIED</span>
                    </div>
                    <button type="submit" class="cyber-btn"><span class="btn-text">[ AUTHENTICATE ]</span></button>
                </form>
                <div class="footer-info">
                    <div class="scan-line"></div>
                    <div>> AUTHORIZED: <span class="pink">POURYA</span>, <span class="cyan">SARINA</span></div>
                    <div>> DEFAULT: <span class="warn">12345</span></div>
                </div>
            </div>
        </div>
    </div>
    <script src="js/api.js"></script>
    <script src="js/auth.js"></script>
    <script src="js/matrix.js"></script>
</body>
</html>
HTMLEOF

cat > app.html << 'HTMLEOF'
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>LOVEHUB // MAIN TERMINAL</title>
    <link rel="stylesheet" href="css/cyber.css">
    <link rel="stylesheet" href="css/app.css">
</head>
<body>
    <canvas id="matrix"></canvas>
    <header class="cyber-header">
        <div class="header-left">
            <div class="logo-mini"><span class="glitch-small">LH</span></div>
            <div class="user-info">
                <div class="user-name" id="user-name">LOADING...</div>
                <div class="user-status"><span class="status-dot"></span><span>SECURE SESSION</span></div>
            </div>
        </div>
        <div class="header-right">
            <button class="icon-btn" onclick="App.openProfile()">⚙</button>
            <button class="icon-btn" onclick="App.logout()">⏻</button>
        </div>
    </header>

    <div class="main-container">
        <div id="view-dashboard" class="view active">
            <div class="dashboard-grid">
                <div class="stat-card pink"><div class="stat-label">LOVE_DURATION</div><div class="stat-value" id="love-counter">00:00:00</div><div class="stat-sub">DAYS:HH:MM</div></div>
                <div class="stat-card cyan"><div class="stat-label">PARTNER</div><div class="stat-value" id="partner-status">ONLINE</div><div class="stat-sub">CONNECTED</div></div>
                <div class="stat-card green"><div class="stat-label">MESSAGES</div><div class="stat-value" id="msg-count">0</div><div class="stat-sub">TODAY</div></div>
                <div class="stat-card purple"><div class="stat-label">MOOD</div><div class="stat-value" id="mood-index">😊</div><div class="stat-sub">CURRENT</div></div>
            </div>
            <div class="quick-actions">
                <div class="section-title">> QUICK_ACCESS</div>
                <div class="action-grid">
                    <button class="action-tile" onclick="App.switchTab('chat')"><span class="tile-icon">💬</span><span>CHAT</span></button>
                    <button class="action-tile" onclick="App.switchTab('games')"><span class="tile-icon">🎮</span><span>GAMES</span></button>
                    <button class="action-tile" onclick="App.switchTab('touch')"><span class="tile-icon">💓</span><span>TOUCH</span></button>
                    <button class="action-tile" onclick="App.switchTab('sector')"><span class="tile-icon">🔮</span><span>SECTOR</span></button>
                </div>
            </div>
        </div>

        <div id="view-chat" class="view">
            <div class="chat-header"><div class="encrypted-badge">🔒 E2E_ENCRYPTED</div></div>
            <div class="chat-stream" id="chat-box"></div>
            <div class="chat-input-area">
                <input type="text" class="cyber-input" id="chat-input" placeholder="$ type_message..." onkeypress="if(event.key==='Enter')Chat.send()">
                <button class="send-btn" onclick="Chat.send()">⏎</button>
            </div>
        </div>

        <div id="view-sector" class="view">
            <div class="sector-header">
                <div class="sector-eye" id="sec-eye"><div class="sector-pupil"></div></div>
                <div class="sector-info"><div class="sector-name">SECTOR AI</div><div class="sector-version">v2.0 // ONLINE</div></div>
            </div>
            <div class="chat-stream" id="sector-stream"></div>
            <div class="chat-input-area">
                <input type="text" class="cyber-input" id="sec-input" placeholder="$ query_sector..." onkeypress="if(event.key==='Enter')Sector.ask()">
                <button class="send-btn cyan" onclick="Sector.ask()">⏎</button>
            </div>
        </div>

        <div id="view-touch" class="view">
            <div class="touch-container">
                <div class="touch-title">> HAPTIC_LINK</div>
                <div class="cyber-heart" id="h-heart" onmousedown="Touch.start()" onmouseup="Touch.stop()" ontouchstart="Touch.start()" ontouchend="Touch.stop()">
                    <div class="heart-core"></div>
                    <div class="heart-ring"></div>
                    <div class="heart-ring ring-2"></div>
                </div>
                <svg class="ecg-svg" viewBox="0 0 100 40"><path class="ecg-path" d="M0,20 L35,20 L38,10 L42,30 L45,4 L49,34 L53,20 L100,20"/></svg>
                <div class="bpm-display"><span class="bpm-label">BPM:</span><span class="bpm-value" id="bpm-value">72</span></div>
                <div class="touch-stats" id="touch-stats"></div>
            </div>
        </div>

        <div id="view-games" class="view">
            <div class="section-title">> GAME_CENTER</div>
            <div class="games-grid">
                <div class="game-card" onclick="Games.open('tod')"><div class="game-icon">🃏</div><div class="game-name">TRUTH_DARE</div><div class="game-desc">50+ questions</div></div>
                <div class="game-card" onclick="Games.open('tictactoe')"><div class="game-icon">⭕</div><div class="game-name">TIC_TAC_TOE</div><div class="game-desc">classic</div></div>
                <div class="game-card" onclick="Games.open('memory')"><div class="game-icon">🧠</div><div class="game-name">MEMORY</div><div class="game-desc">find_pairs</div></div>
                <div class="game-card" onclick="Games.open('rps')"><div class="game-icon">✊</div><div class="game-name">RPS</div><div class="game-desc">rock_paper_scissors</div></div>
                <div class="game-card" onclick="Games.open('reaction')"><div class="game-icon">⚡</div><div class="game-name">REFLEX</div><div class="game-desc">reaction_time</div></div>
                <div class="game-card" onclick="Games.open('guess')"><div class="game-icon">🎯</div><div class="game-name">GUESS_NUM</div><div class="game-desc">1-100</div></div>
                <div class="game-card" onclick="Games.open('dice')"><div class="game-icon">🎲</div><div class="game-name">DICE</div><div class="game-desc">lucky_roll</div></div>
                <div class="game-card" onclick="Games.open('2048')"><div class="game-icon">🔢</div><div class="game-name">2048</div><div class="game-desc">merge_tiles</div></div>
            </div>
            <div class="game-stats-panel">
                <div class="section-title">> PLAYER_STATS</div>
                <div id="game-stats-content"></div>
            </div>
        </div>

        <div id="view-memories" class="view">
            <div class="section-title">> MEMORY_ARCHIVE</div>
            <div class="memories-grid" id="media-grid"></div>
            <button class="cyber-btn" onclick="Memories.add()">+ ADD_MEMORY</button>
            <div class="section-title" style="margin-top:20px;">> DRAWING_PAD</div>
            <div class="canvas-area"><canvas id="paintCanvas"></canvas></div>
            <div class="canvas-controls">
                <button class="cyber-btn small" onclick="Memories.clearCanvas()">CLEAR</button>
                <button class="cyber-btn small cyan" onclick="Memories.saveCanvas()">SAVE</button>
            </div>
        </div>

        <div id="view-health" class="view">
            <div class="health-card">
                <div class="health-title">ROSE_CYCLE_TRACKER</div>
                <div class="rose-icon">🌹</div>
                <div class="health-value" id="days-until">--</div>
                <div class="health-phase" id="current-phase">LOADING...</div>
                <button class="cyber-btn small" onclick="Health.updateCycle()">UPDATE</button>
            </div>
            <div class="health-suggestion" id="sector-suggestion"></div>
            <div class="section-title" style="margin-top:20px;">> BODY_METRICS</div>
            <div class="metrics-grid" id="body-metrics"></div>
        </div>

        <div id="view-capsule" class="view">
            <div class="section-title">> TIME_CAPSULE</div>
            <div class="capsule-main">
                <div class="capsule-icon">💝</div>
                <div id="capsule-status"></div>
                <div class="progress-bar"><div class="progress-fill" id="capsule-progress"></div></div>
            </div>
            <div class="capsule-form">
                <textarea class="cyber-input" id="capsule-message" placeholder="$ write_to_future..."></textarea>
                <input type="date" class="cyber-input" id="capsule-date">
                <button class="cyber-btn" onclick="Capsule.save()">SEAL_CAPSULE</button>
            </div>
            <div id="capsule-list"></div>
        </div>

        <div id="view-wishes" class="view">
            <div class="section-title">> BUCKET_LIST</div>
            <div id="wishes-list"></div>
            <div class="wish-form">
                <input type="text" class="cyber-input" id="new-wish" placeholder="$ new_wish...">
                <button class="cyber-btn" onclick="Wishes.add()">+ ADD</button>
            </div>
            <div class="wishes-progress" id="wishes-stats"></div>
        </div>

        <div id="view-timeline" class="view">
            <div class="section-title">> TIMELINE_LOG</div>
            <div id="timeline-list"></div>
            <button class="cyber-btn" onclick="Timeline.add()">+ ADD_EVENT</button>
        </div>

        <div id="view-mood" class="view">
            <div class="section-title">> MOOD_TRACKER</div>
            <div class="mood-grid">
                <div class="mood-btn" onclick="Mood.select(this,'عالی','😍')">😍</div>
                <div class="mood-btn" onclick="Mood.select(this,'خوب','😊')">😊</div>
                <div class="mood-btn" onclick="Mood.select(this,'معمولی','😐')">😐</div>
                <div class="mood-btn" onclick="Mood.select(this,'ناراحت','😔')">😔</div>
                <div class="mood-btn" onclick="Mood.select(this,'عصبانی','😠')">😠</div>
            </div>
            <div class="mood-stats" id="mood-stats"></div>
            <div class="mood-suggestion" id="mood-suggestion" style="display:none;"></div>
        </div>

        <div id="view-lovetest" class="view">
            <div class="section-title">> LOVE_LANGUAGE_TEST</div>
            <div class="test-card">
                <div id="test-question"></div>
                <div id="test-options"></div>
                <div class="progress-bar"><div class="progress-fill" id="test-progress"></div></div>
                <div id="test-counter"></div>
            </div>
            <div id="test-result" style="display:none;"></div>
        </div>

        <div id="view-meditation" class="view">
            <div class="section-title">> MEDITATION_MODULE</div>
            <div class="meditation-circle" id="meditation-circle">🌊</div>
            <div class="meditation-status" id="meditation-status">READY</div>
            <div class="meditation-timer" id="meditation-timer">05:00</div>
            <div class="meditation-controls">
                <button class="cyber-btn small" onclick="Meditation.start(5)">5 MIN</button>
                <button class="cyber-btn small cyan" onclick="Meditation.start(10)">10 MIN</button>
                <button class="cyber-btn small pink" onclick="Meditation.start(15)">15 MIN</button>
                <button class="cyber-btn small" onclick="Meditation.stop()">STOP</button>
            </div>
            <div class="meditation-stats" id="meditation-stats"></div>
        </div>
    </div>

    <div class="modal" id="profile-modal">
        <div class="modal-content">
            <div class="modal-header">
                <div class="section-title">> USER_PROFILE</div>
                <button class="close-btn" onclick="App.closeProfile()">×</button>
            </div>
            <div class="modal-body" id="profile-body"></div>
        </div>
    </div>

    <div class="game-overlay" id="game-overlay">
        <div class="game-header">
            <div id="game-title"></div>
            <button class="close-btn" onclick="Games.close()">×</button>
        </div>
        <div id="game-content"></div>
        <div id="game-score"></div>
    </div>

    <div class="game-overlay" id="tod-overlay">
        <div class="game-header">
            <div>FORTUNE_SPINNER</div>
            <button class="close-btn" onclick="TruthDare.close()">×</button>
        </div>
        <div class="bottle-circle">
            <div class="lbl-p lbl-top">POURYA 💙</div>
            <div class="bottle-element" id="btl-obj" onclick="TruthDare.spin()"></div>
            <div class="lbl-p lbl-bottom">SARINA 💖</div>
        </div>
        <div id="tod-txt">CLICK_BOTTLE_TO_SPIN</div>
        <div id="tod-question"></div>
        <div class="tod-controls">
            <button class="cyber-btn small" onclick="TruthDare.close()">EXIT</button>
            <button class="cyber-btn small cyan" onclick="TruthDare.next()">NEXT_Q</button>
        </div>
    </div>

    <nav class="cyber-tabbar">
        <div class="tab-item active" onclick="App.switchTab('dashboard')"><span class="tab-icon">⌂</span><span>HOME</span></div>
        <div class="tab-item" onclick="App.switchTab('chat')"><span class="tab-icon">💬</span><span>CHAT</span></div>
        <div class="tab-item" onclick="App.switchTab('sector')"><span class="tab-icon">🔮</span><span>AI</span></div>
        <div class="tab-item" onclick="App.switchTab('games')"><span class="tab-icon">🎮</span><span>PLAY</span></div>
        <div class="tab-item" onclick="App.switchTab('memories')"><span class="tab-icon">📸</span><span>MEM</span></div>
    </nav>
    <nav class="cyber-tabbar secondary">
        <div class="tab-item" onclick="App.switchTab('touch')"><span class="tab-icon">💓</span><span>TOUCH</span></div>
        <div class="tab-item" onclick="App.switchTab('health')"><span class="tab-icon">🌹</span><span>HEALTH</span></div>
        <div class="tab-item" onclick="App.switchTab('capsule')"><span class="tab-icon">⏰</span><span>CAPSULE</span></div>
        <div class="tab-item" onclick="App.switchTab('wishes')"><span class="tab-icon">🌟</span><span>WISHES</span></div>
        <div class="tab-item" onclick="App.switchTab('mood')"><span class="tab-icon">😊</span><span>MOOD</span></div>
    </nav>

    <script src="js/api.js"></script>
    <script src="js/matrix.js"></script>
    <script src="js/app.js"></script>
    <script src="js/profile.js"></script>
    <script src="js/chat.js"></script>
    <script src="js/sector.js"></script>
    <script src="js/touch.js"></script>
    <script src="js/games.js"></script>
    <script src="js/memories.js"></script>
    <script src="js/health.js"></script>
    <script src="js/capsule.js"></script>
    <script src="js/wishes.js"></script>
    <script src="js/timeline.js"></script>
    <script src="js/mood.js"></script>
    <script src="js/meditation.js"></script>
    <script src="js/lovetest.js"></script>
</body>
</html>
HTMLEOF

echo "✅ HTML files created"

# ============================================================
# CSS FILES
# ============================================================

cat > css/cyber.css << 'CSSEOF'
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');

:root {
    --cyber-black: #000000;
    --cyber-dark: #0a0e14;
    --cyber-green: #00ff41;
    --cyber-cyan: #00d4ff;
    --cyber-pink: #ff006e;
    --cyber-red: #ff003c;
    --cyber-yellow: #ffd700;
    --cyber-purple: #bc13fe;
    --cyber-gray: #1a1f2e;
    --cyber-border: rgba(0, 255, 65, 0.3);
    --font-mono: 'Fira Code', 'Share Tech Mono', 'Courier New', monospace;
}

* { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

body {
    font-family: var(--font-mono);
    background: var(--cyber-black);
    color: var(--cyber-green);
    overflow: hidden;
    min-height: 100vh;
    position: relative;
}

body::before {
    content: '';
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: repeating-linear-gradient(0deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px);
    pointer-events: none;
    z-index: 9999;
}

body::after {
    content: '';
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0, 255, 65, 0.02);
    pointer-events: none;
    z-index: 9998;
    animation: flicker 0.15s infinite;
}

@keyframes flicker { 0% { opacity: 0.2; } 50% { opacity: 0.3; } 100% { opacity: 0.2; } }

.boot-sequence {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: var(--cyber-black);
    padding: 20px;
    font-size: 0.8rem;
    color: var(--cyber-green);
    z-index: 100;
    overflow: hidden;
    transition: opacity 0.5s;
}

.boot-sequence.hide { opacity: 0; pointer-events: none; }

#boot-log div { margin: 2px 0; opacity: 0; animation: typeLine 0.3s forwards; }

@keyframes typeLine { to { opacity: 1; } }

.login-body { display: flex; align-items: center; justify-content: center; padding: 20px; }

.login-container { width: 100%; max-width: 500px; z-index: 10; }

.terminal-window {
    background: rgba(10, 14, 20, 0.95);
    border: 1px solid var(--cyber-green);
    border-radius: 8px;
    box-shadow: 0 0 30px rgba(0, 255, 65, 0.3), inset 0 0 30px rgba(0, 255, 65, 0.05);
    overflow: hidden;
    backdrop-filter: blur(10px);
}

.terminal-header {
    background: linear-gradient(90deg, rgba(0, 255, 65, 0.1), transparent);
    padding: 10px 15px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid var(--cyber-border);
}

.terminal-dots { display: flex; gap: 6px; }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot.red { background: var(--cyber-red); box-shadow: 0 0 8px var(--cyber-red); }
.dot.yellow { background: var(--cyber-yellow); box-shadow: 0 0 8px var(--cyber-yellow); }
.dot.green { background: var(--cyber-green); box-shadow: 0 0 8px var(--cyber-green); }

.terminal-title { font-size: 0.75rem; color: var(--cyber-cyan); flex: 1; }

.terminal-body { padding: 20px; }

.ascii-logo {
    text-align: center;
    font-size: 0.45rem;
    line-height: 1.1;
    color: var(--cyber-green);
    margin-bottom: 20px;
    text-shadow: 0 0 10px var(--cyber-green);
    overflow-x: auto;
}

.ascii-logo .glitch {
    display: block;
    color: var(--cyber-pink);
    font-size: 0.7rem;
    margin-top: 10px;
    text-shadow: 0 0 10px var(--cyber-pink);
    animation: glitch 3s infinite;
}

@keyframes glitch {
    0%, 90%, 100% { transform: translate(0); }
    92% { transform: translate(-2px, 1px); }
    94% { transform: translate(2px, -1px); }
    96% { transform: translate(-1px, -1px); }
    98% { transform: translate(1px, 1px); }
}

.system-info {
    background: rgba(0, 255, 65, 0.05);
    border: 1px dashed var(--cyber-border);
    padding: 10px;
    margin-bottom: 20px;
    font-size: 0.75rem;
    line-height: 1.8;
}

.system-info .online { color: var(--cyber-green); }
.system-info .cyan { color: var(--cyber-cyan); }
.system-info .green { color: var(--cyber-green); }

.input-group { margin-bottom: 15px; }
.input-group label { display: block; font-size: 0.75rem; color: var(--cyber-cyan); margin-bottom: 5px; }

.input-wrapper {
    display: flex;
    align-items: center;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid var(--cyber-border);
    border-radius: 4px;
    padding: 8px 12px;
    transition: all 0.3s;
}

.input-wrapper:focus-within { border-color: var(--cyber-green); box-shadow: 0 0 15px rgba(0, 255, 65, 0.3); }

.prompt { color: var(--cyber-pink); margin-left: 8px; font-weight: bold; }

.input-wrapper input {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--cyber-green);
    font-family: var(--font-mono);
    font-size: 0.9rem;
    outline: none;
    caret-color: transparent;
}

.cursor { color: var(--cyber-green); animation: blink 1s infinite; }

@keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }

.error-msg {
    background: rgba(255, 0, 60, 0.1);
    border: 1px solid var(--cyber-red);
    color: var(--cyber-red);
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 15px;
    font-size: 0.8rem;
    text-align: center;
}

.blink { animation: blink 1s infinite; }

.cyber-btn {
    width: 100%;
    background: transparent;
    border: 2px solid var(--cyber-green);
    color: var(--cyber-green);
    padding: 12px;
    font-family: var(--font-mono);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;
    text-transform: uppercase;
    letter-spacing: 2px;
    border-radius: 6px;
}

.cyber-btn:hover { background: var(--cyber-green); color: var(--cyber-black); box-shadow: 0 0 30px var(--cyber-green); }
.cyber-btn:active { transform: scale(0.98); }

.cyber-btn.small { padding: 6px 12px; font-size: 0.75rem; width: auto; }
.cyber-btn.cyan { border-color: var(--cyber-cyan); color: var(--cyber-cyan); }
.cyber-btn.cyan:hover { background: var(--cyber-cyan); color: var(--cyber-black); box-shadow: 0 0 30px var(--cyber-cyan); }
.cyber-btn.pink { border-color: var(--cyber-pink); color: var(--cyber-pink); }
.cyber-btn.pink:hover { background: var(--cyber-pink); color: var(--cyber-black); box-shadow: 0 0 30px var(--cyber-pink); }

.footer-info { margin-top: 20px; font-size: 0.7rem; color: var(--cyber-cyan); line-height: 1.8; position: relative; }
.footer-info .pink { color: var(--cyber-pink); }
.footer-info .warn { color: var(--cyber-yellow); }

.scan-line {
    position: absolute;
    top: 0; left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--cyber-green), transparent);
    animation: scan 3s linear infinite;
}

@keyframes scan { 0% { top: 0; } 100% { top: 100%; } }

@media (max-width: 480px) {
    .ascii-logo { font-size: 0.3rem; }
    .ascii-logo .glitch { font-size: 0.55rem; }
}

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--cyber-green); border-radius: 2px; }
CSSEOF

cat > css/app.css << 'CSSEOF'
body { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

#matrix { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; opacity: 0.15; }
.login-body #matrix { opacity: 0.25; }

.cyber-header {
    background: rgba(10, 14, 20, 0.95);
    backdrop-filter: blur(10px);
    padding: calc(10px + env(safe-area-inset-top)) 15px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--cyber-border);
    z-index: 10;
}

.header-left { display: flex; align-items: center; gap: 12px; }

.logo-mini {
    width: 40px; height: 40px;
    background: linear-gradient(135deg, var(--cyber-pink), var(--cyber-cyan));
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; color: var(--cyber-black);
    box-shadow: 0 0 15px rgba(255, 0, 110, 0.4);
}

.glitch-small { animation: glitch 3s infinite; }

.user-info { display: flex; flex-direction: column; }
.user-name { font-size: 0.9rem; font-weight: 700; color: var(--cyber-green); text-shadow: 0 0 8px var(--cyber-green); }
.user-status { font-size: 0.65rem; color: var(--cyber-cyan); display: flex; align-items: center; gap: 5px; }

.status-dot {
    width: 6px; height: 6px;
    background: var(--cyber-green);
    border-radius: 50%;
    box-shadow: 0 0 8px var(--cyber-green);
    animation: pulse 2s infinite;
}

@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

.header-right { display: flex; gap: 8px; }

.icon-btn {
    width: 36px; height: 36px;
    background: rgba(0, 255, 65, 0.1);
    border: 1px solid var(--cyber-border);
    border-radius: 8px;
    color: var(--cyber-green);
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s;
}

.icon-btn:hover { background: var(--cyber-green); color: var(--cyber-black); box-shadow: 0 0 15px var(--cyber-green); }

.main-container { flex: 1; overflow-y: auto; position: relative; z-index: 5; padding-bottom: 10px; }

.view { display: none; padding: 15px; animation: viewIn 0.3s ease; }
.view.active { display: block; }

@keyframes viewIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.dashboard-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; }

.stat-card {
    background: rgba(10, 14, 20, 0.8);
    border: 1px solid var(--cyber-border);
    border-radius: 10px;
    padding: 15px;
    position: relative;
    overflow: hidden;
}

.stat-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px; }
.stat-card.pink::before { background: var(--cyber-pink); box-shadow: 0 0 10px var(--cyber-pink); }
.stat-card.cyan::before { background: var(--cyber-cyan); box-shadow: 0 0 10px var(--cyber-cyan); }
.stat-card.green::before { background: var(--cyber-green); box-shadow: 0 0 10px var(--cyber-green); }
.stat-card.purple::before { background: var(--cyber-purple); box-shadow: 0 0 10px var(--cyber-purple); }

.stat-label { font-size: 0.65rem; color: var(--cyber-cyan); margin-bottom: 8px; letter-spacing: 1px; }
.stat-value { font-size: 1.4rem; font-weight: 900; color: var(--cyber-green); text-shadow: 0 0 10px var(--cyber-green); margin-bottom: 5px; word-break: break-word; }
.stat-sub { font-size: 0.6rem; color: #666; }

.section-title { font-size: 0.8rem; color: var(--cyber-cyan); margin: 15px 0 10px; padding: 8px; background: rgba(0, 212, 255, 0.05); border-left: 3px solid var(--cyber-cyan); letter-spacing: 1px; }

.action-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }

.action-tile {
    background: rgba(10, 14, 20, 0.8);
    border: 1px solid var(--cyber-border);
    border-radius: 10px;
    padding: 12px 8px;
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    color: var(--cyber-green);
    font-family: var(--font-mono);
    font-size: 0.65rem;
    cursor: pointer;
    transition: all 0.3s;
}

.action-tile:hover { border-color: var(--cyber-green); box-shadow: 0 0 15px rgba(0, 255, 65, 0.3); transform: translateY(-2px); }
.tile-icon { font-size: 1.5rem; }

.chat-header { padding: 10px; text-align: center; }
.encrypted-badge { display: inline-block; font-size: 0.7rem; color: var(--cyber-green); background: rgba(0, 255, 65, 0.1); border: 1px dashed var(--cyber-green); padding: 4px 12px; border-radius: 20px; }

.chat-stream { padding: 15px; display: flex; flex-direction: column; gap: 10px; min-height: 300px; max-height: calc(100vh - 280px); overflow-y: auto; }

.chat-bubble { max-width: 80%; padding: 10px 14px; border-radius: 8px; font-size: 0.85rem; line-height: 1.5; animation: bubbleIn 0.3s ease; word-wrap: break-word; }

@keyframes bubbleIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.msg-me { align-self: flex-end; background: linear-gradient(135deg, var(--cyber-pink), var(--cyber-purple)); color: white; border: 1px solid var(--cyber-pink); box-shadow: 0 0 15px rgba(255, 0, 110, 0.3); border-bottom-left-radius: 2px; }
.msg-partner { align-self: flex-start; background: rgba(10, 14, 20, 0.9); color: var(--cyber-green); border: 1px solid var(--cyber-border); border-bottom-right-radius: 2px; }
.msg-sector { align-self: flex-start; background: rgba(0, 212, 255, 0.1); color: var(--cyber-cyan); border: 1px solid var(--cyber-cyan); border-bottom-right-radius: 2px; }

.chat-input-area { padding: 10px 15px calc(10px + env(safe-area-inset-bottom)); display: flex; gap: 8px; background: rgba(10, 14, 20, 0.95); border-top: 1px solid var(--cyber-border); }

.cyber-input {
    flex: 1;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid var(--cyber-border);
    border-radius: 6px;
    padding: 10px 14px;
    color: var(--cyber-green);
    font-family: var(--font-mono);
    font-size: 0.85rem;
    outline: none;
    transition: all 0.3s;
}

.cyber-input:focus { border-color: var(--cyber-green); box-shadow: 0 0 10px rgba(0, 255, 65, 0.3); }
.cyber-input::placeholder { color: rgba(0, 255, 65, 0.4); }

.send-btn { width: 42px; height: 42px; background: var(--cyber-green); border: none; border-radius: 6px; color: var(--cyber-black); font-size: 1.1rem; font-weight: 900; cursor: pointer; transition: all 0.3s; box-shadow: 0 0 15px rgba(0, 255, 65, 0.4); }
.send-btn:hover { transform: scale(1.05); box-shadow: 0 0 25px var(--cyber-green); }
.send-btn.cyan { background: var(--cyber-cyan); box-shadow: 0 0 15px rgba(0, 212, 255, 0.4); }

.sector-header { display: flex; align-items: center; gap: 15px; padding: 15px; background: rgba(0, 212, 255, 0.05); border: 1px solid var(--cyber-cyan); border-radius: 10px; margin-bottom: 15px; }

.sector-eye { width: 60px; height: 60px; border: 2px solid var(--cyber-cyan); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(0, 212, 255, 0.4); animation: floatEye 3s infinite ease-in-out; }

@keyframes floatEye { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }

.sector-pupil { width: 18px; height: 18px; background: radial-gradient(circle, white, var(--cyber-cyan)); border-radius: 50%; box-shadow: 0 0 15px var(--cyber-cyan); }
.sector-eye.thinking { animation: blinkEye 0.4s infinite alternate; }
@keyframes blinkEye { from { transform: scaleY(1); } to { transform: scaleY(0.1); } }

.sector-info { flex: 1; }
.sector-name { font-size: 1rem; font-weight: 700; color: var(--cyber-cyan); text-shadow: 0 0 10px var(--cyber-cyan); }
.sector-version { font-size: 0.7rem; color: var(--cyber-green); }

.touch-container { display: flex; flex-direction: column; align-items: center; padding: 20px; gap: 20px; }
.touch-title { color: var(--cyber-pink); font-size: 0.9rem; letter-spacing: 2px; }

.cyber-heart { width: 120px; height: 120px; position: relative; cursor: pointer; display: flex; align-items: center; justify-content: center; }

.heart-core { width: 60px; height: 60px; background: linear-gradient(135deg, var(--cyber-pink), var(--cyber-purple)); transform: rotate(-45deg); border-radius: 4px; position: relative; box-shadow: 0 0 30px var(--cyber-pink); animation: heartPulse 1.3s infinite; }
.heart-core::before, .heart-core::after { content: ''; position: absolute; width: 60px; height: 60px; background: linear-gradient(135deg, var(--cyber-pink), var(--cyber-purple)); border-radius: 50%; }
.heart-core::before { top: -30px; left: 0; }
.heart-core::after { top: 0; left: 30px; }

@keyframes heartPulse { 0%, 100% { transform: rotate(-45deg) scale(1); } 25% { transform: rotate(-45deg) scale(1.1); } 60% { transform: rotate(-45deg) scale(1.15); } }

.heart-ring { position: absolute; width: 100%; height: 100%; border: 2px solid var(--cyber-pink); border-radius: 50%; opacity: 0; animation: ringPulse 2s infinite; }
.heart-ring.ring-2 { animation-delay: 1s; }
@keyframes ringPulse { 0% { transform: scale(0.5); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }

.cyber-heart.active .heart-core { animation: heartFast 0.35s infinite; }
@keyframes heartFast { 0%, 100% { transform: rotate(-45deg) scale(1.1); } 50% { transform: rotate(-45deg) scale(1.3); } }

.ecg-svg { width: 90%; height: 70px; background: rgba(0, 0, 0, 0.5); border: 1px solid var(--cyber-border); border-radius: 8px; }
.ecg-path { stroke: var(--cyber-pink); stroke-width: 2; fill: none; stroke-dasharray: 400; stroke-dashoffset: 400; filter: drop-shadow(0 0 5px var(--cyber-pink)); }
.cyber-heart.active ~ .ecg-svg .ecg-path { animation: drawLine 1.4s linear infinite; }
@keyframes drawLine { to { stroke-dashoffset: -400; } }

.bpm-display { font-size: 1.2rem; color: var(--cyber-pink); }
.bpm-value { font-weight: 900; font-size: 1.8rem; text-shadow: 0 0 10px var(--cyber-pink); }

.games-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }

.game-card { background: rgba(10, 14, 20, 0.8); border: 1px solid var(--cyber-border); border-radius: 10px; padding: 18px 12px; text-align: center; cursor: pointer; transition: all 0.3s; }
.game-card:hover { border-color: var(--cyber-green); box-shadow: 0 0 20px rgba(0, 255, 65, 0.3); transform: translateY(-2px); }
.game-icon { font-size: 2.5rem; margin-bottom: 8px; }
.game-name { font-size: 0.8rem; font-weight: 700; color: var(--cyber-green); letter-spacing: 1px; margin-bottom: 4px; }
.game-desc { font-size: 0.65rem; color: var(--cyber-cyan); }

.game-stats-panel { margin-top: 20px; background: rgba(10, 14, 20, 0.8); border: 1px solid var(--cyber-border); border-radius: 10px; padding: 15px; }

.memories-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 15px; }

.memory-item { aspect-ratio: 1; background: rgba(10, 14, 20, 0.8); border: 1px solid var(--cyber-border); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: var(--cyber-cyan); cursor: pointer; transition: all 0.3s; }
.memory-item:hover { border-color: var(--cyber-green); box-shadow: 0 0 10px rgba(0, 255, 65, 0.3); }
.memory-item img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; }

.canvas-area { background: #000; border: 1px solid var(--cyber-green); border-radius: 10px; height: 250px; position: relative; touch-action: none; box-shadow: 0 0 15px rgba(0, 255, 65, 0.2); }
.canvas-area canvas { width: 100%; height: 100%; border-radius: 10px; }
.canvas-controls { display: flex; gap: 8px; margin-top: 10px; }

.health-card { background: linear-gradient(135deg, rgba(255, 0, 110, 0.1), rgba(188, 19, 254, 0.05)); border: 1px solid var(--cyber-pink); border-radius: 12px; padding: 20px; text-align: center; }
.health-title { color: var(--cyber-pink); font-size: 0.85rem; letter-spacing: 2px; margin-bottom: 10px; }
.rose-icon { font-size: 3rem; margin: 10px 0; filter: drop-shadow(0 0 15px var(--cyber-pink)); }
.health-value { font-size: 2.5rem; font-weight: 900; color: var(--cyber-pink); text-shadow: 0 0 15px var(--cyber-pink); }
.health-phase { color: var(--cyber-cyan); font-size: 0.85rem; margin: 10px 0 15px; }
.health-suggestion { background: rgba(0, 212, 255, 0.05); border: 1px solid var(--cyber-cyan); border-radius: 10px; padding: 15px; margin-top: 15px; font-size: 0.85rem; color: var(--cyber-cyan); line-height: 1.6; }

.metrics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.metric-card { background: rgba(10, 14, 20, 0.8); border: 1px solid var(--cyber-border); border-radius: 8px; padding: 12px; text-align: center; }
.metric-label { font-size: 0.7rem; color: var(--cyber-cyan); margin-bottom: 5px; }
.metric-value { font-size: 1.2rem; font-weight: 700; color: var(--cyber-green); }

.capsule-main { background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(188, 19, 254, 0.05)); border: 1px solid var(--cyber-yellow); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 15px; }
.capsule-icon { font-size: 3rem; animation: floatCapsule 3s infinite ease-in-out; }
@keyframes floatCapsule { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

.capsule-form { background: rgba(10, 14, 20, 0.8); border: 1px solid var(--cyber-border); border-radius: 10px; padding: 15px; display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px; }
.capsule-form textarea { min-height: 80px; resize: none; }

.capsule-item { background: rgba(10, 14, 20, 0.8); border: 1px solid var(--cyber-yellow); border-radius: 8px; padding: 12px; margin-bottom: 8px; font-size: 0.85rem; }
.capsule-item.locked { opacity: 0.7; border-style: dashed; }

.wish-item { display: flex; align-items: center; gap: 10px; padding: 12px; background: rgba(10, 14, 20, 0.8); border: 1px solid var(--cyber-border); border-radius: 8px; margin-bottom: 8px; cursor: pointer; transition: all 0.3s; }
.wish-item.done { border-color: var(--cyber-green); opacity: 0.6; }
.wish-item.done .wish-text { text-decoration: line-through; color: var(--cyber-green); }
.wish-check { width: 24px; height: 24px; border: 2px solid var(--cyber-pink); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: transparent; flex-shrink: 0; }
.wish-item.done .wish-check { background: var(--cyber-green); border-color: var(--cyber-green); color: var(--cyber-black); }
.wish-form { display: flex; gap: 8px; margin: 15px 0; }
.wishes-progress { background: rgba(10, 14, 20, 0.8); border: 1px solid var(--cyber-border); border-radius: 10px; padding: 15px; text-align: center; }

.timeline-item { position: relative; padding: 12px 12px 12px 40px; background: rgba(10, 14, 20, 0.8); border: 1px solid var(--cyber-border); border-radius: 8px; margin-bottom: 10px; }
.timeline-item::before { content: ''; position: absolute; right: 12px; top: 18px; width: 10px; height: 10px; background: var(--cyber-pink); border-radius: 50%; box-shadow: 0 0 10px var(--cyber-pink); }
.timeline-date { font-size: 0.7rem; color: var(--cyber-cyan); margin-bottom: 4px; }
.timeline-title { font-weight: 700; color: var(--cyber-green); margin-bottom: 4px; }
.timeline-desc { font-size: 0.8rem; color: #888; }

.mood-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 15px; }
.mood-btn { aspect-ratio: 1; background: rgba(10, 14, 20, 0.8); border: 2px solid var(--cyber-border); border-radius: 50%; font-size: 2rem; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s; }
.mood-btn.selected { background: linear-gradient(135deg, var(--cyber-pink), var(--cyber-purple)); border-color: var(--cyber-pink); box-shadow: 0 0 20px rgba(255, 0, 110, 0.5); transform: scale(1.1); }
.mood-stats { background: rgba(10, 14, 20, 0.8); border: 1px solid var(--cyber-border); border-radius: 10px; padding: 15px; display: flex; justify-content: space-around; }
.mood-suggestion { background: rgba(0, 212, 255, 0.05); border: 1px solid var(--cyber-cyan); border-radius: 10px; padding: 15px; margin-top: 15px; }

.test-card { background: rgba(10, 14, 20, 0.8); border: 1px solid var(--cyber-border); border-radius: 10px; padding: 20px; }
#test-question { color: var(--cyber-cyan); font-size: 0.9rem; margin-bottom: 15px; line-height: 1.6; }
#test-options { display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px; }
#test-options button { background: transparent; border: 1px solid var(--cyber-border); color: var(--cyber-green); padding: 10px; border-radius: 6px; font-family: var(--font-mono); font-size: 0.85rem; cursor: pointer; text-align: right; transition: all 0.3s; }
#test-options button:hover { border-color: var(--cyber-green); background: rgba(0, 255, 65, 0.1); }
#test-result { background: rgba(10, 14, 20, 0.8); border: 1px solid var(--cyber-pink); border-radius: 10px; padding: 20px; text-align: center; margin-top: 15px; }

.meditation-circle { width: 180px; height: 180px; margin: 20px auto; border: 3px solid var(--cyber-cyan); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 3rem; background: radial-gradient(circle, rgba(0, 212, 255, 0.1), transparent); box-shadow: 0 0 30px rgba(0, 212, 255, 0.3); }
.meditation-circle.active { animation: breathe 4s infinite ease-in-out; }
@keyframes breathe { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.15); opacity: 1; box-shadow: 0 0 50px var(--cyber-cyan); } }
.meditation-status { text-align: center; color: var(--cyber-cyan); font-size: 1.2rem; margin: 10px 0; }
.meditation-timer { text-align: center; font-size: 2.5rem; font-weight: 900; color: var(--cyber-yellow); text-shadow: 0 0 15px var(--cyber-yellow); margin: 10px 0; }
.meditation-controls { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin: 15px 0; }
.meditation-stats { background: rgba(10, 14, 20, 0.8); border: 1px solid var(--cyber-border); border-radius: 10px; padding: 15px; display: flex; justify-content: space-around; }

.cyber-tabbar { background: rgba(10, 14, 20, 0.95); backdrop-filter: blur(10px); border-top: 1px solid var(--cyber-border); padding: 6px 4px calc(6px + env(safe-area-inset-bottom)); display: flex; justify-content: space-around; z-index: 10; }
.cyber-tabbar.secondary { border-top: none; border-bottom: 1px solid var(--cyber-border); padding: 6px 4px; order: -1; }
.tab-item { display: flex; flex-direction: column; align-items: center; gap: 3px; color: #666; font-size: 0.6rem; flex: 1; padding: 4px; cursor: pointer; transition: all 0.3s; border-radius: 6px; }
.tab-item.active { color: var(--cyber-green); background: rgba(0, 255, 65, 0.1); text-shadow: 0 0 8px var(--cyber-green); }
.tab-icon { font-size: 1.2rem; }

.modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(5px); z-index: 100; align-items: center; justify-content: center; padding: 20px; }
.modal.show { display: flex; animation: fadeIn 0.3s; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal-content { background: var(--cyber-dark); border: 1px solid var(--cyber-green); border-radius: 12px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; box-shadow: 0 0 40px rgba(0, 255, 65, 0.3); }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 15px; border-bottom: 1px solid var(--cyber-border); }
.close-btn { background: transparent; border: 1px solid var(--cyber-red); color: var(--cyber-red); width: 30px; height: 30px; border-radius: 6px; font-size: 1.2rem; cursor: pointer; transition: all 0.3s; }
.close-btn:hover { background: var(--cyber-red); color: white; }
.modal-body { padding: 20px; }

.game-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: var(--cyber-black); z-index: 150; flex-direction: column; padding: 20px; overflow-y: auto; }
.game-overlay.show { display: flex; animation: fadeIn 0.3s; }
.game-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 15px; border-bottom: 1px solid var(--cyber-border); color: var(--cyber-cyan); font-weight: 700; letter-spacing: 2px; }
#game-content { flex: 1; padding: 20px 0; }
#game-score { text-align: center; font-size: 1.2rem; color: var(--cyber-yellow); margin: 10px 0; }

.bottle-circle { width: 240px; height: 240px; margin: 20px auto; border: 2px dashed var(--cyber-border); border-radius: 50%; position: relative; display: flex; align-items: center; justify-content: center; }
.bottle-element { width: 40px; height: 120px; background: linear-gradient(180deg, var(--cyber-cyan), var(--cyber-green)); border-radius: 15px 15px 6px 6px; cursor: pointer; transition: transform 4s cubic-bezier(0.1, 0.8, 0.1, 1); box-shadow: 0 0 25px rgba(0, 212, 255, 0.5); position: relative; }
.bottle-element::after { content: ''; position: absolute; top: -8px; left: 12px; width: 16px; height: 8px; background: white; border-radius: 3px; }
.lbl-p { position: absolute; font-weight: 700; font-size: 0.9rem; letter-spacing: 1px; }
.lbl-top { top: 10px; color: var(--cyber-pink); }
.lbl-bottom { bottom: 10px; color: var(--cyber-cyan); }
#tod-txt { text-align: center; color: var(--cyber-yellow); margin: 15px 0; letter-spacing: 1px; }
#tod-question { text-align: center; color: var(--cyber-green); font-size: 0.9rem; line-height: 1.6; padding: 15px; background: rgba(0, 255, 65, 0.05); border: 1px dashed var(--cyber-green); border-radius: 8px; margin: 15px 0; min-height: 60px; }
.tod-controls { display: flex; gap: 10px; justify-content: center; margin-top: 15px; }

.progress-bar { width: 100%; height: 6px; background: rgba(0, 255, 65, 0.1); border: 1px solid var(--cyber-border); border-radius: 3px; overflow: hidden; margin: 10px 0; }
.progress-fill { height: 100%; background: linear-gradient(90deg, var(--cyber-pink), var(--cyber-cyan)); box-shadow: 0 0 10px var(--cyber-pink); transition: width 0.5s; }

.ttt-board { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; max-width: 280px; margin: 20px auto; }
.ttt-cell { aspect-ratio: 1; background: rgba(10, 14, 20, 0.8); border: 2px solid var(--cyber-border); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 900; cursor: pointer; transition: all 0.2s; }
.ttt-cell:hover { border-color: var(--cyber-green); }
.ttt-cell.x { color: var(--cyber-pink); text-shadow: 0 0 15px var(--cyber-pink); }
.ttt-cell.o { color: var(--cyber-cyan); text-shadow: 0 0 15px var(--cyber-cyan); }
.ttt-cell.win { background: rgba(255, 215, 0, 0.2); border-color: var(--cyber-yellow); box-shadow: 0 0 20px var(--cyber-yellow); }

.memory-board { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; max-width: 320px; margin: 20px auto; }
.memory-card { aspect-ratio: 1; background: rgba(10, 14, 20, 0.8); border: 2px solid var(--cyber-border); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; cursor: pointer; transition: all 0.3s; }
.memory-card.flipped { background: linear-gradient(135deg, rgba(255, 0, 110, 0.2), rgba(188, 19, 254, 0.2)); border-color: var(--cyber-pink); box-shadow: 0 0 15px rgba(255, 0, 110, 0.3); }
.memory-card.matched { background: linear-gradient(135deg, rgba(0, 255, 65, 0.2), rgba(0, 212, 255, 0.2)); border-color: var(--cyber-green); box-shadow: 0 0 15px rgba(0, 255, 65, 0.3); }

.rps-choices { display: flex; justify-content: center; gap: 15px; margin: 20px 0; }
.rps-btn { width: 80px; height: 80px; background: rgba(10, 14, 20, 0.8); border: 2px solid var(--cyber-border); border-radius: 50%; font-size: 2.5rem; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s; }
.rps-btn:hover { border-color: var(--cyber-green); transform: scale(1.05); }
.rps-btn.selected { background: linear-gradient(135deg, var(--cyber-pink), var(--cyber-purple)); border-color: var(--cyber-pink); box-shadow: 0 0 25px rgba(255, 0, 110, 0.5); }

.profile-avatar { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--cyber-pink), var(--cyber-cyan)); margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 900; color: var(--cyber-black); box-shadow: 0 0 20px rgba(255, 0, 110, 0.4); }
.profile-field { margin-bottom: 12px; }
.profile-field label { display: block; font-size: 0.75rem; color: var(--cyber-cyan); margin-bottom: 5px; letter-spacing: 1px; }
.profile-field input, .profile-field select, .profile-field textarea { width: 100%; background: rgba(0, 0, 0, 0.5); border: 1px solid var(--cyber-border); border-radius: 6px; padding: 10px; color: var(--cyber-green); font-family: var(--font-mono); font-size: 0.85rem; outline: none; }
.profile-field input:focus, .profile-field select:focus, .profile-field textarea:focus { border-color: var(--cyber-green); box-shadow: 0 0 10px rgba(0, 255, 65, 0.3); }

@media (max-width: 480px) {
    .dashboard-grid { grid-template-columns: 1fr; }
    .action-grid { grid-template-columns: repeat(2, 1fr); }
    .stat-value { font-size: 1.2rem; }
}
CSSEOF

echo "✅ CSS files created"
echo "✅ SETUP PART 1 COMPLETE - Continue in next message for JS files"



