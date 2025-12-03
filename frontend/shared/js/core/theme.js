// ═══════════════════════════════════════════════════════════
// SUPERPARTY v7.0 - THEME SYSTEM
// Sistem dark/light theme cu persistență
// ═══════════════════════════════════════════════════════════

const ThemeSystem = {
    
    currentTheme: 'light',
    
    /**
     * Inițializează tema
     */
    init() {
        // Încarcă tema salvată
        const savedTheme = StorageUtils.getTheme();
        this.currentTheme = savedTheme;
        
        // Aplică tema
        this.apply(this.currentTheme);
        
        // Listen pentru system preference changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addListener((e) => {
                if (StorageUtils.getTheme() === null) {
                    this.apply(e.matches ? 'dark' : 'light');
                }
            });
        }
    },
    
    /**
     * Aplică tema
     */
    apply(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            this.currentTheme = 'dark';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            this.currentTheme = 'light';
        }
        
        // Salvează preferința
        StorageUtils.saveTheme(theme);
        
        // Trigger event
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme } 
        }));
    },
    
    /**
     * Toggle între dark/light
     */
    toggle() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.apply(newTheme);
        return newTheme;
    },
    
    /**
     * Obține tema curentă
     */
    getCurrent() {
        return this.currentTheme;
    },
    
    /**
     * Verifică dacă e dark mode
     */
    isDark() {
        return this.currentTheme === 'dark';
    },
    
    /**
     * Set dark mode
     */
    setDark() {
        this.apply('dark');
    },
    
    /**
     * Set light mode
     */
    setLight() {
        this.apply('light');
    }
};

// Export global
window.ThemeSystem = ThemeSystem;

// Init automat
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ThemeSystem.init());
} else {
    ThemeSystem.init();
}

if (SUPERPARTY_CONFIG && SUPERPARTY_CONFIG.isDebug()) {
    console.log('✅ Theme System loaded');
}
