// ═══════════════════════════════════════════════════════════
// SUPERPARTY v7.0 - ADMIN APP
// Inițializare aplicație admin și routing
// ═══════════════════════════════════════════════════════════

const AdminApp = {
    
    initialized: false,
    pages: {},
    
    async init() {
        if (this.initialized) return;
        
        console.log('👨‍💼 Initializing Admin App...');
        
        // Protect page - ONLY ADMIN
        if (!AuthSystem.protectPage(['ADMIN'])) {
            return;
        }
        
        // Initialize state
        AdminState.init();
        
        // Setup navigation
        AdminNav.init();
        
        // Register pages
        this.registerPages();
        
        // Load initial page
        const initialPage = this.getPageFromURL() || 'dashboard';
        await this.navigateTo(initialPage);
        
        // Setup listeners
        this.setupListeners();
        
        // Load initial data
        await this.loadInitialData();
        
        this.initialized = true;
        console.log('✅ Admin App initialized');
    },
    
    registerPages() {
        this.pages = {
            dashboard: AdminDashboard,
            users: AdminUsers,
            events: AdminEvents,
            broadcast: AdminBroadcast,
            reports: AdminReports
        };
    },
    
    async navigateTo(pageName) {
        if (!this.pages[pageName]) {
            console.error('❌ Page not found:', pageName);
            return;
        }
        
        // Hide all pages
        document.querySelectorAll('.admin-page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show target page
        const pageElement = document.getElementById(`page-${pageName}`);
        if (pageElement) {
            pageElement.classList.add('active');
        }
        
        // Update state
        AdminState.setPage(pageName);
        
        // Update navigation
        AdminNav.updateActive(pageName);
        
        // Update URL
        this.updateURL(pageName);
        
        // Update page title
        this.updatePageTitle(pageName);
        
        // Render page
        try {
            if (this.pages[pageName].render) {
                await this.pages[pageName].render();
            }
        } catch (error) {
            console.error('❌ Error rendering page:', pageName, error);
            toast.error('Eroare la încărcarea paginii');
        }
    },
    
    getPageFromURL() {
        const hash = window.location.hash.slice(1);
        return hash || null;
    },
    
    updateURL(pageName) {
        window.location.hash = pageName;
    },
    
    updatePageTitle(pageName) {
        const titles = {
            dashboard: 'Dashboard',
            users: 'Management Useri',
            events: 'Management Evenimente',
            broadcast: 'Broadcast Messages',
            reports: 'Rapoarte'
        };
        
        const titleElement = document.querySelector('.admin-topbar-title');
        if (titleElement) {
            titleElement.textContent = titles[pageName] || pageName;
        }
        
        document.title = `${titles[pageName]} - Admin - SuperParty`;
    },
    
    setupListeners() {
        window.addEventListener('hashchange', () => {
            const page = this.getPageFromURL() || 'dashboard';
            this.navigateTo(page);
        });
    },
    
    async loadInitialData() {
        try {
            LoadingSystem.show('Încărcare date...');
            
            await Promise.all([
                AdminState.loadUsers(),
                AdminState.loadEvents(),
                AdminState.loadStatistics()
            ]);
            
            LoadingSystem.hide();
            
        } catch (error) {
            LoadingSystem.hide();
            console.error('❌ Error loading initial data:', error);
            toast.error('Eroare la încărcarea datelor');
        }
    },
    
    async refresh() {
        try {
            await AdminState.refresh();
            
            const currentPage = AdminState.currentPage;
            if (this.pages[currentPage] && this.pages[currentPage].render) {
                await this.pages[currentPage].render();
            }
            
        } catch (error) {
            console.error('❌ Refresh error:', error);
        }
    }
};

window.AdminApp = AdminApp;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AdminApp.init());
} else {
    AdminApp.init();
}

if (SUPERPARTY_CONFIG && SUPERPARTY_CONFIG.isDebug()) {
    console.log('✅ Admin App loaded');
}
