const Meditation = {
    timer: null,
    remaining: 0,
    isActive: false,
    currentMinutes: 0,
    
    async init() {
        await this.loadStats();
    },
    
    start(minutes) {
        if (this.isActive) this.stop();
        
        this.currentMinutes = minutes;
        this.remaining = minutes * 60;
        this.isActive = true;
        
        const circle = document.getElementById('meditation-circle');
        if (circle) circle.classList.add('active');
        
        const status = document.getElementById('meditation-status');
        if (status) status.textContent = 'نفس بکش...';
        
        this.updateTimer();
        this.timer = setInterval(() => {
            this.remaining--;
            this.updateTimer();
            
            if (this.remaining <= 0) {
                this.complete();
            }
        }, 1000);
        
        if (navigator.vibrate) navigator.vibrate(100);
    },
    
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.isActive = false;
        
        const circle = document.getElementById('meditation-circle');
        if (circle) circle.classList.remove('active');
        
        const status = document.getElementById('meditation-status');
        if (status) {
            if (this.remaining > 0 && this.remaining < this.currentMinutes * 60) {
                status.textContent = 'متوقف شد';
            } else {
                status.textContent = 'READY';
            }
        }
        
        const timerEl = document.getElementById('meditation-timer');
        if (timerEl) {
            timerEl.textContent = `${String(this.currentMinutes || 5).padStart(2,'0')}:00`;
        }
    },
    
    async complete() {
        this.stop();
        
        const status = document.getElementById('meditation-status');
        if (status) status.textContent = '🎉 تکمیل شد!';
        
        try {
            await API.completeMeditation(this.currentMinutes);
            this.loadStats();
            
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            alert('🧘 مدیتیشن تکمیل شد! آفرین 💕');
        } catch (err) {
            console.error('Meditation complete error:', err);
            alert('⚠️ خطا در ذخیره آمار');
        }
    },
    
    updateTimer() {
        const mins = Math.floor(this.remaining / 60);
        const secs = this.remaining % 60;
        const timerEl = document.getElementById('meditation-timer');
        if (timerEl) {
            timerEl.textContent = `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
        }
    },
    
    async loadStats() {
        const statsBox = document.getElementById('meditation-stats');
        if (!statsBox) return;
        
        try {
            const data = await API.getMeditationStats();
            const stats = data.stats || { sessions: 0, total_minutes: 0, streak: 0 };
            
            statsBox.innerHTML = `
                <div style="text-align:center;">
                    <div style="font-size:1.5rem; font-weight:700; color:var(--cyber-pink);">${stats.sessions || 0}</div>
                    <div style="font-size:0.7rem; color:#666; letter-spacing:1px;">SESSIONS</div>
                </div>
                <div style="text-align:center;">
                    <div style="font-size:1.5rem; font-weight:700; color:var(--cyber-cyan);">${stats.total_minutes || 0}</div>
                    <div style="font-size:0.7rem; color:#666; letter-spacing:1px;">MINUTES</div>
                </div>
                <div style="text-align:center;">
                    <div style="font-size:1.5rem; font-weight:700; color:var(--cyber-green);">${stats.streak || 0}</div>
                    <div style="font-size:0.7rem; color:#666; letter-spacing:1px;">STREAK</div>
                </div>
            `;
        } catch (err) {
            console.error('Load meditation stats error:', err);
            statsBox.innerHTML = '<div style="color:var(--cyber-red); font-size:0.8rem;">Error loading stats</div>';
        }
    }
};

