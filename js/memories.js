const Memories = {
    canvas: null,
    ctx: null,
    drawing: false,
    
    async init() {
        await this.loadMedia();
    },
    
    async loadMedia() {
        const grid = document.getElementById('media-grid');
        if (!grid) return;
        
        try {
            const data = await API.getMemories();
            const memories = data.memories || [];
            
            grid.innerHTML = '';
            
            if (memories.length === 0) {
                const samples = ['🎬 ویدیو', '🌅 عکس ۱', '🌌 عکس ۲', '🎂 تولد', '💑 دونفره', '🏖️ سفر'];
                samples.forEach(s => {
                    const item = document.createElement('div');
                    item.className = 'memory-item';
                    item.innerHTML = `<span style="color:var(--cyber-cyan); font-size:0.7rem;">${s}</span>`;
                    grid.appendChild(item);
                });
            } else {
                memories.forEach(m => {
                    const item = document.createElement('div');
                    item.className = 'memory-item';
                    if (m.type === 'image' && m.data) {
                        item.innerHTML = `<img src="${m.data}" alt="خاطره">`;
                    } else {
                        item.innerHTML = `<span style="color:var(--cyber-cyan); font-size:0.7rem;">${m.caption || m.type}</span>`;
                    }
                    grid.appendChild(item);
                });
            }
        } catch (err) {
            console.error('Load media error:', err);
            if (grid) grid.innerHTML = '<div style="color:var(--cyber-red); padding:10px; font-size:0.8rem;">Error loading memories</div>';
        }
    },
    
    async add() {
        const caption = prompt('عنوان خاطره:');
        if (!caption) return;
        
        try {
            await API.addMemory({ type: 'text', caption, data: '' });
            this.loadMedia();
            alert('✓ خاطره اضافه شد');
        } catch (err) {
            alert('✗ خطا: ' + err.message);
        }
    },
    
    initCanvas() {
        const canvas = document.getElementById('paintCanvas');
        if (!canvas) return;
        
        // اگر canvas قبلاً setup شده، فقط reload کن
        if (this.canvas === canvas && this.ctx) {
            return;
        }
        
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        
        this.ctx.strokeStyle = '#00ff41';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#00ff41';
        
        // بارگذاری نقاشی ذخیره شده
        const saved = localStorage.getItem('lovehub_canvas');
        if (saved) {
            const img = new Image();
            img.onload = () => this.ctx.drawImage(img, 0, 0);
            img.src = saved;
        }
        
        // جلوگیری از اضافه شدن event listener های تکراری
        if (!canvas.dataset.initialized) {
            canvas.addEventListener('mousedown', (e) => this.startDraw(e));
            canvas.addEventListener('mousemove', (e) => this.draw(e));
            canvas.addEventListener('mouseup', () => this.endDraw());
            canvas.addEventListener('mouseleave', () => this.endDraw());
            canvas.addEventListener('touchstart', (e) => { this.startDraw(e.touches[0]); e.preventDefault(); });
            canvas.addEventListener('touchmove', (e) => { this.draw(e.touches[0]); e.preventDefault(); });
            canvas.addEventListener('touchend', () => this.endDraw());
            canvas.dataset.initialized = 'true';
        }
    },
    
    startDraw(e) {
        if (!this.ctx) return;
        this.drawing = true;
        const rect = this.canvas.getBoundingClientRect();
        this.ctx.beginPath();
        this.ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    },
    
    draw(e) {
        if (!this.drawing || !this.ctx) return;
        const rect = this.canvas.getBoundingClientRect();
        this.ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        this.ctx.stroke();
    },
    
    endDraw() {
        this.drawing = false;
    },
    
    clearCanvas() {
        if (!this.ctx || !this.canvas) return;
        if (confirm('مطمئنی می‌خوای نقاشی رو پاک کنی؟')) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            localStorage.removeItem('lovehub_canvas');
        }
    },
    
    saveCanvas() {
        if (!this.canvas) return;
        const data = this.canvas.toDataURL();
        localStorage.setItem('lovehub_canvas', data);
        alert('✓ نقاشی ذخیره شد');
    }
};

