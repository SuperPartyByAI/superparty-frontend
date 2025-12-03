// ═══════════════════════════════════════════════════════════
// SUPERPARTY v7.0 - ADMIN NAVIGATION
// Navigation pentru aplicația admin
// ═══════════════════════════════════════════════════════════

const AdminNav = {
    
    sidebarOpen: false,
    
    init() {
        this.renderUserInfo();
        this.setupEventListeners();
    },
    
    renderUserInfo() {
        const user = AdminState.user;
        if (!user) return;
        
        const userNameEl = document.querySelector('.admin-user-name');
        const userRoleEl = document.querySelector('.admin-user-role');
        
        if (userNameEl) {
            userNameEl.textContent = user.name || user.email;
        }
        
        if (userRoleEl) {
            userRoleEl.textContent = 'Administrator';
        }
    },
    
    setupEventListeners() {
        // Sidebar items
        document.querySelectorAll('.admin-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page) {
                    AdminApp.navigateTo(page);
                    this.closeSidebar();
                }
            });
        });
        
        // Bottom nav items
        document.querySelectorAll('.admin-bottom-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page) {
                    AdminApp.navigateTo(page);
                }
            });
        });
        
        // Menu toggle
        const menuToggle = document.querySelector('.admin-menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
        
        // Overlay
        const overlay = document.querySelector('.admin-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.closeSidebar();
            });
        }
        
        // Logout
        const logoutBtn = document.querySelector('.admin-btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
    },
    
    updateActive(pageName) {
        document.querySelectorAll('.admin-nav-item').forEach(item => {
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        document.querySelectorAll('.admin-bottom-nav-item').forEach(item => {
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
        const sidebar = document.querySelector('.admin-sidebar');
        const overlay = document.querySelector('.admin-overlay');
        
        if (sidebar) sidebar.classList.add('open');
        if (overlay) overlay.classList.add('show');
        
        this.sidebarOpen = true;
    },
    
    closeSidebar() {
        const sidebar = document.querySelector('.admin-sidebar');
        const overlay = document.querySelector('.admin-overlay');
        
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
    },
    
    updateBadge(pageName, count) {
        const navItem = document.querySelector(`.admin-nav-item[data-page="${pageName}"]`);
        if (!navItem) return;
        
        let badge = navItem.querySelector('.admin-nav-badge');
        
        if (count > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'admin-nav-badge';
                navItem.appendChild(badge);
            }
            badge.textContent = count;
        } else {
            if (badge) badge.remove();
        }
    }
};

window.AdminNav = AdminNav;

if (SUPERPARTY_CONFIG && SUPERPARTY_CONFIG.isDebug()) {
    console.log('✅ Admin Nav loaded');
}
