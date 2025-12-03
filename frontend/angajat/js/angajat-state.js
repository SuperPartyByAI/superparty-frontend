// ═══════════════════════════════════════════════════════════
// SUPERPARTY v7.0 - ANGAJAT STATE
// State management pentru aplicația angajat
// ═══════════════════════════════════════════════════════════

const AngajatState = {
    
    // Current state
    user: null,
    currentPage: 'dashboard',
    events: [],
    statistics: null,
    loading: false,
    
    // Initialize state
    init() {
        this.user = AuthSystem.getCurrentUser();
        this.loadFromCache();
    },
    
    // Load from cache
    loadFromCache() {
        const cachedEvents = StorageUtils.getCache('angajat_events');
        if (cachedEvents) {
            this.events = cachedEvents;
        }
        
        const cachedStats = StorageUtils.getCache('angajat_statistics');
        if (cachedStats) {
            this.statistics = cachedStats;
        }
    },
    
    // Set current page
    setPage(pageName) {
        this.currentPage = pageName;
        window.dispatchEvent(new CustomEvent('pageChanged', { 
            detail: { page: pageName } 
        }));
    },
    
    // Load events from backend
    async loadEvents(filters = {}) {
        try {
            this.loading = true;
            
            const response = await API.request('getEvents', {
                userId: this.user.id,
                ...filters
            });
            
            this.events = response.events || [];
            
            // Cache pentru 10 minute
            StorageUtils.setCache('angajat_events', this.events, 10);
            
            this.loading = false;
            
            return this.events;
            
        } catch (error) {
            console.error('❌ Load events error:', error);
            this.loading = false;
            throw error;
        }
    },
    
    // Get event by ID
    getEvent(eventId) {
        return this.events.find(e => e.id === eventId);
    },
    
    // Load statistics
    async loadStatistics(period = 'month') {
        try {
            const response = await API.request('getStatistics', {
                userId: this.user.id,
                period
            });
            
            this.statistics = response.statistics || {};
            
            // Cache pentru 30 minute
            StorageUtils.setCache('angajat_statistics', this.statistics, 30);
            
            return this.statistics;
            
        } catch (error) {
            console.error('❌ Load statistics error:', error);
            throw error;
        }
    },
    
    // Submit evidence (dovezi)
    async submitEvidence(eventId, stage, photoData) {
        try {
            const response = await API.request('submitEvidence', {
                eventId,
                stage,
                userId: this.user.id,
                photo: photoData
            });
            
            // Update event în state
            const eventIndex = this.events.findIndex(e => e.id === eventId);
            if (eventIndex !== -1 && response.event) {
                this.events[eventIndex] = response.event;
                StorageUtils.setCache('angajat_events', this.events, 10);
            }
            
            return response;
            
        } catch (error) {
            console.error('❌ Submit evidence error:', error);
            throw error;
        }
    },
    
    // Refresh data
    async refresh() {
        try {
            await Promise.all([
                this.loadEvents(),
                this.loadStatistics()
            ]);
            
            toast.success('Date actualizate!');
            
        } catch (error) {
            toast.error('Eroare la actualizare date');
            throw error;
        }
    },
    
    // Get today events
    getTodayEvents() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return this.events.filter(event => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate.getTime() === today.getTime();
        });
    },
    
    // Get upcoming events
    getUpcomingEvents(days = 7) {
        const now = new Date();
        const future = new Date();
        future.setDate(future.getDate() + days);
        
        return this.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= now && eventDate <= future;
        });
    },
    
    // Clear cache
    clearCache() {
        StorageUtils.removeLocal('cache_angajat_events');
        StorageUtils.removeLocal('cache_angajat_statistics');
    }
};

// Export global
window.AngajatState = AngajatState;

if (SUPERPARTY_CONFIG && SUPERPARTY_CONFIG.isDebug()) {
    console.log('✅ Angajat State loaded');
}
