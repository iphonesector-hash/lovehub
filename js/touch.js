const Touch = {
    timer: null,
    startTime: 0,
    bpmInterval: null,
    totalSeconds: 0,
    touchCount: 0,
    
    async init() {
        try {
            const data = await API.getTouchStats();
            if (data.stats) {
                this.touchCount = data.stats.touch_count || 0;
                this.totalSeconds = data.stats.total_seconds || 0;
            }
        } catch (err) {
            console.error('Touch init error:', err);
        }
        this.updateStats();
    },
    
    start() {
        const heart = document.getElementById('h-heart');
        if (!heart) return;
        
        heart.classList.add('active');
        this.startTime = Date.now();
        
        if (navigator.vibrate) navigator.vibrate([70, 30, 70]);
        
        this.timer = setInterval(() => {
            this.totalSeconds++;
            this.updateStats();
        }, 1000);
        
        const bpmDisplay = document.getElementById('bpm-value');
        this.bpmInterval = setInterval(() => {
            const bpm = Math.floor(Math.random() * 30) + 90;
            if (bpmDisplay) bpmDisplay.textContent = bpm;
        }, 500);
    },
    
    async stop() {
        const heart = document.getElementById('h-heart');
        if (heart) heart.classList.remove('active');
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        if (this.bpmInterval) {
            clearInterval(this.bpmInterval);
            this.bpmInterval = null;
        }
        
        const bpmDisplay = document.getElementById('bpm-value');
        if (bpmDisplay) bpmDisplay.textContent = '72';
        
        const duration = Math.floor((Date.now() - this.startTime) / 1000);
        if (duration > 0) {
            this.touchCount++;
            try {
                await API.updateTouch(duration);
            } catch (err) {
                console.error('Touch update error:', err);
            }
        }
        
        this.updateStats();
    },
    
    updateStats() {
        const statsEl = document.getElementById('touch-stats');
        if (statsEl) {
            const mins = Math.floor(this.totalSeconds / 60);
            statsEl.innerHTML = `
                <div style="font-size:0.8rem; color:var(--cyber-cyan); text-align:center;">
                    <div>TOUCH_COUNT: <span style="color:var(--cyber-pink); font-weight:700;">${this.touchCount}</span></div>
                    <div>TOTAL_TIME: <span style="color:var(--cyber-green); font-weight:700;">${mins} MIN</span></div>
                </div>
            `;
        }
    }
};

