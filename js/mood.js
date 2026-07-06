const Mood = {
    async init() {
        await this.loadStats();
        this.checkTodayMood();
    },
    
    checkTodayMood() {
        const today = new Date().toDateString();
        const lastMood = localStorage.getItem('lovehub_last_mood');
        if (lastMood) {
            try {
                const data = JSON.parse(lastMood);
                if (new Date(data.date).toDateString() === today) {
                    document.querySelectorAll('.mood-btn').forEach(btn => {
                        if (btn.textContent.trim() === data.emoji) {
                            btn.classList.add('selected');
                        }
                    });
                    
                    const moodIndex = document.getElementById('mood-index');
                    if (moodIndex) moodIndex.textContent = data.emoji;
                }
            } catch (e) {
                console.error('Parse last mood error:', e);
            }
        }
    },
    
    async select(element, mood, emoji) {
        document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
        element.classList.add('selected');
        
        localStorage.setItem('lovehub_last_mood', JSON.stringify({
            mood, emoji, date: new Date().toISOString()
        }));
        
        try {
            await API.addMood({ mood, emoji, note: '' });
            this.loadStats();
            this.showSuggestion(mood);
            
            const moodIndex = document.getElementById('mood-index');
            if (moodIndex) moodIndex.textContent = emoji;
            
            if (navigator.vibrate) navigator.vibrate(50);
            
        } catch (err) {
            console.error('Mood save error:', err);
        }
    },
    
    showSuggestion(mood) {
        const box = document.getElementById('mood-suggestion');
        if (!box) return;
        
        box.style.display = 'block';
        
        const suggestions = {
            'عالی': '🎉 چه عالی! این حس خوب رو با پارتنرت به اشتراک بذار! یه پیام عاشقانه بفرست.',
            'خوب': '😊 روز خوبی داری! یه عکس دونفره از امروز بگیرید.',
            'معمولی': '🌼 یه کار کوچیک خوشحال‌کننده انجام بده. مثلاً یه موزیک شاد گوش کن.',
            'ناراحت': '💙 نگران نباش، این حس می‌گذره. با پارتنرت حرف بزن، یه بغل طولانی معجزه می‌کنه.',
            'عصبانی': '🧘 چند نفس عمیق بکش. مدیتیشن می‌تونه کمکت کنه. یا یه پیاده‌روی کوتاه برو.'
        };
        
        box.innerHTML = `
            <div style="font-weight:700; color:var(--cyber-cyan); margin-bottom:8px; letter-spacing:1px;">💡 SECTOR SUGGESTION</div>
            <div style="font-size:0.85rem; color:var(--cyber-green); line-height:1.6;">${suggestions[mood] || ''}</div>
        `;
    },
    
    async loadStats() {
        const statsBox = document.getElementById('mood-stats');
        if (!statsBox) return;
        
        try {
            const data = await API.getMood();
            const moods = data.moods || [];
            
            const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            const weekMoods = moods.filter(m => new Date(m.created_at).getTime() >= weekAgo);
            
            const counts = {};
            weekMoods.forEach(m => {
                counts[m.emoji] = (counts[m.emoji] || 0) + 1;
            });
            
            const emojis = ['😍', '😊', '😐', '😔', '😠'];
            statsBox.innerHTML = emojis.map(e => `
                <div style="text-align:center;">
                    <div style="font-size:1.5rem;">${e}</div>
                    <div style="font-size:0.7rem; color:#666;">${counts[e] || 0}</div>
                </div>
            `).join('');
            
        } catch (err) {
            console.error('Load mood stats error:', err);
            statsBox.innerHTML = '<div style="color:var(--cyber-red); font-size:0.8rem;">Error loading stats</div>';
        }
    }
};

