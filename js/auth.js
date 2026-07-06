const bootMessages = [
    '[ OK ] Initializing LOVEHUB kernel...',
    '[ OK ] Loading encryption modules...',
    '[ OK ] Mounting secure filesystem...',
    '[ OK ] Starting network services...',
    '[ OK ] Establishing secure tunnel...',
    '[ OK ] Verifying system integrity...',
    '[ OK ] Loading user database...',
    '[ OK ] Decrypting memory banks...',
    '[ OK ] Initializing AI core (SECTOR)...',
    '[ OK ] System ready. Awaiting authentication...'
];

async function bootSequence() {
    const log = document.getElementById('boot-log');
    const container = document.getElementById('login-container');
    const boot = document.querySelector('.boot-sequence');
    
    if (!log) return;
    
    for (let i = 0; i < bootMessages.length; i++) {
        await new Promise(r => setTimeout(r, 150));
        const line = document.createElement('div');
        line.textContent = bootMessages[i];
        line.style.animationDelay = '0s';
        log.appendChild(line);
    }
    
    await new Promise(r => setTimeout(r, 500));
    if (boot) boot.classList.add('hide');
    setTimeout(() => {
        if (boot) boot.style.display = 'none';
        if (container) container.style.display = 'block';
    }, 500);
}

function updateTime() {
    const el = document.getElementById('live-time');
    if (el) {
        const now = new Date();
        el.textContent = now.toLocaleTimeString('en-US', { hour12: false });
    }
}

setInterval(updateTime, 1000);
updateTime();

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const errorEl = document.getElementById('login-error');
            const btn = e.target.querySelector('button');
            
            if (errorEl) errorEl.style.display = 'none';
            if (btn) {
                btn.classList.add('loading');
                btn.disabled = true;
            }
            
            try {
                const data = await API.login(username, password);
                
                if (data.success) {
                    API.setToken(data.token);
                    localStorage.setItem('lovehub_user', JSON.stringify(data.user));
                    
                    if (btn) btn.innerHTML = '<span style="color:var(--cyber-green)">✓ ACCESS GRANTED</span>';
                    await new Promise(r => setTimeout(r, 800));
                    
                    window.location.href = '/app';
                }
            } catch (err) {
                if (errorEl) errorEl.style.display = 'block';
                if (btn) {
                    btn.classList.remove('loading');
                    btn.disabled = false;
                }
                
                if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            }
        });
    }
    
    if (API.getToken()) {
        window.location.href = '/app';
    }
    
    bootSequence();
});

