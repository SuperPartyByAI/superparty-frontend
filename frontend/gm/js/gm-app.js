// ═══════════════════════════════════════════════════════════
// SUPERPARTY v7.0 - GM APP
// Inițializare aplicație GM și routing
// ═══════════════════════════════════════════════════════════

const GMApp = {
    
    initialized: false,
    pages: {},
    
    async init() {
        if (this.initialized) return;
        
        console.log('👑 Initializing GM App...');
        
        // Protect page - ONLY GM
        if (!AuthSystem.protectPage(['GM'])) {
            return;
        }
        
        // Initialize state
        GMState.init();
        
        // Setup navigation
        GMNav.init();
        
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
        console.log('✅ GM App initialized');
    },
    
    registerPages() {
        this.pages = {
            dashboard: GMDashboard,
            analytics: GMAnalytics,
            seo: GMSEO,
            ads: GMAds,
            financial: GMFinancial,
            config: GMConfig,
            access: GMAccess,
            callcenter: GMCallCenter
        };
    },
    
    async navigateTo(pageName) {
        if (!this.pages[pageName]) {
            console.error('❌ Page not found:', pageName);
            return;
        }
        
        // Hide all pages
        document.querySelectorAll('.gm-page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show target page
        const pageElement = document.getElementById(`page-${pageName}`);
        if (pageElement) {
            pageElement.classList.add('active');
        }
        
        // Update state
        GMState.setPage(pageName);
        
        // Update navigation
        GMNav.updateActive(pageName);
        
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
            dashboard: 'Dashboard GM',
            analytics: 'Analytics Avansate',
            seo: 'SEO Management',
            ads: 'Ads Management',
            financial: 'Financial Overview',
            config: 'System Configuration',
            access: 'Access Control',
            callcenter: 'Call Center'
        };
        
        const titleElement = document.querySelector('.gm-topbar-title');
        if (titleElement) {
            titleElement.textContent = titles[pageName] || pageName;
        }
        
        document.title = `${titles[pageName]} - GM - SuperParty`;
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
            
            await GMState.loadStatistics();
            
            LoadingSystem.hide();
            
        } catch (error) {
            LoadingSystem.hide();
            console.error('❌ Error loading initial data:', error);
        }
    },
    
    async refresh() {
        try {
            await GMState.refresh();
            
            const currentPage = GMState.currentPage;
            if (this.pages[currentPage] && this.pages[currentPage].render) {
                await this.pages[currentPage].render();
            }
            
        } catch (error) {
            console.error('❌ Refresh error:', error);
        }
    }
};

window.GMApp = GMApp;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GMApp.init());
} else {
    GMApp.init();
}

if (SUPERPARTY_CONFIG && SUPERPARTY_CONFIG.isDebug()) {
    console.log('✅ GM App loaded');
}
