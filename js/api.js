const API = {
    baseUrl: '/api/',
    
    getToken() {
        return localStorage.getItem('lovehub_token');
    },
    
    setToken(token) {
        localStorage.setItem('lovehub_token', token);
    },
    
    clearToken() {
        localStorage.removeItem('lovehub_token');
        localStorage.removeItem('lovehub_user');
    },
    
    async request(endpoint, options = {}) {
        const url = this.baseUrl + endpoint;
        const token = this.getToken();
        
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
        
        try {
            const response = await fetch(url, {
                ...options,
                headers: { ...headers, ...options.headers }
            });
            
            const data = await response.json();
            
            if (response.status === 401) {
                this.clearToken();
                window.location.href = '/';
                throw new Error('Unauthorized');
            }
            
            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }
            
            return data;
        } catch (err) {
            console.error('API Error:', err);
            throw err;
        }
    },
    
    login(username, password) {
        return this.request('auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    },
    
    getMe() {
        return this.request('auth/me');
    },
    
    changePassword(oldPass, newPass) {
        return this.request('auth/change-password', {
            method: 'POST',
            body: JSON.stringify({ old_password: oldPass, new_password: newPass })
        });
    },
    
    updateProfile(data) {
        return this.request('profile', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    getChat() {
        return this.request('chat');
    },
    
    sendMessage(message) {
        return this.request('chat', {
            method: 'POST',
            body: JSON.stringify({ message })
        });
    },
    
    getWishes() {
        return this.request('wishes');
    },
    
    addWish(text) {
        return this.request('wishes', {
            method: 'POST',
            body: JSON.stringify({ text })
        });
    },
    
    toggleWish(id) {
        return this.request(`wishes/${id}/toggle`, {
            method: 'POST'
        });
    },
    
    getTimeline() {
        return this.request('timeline');
    },
    
    addTimelineEvent(data) {
        return this.request('timeline', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    getCapsules() {
        return this.request('capsules');
    },
    
    addCapsule(data) {
        return this.request('capsules', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    getMood() {
        return this.request('mood');
    },
    
    addMood(data) {
        return this.request('mood', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    getCycle() {
        return this.request('cycle');
    },
    
    updateCycle(data) {
        return this.request('cycle', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    getGameStats() {
        return this.request('game-stats');
    },
    
    updateGameStats(game, result) {
        return this.request('game-stats', {
            method: 'POST',
            body: JSON.stringify({ game, result })
        });
    },
    
    getMeditationStats() {
        return this.request('meditation');
    },
    
    completeMeditation(minutes) {
        return this.request('meditation', {
            method: 'POST',
            body: JSON.stringify({ minutes })
        });
    },
    
    getTouchStats() {
        return this.request('touch');
    },
    
    updateTouch(seconds) {
        return this.request('touch', {
            method: 'POST',
            body: JSON.stringify({ seconds })
        });
    },
    
    querySector(message) {
        return this.request('sector', {
            method: 'POST',
            body: JSON.stringify({ message })
        });
    },
    
    getMemories() {
        return this.request('memories');
    },
    
    addMemory(data) {
        return this.request('memories', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    saveLoveTest(resultType) {
        return this.request('love-test', {
            method: 'POST',
            body: JSON.stringify({ result_type: resultType })
        });
    }
};

