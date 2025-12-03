// ═══════════════════════════════════════════════════════════
// SUPERPARTY v7.0 - ANGAJAT APP
// Inițializare aplicație și routing
// ═══════════════════════════════════════════════════════════

const AngajatApp = {
    
    initialized: false,
    pages: {},
    
    // Initialize application
    async init() {
        if (this.initialized) return;
        
        console.log('🎭 Initializing Angajat App...');
        
        // Protect page
        if (!AuthSystem.protectPage(['OPERATOR', 'TRAINER'])) {
            return;
        }
        
        // Initialize state
        AngajatState.init();
        
        // Setup navigation
        AngajatNav.init();
        
        // Register pages
        this.registerPages();
        
        // Load initial page
        const initialPage = this.getPageFromURL() || 'dashboard';
        await this.navigateTo(initialPage);
        
        // Setup event listeners
        this.setupListeners();
        
        // Load initial data
        await this.loadInitialData();
        
        this.initialized = true;
        console.log('✅ Angajat App initialized');
    },
    
    // Register all pages
    registerPages() {
        this.pages = {
            dashboard: AngajatDashboard,
            petreceri: AngajatPetreceri,
            dovezi: AngajatDovezi,
            statistici: AngajatStatistici,
            profil: AngajatProfil
        };
    },
    
    // Navigate to page
    async navigateTo(pageName) {
        if (!this.pages[pageName]) {
            console.error('❌ Page not found:', pageName);
            return;
        }
        
        // Hide all pages
        document.querySelectorAll('.angajat-page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show target page
        const pageElement = document.getElementById(`page-${pageName}`);
        if (pageElement) {
            pageElement.classList.add('active');
        }
        
        // Update state
        AngajatState.setPage(pageName);
        
        // Update navigation
        AngajatNav.updateActive(pageName);
        
        // Update URL
        this.updateURL(pageName);
        
        // Update page title (mobile)
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
    
    // Get page from URL hash
    getPageFromURL() {
        const hash = window.location.hash.slice(1);
        return hash || null;
    },
    
    // Update URL hash
    updateURL(pageName) {
        window.location.hash = pageName;
    },
    
    // Update page title (for mobile topbar)
    updatePageTitle(pageName) {
        const titles = {
            dashboard: 'Dashboard',
            petreceri: 'Petreceri',
            dovezi: 'Dovezi',
            statistici: 'Statistici',
            profil: 'Profil'
        };
        
        const titleElement = document.querySelector('.angajat-topbar-title');
        if (titleElement) {
            titleElement.textContent = titles[pageName] || pageName;
        }
        
        // Update document title
        document.title = `${titles[pageName]} - SuperParty`;
    },
    
    // Setup event listeners
    setupListeners() {
        // Hash change (browser back/forward)
        window.addEventListener('hashchange', () => {
            const page = this.getPageFromURL() || 'dashboard';
            this.navigateTo(page);
        });
        
        // Refresh button (if exists)
        const refreshBtn = document.getElementById('btn-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refresh());
        }
    },
    
    // Load initial data
    async loadInitialData() {
        try {
            LoadingSystem.show('Încărcare date...');
            
            await Promise.all([
                AngajatState.loadEvents(),
                AngajatState.loadStatistics()
            ]);
            
            LoadingSystem.hide();
            
        } catch (error) {
            LoadingSystem.hide();
            console.error('❌ Error loading initial data:', error);
            toast.error('Eroare la încărcarea datelor');
        }
    },
    
    // Refresh all data
    async refresh() {
        try {
            await AngajatState.refresh();
            
            // Re-render current page
            const currentPage = AngajatState.currentPage;
            if (this.pages[currentPage] && this.pages[currentPage].render) {
                await this.pages[currentPage].render();
            }
            
        } catch (error) {
            console.error('❌ Refresh error:', error);
        }
    }
};

// Export global
window.AngajatApp = AngajatApp;

// Auto-initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AngajatApp.init());
} else {
    AngajatApp.init();
}

if (SUPERPARTY_CONFIG && SUPERPARTY_CONFIG.isDebug()) {
    console.log('✅ Angajat App loaded');
}
