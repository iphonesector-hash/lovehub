const Games = {
    current: null,
    
    async init() {
        await this.loadStats();
    },
    
    open(gameId) {
        this.current = gameId;
        
        if (gameId === 'tod') {
            document.getElementById('tod-overlay').classList.add('show');
            return;
        }
        
        const overlay = document.getElementById('game-overlay');
        overlay.classList.add('show');
        
        switch(gameId) {
            case 'tictactoe': TicTacToe.init(); break;
            case 'memory': MemoryGame.init(); break;
            case 'rps': RPS.init(); break;
            case 'reaction': Reaction.init(); break;
            case 'guess': GuessNumber.init(); break;
            case 'dice': Dice.init(); break;
            case '2048': Game2048.init(); break;
        }
    },
    
    close() {
        document.getElementById('game-overlay').classList.remove('show');
        document.getElementById('game-content').innerHTML = '';
        this.current = null;
    },
    
    async recordResult(game, result) {
        try {
            await API.updateGameStats(game, result);
            this.loadStats();
        } catch (err) {
            console.error('Record result error:', err);
        }
    },
    
    async loadStats() {
        const el = document.getElementById('game-stats-content');
        if (!el) return;
        
        try {
            const data = await API.getGameStats();
            const stats = data.stats || [];
            
            if (stats.length === 0) {
                el.innerHTML = '<div style="color:#666; font-size:0.8rem;">No games played yet</div>';
                return;
            }
            
            el.innerHTML = stats.map(s => `
                <div style="display:flex; justify-content:space-between; padding:8px; background:rgba(0,255,65,0.05); margin-bottom:5px; border-radius:6px;">
                    <span style="color:var(--cyber-cyan);">${s.game_type}</span>
                    <span>
                        <span style="color:var(--cyber-green);">W:${s.wins}</span> | 
                        <span style="color:var(--cyber-yellow);">D:${s.draws}</span> | 
                        <span style="color:var(--cyber-pink);">L:${s.losses}</span>
                    </span>
                </div>
            `).join('');
        } catch (err) {
            el.innerHTML = '<div style="color:var(--cyber-red);">Error loading stats</div>';
        }
    }
};

// ============ بازی واکنش سریع ============
const Reaction = {
    startTime: 0,
    timer: null,
    state: 'waiting',
    resultTime: 0,
    
    init() {
        document.getElementById('game-title').textContent = '⚡ REFLEX_TEST';
        this.state = 'waiting';
        this.render();
    },
    
    render() {
        const content = document.getElementById('game-content');
        let html = '';
        
        if (this.state === 'waiting') {
            html = `<div style="text-align:center; padding:40px 20px;">
                <div style="font-size:3rem; margin-bottom:20px;">⚡</div>
                <div style="color:var(--cyber-cyan); margin-bottom:20px;">READY YOUR FINGER</div>
                <button class="cyber-btn" onclick="Reaction.start()">START</button>
            </div>`;
        } else if (this.state === 'ready') {
            html = `<div onclick="Reaction.tooEarly()" style="text-align:center; padding:80px 20px; background:var(--cyber-red); min-height:300px; display:flex; align-items:center; justify-content:center; flex-direction:column; border-radius:10px; cursor:pointer;">
                <div style="font-size:2rem; color:white; font-weight:900;">WAIT FOR GREEN...</div>
                <div style="color:white; margin-top:10px;">DON'T CLICK YET!</div>
            </div>`;
        } else if (this.state === 'go') {
            html = `<div onclick="Reaction.click()" style="text-align:center; padding:80px 20px; background:var(--cyber-green); min-height:300px; display:flex; align-items:center; justify-content:center; flex-direction:column; border-radius:10px; cursor:pointer;">
                <div style="font-size:3rem; color:black; font-weight:900;">CLICK NOW!</div>
            </div>`;
        } else if (this.state === 'result') {
            const time = this.resultTime;
            let rating = '🐢 SLOW', color = 'var(--cyber-pink)';
            if (time < 200) { rating = '⚡ SUPERHUMAN'; color = 'var(--cyber-yellow)'; }
            else if (time < 250) { rating = '🚀 FAST'; color = 'var(--cyber-green)'; }
            else if (time < 350) { rating = '✓ GOOD'; color = 'var(--cyber-cyan)'; }
            
            html = `<div style="text-align:center; padding:40px 20px;">
                <div style="font-size:4rem; font-weight:900; color:${color}; text-shadow:0 0 20px ${color};">${time}ms</div>
                <div style="font-size:1.5rem; margin:20px 0; color:${color};">${rating}</div>
                <button class="cyber-btn" onclick="Reaction.init()">TRY AGAIN</button>
            </div>`;
        } else if (this.state === 'early') {
            html = `<div style="text-align:center; padding:40px 20px;">
                <div style="font-size:3rem; margin-bottom:20px;">⚠️</div>
                <div style="color:var(--cyber-red); font-size:1.2rem; margin-bottom:20px;">TOO EARLY!</div>
                <button class="cyber-btn" onclick="Reaction.init()">RETRY</button>
            </div>`;
        }
        
        content.innerHTML = html;
    },
    
    start() {
        this.state = 'ready';
        this.render();
        const delay = 1500 + Math.random() * 3000;
        this.timer = setTimeout(() => {
            this.state = 'go';
            this.startTime = Date.now();
            this.render();
        }, delay);
    },
    
    click() {
        if (this.state !== 'go') return;
        this.resultTime = Date.now() - this.startTime;
        this.state = 'result';
        this.render();
        if (navigator.vibrate) navigator.vibrate(100);
        Games.recordResult('reaction', this.resultTime < 300 ? 'win' : 'loss');
    },
    
    tooEarly() {
        clearTimeout(this.timer);
        this.state = 'early';
        this.render();
    }
};

// ============ حدس عدد ============
const GuessNumber = {
    target: 0,
    attempts: 0,
    maxAttempts: 7,
    
    init() {
        document.getElementById('game-title').textContent = '🎯 GUESS_NUMBER';
        this.target = Math.floor(Math.random() * 100) + 1;
        this.attempts = 0;
        this.render('');
    },
    
    render(message) {
        const content = document.getElementById('game-content');
        content.innerHTML = `
            <div style="text-align:center; padding:20px;">
                <div style="color:var(--cyber-cyan); margin-bottom:15px;">GUESS 1-100</div>
                <div style="color:var(--cyber-yellow); margin-bottom:15px;">ATTEMPTS: ${this.attempts}/${this.maxAttempts}</div>
                ${message ? `<div style="padding:15px; background:rgba(0,255,65,0.1); border:1px solid var(--cyber-green); border-radius:8px; margin-bottom:15px; color:var(--cyber-green);">${message}</div>` : ''}
                <div style="display:flex; gap:8px; margin-bottom:15px;">
                    <input type="number" id="guess-input" class="cyber-input" min="1" max="100" placeholder="1-100" style="text-align:center;" onkeypress="if(event.key==='Enter')GuessNumber.guess()">
                    <button class="cyber-btn" onclick="GuessNumber.guess()">GUESS</button>
                </div>
                <button class="cyber-btn small cyan" onclick="GuessNumber.init()">NEW_GAME</button>
            </div>
        `;
        const input = document.getElementById('guess-input');
        if (input) input.focus();
    },
    
    guess() {
        const input = document.getElementById('guess-input');
        const num = parseInt(input.value);
        
        if (!num || num < 1 || num > 100) {
            this.render('⚠️ Enter number 1-100');
            return;
        }
        
        this.attempts++;
        
        if (num === this.target) {
            this.render(`🎉 CORRECT! You got it in ${this.attempts} attempts!`);
            Games.recordResult('guess', 'win');
            if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
        } else if (this.attempts >= this.maxAttempts) {
            this.render(`💀 GAME OVER! Number was ${this.target}`);
            Games.recordResult('guess', 'loss');
        } else {
            const hint = num < this.target ? '📈 HIGHER' : '📉 LOWER';
            this.render(`${hint} (remaining: ${this.maxAttempts - this.attempts})`);
        }
    }
};

// ============ تاس ============
const Dice = {
    init() {
        document.getElementById('game-title').textContent = '🎲 LUCKY_DICE';
        this.render(0, 0, '');
    },
    
    render(d1, d2, result) {
        const content = document.getElementById('game-content');
        const diceEmojis = ['⚀','⚁','⚂','⚃','⚄','⚅'];
        
        content.innerHTML = `
            <div style="text-align:center; padding:30px 20px;">
                <div style="display:flex; justify-content:center; gap:30px; margin:30px 0;">
                    <div style="font-size:5rem;">${d1 ? diceEmojis[d1-1] : '🎲'}</div>
                    <div style="font-size:5rem;">${d2 ? diceEmojis[d2-1] : '🎲'}</div>
                </div>
                ${d1 && d2 ? `
                    <div style="font-size:2rem; color:var(--cyber-yellow); margin:15px 0;">TOTAL: ${d1+d2}</div>
                    ${result ? `<div style="padding:15px; background:rgba(0,255,65,0.1); border:1px solid var(--cyber-green); border-radius:8px; color:var(--cyber-green);">${result}</div>` : ''}
                ` : ''}
                <button class="cyber-btn" onclick="Dice.roll()" style="margin-top:20px;">ROLL</button>
            </div>
        `;
    },
    
    roll() {
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        
        let result = '';
        if (d1 === d2) result = '🎉 DOUBLES!';
        else if (d1 + d2 === 7) result = '🍀 LUCKY SEVEN!';
        else if (d1 + d2 >= 10) result = '💎 HIGH ROLL!';
        
        this.render(d1, d2, result);
        if (navigator.vibrate) navigator.vibrate(100);
    }
};

// ============ بازی 2048 ============
const Game2048 = {
    grid: [],
    score: 0,
    
    init() {
        document.getElementById('game-title').textContent = '🔢 2048';
        this.grid = Array(16).fill(0);
        this.score = 0;
        this.addRandom();
        this.addRandom();
        this.render();
    },
    
    addRandom() {
        const empty = this.grid.map((v,i) => v===0?i:-1).filter(i=>i>=0);
        if (empty.length) {
            const idx = empty[Math.floor(Math.random()*empty.length)];
            this.grid[idx] = Math.random() < 0.9 ? 2 : 4;
        }
    },
    
    render() {
        const content = document.getElementById('game-content');
        const colors = {
            0: 'rgba(10,14,20,0.8)', 2: '#00ff41', 4: '#00d4ff', 8: '#ff006e',
            16: '#bc13fe', 32: '#ffd700', 64: '#ff003c',
            128: '#00ff41', 256: '#00d4ff', 512: '#ff006e',
            1024: '#bc13fe', 2048: '#ffd700'
        };
        
        content.innerHTML = `
            <div style="text-align:center; color:var(--cyber-yellow); font-size:1.5rem; margin-bottom:15px;">SCORE: ${this.score}</div>
            <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:6px; max-width:320px; margin:0 auto; padding:10px; background:rgba(0,0,0,0.5); border:1px solid var(--cyber-border); border-radius:10px;">
                ${this.grid.map(v => `
                    <div style="aspect-ratio:1; background:${colors[v]||'#ffd700'}; border-radius:6px; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:${v>100?'1rem':'1.3rem'}; color:${v?'black':'transparent'}; box-shadow:0 0 10px ${colors[v]||'transparent'};">
                        ${v||''}
                    </div>
                `).join('')}
            </div>
            <div style="display:grid; grid-template-columns:repeat(3,60px); gap:5px; justify-content:center; margin-top:20px;">
                <div></div>
                <button class="cyber-btn small" onclick="Game2048.move('up')">↑</button>
                <div></div>
                <button class="cyber-btn small" onclick="Game2048.move('left')">←</button>
                <button class="cyber-btn small pink" onclick="Game2048.init()">RESET</button>
                <button class="cyber-btn small" onclick="Game2048.move('right')">→</button>
                <div></div>
                <button class="cyber-btn small" onclick="Game2048.move('down')">↓</button>
                <div></div>
            </div>
        `;
    },
    
    move(dir) {
        let moved = false;
        
        const getRow = (r) => [this.grid[r*4], this.grid[r*4+1], this.grid[r*4+2], this.grid[r*4+3]];
        const setRow = (r, row) => {
            this.grid[r*4] = row[0]; this.grid[r*4+1] = row[1];
            this.grid[r*4+2] = row[2]; this.grid[r*4+3] = row[3];
        };
        
        const slide = (row) => {
            let arr = row.filter(v => v);
            for (let i = 0; i < arr.length - 1; i++) {
                if (arr[i] === arr[i+1]) {
                    arr[i] *= 2;
                    this.score += arr[i];
                    arr.splice(i+1, 1);
                }
            }
            while (arr.length < 4) arr.push(0);
            return arr;
        };
        
        if (dir === 'left') {
            for (let r = 0; r < 4; r++) {
                const oldRow = getRow(r);
                const newRow = slide(oldRow);
                if (JSON.stringify(newRow) !== JSON.stringify(oldRow)) moved = true;
                setRow(r, newRow);
            }
        } else if (dir === 'right') {
            for (let r = 0; r < 4; r++) {
                const oldRow = getRow(r);
                const newRow = slide(oldRow.slice().reverse()).reverse();
                if (JSON.stringify(newRow) !== JSON.stringify(oldRow)) moved = true;
                setRow(r, newRow);
            }
        } else if (dir === 'up') {
            for (let c = 0; c < 4; c++) {
                const col = [this.grid[c], this.grid[c+4], this.grid[c+8], this.grid[c+12]];
                const newCol = slide(col);
                if (JSON.stringify(newCol) !== JSON.stringify(col)) moved = true;
                this.grid[c] = newCol[0]; this.grid[c+4] = newCol[1];
                this.grid[c+8] = newCol[2]; this.grid[c+12] = newCol[3];
            }
        } else if (dir === 'down') {
            for (let c = 0; c < 4; c++) {
                const col = [this.grid[c], this.grid[c+4], this.grid[c+8], this.grid[c+12]];
                const newCol = slide(col.slice().reverse()).reverse();
                if (JSON.stringify(newCol) !== JSON.stringify(col)) moved = true;
                this.grid[c] = newCol[0]; this.grid[c+4] = newCol[1];
                this.grid[c+8] = newCol[2]; this.grid[c+12] = newCol[3];
            }
        }
        
        if (moved) {
            this.addRandom();
            this.render();
            if (navigator.vibrate) navigator.vibrate(30);
        }
    }
};

// ============ بازی دوز ============
const TicTacToe = {
    board: Array(9).fill(null),
    current: 'X',
    active: true,
    wins: [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]],
    
    init() {
        document.getElementById('game-title').textContent = '⭕ TIC_TAC_TOE';
        this.board = Array(9).fill(null);
        this.current = 'X';
        this.active = true;
        this.render();
    },
    
    render() {
        const content = document.getElementById('game-content');
        content.innerHTML = `
            <div style="text-align:center; color:var(--cyber-cyan); margin-bottom:15px;">
                TURN: ${this.current === 'X' ? '💙 POURYA (X)' : '💖 SARINA (O)'}
            </div>
            <div class="ttt-board">
                ${this.board.map((c,i) => `
                    <div class="ttt-cell ${c?c.toLowerCase():''}" onclick="TicTacToe.move(${i})">${c||''}</div>
                `).join('')}
            </div>
            <div style="text-align:center; margin-top:15px;">
                <button class="cyber-btn small" onclick="TicTacToe.init()">NEW_GAME</button>
            </div>
        `;
    },
    
    move(i) {
        if (!this.active || this.board[i]) return;
        this.board[i] = this.current;
        
        const winner = this.checkWin();
        if (winner) {
            this.active = false;
            this.render();
            setTimeout(() => {
                alert(`🎉 ${winner} WINS!`);
                Games.recordResult('tictactoe', winner === 'X' ? 'win' : 'loss');
            }, 100);
            return;
        }
        
        if (this.board.every(c => c)) {
            this.active = false;
            this.render();
            setTimeout(() => {
                alert('🤝 DRAW');
                Games.recordResult('tictactoe', 'draw');
            }, 100);
            return;
        }
        
        this.current = this.current === 'X' ? 'O' : 'X';
        this.render();
    },
    
    checkWin() {
        for (let p of this.wins) {
            const [a,b,c] = p;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                return this.board[a];
            }
        }
        return null;
    }
};

// ============ بازی حافظه ============
const MemoryGame = {
    emojis: ['💕','🌹','💖','💗','💘','💝','💞','💓'],
    cards: [],
    flipped: [],
    matched: [],
    moves: 0,
    
    init() {
        document.getElementById('game-title').textContent = '🧠 MEMORY';
        this.cards = [...this.emojis, ...this.emojis].sort(() => Math.random() - 0.5);
        this.flipped = [];
        this.matched = [];
        this.moves = 0;
        this.render();
    },
    
    render() {
        const content = document.getElementById('game-content');
        content.innerHTML = `
            <div style="display:flex; justify-content:space-around; margin-bottom:15px;">
                <div style="color:var(--cyber-pink);">MOVES: ${this.moves}</div>
                <div style="color:var(--cyber-cyan);">PAIRS: ${this.matched.length/2}/${this.emojis.length}</div>
            </div>
            <div class="memory-board">
                ${this.cards.map((e,i) => {
                    const isFlipped = this.flipped.includes(i) || this.matched.includes(i);
                    const isMatched = this.matched.includes(i);
                    return `<div class="memory-card ${isFlipped?'flipped':''} ${isMatched?'matched':''}" onclick="MemoryGame.flip(${i})">${isFlipped?e:'?'}</div>`;
                }).join('')}
            </div>
            <div style="text-align:center; margin-top:15px;">
                <button class="cyber-btn small" onclick="MemoryGame.init()">NEW_GAME</button>
            </div>
        `;
    },
    
    flip(i) {
        if (this.flipped.includes(i) || this.matched.includes(i) || this.flipped.length >= 2) return;
        this.flipped.push(i);
        this.render();
        
        if (this.flipped.length === 2) {
            this.moves++;
            setTimeout(() => {
                const [a,b] = this.flipped;
                if (this.cards[a] === this.cards[b]) {
                    this.matched.push(a, b);
                    if (this.matched.length === this.cards.length) {
                        setTimeout(() => {
                            alert(`🎉 DONE in ${this.moves} moves!`);
                            Games.recordResult('memory', 'win');
                        }, 300);
                    }
                }
                this.flipped = [];
                this.render();
            }, 800);
        }
    }
};

// ============ سنگ کاغذ قیچی ============
const RPS = {
    choices: ['rock','paper','scissors'],
    emojis: {rock:'✊', paper:'✋', scissors:'✌️'},
    player: null,
    ai: null,
    score: {p:0, a:0, d:0},
    
    init() {
        document.getElementById('game-title').textContent = '✊ RPS';
        this.player = null;
        this.ai = null;
        this.render();
    },
    
    render() {
        const content = document.getElementById('game-content');
        content.innerHTML = `
            <div style="text-align:center;">
                <div class="rps-choices">
                    ${this.choices.map(c => `
                        <div class="rps-btn ${this.player===c?'selected':''}" onclick="RPS.play('${c}')">${this.emojis[c]}</div>
                    `).join('')}
                </div>
                ${this.ai ? `
                    <div style="display:flex; justify-content:space-around; align-items:center; margin:20px 0; font-size:3rem;">
                        <div>${this.emojis[this.player]}</div>
                        <div style="color:var(--cyber-yellow);">⚔️</div>
                        <div>${this.emojis[this.ai]}</div>
                    </div>
                    <div style="text-align:center; font-size:1.2rem; color:var(--cyber-green);">${this.getResult()}</div>
                ` : ''}
                <div style="display:flex; justify-content:space-around; margin-top:20px; padding:15px; background:rgba(10,14,20,0.8); border-radius:10px;">
                    <div style="text-align:center;">
                        <div style="font-size:1.5rem; color:var(--cyber-pink); font-weight:900;">${this.score.p}</div>
                        <div style="font-size:0.7rem;">YOU</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:1.5rem; color:var(--cyber-yellow); font-weight:900;">${this.score.d}</div>
                        <div style="font-size:0.7rem;">DRAW</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:1.5rem; color:var(--cyber-cyan); font-weight:900;">${this.score.a}</div>
                        <div style="font-size:0.7rem;">AI</div>
                    </div>
                </div>
            </div>
        `;
    },
    
    play(c) {
        this.player = c;
        this.ai = this.choices[Math.floor(Math.random()*3)];
        
        if (this.player === this.ai) {
            this.score.d++;
            Games.recordResult('rps', 'draw');
        } else if (
            (this.player==='rock' && this.ai==='scissors') ||
            (this.player==='paper' && this.ai==='rock') ||
            (this.player==='scissors' && this.ai==='paper')
        ) {
            this.score.p++;
            Games.recordResult('rps', 'win');
        } else {
            this.score.a++;
            Games.recordResult('rps', 'loss');
        }
        
        if (navigator.vibrate) navigator.vibrate(50);
        this.render();
    },
    
    getResult() {
        if (this.player === this.ai) return '🤝 DRAW';
        if (
            (this.player==='rock' && this.ai==='scissors') ||
            (this.player==='paper' && this.ai==='rock') ||
            (this.player==='scissors' && this.ai==='paper')
        ) return '🎉 YOU WIN!';
        return '💀 AI WINS';
    }
};

// ============ جرئت یا حقیقت ============
const TruthDare = {
    truths: [
        'اولین باری که منو دیدی چه فکری کردی؟',
        'بزرگترین ترست چیه؟',
        'چه رازی داری که هیچکس نمی‌دونه؟',
        'آخرین باری که گریه کردی کی بود؟',
        'اگه یه ابرقدرت داشتی چی بود؟',
        'چه چیزی در مورد من بیشتر دوست داری؟',
        'بدترین خاطره‌ت چیه؟',
        'اولین باری که فهمیدی عاشقم شدی کی بود؟',
        'اگه فردا آخرین روز زندگیت باشه چیکار می‌کنی؟',
        'چه عادت بدی داری که می‌خوای ترک کنی؟',
        'خاطره‌انگیزترین لحظه‌مون چی بوده؟',
        'بهترین هدیه‌ای که گرفتی چی بوده؟',
        'چه آهنگی به من یادآورته؟',
        'اگه بتونی به هر جای دنیا سفر کنی کجا می‌ری؟',
        'چه چیزی هست که می‌خوای بگی ولی نمی‌تونی؟'
    ],
    dares: [
        'یه پیام صوتی عاشقانه بفرست',
        '۲ دقیقه چشماتو ببند و به من فکر کن',
        'یه عکس دونفره بگیر',
        '۱۰ دلیل که چرا منو دوست داری بگو',
        'یه شعر عاشقانه بخون',
        'یه وویس ۳۰ ثانیه‌ای بفرست',
        'یه نقاشی از من بکش',
        '۱ دقیقه بدون حرف زدن بهم نگاه کن',
        'یه خاطره خنده‌دار بگو',
        'یه آهنگ عاشقانه بفرست',
        '۵ چیزی که در مورد من دوست داری بگو',
        'یه نامه عاشقانه بنویس',
        'ادای منو در بیار',
        'یه راز بگو که هیچکس نمی‌دونه',
        'یه سورپرایز برای فردا برنامه‌ریزی کن'
    ],
    current: null,
    type: null,
    
    spin() {
        const bottle = document.getElementById('btl-obj');
        const txt = document.getElementById('tod-txt');
        const q = document.getElementById('tod-question');
        
        txt.textContent = 'SPINNING...';
        q.textContent = '';
        
        const rand = Math.floor(Math.random()*360) + 1440;
        const cur = parseFloat(bottle.dataset.angle || 0);
        bottle.dataset.angle = cur + rand;
        bottle.style.transform = `rotate(${cur+rand}deg)`;
        
        setTimeout(() => {
            const pos = (cur+rand) % 360;
            const person = pos < 180 ? '💖 SARINA' : '💙 POURYA';
            txt.textContent = `SELECTED: ${person}`;
            this.type = Math.random() > 0.5 ? 'truth' : 'dare';
            this.showQ();
        }, 4000);
    },
    
    showQ() {
        const q = document.getElementById('tod-question');
        const arr = this.type === 'truth' ? this.truths : this.dares;
        this.current = arr[Math.floor(Math.random()*arr.length)];
        const label = this.type === 'truth' ? '🔍 TRUTH' : '🔥 DARE';
        q.innerHTML = `<strong style="color:var(--cyber-cyan);">${label}:</strong><br>${this.current}`;
    },
    
    next() {
        this.type = this.type === 'truth' ? 'dare' : 'truth';
        this.showQ();
    },
    
    close() {
        document.getElementById('tod-overlay').classList.remove('show');
    }
};

