const Timeline = {
    async init() {
        await this.loadTimeline();
    },
    
    async loadTimeline() {
        const list = document.getElementById('timeline-list');
        if (!list) return;
        
        try {
            const data = await API.getTimeline();
            const events = data.events || [];
            
            list.innerHTML = '';
            
            if (events.length === 0) {
                list.innerHTML = '<div style="color:#666; font-size:0.8rem; padding:10px; text-align:center;">No events yet. Add your first memory! 💕</div>';
                return;
            }
            
            events.forEach(e => {
                const item = document.createElement('div');
                item.className = 'timeline-item';
                
                const formattedDate = e.event_date ? new Date(e.event_date).toLocaleDateString('fa-IR') : 'نامشخص';
                
                item.innerHTML = `
                    <div class="timeline-date">${formattedDate}</div>
                    <div class="timeline-title">${this.escapeHtml(e.title)}</div>
                    <div class="timeline-desc">${this.escapeHtml(e.description || '')}</div>
                `;
                list.appendChild(item);
            });
            
        } catch (err) {
            console.error('Load timeline error:', err);
            if (list) list.innerHTML = '<div style="color:var(--cyber-red);">Error loading timeline</div>';
        }
    },
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    async add() {
        const date = prompt('تاریخ (YYYY-MM-DD):');
        if (!date) return;
        
        // اعتبارسنجی تاریخ
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            alert('❌ تاریخ نامعتبر');
            return;
        }
        
        const title = prompt('عنوان خاطره:');
        if (!title) return;
        
        const description = prompt('توضیحات (اختیاری):') || '';
        
        try {
            await API.addTimelineEvent({ date, title, description });
            this.loadTimeline();
            alert('✓ خاطره اضافه شد');
        } catch (err) {
            alert('✗ خطا: ' + err.message);
        }
    }
};

