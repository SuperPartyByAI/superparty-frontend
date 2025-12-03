// ═══════════════════════════════════════════════════════════
// SUPERPARTY v7.0 - ANGAJAT NAVIGATION
// Navigation pentru sidebar și bottom nav
// ═══════════════════════════════════════════════════════════

const AngajatNav = {
    
    sidebarOpen: false,
    
    // Initialize navigation
    init() {
        this.renderUserInfo();
        this.setupEventListeners();
    },
    
    // Render user info în sidebar
    renderUserInfo() {
        const user = AngajatState.user;
        if (!user) return;
        
        const userNameEl = document.querySelector('.angajat-user-name');
        const userRoleEl = document.querySelector('.angajat-user-role');
        
        if (userNameEl) {
            userNameEl.textContent = user.name || user.email;
        }
        
        if (userRoleEl) {
            const roleText = user.role === 'TRAINER' ? 'Trainer' : 'Operator';
            const teamText = user.team ? ` • Echipa ${user.team}` : '';
            userRoleEl.textContent = roleText + teamText;
        }
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Sidebar navigation items
        document.querySelectorAll('.angajat-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page) {
                    AngajatApp.navigateTo(page);
                    this.closeSidebar(); // Close mobile sidebar
                }
            });
        });
        
        // Bottom navigation items
        document.querySelectorAll('.angajat-bottom-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page) {
                    AngajatApp.navigateTo(page);
                }
            });
        });
        
        // Menu toggle (mobile)
        const menuToggle = document.querySelector('.angajat-menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
        
        // Overlay click (close sidebar)
        const overlay = document.querySelector('.angajat-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.closeSidebar();
            });
        }
        
        // Logout button
        const logoutBtn = document.querySelector('.angajat-btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
    },
    
    // Update active navigation item
    updateActive(pageName) {
        // Sidebar items
        document.querySelectorAll('.angajat-nav-item').forEach(item => {
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Bottom nav items
        document.querySelectorAll('.angajat-bottom-nav-item').forEach(item => {
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    },
    
    // Toggle sidebar (mobile)
    toggleSidebar() {
        const sidebar = document.querySelector('.angajat-sidebar');
        const overlay = document.querySelector('.angajat-overlay');
        
        if (this.sidebarOpen) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    },
    
    // Open sidebar
    openSidebar() {
        const sidebar = document.querySelector('.angajat-sidebar');
        const overlay = document.querySelector('.angajat-overlay');
        
        if (sidebar) sidebar.classList.add('open');
        if (overlay) overlay.classList.add('show');
        
        this.sidebarOpen = true;
    },
    
    // Close sidebar
    closeSidebar() {
        const sidebar = document.querySelector('.angajat-sidebar');
        const overlay = document.querySelector('.angajat-overlay');
        
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('show');
        
        this.sidebarOpen = false;
    },
    
    // Handle logout
    handleLogout() {
        ModalSystem.confirm(
            'Sigur vrei să te deconectezi?',
            () => {
                AuthSystem.logout();
            },
            null
        );
    },
    
    // Update notification badge
    updateBadge(pageName, count) {
        const navItem = document.querySelector(`.angajat-nav-item[data-page="${pageName}"]`);
        if (!navItem) return;
        
        let badge = navItem.querySelector('.angajat-nav-badge');
        
        if (count > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'angajat-nav-badge';
                navItem.appendChild(badge);
            }
            badge.textContent = count;
        } else {
            if (badge) {
                badge.remove();
            }
        }
    }
};

// Export global
window.AngajatNav = AngajatNav;

if (SUPERPARTY_CONFIG && SUPERPARTY_CONFIG.isDebug()) {
    console.log('✅ Angajat Nav loaded');
}
