// Boot sequence
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
    
    for (let i = 0; i < bootMessages.length; i++) {
        await new Promise(r => setTimeout(r, 150));
        const line = document.createElement('div');
        line.textContent = bootMessages[i];
        line.style.animationDelay = '0s';
        log.appendChild(line);
    }
    
    await new Promise(r => setTimeout(r, 500));
    boot.classList.add('hide');
    setTimeout(() => {
        boot.style.display = 'none';
        container.style.display = 'block';
    }, 500);
}

// Live time
function updateTime() {
    const el = document.getElementById('live-time');
    if (el) {
        const now = new Date();
        el.textContent = now.toLocaleTimeString('en-US', { hour12: false });
    }
}
setInterval(updateTime, 1000);
updateTime();

// Login form
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');
    const btn = e.target.querySelector('button');
    
    errorEl.style.display = 'none';
    btn.classList.add('loading');
    btn.disabled = true;
    
    try {
        const data = await API.login(username, password);
        
        if (data.success) {
            API.setToken(data.token);
            localStorage.setItem('lovehub_user', JSON.stringify(data.user));
            
            // افکت موفقیت
            btn.innerHTML = '<span style="color:var(--cyber-green)">✓ ACCESS GRANTED</span>';
            await new Promise(r => setTimeout(r, 800));
            
            window.location.href = 'app.html';
        }
    } catch (err) {
        errorEl.style.display = 'block';
        btn.classList.remove('loading');
        btn.disabled = false;
        
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
});

// Auto-login check
if (API.getToken()) {
    // اگه توکن داریم، مستقیم برو به app
    window.location.href = 'app.html';
}

// Start boot
bootSequence();

