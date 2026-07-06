const Health = {
    async init() {
        await this.loadCycle();
        this.loadMetrics();
    },
    
    async loadCycle() {
        try {
            const data = await API.getCycle();
            const cycle = data.cycle;
            
            const daysEl = document.getElementById('days-until');
            const phaseEl = document.getElementById('current-phase');
            const suggestionEl = document.getElementById('sector-suggestion');
            
            if (!cycle) {
                if (daysEl) daysEl.textContent = '--';
                if (phaseEl) phaseEl.textContent = 'NOT SET';
                if (suggestionEl) suggestionEl.textContent = 'لطفاً چرخه رو تنظیم کن';
                return;
            }
            
            const lastPeriod = new Date(cycle.last_period);
            const daysSince = Math.floor((Date.now() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
            const cycleLength = cycle.cycle_length || 28;
            const currentDay = daysSince % cycleLength;
            const daysUntil = cycleLength - currentDay;
            
            if (daysEl) daysEl.textContent = `${daysUntil} روز`;
            
            let phase = 'pms', phaseName = 'PMS';
            if (currentDay < 5) { phase = 'menstrual'; phaseName = 'قاعدگی'; }
            else if (currentDay < 13) { phase = 'follicular'; phaseName = 'فولیکولار'; }
            else if (currentDay < 16) { phase = 'ovulation'; phaseName = 'تخمک‌گذاری'; }
            else if (currentDay < 24) { phase = 'luteal'; phaseName = 'لوتئال'; }
            
            if (phaseEl) phaseEl.textContent = `فاز: ${phaseName}`;
            
            const suggestions = {
                'menstrual': '💝 در این فاز به استراحت و محبت بیشتری نیاز داره. کیسه آب گرم و چای گیاهی آماده کن!',
                'follicular': '✨ انرژی در حال بالارفتنه! وقت خوبیه برای یه فعالیت هیجان‌انگیز دونفره.',
                'ovulation': '🌹 در اوج جذابیت و انرژی! یه قرار رمانتیک ویژه برنامه‌ریزی کن.',
                'luteal': '💕 ممکنه حساس‌تر باشه. صبور باش و با مهربونی رفتار کن.',
                'pms': '🤗 شکلات، ماساژ و پیام‌های عاشقانه معجزه می‌کنه!'
            };
            
            if (suggestionEl) suggestionEl.textContent = suggestions[phase];
            
        } catch (err) {
            console.error('Load cycle error:', err);
        }
    },
    
    loadMetrics() {
        const user = App.user;
        const metricsEl = document.getElementById('body-metrics');
        if (!metricsEl || !user) return;
        
        const bmi = user.height_cm && user.weight_kg ? 
            (user.weight_kg / Math.pow(user.height_cm/100, 2)).toFixed(1) : '--';
        
        let bmiStatus = '--';
        if (bmi !== '--') {
            const b = parseFloat(bmi);
            if (b < 18.5) bmiStatus = 'لاغر';
            else if (b < 25) bmiStatus = 'نرمال ✓';
            else if (b < 30) bmiStatus = 'اضافه وزن';
            else bmiStatus = 'چاق';
        }
        
        const age = user.birth_date ? this.calcAge(user.birth_date) : '--';
        
        metricsEl.innerHTML = `
            <div class="metric-card">
                <div class="metric-label">AGE</div>
                <div class="metric-value">${age}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">HEIGHT</div>
                <div class="metric-value">${user.height_cm || '--'} cm</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">WEIGHT</div>
                <div class="metric-value">${user.weight_kg || '--'} kg</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">BMI</div>
                <div class="metric-value">${bmi}</div>
                <div style="font-size:0.6rem; color:var(--cyber-cyan); margin-top:3px;">${bmiStatus}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">BLOOD</div>
                <div class="metric-value">${user.blood_type || '--'}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">GENDER</div>
                <div class="metric-value">${user.gender ? (user.gender === 'male' ? '♂' : user.gender === 'female' ? '♀' : '⚧') : '--'}</div>
            </div>
        `;
    },
    
    calcAge(birthDate) {
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    },
    
    async updateCycle() {
        const dateStr = prompt('تاریخ آخرین شروع چرخه (YYYY-MM-DD):');
        if (!dateStr) return;
        
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            alert('❌ تاریخ نامعتبر');
            return;
        }
        
        try {
            await API.updateCycle({
                last_period: dateStr,
                cycle_length: 28
            });
            alert('✓ چرخه بروزرسانی شد');
            this.loadCycle();
        } catch (err) {
            alert('✗ خطا: ' + err.message);
        }
    }
};

