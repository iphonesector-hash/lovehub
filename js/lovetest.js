const LoveTest = {
    questions: [
        {
            q: 'کدوم بیشتر خوشحالت می‌کنه؟',
            options: [
                { text: '🎁 دریافت هدیه غیرمنتظره', type: 'gifts' },
                { text: '💬 شنیدن "دوستت دارم"', type: 'words' },
                { text: '🤗 یه بغل طولانی', type: 'touch' },
                { text: '⏰ وقت گذروندن با هم', type: 'time' },
                { text: '🤝 کمک در کارهای خونه', type: 'acts' }
            ]
        },
        {
            q: 'وقتی ناراحتی، چی آرومت می‌کنه؟',
            options: [
                { text: '🌹 یه دسته گل', type: 'gifts' },
                { text: '📝 یه نامه محبت‌آمیز', type: 'words' },
                { text: '💆 ماساژ شانه‌ها', type: 'touch' },
                { text: '🎬 یه فیلم دیدن با هم', type: 'time' },
                { text: '🍳 درست کردن چای برات', type: 'acts' }
            ]
        },
        {
            q: 'تولد دوست‌داشتنی‌ترین حالت چطوریه؟',
            options: [
                { text: '🎁 یه هدیه خاص و گرون', type: 'gifts' },
                { text: '💌 یه نامه عاشقانه بلند', type: 'words' },
                { text: '💑 تمام روز با هم بودن', type: 'touch' },
                { text: '🎉 یه مهمونی دونفره', type: 'time' },
                { text: '🏠 خونه رو برات تمیز کنم', type: 'acts' }
            ]
        },
        {
            q: 'کدوم بیشتر بهت حس عشق می‌ده؟',
            options: [
                { text: '💍 یه حلقه یا جواهر', type: 'gifts' },
                { text: '📱 پیام‌های عاشقانه روزانه', type: 'words' },
                { text: '👫 دست گرفتن موقع راه رفتن', type: 'touch' },
                { text: '🌅 تماشای غروب با هم', type: 'time' },
                { text: '🚗 آوردنت از سر کار', type: 'acts' }
            ]
        },
        {
            q: 'وقتی از هم دورید، چی دلتنگت می‌کنه؟',
            options: [
                { text: '📦 بسته پستی از طرفش', type: 'gifts' },
                { text: '📞 تماس تصویری طولانی', type: 'words' },
                { text: '🧸 چیزی که بوش رو بده', type: 'touch' },
                { text: '📅 برنامه‌ریزی برای دیدار بعدی', type: 'time' },
                { text: '🛒 خرید چیزایی که دوست داری', type: 'acts' }
            ]
        }
    ],
    
    currentQ: 0,
    answers: { gifts: 0, words: 0, touch: 0, time: 0, acts: 0 },
    
    init() {
        this.currentQ = 0;
        this.answers = { gifts: 0, words: 0, touch: 0, time: 0, acts: 0 };
        
        const resultEl = document.getElementById('test-result');
        if (resultEl) resultEl.style.display = 'none';
        
        this.renderQuestion();
    },
    
    renderQuestion() {
        const qEl = document.getElementById('test-question');
        const optEl = document.getElementById('test-options');
        const progEl = document.getElementById('test-progress');
        const counterEl = document.getElementById('test-counter');
        
        if (!qEl || !optEl) return;
        
        if (this.currentQ >= this.questions.length) {
            this.showResult();
            return;
        }
        
        const q = this.questions[this.currentQ];
        
        qEl.textContent = q.q;
        optEl.innerHTML = q.options.map(opt => `
            <button onclick="LoveTest.answer('${opt.type}')">${opt.text}</button>
        `).join('');
        
        if (progEl) progEl.style.width = `${(this.currentQ / this.questions.length) * 100}%`;
        if (counterEl) counterEl.textContent = `سوال ${this.currentQ + 1} از ${this.questions.length}`;
    },
    
    answer(type) {
        this.answers[type]++;
        this.currentQ++;
        this.renderQuestion();
    },
    
    async showResult() {
        const resultEl = document.getElementById('test-result');
        const progEl = document.getElementById('test-progress');
        
        if (!resultEl) return;
        
        const max = Math.max(...Object.values(this.answers));
        const winner = Object.keys(this.answers).find(k => this.answers[k] === max);
        
        const descriptions = {
            gifts: { 
                name: '🎁 هدیه گرفتن', 
                desc: 'تو با هدیه‌های کوچک و سورپرایزها احساس عشق می‌کنی. یادته آخرین باری که یه شاخه گل خریدی؟',
                tip: '💡 پیشنهاد: هر هفته یه سورپرایز کوچیک برای پارتنرت آماده کن.'
            },
            words: { 
                name: '💬 کلمات محبت‌آمیز', 
                desc: 'تو با کلمات عاشقانه و تعریف‌ها احساس ارزشمندی می‌کنی. هر روز یه چیز قشنگ به هم بگید!',
                tip: '💡 پیشنهاد: یه نامه عاشقانه بنویس و فردا بهش بده.'
            },
            touch: { 
                name: '🤗 تماس فیزیکی', 
                desc: 'تو با بغل، بوسه و دست گرفتن احساس نزدیکی می‌کنی. لمس فیزیکی برات خیلی مهمه.',
                tip: '💡 پیشنهاد: از بخش "لمس زنده" استفاده کن و ضربان قلبت رو بفرست!'
            },
            time: { 
                name: '⏰ وقت گذروندن', 
                desc: 'تو با حضور کامل و توجه پارتنرت احساس عشق می‌کنی. وقت دونفره برات طلاست!',
                tip: '💡 پیشنهاد: امشب گوشی‌ها رو بذار کنار و یه فیلم با هم ببینید.'
            },
            acts: { 
                name: '🤝 خدمات و کمک', 
                desc: 'تو با کارهای عملی و کمک کردن احساس عشق می‌کنی. کارهای کوچک روزانه برات معنی داره.',
                tip: '💡 پیشنهاد: یه کاری که پارتنرت ازش متنفره رو براش انجام بده.'
            }
        };
        
        const w = descriptions[winner];
        
        // محاسبه درصد هر زبان
        const total = Object.values(this.answers).reduce((a, b) => a + b, 0);
        const percentages = {};
        for (let key in this.answers) {
            percentages[key] = total > 0 ? Math.round((this.answers[key] / total) * 100) : 0;
        }
        
        resultEl.style.display = 'block';
        resultEl.innerHTML = `
            <div style="text-align:center;">
                <div style="font-size:3rem; margin-bottom:10px;">💕</div>
                <div style="font-weight:700; font-size:1.1rem; color:var(--cyber-pink); margin-bottom:10px; letter-spacing:1px;">زبان عشق تو:</div>
                <div style="font-size:1.5rem; font-weight:900; color:var(--cyber-yellow); margin-bottom:15px; text-shadow:0 0 10px var(--cyber-yellow);">${w.name}</div>
                <div style="font-size:0.85rem; color:var(--cyber-green); line-height:1.6; margin-bottom:15px;">${w.desc}</div>
                <div style="font-size:0.85rem; color:var(--cyber-cyan); line-height:1.6; margin-bottom:20px; padding:10px; background:rgba(0,212,255,0.05); border-radius:8px;">${w.tip}</div>
                
                <div style="text-align:right; font-size:0.75rem; color:#666; margin-bottom:10px; letter-spacing:1px;">توزیع زبان‌های عشق:</div>
                ${Object.keys(percentages).map(key => `
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:5px;">
                        <div style="width:80px; font-size:0.7rem; color:var(--cyber-cyan);">${descriptions[key].name.split(' ')[0]}</div>
                        <div style="flex:1; height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;">
                            <div style="width:${percentages[key]}%; height:100%; background:linear-gradient(90deg, var(--cyber-pink), var(--cyber-cyan));"></div>
                        </div>
                        <div style="width:35px; font-size:0.7rem; color:var(--cyber-green); text-align:left;">${percentages[key]}%</div>
                    </div>
                `).join('')}
                
                <button class="cyber-btn" style="margin-top:20px; font-size:0.8rem;" onclick="LoveTest.init()">🔄 شروع مجدد</button>
            </div>
        `;
        
        if (progEl) progEl.style.width = '100%';
        
        try {
            await API.saveLoveTest(winner);
        } catch (err) {
            console.error('Save love test error:', err);
        }
    }
};

