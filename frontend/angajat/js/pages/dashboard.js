// ═══════════════════════════════════════════════════════════
// SUPERPARTY v7.0 - ANGAJAT DASHBOARD
// Pagină dashboard cu overview și petreceri astăzi
// ═══════════════════════════════════════════════════════════

const AngajatDashboard = {
    
    // Render dashboard
    async render() {
        const container = document.getElementById('page-dashboard');
        if (!container) return;
        
        // Show loading
        container.innerHTML = this.renderLoading();
        
        try {
            // Ensure data is loaded
            if (!AngajatState.statistics) {
                await AngajatState.loadStatistics();
            }
            if (AngajatState.events.length === 0) {
                await AngajatState.loadEvents();
            }
            
            // Render content
            container.innerHTML = this.renderContent();
            
            // Setup event listeners
            this.setupListeners();
            
        } catch (error) {
            container.innerHTML = this.renderError();
            console.error('❌ Dashboard render error:', error);
        }
    },
    
    // Render loading state
    renderLoading() {
        return `
            <div class="angajat-stats-grid">
                ${Array(4).fill('<div class="angajat-skeleton angajat-skeleton-card"></div>').join('')}
            </div>
        `;
    },
    
    // Render main content
    renderContent() {
        const stats = AngajatState.statistics || {};
        const todayEvents = AngajatState.getTodayEvents();
        const upcomingEvents = AngajatState.getUpcomingEvents(7);
        
        return `
            ${this.renderStats(stats)}
            ${this.renderTodayEvents(todayEvents)}
            ${this.renderUpcomingEvents(upcomingEvents)}
        `;
    },
    
    // Render statistics cards
    renderStats(stats) {
        const monthSalary = stats.monthSalary || 0;
        const monthEvents = stats.monthEvents || 0;
        const todayEvents = AngajatState.getTodayEvents().length;
        const pendingEvidence = stats.pendingEvidence || 0;
        
        return `
            <div class="angajat-stats-grid">
                <!-- Salariu Luna Aceasta -->
                <div class="angajat-stat-card">
                    <div class="angajat-stat-header">
                        <div class="angajat-stat-icon success">
                            💰
                        </div>
                        <div class="angajat-stat-info">
                            <div class="angajat-stat-label">Salariu Luna Aceasta</div>
                            <div class="angajat-stat-value">${FormatUtils.formatCurrency(monthSalary)}</div>
                        </div>
                    </div>
                    ${stats.lastMonthSalary ? `
                        <div class="angajat-stat-change ${monthSalary >= stats.lastMonthSalary ? 'positive' : 'negative'}">
                            ${monthSalary >= stats.lastMonthSalary ? '↑' : '↓'} 
                            ${FormatUtils.formatCurrency(Math.abs(monthSalary - stats.lastMonthSalary))} 
                            vs luna trecută
                        </div>
                    ` : ''}
                </div>
                
                <!-- Petreceri Luna Aceasta -->
                <div class="angajat-stat-card">
                    <div class="angajat-stat-header">
                        <div class="angajat-stat-icon primary">
                            🎉
                        </div>
                        <div class="angajat-stat-info">
                            <div class="angajat-stat-label">Petreceri Luna Aceasta</div>
                            <div class="angajat-stat-value">${monthEvents}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Petreceri Astăzi -->
                <div class="angajat-stat-card">
                    <div class="angajat-stat-header">
                        <div class="angajat-stat-icon warning">
                            📅
                        </div>
                        <div class="angajat-stat-info">
                            <div class="angajat-stat-label">Petreceri Astăzi</div>
                            <div class="angajat-stat-value">${todayEvents}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Dovezi Pending -->
                <div class="angajat-stat-card">
                    <div class="angajat-stat-header">
                        <div class="angajat-stat-icon ${pendingEvidence > 0 ? 'error' : 'success'}">
                            📷
                        </div>
                        <div class="angajat-stat-info">
                            <div class="angajat-stat-label">Dovezi de Trimis</div>
                            <div class="angajat-stat-value">${pendingEvidence}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Render today's events
    renderTodayEvents(events) {
        if (events.length === 0) {
            return `
                <div class="angajat-page-header">
                    <h2 class="angajat-page-title">Petreceri Astăzi</h2>
                </div>
                <div class="angajat-empty-state">
                    <div class="angajat-empty-icon">🎉</div>
                    <div class="angajat-empty-title">Nu ai petreceri astăzi</div>
                    <div class="angajat-empty-text">Bucură-te de ziua liberă!</div>
                </div>
            `;
        }
        
        return `
            <div class="angajat-page-header">
                <h2 class="angajat-page-title">Petreceri Astăzi (${events.length})</h2>
            </div>
            ${events.map(event => this.renderEventCard(event, 'today')).join('')}
        `;
    },
    
    // Render upcoming events
    renderUpcomingEvents(events) {
        const filtered = events.filter(e => {
            const eventDate = new Date(e.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return eventDate > today;
        });
        
        if (filtered.length === 0) return '';
        
        return `
            <div class="angajat-page-header" style="margin-top: var(--spacing-xl);">
                <h2 class="angajat-page-title">Petreceri Următoare 7 Zile</h2>
            </div>
            ${filtered.slice(0, 5).map(event => this.renderEventCard(event, 'upcoming')).join('')}
            ${filtered.length > 5 ? `
                <button class="btn btn-secondary" onclick="AngajatApp.navigateTo('petreceri')">
                    Vezi Toate Petrecerile (${filtered.length})
                </button>
            ` : ''}
        `;
    },
    
    // Render single event card
    renderEventCard(event, status) {
        return `
            <div class="angajat-event-card">
                <div class="angajat-event-header">
                    <div>
                        <div class="angajat-event-title">${event.title || 'Petrecere'}</div>
                        <div class="angajat-event-date">
                            ${FormatUtils.formatDate(event.date)} • ${event.time || '14:00'}
                        </div>
                    </div>
                    <span class="angajat-event-status ${status}">
                        ${status === 'today' ? 'Astăzi' : 'În curând'}
                    </span>
                </div>
                
                <div class="angajat-event-details">
                    <div class="angajat-event-detail">
                        <span class="angajat-event-detail-icon">📍</span>
                        <span>${event.location || 'Adresa necunoscută'}</span>
                    </div>
                    <div class="angajat-event-detail">
                        <span class="angajat-event-detail-icon">🎭</span>
                        <span>${event.role || 'Rol necunoscut'}</span>
                    </div>
                    <div class="angajat-event-detail">
                        <span class="angajat-event-detail-icon">💰</span>
                        <span>${FormatUtils.formatCurrency(event.salary || 0)}</span>
                    </div>
                </div>
                
                <div class="angajat-event-actions">
                    <button class="angajat-btn-small angajat-btn-primary" 
                            onclick="AngajatDashboard.viewEventDetails('${event.id}')">
                        Vezi Detalii
                    </button>
                    ${status === 'today' ? `
                        <button class="angajat-btn-small angajat-btn-secondary" 
                                onclick="AngajatApp.navigateTo('dovezi')">
                            Trimite Dovezi
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    },
    
    // Render error state
    renderError() {
        return `
            <div class="angajat-empty-state">
                <div class="angajat-empty-icon">⚠️</div>
                <div class="angajat-empty-title">Eroare la încărcare</div>
                <div class="angajat-empty-text">Te rugăm să reîncerci</div>
                <button class="btn btn-primary" onclick="AngajatDashboard.render()">
                    Reîncearcă
                </button>
            </div>
        `;
    },
    
    // Setup event listeners
    setupListeners() {
        // Any additional listeners
    },
    
    // View event details
    viewEventDetails(eventId) {
        const event = AngajatState.getEvent(eventId);
        if (!event) {
            toast.error('Eveniment negăsit');
            return;
        }
        
        // Show modal with details
        ModalSystem.show({
            title: event.title || 'Detalii Petrecere',
            content: `
                <div style="line-height: 1.8;">
                    <p><strong>📅 Dată:</strong> ${FormatUtils.formatDate(event.date)}</p>
                    <p><strong>🕐 Oră:</strong> ${event.time || 'N/A'}</p>
                    <p><strong>📍 Locație:</strong> ${event.location || 'N/A'}</p>
                    <p><strong>🎭 Rol:</strong> ${event.role || 'N/A'}</p>
                    <p><strong>💰 Salariu:</strong> ${FormatUtils.formatCurrency(event.salary || 0)}</p>
                    ${event.notes ? `<p><strong>📝 Note:</strong> ${event.notes}</p>` : ''}
                </div>
            `,
            buttons: [
                {
                    id: 'close',
                    text: 'Închide',
                    primary: true
                }
            ]
        });
    }
};

// Export global
window.AngajatDashboard = AngajatDashboard;

if (SUPERPARTY_CONFIG && SUPERPARTY_CONFIG.isDebug()) {
    console.log('✅ Angajat Dashboard loaded');
}
