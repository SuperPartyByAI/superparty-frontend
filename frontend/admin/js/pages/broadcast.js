// ═══════════════════════════════════════════════════════════
// SUPERPARTY v7.0 - ADMIN BROADCAST
// Trimite mesaje broadcast către angajați
// ═══════════════════════════════════════════════════════════

const AdminBroadcast = {
    
    async render() {
        const container = document.getElementById('page-broadcast');
        if (!container) return;
        
        container.innerHTML = `
            <div class="admin-page-header">
                <h2 class="admin-page-title">Broadcast Messages</h2>
            </div>
            
            ${this.renderBroadcastCard()}
            ${this.renderTargetStats()}
        `;
        
        this.setupListeners();
    },
    
    renderBroadcastCard() {
        return `
            <div class="admin-broadcast-card">
                <h3>📢 Trimite Mesaj către Angajați</h3>
                <p>Mesajul va fi trimis instant prin notificare push și email</p>
                
                <form id="form-broadcast" class="admin-broadcast-form">
                    <textarea 
                        id="broadcast-message" 
                        name="message" 
                        placeholder="Scrie mesajul aici... (max 500 caractere)"
                        maxlength="500"
                        required
                    ></textarea>
                    
                    <div class="admin-broadcast-options">
                        <div style="flex: 1;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Destinatari:</label>
                            <select id="broadcast-target" class="form-input" style="background: rgba(255,255,255,0.2); color: white; border-color: rgba(255,255,255,0.3);">
                                <option value="all">🌍 Toți Angajații (${AdminState.users.length})</option>
                                <optgroup label="Per Echipă">
                                    ${Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map(team => {
                                        const count = AdminState.users.filter(u => u.team === team).length;
                                        if (count > 0) {
                                            return `<option value="team:${team}">Echipa ${team} (${count})</option>`;
                                        }
                                        return '';
                                    }).join('')}
                                </optgroup>
                                <optgroup label="Per Rol">
                                    <option value="role:OPERATOR">Operatori (${AdminState.users.filter(u => u.role === 'OPERATOR').length})</option>
                                    <option value="role:TRAINER">Traineri (${AdminState.users.filter(u => u.role === 'TRAINER').length})</option>
                                </optgroup>
                            </select>
                        </div>
                        
                        <button type="submit" class="btn" style="background: white; color: #6366f1; padding: 12px 32px; align-self: flex-end;">
                            <span style="font-size: 20px; margin-right: 8px;">📤</span>
                            Trimite Mesaj
                        </button>
                    </div>
                    
                    <div id="char-count" style="text-align: right; margin-top: 8px; opacity: 0.8; font-size: 14px;">
                        0 / 500 caractere
                    </div>
                </form>
            </div>
        `;
    },
    
    renderTargetStats() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">📊 Statistici Broadcast</h3>
                </div>
                <div class="card-body">
                    <div class="admin-quick-stats">
                        <div class="admin-quick-stat">
                            <div class="admin-quick-stat-value">${AdminState.users.length}</div>
                            <div class="admin-quick-stat-label">Total Angajați</div>
                        </div>
                        
                        <div class="admin-quick-stat">
                            <div class="admin-quick-stat-value">
                                ${AdminState.users.filter(u => u.status === 'active').length}
                            </div>
                            <div class="admin-quick-stat-label">Angajați Activi</div>
                        </div>
                        
                        <div class="admin-quick-stat">
                            <div class="admin-quick-stat-value">26</div>
                            <div class="admin-quick-stat-label">Echipe</div>
                        </div>
                        
                        <div class="admin-quick-stat">
                            <div class="admin-quick-stat-value">
                                ${AdminState.users.filter(u => u.role === 'TRAINER').length}
                            </div>
                            <div class="admin-quick-stat-label">Traineri</div>
                        </div>
                    </div>
                    
                    <div style="margin-top: var(--spacing-xl); padding: var(--spacing-lg); background: var(--bg-tertiary); border-radius: var(--radius-md);">
                        <h4 style="margin-bottom: var(--spacing-md);">💡 Sfaturi pentru Mesaje Eficiente</h4>
                        <ul style="list-style-position: inside; line-height: 2;">
                            <li>Folosește un ton pozitiv și motivant</li>
                            <li>Fii clar și concis</li>
                            <li>Include deadline-uri sau informații importante</li>
                            <li>Verifică mesajul pentru greșeli înainte de trimitere</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    },
    
    setupListeners() {
        const form = document.getElementById('form-broadcast');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSendBroadcast();
            });
        }
        
        const textarea = document.getElementById('broadcast-message');
        const charCount = document.getElementById('char-count');
        if (textarea && charCount) {
            textarea.addEventListener('input', () => {
                const length = textarea.value.length;
                charCount.textContent = `${length} / 500 caractere`;
            });
        }
    },
    
    async handleSendBroadcast() {
        const message = document.getElementById('broadcast-message').value.trim();
        const target = document.getElementById('broadcast-target').value;
        
        if (!message) {
            toast.error('Scrie un mesaj!');
            return;
        }
        
        if (message.length < 10) {
            toast.error('Mesajul este prea scurt (minim 10 caractere)');
            return;
        }
        
        // Confirm dialog
        const targetText = this.getTargetText(target);
        
        ModalSystem.confirm(
            `Sigur vrei să trimiți acest mesaj către ${targetText}?`,
            async () => {
                try {
                    LoadingSystem.show('Se trimite mesajul...');
                    
                    await AdminState.sendBroadcast(message, target);
                    
                    LoadingSystem.hide();
                    toast.success('Mesaj trimis cu succes!');
                    
                    // Reset form
                    document.getElementById('form-broadcast').reset();
                    document.getElementById('char-count').textContent = '0 / 500 caractere';
                    
                } catch (error) {
                    LoadingSystem.hide();
                    toast.error('Eroare la trimitere mesaj');
                }
            },
            null
        );
    },
    
    getTargetText(target) {
        if (target === 'all') {
            return `toți angajații (${AdminState.users.length} persoane)`;
        } else if (target.startsWith('team:')) {
            const team = target.split(':')[1];
            const count = AdminState.users.filter(u => u.team === team).length;
            return `Echipa ${team} (${count} persoane)`;
        } else if (target.startsWith('role:')) {
            const role = target.split(':')[1];
            const count = AdminState.users.filter(u => u.role === role).length;
            const roleText = role === 'OPERATOR' ? 'Operatori' : 'Traineri';
            return `${roleText} (${count} persoane)`;
        }
        return 'destinatarii selectați';
    }
};

window.AdminBroadcast = AdminBroadcast;
