// ═══════════════════════════════════════════════════════════
// SUPERPARTY v7.0 - TOAST NOTIFICATIONS
// Sistem notificări toast (success, error, warning, info)
// ═══════════════════════════════════════════════════════════

const ToastSystem = {
    
    container: null,
    toasts: [],
    
    /**
     * Inițializează sistemul de toast
     */
    init() {
        if (this.container) return;
        
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        this.container.id = 'toast-container';
        document.body.appendChild(this.container);
    },
    
    /**
     * Afișează toast
     */
    show(message, type = 'info', duration = 3000) {
        this.init();
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = this._getIcon(type);
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="ToastSystem.close(this.parentElement)">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
        `;
        
        this.container.appendChild(toast);
        this.toasts.push(toast);
        
        // Auto-remove după duration
        if (duration > 0) {
            setTimeout(() => this.close(toast), duration);
        }
        
        return toast;
    },
    
    /**
     * Închide toast
     */
    close(toast) {
        if (!toast || !toast.parentElement) return;
        
        toast.style.animation = 'slideOut 0.3s ease';
        
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
            
            const index = this.toasts.indexOf(toast);
            if (index > -1) {
                this.toasts.splice(index, 1);
            }
        }, 300);
    },
    
    /**
     * Shortcuts pentru tipuri
     */
    success(message, duration) {
        return this.show(message, 'success', duration);
    },
    
    error(message, duration) {
        return this.show(message, 'error', duration);
    },
    
    warning(message, duration) {
        return this.show(message, 'warning', duration);
    },
    
    info(message, duration) {
        return this.show(message, 'info', duration);
    },
    
    /**
     * Închide toate toast-urile
     */
    closeAll() {
        this.toasts.forEach(toast => this.close(toast));
    },
    
    /**
     * Obține icon pentru tip
     */
    _getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }
};

// Export global
window.ToastSystem = ToastSystem;
window.toast = ToastSystem;

// Shortcuts globale
window.showToast = (msg, type, duration) => ToastSystem.show(msg, type, duration);
window.successToast = (msg, duration) => ToastSystem.success(msg, duration);
window.errorToast = (msg, duration) => ToastSystem.error(msg, duration);

if (SUPERPARTY_CONFIG && SUPERPARTY_CONFIG.isDebug()) {
    console.log('✅ Toast System loaded');
}
