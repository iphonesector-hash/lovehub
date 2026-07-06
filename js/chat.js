const Chat = {
    autoReplies: [
        '❤️ عاشقتم!',
        '🌹 خیلی خوشحالم باهات',
        '💕 دلم برات تنگ شده',
        '✨ زندگیمی!',
        '🥰 بهترین اتفاق زندگیمی',
        '💖 همیشه کنارتم',
        '🌟 تو همه دنیای منی'
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
            
            if (data.messages.length === 0) {
                const welcome = document.createElement('div');
                welcome.className = 'chat-bubble msg-partner';
                welcome.textContent = 'سلام عشقم! 🌹 کلبه رویاییمون آماده‌ست...';
                chatBox.appendChild(welcome);
                return;
            }
            
            const currentUserId = JSON.parse(localStorage.getItem('lovehub_user')).id;
            
            data.messages.forEach(msg => {
                const bubble = document.createElement('div');
                bubble.className = `chat-bubble ${msg.sender_id === currentUserId ? 'msg-me' : 'msg-partner'}`;
                bubble.textContent = msg.message;
                chatBox.appendChild(bubble);
            });
            
            chatBox.scrollTop = chatBox.scrollHeight;
        } catch (err) {
            console.error('Load chat error:', err);
        }
    },
    
    async send() {
        const input = document.getElementById('chat-input');
        if (!input || !input.value.trim()) return;
        
        const message = input.value.trim();
        input.value = '';
        
        // نمایش پیام خودمون
        const chatBox = document.getElementById('chat-box');
        const myMsg = document.createElement('div');
        myMsg.className = 'chat-bubble msg-me';
        myMsg.textContent = message;
        chatBox.appendChild(myMsg);
        chatBox.scrollTop = chatBox.scrollHeight;
        
        try {
            await API.sendMessage(message);
            
            // پاسخ خودکار پارتنر (شبیه‌سازی)
            setTimeout(() => {
                const reply = document.createElement('div');
                reply.className = 'chat-bubble msg-partner';
                reply.textContent = this.autoReplies[Math.floor(Math.random() * this.autoReplies.length)];
                chatBox.appendChild(reply);
                chatBox.scrollTop = chatBox.scrollHeight;
            }, 1500);
        } catch (err) {
            console.error('Send error:', err);
        }
    }
};

