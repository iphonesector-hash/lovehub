const Sector = {
    init() {
        const stream = document.getElementById('sector-stream');
        if (stream && stream.children.length === 0) {
            const welcome = document.createElement('div');
            welcome.className = 'chat-bubble msg-sector';
            welcome.textContent = '🔮 SECTOR ONLINE. چطور می‌تونم کمکتون کنم؟';
            stream.appendChild(welcome);
        }
    },
    
    async ask() {
        const input = document.getElementById('sec-input');
        const stream = document.getElementById('sector-stream');
        const eye = document.getElementById('sec-eye');
        
        if (!input || !input.value.trim()) return;
        
        const userMsg = document.createElement('div');
        userMsg.className = 'chat-bubble msg-me';
        userMsg.textContent = input.value;
        stream.appendChild(userMsg);
        
        const question = input.value;
        input.value = '';
        stream.scrollTop = stream.scrollHeight;
        
        if (eye) eye.classList.add('thinking');
        
        try {
            const data = await API.querySector(question);
            if (eye) eye.classList.remove('thinking');
            
            const aiMsg = document.createElement('div');
            aiMsg.className = 'chat-bubble msg-sector';
            aiMsg.textContent = data.reply || 'پاسخی دریافت نشد';
            stream.appendChild(aiMsg);
            stream.scrollTop = stream.scrollHeight;
        } catch (err) {
            if (eye) eye.classList.remove('thinking');
            const errMsg = document.createElement('div');
            errMsg.className = 'chat-bubble msg-sector';
            errMsg.textContent = '⚠️ SECTOR OFFLINE. Try again later.';
            stream.appendChild(errMsg);
        }
    }
};

