// ═══════════════════════════════════════════════════════════
// SUPERPARTY v7.0 - ANGAJAT PROFIL
// Pagină profil user și setări
// ═══════════════════════════════════════════════════════════

const AngajatProfil = {
    
    // Render page
    async render() {
        const container = document.getElementById('page-profil');
        if (!container) return;
        
        const user = AngajatState.user;
        
        container.innerHTML = `
            <div class="angajat-page-header">
                <h2 class="angajat-page-title">Profilul Meu</h2>
            </div>
            
            ${this.renderUserInfo(user)}
            ${this.renderPasswordChange()}
            ${this.renderThemeSettings()}
            ${this.renderDangerZone()}
        `;
        
        this.setupListeners();
    },
    
    // Render user info
    renderUserInfo(user) {
        return `
            <div class="card" style="margin-bottom: var(--spacing-xl);">
                <div class="card-header">
                    <h3 class="card-title">👤 Informații Personale</h3>
                </div>
                <div class="card-body">
                    <div style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
                        <!-- Avatar -->
                        <div style="display: flex; align-items: center; gap: var(--spacing-lg);">
                            <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: var(--font-bold);">
                                ${user.name ? user.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                                <div style="font-size: var(--text-xl); font-weight: var(--font-bold); margin-bottom: 4px;">
                                    ${user.name || 'Nume Necunoscut'}
                                </div>
                                <div style="color: var(--text-secondary);">
                                    ${user.role === 'TRAINER' ? 'Trainer' : 'Operator'}
                                    ${user.team ? ` • Echipa ${user.team}` : ''}
                                    ${user.code ? ` • ${user.code}` : ''}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Info Fields -->
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-md);">
                            <div>
                                <div style="font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: 4px;">Email</div>
                                <div style="font-weight: var(--font-medium);">${user.email}</div>
                            </div>
                            
                            ${user.phone ? `
                                <div>
                                    <div style="font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: 4px;">Telefon</div>
                                    <div style="font-weight: var(--font-medium);">${FormatUtils.formatPhone(user.phone)}</div>
                                </div>
                            ` : ''}
                            
                            ${user.joinDate ? `
                                <div>
                                    <div style="font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: 4px;">Membru din</div>
                                    <div style="font-weight: var(--font-medium);">${FormatUtils.formatDate(user.joinDate)}</div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Render password change
    renderPasswordChange() {
        return `
            <div class="card" style="margin-bottom: var(--spacing-xl);">
                <div class="card-header">
                    <h3 class="card-title">🔒 Schimbă Parola</h3>
                </div>
                <div class="card-body">
                    <form id="form-change-password">
                        <div class="form-group">
                            <label class="form-label">Parola Actuală</label>
                            <input type="password" class="form-input" id="old-password" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Parolă Nouă</label>
                            <input type="password" class="form-input" id="new-password" required minlength="6">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Confirmă Parola Nouă</label>
                            <input type="password" class="form-input" id="confirm-password" required minlength="6">
                        </div>
                        
                        <button type="submit" class="btn btn-primary" id="btn-change-password">
                            Schimbă Parola
                        </button>
                    </form>
                </div>
            </div>
        `;
    },
    
    // Render theme settings
    renderThemeSettings() {
        const isDark = ThemeSystem.isDark();
        
        return `
            <div class="card" style="margin-bottom: var(--spacing-xl);">
                <div class="card-header">
                    <h3 class="card-title">🎨 Aspect</h3>
                </div>
                <div class="card-body">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <div style="font-weight: var(--font-semibold); margin-bottom: 4px;">Mod Întunecat</div>
                            <div style="font-size: var(--text-sm); color: var(--text-secondary);">
                                Schimbă între tema light și dark
                            </div>
                        </div>
                        <button class="btn ${isDark ? 'btn-primary' : 'btn-secondary'}" onclick="AngajatProfil.toggleTheme()">
                            ${isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Render danger zone
    renderDangerZone() {
        return `
            <div class="card" style="border-color: var(--error);">
                <div class="card-header" style="background: rgba(239, 68, 68, 0.1); border-bottom-color: var(--error);">
                    <h3 class="card-title" style="color: var(--error);">⚠️ Zonă Periculoasă</h3>
                </div>
                <div class="card-body">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-lg);">
                        <div>
                            <div style="font-weight: var(--font-semibold); margin-bottom: 4px;">Șterge Cache Local</div>
                            <div style="font-size: var(--text-sm); color: var(--text-secondary);">
                                Șterge toate datele salvate local (petreceri, statistici)
                            </div>
                        </div>
                        <button class="btn btn-secondary" onclick="AngajatProfil.clearCache()">
                            Șterge Cache
                        </button>
                    </div>
                    
                    <div style="height: 1px; background: var(--border); margin: var(--spacing-lg) 0;"></div>
                    
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-lg);">
                        <div>
                            <div style="font-weight: var(--font-semibold); margin-bottom: 4px; color: var(--error);">Deconectare</div>
                            <div style="font-size: var(--text-sm); color: var(--text-secondary);">
                                Deconectează-te din aplicație
                            </div>
                        </div>
                        <button class="btn" style="background: var(--error); color: white;" onclick="AngajatProfil.logout()">
                            Deconectare
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Setup listeners
    setupListeners() {
        const form = document.getElementById('form-change-password');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePasswordChange();
            });
        }
    },
    
    // Handle password change
    async handlePasswordChange() {
        const oldPassword = document.getElementById('old-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Validare
        if (newPassword !== confirmPassword) {
            toast.error('Parolele nu coincid!');
            return;
        }
        
        const validation = ValidationUtils.validatePassword(newPassword);
        if (!validation.valid) {
            toast.error(validation.errors[0]);
            return;
        }
        
        const btn = document.getElementById('btn-change-password');
        LoadingSystem.buttonStart(btn, 'Se schimbă...');
        
        try {
            await AuthSystem.changePassword(oldPassword, newPassword);
            
            toast.success('Parolă schimbată cu succes!');
            
            // Reset form
            document.getElementById('form-change-password').reset();
            LoadingSystem.buttonEnd(btn);
            
        } catch (error) {
            toast.error(error.message || 'Eroare la schimbare parolă');
            LoadingSystem.buttonEnd(btn);
        }
    },
    
    // Toggle theme
    toggleTheme() {
        ThemeSystem.toggle();
        this.render();
    },
    
    // Clear cache
    clearCache() {
        ModalSystem.confirm(
            'Sigur vrei să ștergi cache-ul local? Datele vor fi reîncărcate de pe server.',
            () => {
                AngajatState.clearCache();
                toast.success('Cache șters!');
            },
            null
        );
    },
    
    // Logout
    logout() {
        ModalSystem.confirm(
            'Sigur vrei să te deconectezi?',
            () => {
                AuthSystem.logout();
            },
            null
        );
    }
};

window.AngajatProfil = AngajatProfil;
