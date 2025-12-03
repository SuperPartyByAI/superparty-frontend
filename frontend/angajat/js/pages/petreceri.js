// ═══════════════════════════════════════════════════════════
// SUPERPARTY v7.0 - ANGAJAT PETRECERI
// Pagină listă petreceri cu filtrare
// ═══════════════════════════════════════════════════════════

const AngajatPetreceri = {
    
    currentFilter: 'all', // all, upcoming, past
    
    // Render page
    async render() {
        const container = document.getElementById('page-petreceri');
        if (!container) return;
        
        container.innerHTML = this.renderContent();
        this.setupListeners();
    },
    
    // Render content
    renderContent() {
        const events = this.getFilteredEvents();
        
        return `
            ${this.renderFilters()}
            ${events.length > 0 ? this.renderEventsList(events) : this.renderEmpty()}
        `;
    },
    
    // Render filters
    renderFilters() {
        return `
            <div class="angajat-page-header">
                <h2 class="angajat-page-title">Petreceri</h2>
            </div>
            <div style="display: flex; gap: var(--spacing-sm); margin-bottom: var(--spacing-lg); flex-wrap: wrap;">
                <button class="angajat-btn-small ${this.currentFilter === 'all' ? 'angajat-btn-primary' : 'angajat-btn-secondary'}" 
                        data-filter="all">
                    Toate
                </button>
                <button class="angajat-btn-small ${this.currentFilter === 'upcoming' ? 'angajat-btn-primary' : 'angajat-btn-secondary'}" 
                        data-filter="upcoming">
                    Viitoare
                </button>
                <button class="angajat-btn-small ${this.currentFilter === 'past' ? 'angajat-btn-primary' : 'angajat-btn-secondary'}" 
                        data-filter="past">
                    Trecute
                </button>
            </div>
        `;
    },
    
    // Get filtered events
    getFilteredEvents() {
        const now = new Date();
        let events = AngajatState.events;
        
        if (this.currentFilter === 'upcoming') {
            events = events.filter(e => new Date(e.date) >= now);
        } else if (this.currentFilter === 'past') {
            events = events.filter(e => new Date(e.date) < now);
        }
        
        return events.sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    
    // Render events list
    renderEventsList(events) {
        return events.map(event => {
            const eventDate = new Date(event.date);
            const isToday = this.isToday(eventDate);
            const isPast = eventDate < new Date();
            
            return `
                <div class="angajat-event-card">
                    <div class="angajat-event-header">
                        <div>
                            <div class="angajat-event-title">${event.title || 'Petrecere'}</div>
                            <div class="angajat-event-date">
                                ${FormatUtils.formatDate(event.date)} • ${event.time || '14:00'}
                            </div>
                        </div>
                        <span class="angajat-event-status ${isToday ? 'today' : isPast ? 'completed' : 'upcoming'}">
                            ${isToday ? 'Astăzi' : isPast ? 'Finalizată' : 'În curând'}
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
                                onclick="AngajatPetreceri.viewDetails('${event.id}')">
                            Vezi Detalii
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // Render empty state
    renderEmpty() {
        return `
            <div class="angajat-empty-state">
                <div class="angajat-empty-icon">🎉</div>
                <div class="angajat-empty-title">Nu ai petreceri</div>
                <div class="angajat-empty-text">Nu există petreceri pentru acest filtru</div>
            </div>
        `;
    },
    
    // Setup listeners
    setupListeners() {
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });
    },
    
    // Check if date is today
    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    },
    
    // View event details
    viewDetails(eventId) {
        AngajatDashboard.viewEventDetails(eventId);
    }
};

window.AngajatPetreceri = AngajatPetreceri;
