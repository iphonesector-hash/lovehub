const App = {
    user: null,
    partner: null,
    
    async init() {
        if (!API.getToken()) {
            window.location.href = '/';
            return;
        }
        
        try {
            const data = await API.getMe();
            this.user = data.user;
            localStorage.setItem('lovehub_user', JSON.stringify(this.user));
            
            const userNameEl = document.getElementById('user-name');
            if (userNameEl) {
                userNameEl.textContent = this.user.display_name || this.user.username;
            }
            
            this.partner = { name: this.user.username === 'pourya' ? 'سارینا' : 'پوریا' };
            
            // Initialize all modules
            if (typeof Chat !== 'undefined') Chat.init();
            if (typeof Sector !== 'undefined') Sector.init();
            if (typeof Touch !== 'undefined') Touch.init();
            if (typeof Games !== 'undefined') Games.init();
            if (typeof Memories !== 'undefined') Memories.init();
            if (typeof Health !== 'undefined') Health.init();
            if (typeof Capsule !== 'undefined') Capsule.init();
            if (typeof Wishes !== 'undefined') Wishes.init();
            if (typeof Timeline !== 'undefined') Timeline.init();
            if (typeof Mood !== 'undefined') Mood.init();
            if (typeof Meditation !== 'undefined') Meditation.init();
            if (typeof LoveTest !== 'undefined') LoveTest.init();
            
            this.startLoveCounter();
            
        } catch (err) {
            console.error('Init error:', err);
            API.clearToken();
            window.location.href = '/';
        }
    },
    
    switchTab(tabId) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
        
        const view = document.getElementById(`view-${tabId}`);
        if (view) view.classList.add('active');
        
        document.querySelectorAll('.tab-item').forEach(t => {
            if (t.getAttribute('onclick')?.includes(`'${tabId}'`)) {
                t.classList.add('active');
            }
        });
        
        if (tabId === 'memories') {
            setTimeout(() => {
                if (typeof Memories !== 'undefined') Memories.initCanvas();
            }, 100);
        }
    },
    
    startLoveCounter() {
        const startDate = new Date('2024-01-01');
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
    
    openProfile() {
        if (typeof Profile !== 'undefined') Profile.open();
    },
    
    closeProfile() {
        const modal = document.getElementById('profile-modal');
        if (modal) modal.classList.remove('show');
    },
    
    logout() {
        if (confirm('خروج از سیستم؟')) {
            API.clearToken();
            window.location.href = '/';
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());

