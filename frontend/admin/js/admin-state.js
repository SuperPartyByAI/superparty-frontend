// ═══════════════════════════════════════════════════════════
// SUPERPARTY v7.0 - ADMIN STATE
// State management pentru aplicația admin
// ═══════════════════════════════════════════════════════════

const AdminState = {
    
    user: null,
    currentPage: 'dashboard',
    
    // Data
    users: [],
    events: [],
    statistics: null,
    loading: false,
    
    // Filters
    usersFilter: 'all', // all, active, inactive
    eventsFilter: 'all', // all, upcoming, past
    
    // Init
    init() {
        this.user = AuthSystem.getCurrentUser();
        this.loadFromCache();
    },
    
    // Load from cache
    loadFromCache() {
        const cachedUsers = StorageUtils.getCache('admin_users');
        if (cachedUsers) this.users = cachedUsers;
        
        const cachedEvents = StorageUtils.getCache('admin_events');
        if (cachedEvents) this.events = cachedEvents;
        
        const cachedStats = StorageUtils.getCache('admin_statistics');
        if (cachedStats) this.statistics = cachedStats;
    },
    
    // Set page
    setPage(pageName) {
        this.currentPage = pageName;
        window.dispatchEvent(new CustomEvent('pageChanged', { 
            detail: { page: pageName } 
        }));
    },
    
    // ═══════════════════════════════════════════════════════
    // USERS MANAGEMENT
    // ═══════════════════════════════════════════════════════
    
    async loadUsers() {
        try {
            this.loading = true;
            
            const response = await API.request('getUsers', {
                adminId: this.user.id
            });
            
            this.users = response.users || [];
            StorageUtils.setCache('admin_users', this.users, 30);
            
            this.loading = false;
            return this.users;
            
        } catch (error) {
            console.error('❌ Load users error:', error);
            this.loading = false;
            throw error;
        }
    },
    
    async createUser(userData) {
        try {
            const response = await API.request('createUser', userData);
            
            if (response.error) {
                throw new Error(response.message);
            }
            
            // Add to state
            this.users.push(response.user);
            StorageUtils.setCache('admin_users', this.users, 30);
            
            return response.user;
            
        } catch (error) {
            console.error('❌ Create user error:', error);
            throw error;
        }
    },
    
    async updateUser(userId, updates) {
        try {
            const response = await API.request('updateUser', {
                userId,
                updates
            });
            
            if (response.error) {
                throw new Error(response.message);
            }
            
            // Update in state
            const index = this.users.findIndex(u => u.id === userId);
            if (index !== -1) {
                this.users[index] = { ...this.users[index], ...updates };
                StorageUtils.setCache('admin_users', this.users, 30);
            }
            
            return response.user;
            
        } catch (error) {
            console.error('❌ Update user error:', error);
            throw error;
        }
    },
    
    async deleteUser(userId) {
        try {
            const response = await API.request('deleteUser', { userId });
            
            if (response.error) {
                throw new Error(response.message);
            }
            
            // Remove from state
            this.users = this.users.filter(u => u.id !== userId);
            StorageUtils.setCache('admin_users', this.users, 30);
            
            return true;
            
        } catch (error) {
            console.error('❌ Delete user error:', error);
            throw error;
        }
    },
    
    getUser(userId) {
        return this.users.find(u => u.id === userId);
    },
    
    getFilteredUsers() {
        if (this.usersFilter === 'active') {
            return this.users.filter(u => u.status === 'active');
        } else if (this.usersFilter === 'inactive') {
            return this.users.filter(u => u.status === 'inactive');
        }
        return this.users;
    },
    
    // ═══════════════════════════════════════════════════════
    // EVENTS MANAGEMENT
    // ═══════════════════════════════════════════════════════
    
    async loadEvents() {
        try {
            this.loading = true;
            
            const response = await API.request('getAllEvents', {
                adminId: this.user.id
            });
            
            this.events = response.events || [];
            StorageUtils.setCache('admin_events', this.events, 15);
            
            this.loading = false;
            return this.events;
            
        } catch (error) {
            console.error('❌ Load events error:', error);
            this.loading = false;
            throw error;
        }
    },
    
    async createEvent(eventData) {
        try {
            const response = await API.request('createEvent', eventData);
            
            if (response.error) {
                throw new Error(response.message);
            }
            
            this.events.push(response.event);
            StorageUtils.setCache('admin_events', this.events, 15);
            
            return response.event;
            
        } catch (error) {
            console.error('❌ Create event error:', error);
            throw error;
        }
    },
    
    async updateEvent(eventId, updates) {
        try {
            const response = await API.request('updateEvent', {
                eventId,
                updates
            });
            
            if (response.error) {
                throw new Error(response.message);
            }
            
            const index = this.events.findIndex(e => e.id === eventId);
            if (index !== -1) {
                this.events[index] = { ...this.events[index], ...updates };
                StorageUtils.setCache('admin_events', this.events, 15);
            }
            
            return response.event;
            
        } catch (error) {
            console.error('❌ Update event error:', error);
            throw error;
        }
    },
    
    async deleteEvent(eventId) {
        try {
            const response = await API.request('deleteEvent', { eventId });
            
            if (response.error) {
                throw new Error(response.message);
            }
            
            this.events = this.events.filter(e => e.id !== eventId);
            StorageUtils.setCache('admin_events', this.events, 15);
            
            return true;
            
        } catch (error) {
            console.error('❌ Delete event error:', error);
            throw error;
        }
    },
    
    getEvent(eventId) {
        return this.events.find(e => e.id === eventId);
    },
    
    getFilteredEvents() {
        const now = new Date();
        
        if (this.eventsFilter === 'upcoming') {
            return this.events.filter(e => new Date(e.date) >= now);
        } else if (this.eventsFilter === 'past') {
            return this.events.filter(e => new Date(e.date) < now);
        }
        return this.events;
    },
    
    // ═══════════════════════════════════════════════════════
    // STATISTICS
    // ═══════════════════════════════════════════════════════
    
    async loadStatistics() {
        try {
            const response = await API.request('getAdminStatistics', {
                adminId: this.user.id
            });
            
            this.statistics = response.statistics || {};
            StorageUtils.setCache('admin_statistics', this.statistics, 30);
            
            return this.statistics;
            
        } catch (error) {
            console.error('❌ Load statistics error:', error);
            throw error;
        }
    },
    
    // ═══════════════════════════════════════════════════════
    // BROADCAST
    // ═══════════════════════════════════════════════════════
    
    async sendBroadcast(message, target) {
        try {
            const response = await API.request('sendBroadcast', {
                adminId: this.user.id,
                message,
                target // 'all', 'team:A', 'role:OPERATOR'
            });
            
            if (response.error) {
                throw new Error(response.message);
            }
            
            return response;
            
        } catch (error) {
            console.error('❌ Broadcast error:', error);
            throw error;
        }
    },
    
    // ═══════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════
    
    async refresh() {
        try {
            await Promise.all([
                this.loadUsers(),
                this.loadEvents(),
                this.loadStatistics()
            ]);
            
            toast.success('Date actualizate!');
            
        } catch (error) {
            toast.error('Eroare la actualizare date');
            throw error;
        }
    },
    
    clearCache() {
        StorageUtils.removeLocal('cache_admin_users');
        StorageUtils.removeLocal('cache_admin_events');
        StorageUtils.removeLocal('cache_admin_statistics');
    }
};

window.AdminState = AdminState;

if (SUPERPARTY_CONFIG && SUPERPARTY_CONFIG.isDebug()) {
    console.log('✅ Admin State loaded');
}
