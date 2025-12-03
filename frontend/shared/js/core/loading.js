// ═══════════════════════════════════════════════════════════
// SUPERPARTY v7.0 - LOADING SYSTEM
// Sistem loading global și per-element
// ═══════════════════════════════════════════════════════════

const LoadingSystem = {
    
    globalLoader: null,
    activeLoaders: new Set(),
    
    /**
     * Inițializează loader global
     */
    init() {
        if (this.globalLoader) return;
        
        this.globalLoader = document.createElement('div');
        this.globalLoader.id = 'global-loader';
        this.globalLoader.className = 'global-loader hidden';
        this.globalLoader.innerHTML = `
            <div class="loader-content">
                <div class="spinner"></div>
                <p class="loader-text">Se încarcă...</p>
            </div>
        `;
        
        document.body.appendChild(this.globalLoader);
    },
    
    /**
     * Arată loader global
     */
    show(text = 'Se încarcă...') {
        this.init();
        
        const textEl = this.globalLoader.querySelector('.loader-text');
        if (textEl) textEl.textContent = text;
        
        this.globalLoader.classList.remove('hidden');
        this.activeLoaders.add('global');
    },
    
    /**
     * Ascunde loader global
     */
    hide() {
        if (!this.globalLoader) return;
        
        this.globalLoader.classList.add('hidden');
        this.activeLoaders.delete('global');
    },
    
    /**
     * Adaugă loading state la un button
     */
    buttonStart(button, text = 'Se încarcă...') {
        if (!button) return;
        
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.innerHTML = `<span class="spinner"></span> ${text}`;
        this.activeLoaders.add(button);
    },
    
    /**
     * Șterge loading state de pe button
     */
    buttonEnd(button) {
        if (!button) return;
        
        button.disabled = false;
        button.textContent = button.dataset.originalText || 'Trimite';
        delete button.dataset.originalText;
        this.activeLoaders.delete(button);
    },
    
    /**
     * Adaugă loading spinner la un element
     */
    elementStart(element) {
        if (!element) return;
        
        const spinner = document.createElement('div');
        spinner.className = 'inline-spinner';
        spinner.innerHTML = '<span class="spinner"></span>';
        
        element.appendChild(spinner);
        this.activeLoaders.add(element);
    },
    
    /**
     * Șterge loading spinner de pe element
     */
    elementEnd(element) {
        if (!element) return;
        
        const spinner = element.querySelector('.inline-spinner');
        if (spinner) {
            element.removeChild(spinner);
        }
        this.activeLoaders.delete(element);
    },
    
    /**
     * Verifică dacă se încarcă ceva
     */
    isLoading() {
        return this.activeLoaders.size > 0;
    },
    
    /**
     * Ascunde toate loaderele
     */
    hideAll() {
        this.hide();
        this.activeLoaders.forEach(loader => {
            if (loader instanceof HTMLButtonElement) {
                this.buttonEnd(loader);
            } else if (loader !== 'global') {
                this.elementEnd(loader);
            }
        });
        this.activeLoaders.clear();
    }
};

// Export global
window.LoadingSystem = LoadingSystem;

// Init automat
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => LoadingSystem.init());
} else {
    LoadingSystem.init();
}

if (SUPERPARTY_CONFIG && SUPERPARTY_CONFIG.isDebug()) {
    console.log('✅ Loading System loaded');
}
