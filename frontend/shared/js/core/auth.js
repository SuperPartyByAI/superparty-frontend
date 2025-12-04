// ═══════════════════════════════════════════════════════════
// SUPERPARTY v7.0 - AUTHENTICATION SYSTEM
// Sistem autentificare cu redirect pe roluri
// ═══════════════════════════════════════════════════════════

const AuthSystem = {
    
    currentUser: null,
    
    /**
     * Login user cu email și parolă
     */
    async login(email, password) {
        try {
            // Call backend
            const response = await API.request('login', {
                email: email.toLowerCase().trim(),
                password: password
            });
            
            if (!response.success || !response.user) {
                throw new Error(response.error || 'Login failed');
            }
            
            // Salvează user
            StorageUtils.saveUser(response.user);
            if (response.token) StorageUtils.saveToken(response.token);
            
            this.currentUser = response.user;
            
            // Redirect către aplicația corespunzătoare
            this.redirectToApp(response.user.role);
            
            return response.user;
            
        } catch (error) {
            console.error('❌ Login error:', error);
            throw error;
        }
    },
    
    /**
     * Logout user
     */
    async logout() {
        try {
            await API.request('logout', {}, { showLoading: false });
        } catch (error) {
            console.warn('Backend logout failed');
        }
        
        StorageUtils.removeUser();
        StorageUtils.removeToken();
        this.currentUser = null;
        window.location.href = '/index.html';
    },
    
    /**
     * Verifică dacă user e logat
     */
    isLoggedIn() {
        return StorageUtils.getUser() !== null;
    },
    
    /**
     * Obține user curent
     */
    getCurrentUser() {
        if (this.currentUser) return this.currentUser;
        this.currentUser = StorageUtils.getUser();
        return this.currentUser;
    },
    
    /**
     * Redirect către aplicația corespunzătoare după rol
     */
    redirectToApp(role) {
        let url = '';
        
        switch(role.toUpperCase()) {
            case 'OPERATOR':
            case 'TRAINER':
                url = '/frontend/angajat/index.html';
                break;
            case 'ADMIN':
                url = '/frontend/admin/index.html';
                break;
            case 'GM':
                url = '/frontend/gm/index.html';
                break;
            default:
                url = '/frontend/angajat/index.html';
        }
        
        window.location.href = url;
    },
    
    /**
     * Verifică dacă user are un anumit rol
     */
    hasRole(role) {
        const user = this.getCurrentUser();
        return user && user.role.toUpperCase() === role.toUpperCase();
    },
    
    /**
     * Protejează pagina - redirect dacă nu e logat
     */
    protectPage(allowedRoles = null) {
        if (!this.isLoggedIn()) {
            window.location.href = '/index.html';
            return false;
        }
        
        if (allowedRoles) {
            const user = this.getCurrentUser();
            const hasPermission = allowedRoles.some(role => 
                role.toUpperCase() === user.role.toUpperCase()
            );
            
            if (!hasPermission) {
                alert('Nu ai permisiunea să accesezi această pagină!');
                this.logout();
                return false;
            }
        }
        
        return true;
    },
    
    /**
     * Verifică dacă user e deja logat (pentru pagina login)
     */
    checkAutoLogin() {
        if (this.isLoggedIn()) {
            const user = this.getCurrentUser();
            this.redirectToApp(user.role);
        }
    }
};

window.AuthSystem = AuthSystem;

if (SUPERPARTY_CONFIG && SUPERPARTY_CONFIG.isDebug()) {
    console.log('✅ Auth System loaded');
}
