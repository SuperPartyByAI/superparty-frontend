// ═══════════════════════════════════════════════════════════
// SUPERPARTY v7.0 - GM NAVIGATION
// Navigation pentru aplicația GM
// ═══════════════════════════════════════════════════════════

const GMNav = {
    
    sidebarOpen: false,
    
    init() {
        this.renderUserInfo();
        this.setupEventListeners();
    },
    
    renderUserInfo() {
        const user = GMState.user;
        if (!user) return;
        
        const userNameEl = document.querySelector('.gm-user-name');
        const userRoleEl = document.querySelector('.gm-user-role');
        
        if (userNameEl) {
            userNameEl.textContent = user.name || user.email;
        }
        
        if (userRoleEl) {
            userRoleEl.innerHTML = '👑 General Manager';
        }
    },
    
    setupEventListeners() {
        // Sidebar items
        document.querySelectorAll('.gm-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page) {
                    GMApp.navigateTo(page);
                    this.closeSidebar();
                }
            });
        });
        
        // Bottom nav items
        document.querySelectorAll('.gm-bottom-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page) {
                    GMApp.navigateTo(page);
                }
            });
        });
        
        // Menu toggle
        const menuToggle = document.querySelector('.gm-menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
        
        // Overlay
        const overlay = document.querySelector('.gm-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.closeSidebar();
            });
        }
        
        // Logout
        const logoutBtn = document.querySelector('.gm-btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
    },
    
    updateActive(pageName) {
        document.querySelectorAll('.gm-nav-item').forEach(item => {
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        document.querySelectorAll('.gm-bottom-nav-item').forEach(item => {
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    },
    
    toggleSidebar() {
        if (this.sidebarOpen) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    },
    
    openSidebar() {
        const sidebar = document.querySelector('.gm-sidebar');
        const overlay = document.querySelector('.gm-overlay');
        
        if (sidebar) sidebar.classList.add('open');
        if (overlay) overlay.classList.add('show');
        
        this.sidebarOpen = true;
    },
    
    closeSidebar() {
        const sidebar = document.querySelector('.gm-sidebar');
        const overlay = document.querySelector('.gm-overlay');
        
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('show');
        
        this.sidebarOpen = false;
    },
    
    handleLogout() {
        ModalSystem.confirm(
            'Sigur vrei să te deconectezi?',
            () => {
                AuthSystem.logout();
            },
            null
        );
    }
};

window.GMNav = GMNav;

if (SUPERPARTY_CONFIG && SUPERPARTY_CONFIG.isDebug()) {
    console.log('✅ GM Nav loaded');
}
