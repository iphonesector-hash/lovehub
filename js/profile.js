const Profile = {
    open() {
        const modal = document.getElementById('profile-modal');
        const body = document.getElementById('profile-body');
        
        const u = App.user;
        const age = u.birth_date ? this.calcAge(u.birth_date) : '--';
        
        body.innerHTML = `
            <div class="profile-avatar">${(u.display_name || u.username || '?')[0].toUpperCase()}</div>
            
            <div class="section-title">> PERSONAL_INFO</div>
            
            <div class="profile-field">
                <label>DISPLAY_NAME:</label>
                <input type="text" id="pf-display" value="${u.display_name || ''}">
            </div>
            
            <div class="profile-field">
                <label>NICKNAME:</label>
                <input type="text" id="pf-nick" value="${u.nickname || ''}">
            </div>
            
            <div class="profile-field">
                <label>BIRTH_DATE:</label>
                <input type="date" id="pf-birth" value="${u.birth_date || ''}">
            </div>
            
            <div class="profile-field">
                <label>AGE: <span style="color:var(--cyber-yellow)">${age}</span></label>
            </div>
            
            <div class="profile-field">
                <label>GENDER:</label>
                <select id="pf-gender">
                    <option value="">--SELECT--</option>
                    <option value="male" ${u.gender==='male'?'selected':''}>MALE</option>
                    <option value="female" ${u.gender==='female'?'selected':''}>FEMALE</option>
                    <option value="other" ${u.gender==='other'?'selected':''}>OTHER</option>
                </select>
            </div>
            
            <div class="profile-field">
                <label>HEIGHT (cm):</label>
                <input type="number" id="pf-height" value="${u.height_cm || ''}">
            </div>
            
            <div class="profile-field">
                <label>WEIGHT (kg):</label>
                <input type="number" step="0.1" id="pf-weight" value="${u.weight_kg || ''}">
            </div>
            
            <div class="profile-field">
                <label>BLOOD_TYPE:</label>
                <select id="pf-blood">
                    <option value="">--UNKNOWN--</option>
                    ${['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => 
                        `<option value="${b}" ${u.blood_type===b?'selected':''}>${b}</option>`
                    ).join('')}
                </select>
            </div>
            
            <div class="profile-field">
                <label>PHONE:</label>
                <input type="tel" id="pf-phone" value="${u.phone || ''}">
            </div>
            
            <div class="profile-field">
                <label>EMAIL:</label>
                <input type="email" id="pf-email" value="${u.email || ''}">
            </div>
            
            <div class="profile-field">
                <label>BIO:</label>
                <textarea id="pf-bio" rows="3">${u.bio || ''}</textarea>
            </div>
            
            <div class="section-title">> SECURITY</div>
            
            <div class="profile-field">
                <label>OLD_PASSWORD:</label>
                <input type="password" id="pf-old-pass" placeholder="•••••">
            </div>
            
            <div class="profile-field">
                <label>NEW_PASSWORD:</label>
                <input type="password" id="pf-new-pass" placeholder="•••••">
            </div>
            
            <div style="display:flex; gap:8px; margin-top:20px;">
                <button class="cyber-btn" onclick="Profile.save()" style="flex:1;">SAVE</button>
                <button class="cyber-btn pink" onclick="Profile.changePass()" style="flex:1;">CHANGE_PASS</button>
            </div>
        `;
        
        modal.classList.add('show');
    },
    
    calcAge(birthDate) {
        const birth = new Date(birthDate);
        const diff = Date.now() - birth.getTime();
        return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
    },
    
    async save() {
        const data = {
            display_name: document.getElementById('pf-display').value,
            nickname: document.getElementById('pf-nick').value,
            birth_date: document.getElementById('pf-birth').value || null,
            gender: document.getElementById('pf-gender').value || null,
            height_cm: document.getElementById('pf-height').value || null,
            weight_kg: document.getElementById('pf-weight').value || null,
            blood_type: document.getElementById('pf-blood').value || null,
            phone: document.getElementById('pf-phone').value,
            email: document.getElementById('pf-email').value,
            bio: document.getElementById('pf-bio').value
        };
        
        try {
            const res = await API.updateProfile(data);
            if (res.success) {
                App.user = res.user;
                localStorage.setItem('lovehub_user', JSON.stringify(res.user));
                document.getElementById('user-name').textContent = res.user.display_name || res.user.username;
                alert('✓ پروفایل ذخیره شد');
                App.closeProfile();
                Health.init(); // بروزرسانی بخش سلامت
            }
        } catch (err) {
            alert('✗ خطا: ' + err.message);
        }
    },
    
    async changePass() {
        const oldPass = document.getElementById('pf-old-pass').value;
        const newPass = document.getElementById('pf-new-pass').value;
        
        if (!oldPass || !newPass) {
            alert('هر دو فیلد رمز الزامی است');
            return;
        }
        if (newPass.length < 4) {
            alert('رمز جدید حداقل ۴ کاراکتر');
            return;
        }
        
        try {
            const res = await API.changePassword(oldPass, newPass);
            if (res.success) {
                alert('✓ رمز عبور تغییر کرد');
                document.getElementById('pf-old-pass').value = '';
                document.getElementById('pf-new-pass').value = '';
            }
        } catch (err) {
            alert('✗ ' + err.message);
        }
    }
};

