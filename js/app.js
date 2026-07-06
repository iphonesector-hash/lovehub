const App = {
    user: null,
    partner: null,
    
    async init() {
        // بررسی auth
        if (!API.getToken()) {
            window.location.href = 'index.html';
            return;
        }
        
        try {
            const data = await API.getMe();
            this.user = data.user;
            localStorage.setItem('lovehub_user', JSON.stringify(this.user));
            
            document.getElementById('user-name').textContent = this.user.display_name || this.user.username;
            
            // دریافت اطلاعات پارتنر (ساده‌سازی شده)
            this.partner = { name: this.user.username === 'pourya' ? 'سارینا' : 'پوریا' };
            
            // راه‌اندازی ماژول‌ها
            Chat.init();
            Sector.init();
            Touch.init();
            Games.init();
            Memories.init();
            Health.init();
            Capsule.init();
            Wishes.init();
            Timeline.init();
            Mood.init();
            Meditation.init();
            LoveTest.init();
            
            // شمارشگر عشق
            this.startLoveCounter();
            
            // فعالیت‌های اخیر
            this.loadActivity();
            
        } catch (err) {
            console.error('Init error:', err);
            API.clearToken();
            window.location.href = 'index.html';
        }
    },
    
    switchTab(tabId) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
        
        const view = document.getElementById(`view-${tabId}`);
        if (view) view.classList.add('active');
        
        // فعال کردن تب مربوطه
        document.querySelectorAll('.tab-item').forEach(t => {
            if (t.getAttribute('onclick')?.includes(`'${tabId}'`)) {
                t.classList.add('active');
            }
        });
        
        // راه‌اندازی canvas در تب خاطرات
        if (tabId === 'memories') {
            setTimeout(() => Memories.initCanvas(), 100);
        }
    },
    
    startLoveCounter() {
        const startDate = new Date('2024-01-01'); // قابل تنظیم
        const update = () => {
            const diff = Date.now() - startDate;
            const days = Math.floor(diff / 86400000);
            const hours = Math.floor((diff % 86400000) / 3600000);
            const mins = Math.floor((diff % 3600000) / 60000);
            
            const el = document.getElementById('love-counter');
            if (el) {
                el.textContent = `${days}:${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}`;
            }
        };
        update();
        setInterval(update, 60000);
    },
    
    async loadActivity() {
        const list = document.getElementById('activity-list');
        if (!list) return;
        
        try {
            const data = await API.getData('chat_get');
            const recent = data.messages.slice(0, 5);
            
            if (recent.length === 0) {
                list.innerHTML = '<div style="color:var(--text-muted); font-size:0.8rem; padding:10px;">No recent activity</div>';
                return;
            }
            
            list.innerHTML = recent.map(m => `
                <div class="activity-item">
                    <div class="activity-user">${m.display_name}</div>
                    <div class="activity-msg">${m.message.substring(0, 40)}${m.message.length > 40 ? '...' : ''}</div>
                </div>
            `).join('');
        } catch (err) {
            list.innerHTML = '<div style="color:var(--cyber-red);">Error loading activity</div>';
        }
    },
    
    openProfile() {
        Profile.open();
    },
    
    closeProfile() {
        document.getElementById('profile-modal').classList.remove('show');
    },
    
    logout() {
        if (confirm('خروج از سیستم؟')) {
            API.clearToken();
            localStorage.removeItem('lovehub_user');
            window.location.href = 'index.html';
        }
    }
};

// شروع برنامه
document.addEventListener('DOMContentLoaded', () => App.init());

