// ═══════════════════════════════════════════════════════════
// SUPERPARTY v7.0 - ADMIN DASHBOARD
// Dashboard admin cu statistici generale
// ═══════════════════════════════════════════════════════════

const AdminDashboard = {
    
    async render() {
        const container = document.getElementById('page-dashboard');
        if (!container) return;
        
        container.innerHTML = this.renderLoading();
        
        try {
            if (!AdminState.statistics) {
                await AdminState.loadStatistics();
            }
            
            container.innerHTML = this.renderContent();
            this.setupListeners();
            
        } catch (error) {
            container.innerHTML = this.renderError();
        }
    },
    
    renderLoading() {
        return `
            <div class="admin-stats-grid">
                ${Array(4).fill('<div class="angajat-skeleton angajat-skeleton-card"></div>').join('')}
            </div>
        `;
    },
    
    renderContent() {
        const stats = AdminState.statistics || {};
        
        return `
            ${this.renderStats(stats)}
            ${this.renderQuickActions()}
            ${this.renderRecentActivity(stats)}
        `;
    },
    
    renderStats(stats) {
        return `
            <div class="admin-stats-grid">
                <!-- Total Angajați -->
                <div class="admin-stat-card info">
                    <div class="admin-stat-header">
                        <div class="admin-stat-label">Total Angajați</div>
                        <div class="admin-stat-icon">👥</div>
                    </div>
                    <div class="admin-stat-value">${stats.totalEmployees || AdminState.users.length}</div>
                    <div class="admin-stat-change positive">
                        +${stats.newEmployeesThisMonth || 0} luna aceasta
                    </div>
                </div>
                
                <!-- Evenimente Astăzi -->
                <div class="admin-stat-card warning">
                    <div class="admin-stat-header">
                        <div class="admin-stat-label">Evenimente Astăzi</div>
                        <div class="admin-stat-icon">🎉</div>
                    </div>
                    <div class="admin-stat-value">${stats.eventsToday || 0}</div>
                    <div class="admin-stat-change">
                        ${stats.eventsThisWeek || 0} săptămâna aceasta
                    </div>
                </div>
                
                <!-- Evenimente Luna Aceasta -->
                <div class="admin-stat-card success">
                    <div class="admin-stat-header">
                        <div class="admin-stat-label">Evenimente Luna Aceasta</div>
                        <div class="admin-stat-icon">📅</div>
                    </div>
                    <div class="admin-stat-value">${stats.eventsThisMonth || AdminState.events.length}</div>
                    <div class="admin-stat-change ${stats.monthlyGrowth >= 0 ? 'positive' : 'negative'}">
                        ${stats.monthlyGrowth >= 0 ? '+' : ''}${stats.monthlyGrowth || 0}% vs luna trecută
                    </div>
                </div>
                
                <!-- Dovezi Pending -->
                <div class="admin-stat-card error">
                    <div class="admin-stat-header">
                        <div class="admin-stat-label">Dovezi Pending</div>
                        <div class="admin-stat-icon">📷</div>
                    </div>
                    <div class="admin-stat-value">${stats.pendingEvidence || 0}</div>
                    <div class="admin-stat-change">
                        Necesită verificare
                    </div>
                </div>
            </div>
        `;
    },
    
    renderQuickActions() {
        return `
            <div class="card" style="margin-bottom: var(--spacing-xl);">
                <div class="card-header">
                    <h3 class="card-title">⚡ Acțiuni Rapide</h3>
                </div>
                <div class="card-body">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-md);">
                        <button class="btn btn-primary" onclick="AdminApp.navigateTo('users'); setTimeout(() => AdminUsers.showCreateForm(), 100)">
                            <span style="font-size: 20px; margin-right: 8px;">👤</span>
                            Adaugă Angajat Nou
                        </button>
                        
                        <button class="btn btn-secondary" onclick="AdminApp.navigateTo('events'); setTimeout(() => AdminEvents.showCreateForm(), 100)">
                            <span style="font-size: 20px; margin-right: 8px;">🎉</span>
                            Creare Petrecere Nouă
                        </button>
                        
                        <button class="btn btn-secondary" onclick="AdminApp.navigateTo('broadcast')">
                            <span style="font-size: 20px; margin-right: 8px;">📢</span>
                            Trimite Mesaj Broadcast
                        </button>
                        
                        <button class="btn btn-secondary" onclick="AdminApp.navigateTo('reports')">
                            <span style="font-size: 20px; margin-right: 8px;">📊</span>
                            Vezi Rapoarte
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderRecentActivity(stats) {
        const recentEvents = AdminState.events
            .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
            .slice(0, 5);
        
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">📋 Activitate Recentă</h3>
                </div>
                <div class="card-body">
                    ${recentEvents.length > 0 ? `
                        <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
                            ${recentEvents.map(event => `
                                <div style="padding: var(--spacing-md); background: var(--bg-tertiary); border-radius: var(--radius-md);">
                                    <div style="display: flex; justify-content: space-between; align-items: start;">
                                        <div>
                                            <div style="font-weight: var(--font-semibold); margin-bottom: 4px;">
                                                ${event.title || 'Petrecere'}
                                            </div>
                                            <div style="font-size: var(--text-sm); color: var(--text-secondary);">
                                                📅 ${FormatUtils.formatDate(event.date)} • 
                                                👤 ${event.assignedTo || 'Nealocată'}
                                            </div>
                                        </div>
                                        <span class="admin-badge ${new Date(event.date) > new Date() ? 'pending' : 'active'}">
                                            ${new Date(event.date) > new Date() ? 'Viitoare' : 'Finalizată'}
                                        </span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="admin-empty-state">
                            <div class="admin-empty-icon">📋</div>
                            <div class="admin-empty-text">Nu există activitate recentă</div>
                        </div>
                    `}
                </div>
            </div>
        `;
    },
    
    renderError() {
        return `
            <div class="admin-empty-state">
                <div class="admin-empty-icon">⚠️</div>
                <div class="admin-empty-title">Eroare la încărcare</div>
                <button class="btn btn-primary" onclick="AdminDashboard.render()">Reîncearcă</button>
            </div>
        `;
    },
    
    setupListeners() {
        // Any additional listeners
    }
};

window.AdminDashboard = AdminDashboard;
