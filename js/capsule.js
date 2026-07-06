const Capsule = {
    async init() {
        await this.loadCapsules();
    },
    
    async loadCapsules() {
        const list = document.getElementById('capsule-list');
        const statusEl = document.getElementById('capsule-status');
        const progressEl = document.getElementById('capsule-progress');
        
        if (!list) return;
        
        try {
            const data = await API.getCapsules();
            const capsules = data.capsules || [];
            
            list.innerHTML = '';
            
            if (capsules.length === 0) {
                if (statusEl) statusEl.innerHTML = 'هنوز کپسولی نساختی!<br>اولین پیام رو برای آینده بنویس 💝';
                if (progressEl) progressEl.style.width = '0%';
                return;
            }
            
            const now = Date.now();
            const nextLocked = capsules.find(c => new Date(c.unlock_time).getTime() > now);
            
            if (nextLocked && statusEl && progressEl) {
                const total = new Date(nextLocked.unlock_time).getTime() - new Date(nextLocked.created_at).getTime();
                const passed = now - new Date(nextLocked.created_at).getTime();
                const percent = Math.min(100, Math.max(0, (passed / total) * 100));
                const daysLeft = Math.ceil((new Date(nextLocked.unlock_time).getTime() - now) / (1000 * 60 * 60 * 24));
                
                statusEl.innerHTML = `پیام ذخیره شده<br><span style="color:var(--cyber-pink); font-weight:700;">${daysLeft} روز</span> باقی‌مانده`;
                progressEl.style.width = percent + '%';
            } else if (statusEl) {
                statusEl.innerHTML = 'همه کپسول‌ها باز شدن! 🎉';
                if (progressEl) progressEl.style.width = '100%';
            }
            
            capsules.forEach(c => {
                const unlockTime = new Date(c.unlock_time).getTime();
                const unlocked = now >= unlockTime;
                
                const item = document.createElement('div');
                item.className = `capsule-item ${unlocked ? '' : 'locked'}`;
                
                if (unlocked) {
                    item.innerHTML = `
                        <div style="font-weight:700; color:var(--cyber-yellow); margin-bottom:5px;">💌 باز شده!</div>
                        <div style="font-size:0.85rem; color:var(--cyber-green); line-height:1.6;">${this.escapeHtml(c.message)}</div>
                        <div style="font-size:0.7rem; color:#666; margin-top:8px;">نوشته شده: ${new Date(c.created_at).toLocaleDateString('fa-IR')}</div>
                    `;
                } else {
                    const daysLeft = Math.ceil((unlockTime - now) / (1000 * 60 * 60 * 24));
                    item.innerHTML = `
                        <div style="font-weight:700; color:var(--cyber-cyan); margin-bottom:5px;">🔒 قفل تا ${new Date(c.unlock_time).toLocaleDateString('fa-IR')}</div>
                        <div style="font-size:0.8rem; color:#666;">${daysLeft} روز باقی‌مانده</div>
                        <div style="font-size:0.75rem; color:#666; margin-top:5px;">${this.escapeHtml(c.message).substring(0, 30)}...</div>
                    `;
                }
                list.appendChild(item);
            });
            
        } catch (err) {
            console.error('Load capsules error:', err);
            if (list) list.innerHTML = '<div style="color:var(--cyber-red);">Error loading capsules</div>';
        }
    },
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    async save() {
        const message = document.getElementById('capsule-message').value.trim();
        const date = document.getElementById('capsule-date').value;
        
        if (!message) { alert('پیام رو بنویس!'); return; }
        if (!date) { alert('تاریخ رو انتخاب کن!'); return; }
        
        const unlockTime = new Date(date).getTime();
        if (unlockTime <= Date.now()) {
            alert('تاریخ باید در آینده باشه!');
            return;
        }
        
        try {
            await API.addCapsule({
                message,
                unlock_time: new Date(date).toISOString()
            });
            document.getElementById('capsule-message').value = '';
            document.getElementById('capsule-date').value = '';
            alert('✓ کپسول ذخیره شد');
            this.loadCapsules();
        } catch (err) {
            alert('✗ خطا: ' + err.message);
        }
    }
};

