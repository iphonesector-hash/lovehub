const Wishes = {
    async init() {
        await this.loadWishes();
    },
    
    async loadWishes() {
        const list = document.getElementById('wishes-list');
        const statsEl = document.getElementById('wishes-stats');
        
        if (!list) return;
        
        try {
            const data = await API.getWishes();
            const wishes = data.wishes || [];
            
            list.innerHTML = '';
            
            if (wishes.length === 0) {
                list.innerHTML = '<div style="color:#666; font-size:0.8rem; padding:10px; text-align:center;">No wishes yet. Add your first wish! ✨</div>';
            } else {
                wishes.forEach(w => {
                    const item = document.createElement('div');
                    item.className = `wish-item ${w.is_completed ? 'done' : ''}`;
                    item.onclick = () => this.toggle(w.id);
                    item.innerHTML = `
                        <div class="wish-check">${w.is_completed ? '✓' : ''}</div>
                        <span class="wish-text" style="flex:1;">${this.escapeHtml(w.text)}</span>
                    `;
                    list.appendChild(item);
                });
            }
            
            if (statsEl) {
                const completed = wishes.filter(w => w.is_completed).length;
                const total = wishes.length;
                const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
                statsEl.innerHTML = `
                    <div style="color:var(--cyber-cyan); margin-bottom:8px; letter-spacing:1px;">PROGRESS: ${percent}%</div>
                    <div class="progress-bar"><div class="progress-fill" style="width:${percent}%;"></div></div>
                    <div style="color:#666; font-size:0.8rem; margin-top:8px;">${completed}/${total} COMPLETED</div>
                `;
            }
            
        } catch (err) {
            console.error('Load wishes error:', err);
            if (list) list.innerHTML = '<div style="color:var(--cyber-red);">Error loading wishes</div>';
        }
    },
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    async add() {
        const input = document.getElementById('new-wish');
        if (!input || !input.value.trim()) return;
        
        const text = input.value.trim();
        input.value = '';
        
        try {
            await API.addWish(text);
            this.loadWishes();
        } catch (err) {
            alert('✗ خطا: ' + err.message);
        }
    },
    
    async toggle(id) {
        try {
            await API.toggleWish(id);
            this.loadWishes();
        } catch (err) {
            console.error('Toggle error:', err);
        }
    }
};

