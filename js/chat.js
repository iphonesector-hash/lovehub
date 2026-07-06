const Chat = {
    autoReplies: [
        '❤️ عاشقتم!',
        '🌹 خیلی خوشحالم باهات',
        '💕 دلم برات تنگ شده',
        '✨ زندگیمی!',
        '🥰 بهترین اتفاق زندگیمی',
        '💖 همیشه کنارتم',
        '🌟 تو همه دنیای منی',
        '😘 می‌بوسمت',
        '🤗 کاش الان پیشت بودم',
        '💫 هر روز بیشتر دوستت دارم'
    ],
    
    async init() {
        await this.loadMessages();
    },
    
    async loadMessages() {
        const chatBox = document.getElementById('chat-box');
        if (!chatBox) return;
        
        try {
            const data = await API.getChat();
            chatBox.innerHTML = '';
            
            if (!data.messages || data.messages.length === 0) {
                const welcome = document.createElement('div');
                welcome.className = 'chat-bubble msg-partner';
                welcome.textContent = 'سلام عشقم! 🌹 کلبه رویاییمون آماده‌ست...';
                chatBox.appendChild(welcome);
                return;
            }
            
            const user = JSON.parse(localStorage.getItem('lovehub_user') || '{}');
            const currentUserId = user.id;
            
            data.messages.forEach(msg => {
                const bubble = document.createElement('div');
                bubble.className = `chat-bubble ${msg.sender_id === currentUserId ? 'msg-me' : 'msg-partner'}`;
                bubble.textContent = msg.message;
                chatBox.appendChild(bubble);
            });
            
            chatBox.scrollTop = chatBox.scrollHeight;
            
            const msgCount = document.getElementById('msg-count');
            if (msgCount) msgCount.textContent = data.messages.length;
            
        } catch (err) {
            console.error('Load chat error:', err);
        }
    },
    
    async send() {
        const input = document.getElementById('chat-input');
        if (!input || !input.value.trim()) return;
        
        const message = input.value.trim();
        input.value = '';
        
        const chatBox = document.getElementById('chat-box');
        const myMsg = document.createElement('div');
        myMsg.className = 'chat-bubble msg-me';
        myMsg.textContent = message;
        chatBox.appendChild(myMsg);
        chatBox.scrollTop = chatBox.scrollHeight;
        
        try {
            await API.sendMessage(message);
            
            setTimeout(() => {
                const reply = document.createElement('div');
                reply.className = 'chat-bubble msg-partner';
                reply.textContent = this.autoReplies[Math.floor(Math.random() * this.autoReplies.length)];
                chatBox.appendChild(reply);
                chatBox.scrollTop = chatBox.scrollHeight;
            }, 1500);
        } catch (err) {
            console.error('Send error:', err);
            const errMsg = document.createElement('div');
            errMsg.className = 'chat-bubble msg-partner';
            errMsg.style.color = 'var(--cyber-red)';
            errMsg.textContent = '⚠️ خطا در ارسال پیام';
            chatBox.appendChild(errMsg);
        }
    }
};

