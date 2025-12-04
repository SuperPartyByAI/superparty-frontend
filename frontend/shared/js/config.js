// ═══════════════════════════════════════════════════════════
// SUPERPARTY FRONTEND CONFIG - FIXED
// ═══════════════════════════════════════════════════════════

// Backend URL (from Apps Script deployment)
const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbxpV3NKZJLzNe5tTGX5TlUVnAQc1j6z82kPz7QkzartJpFfdPgvvg0T84ay1Ljlrxk/exec';

// Main config object
const SUPERPARTY_CONFIG = {
    BACKEND_URL: BACKEND_URL,
    API_URL: BACKEND_URL,  // alias
    
    APP_NAME: 'SuperParty',
    VERSION: '7.0',
    
    // Debug mode as function (code expects this)
    isDebug: function() {
        return true;  // set to false in production
    },
    
    // Settings
    DEBUG: true,
    LOG_API_CALLS: true,
    LOG_ERRORS: true
};

// Legacy support - global variable
const CONFIG = SUPERPARTY_CONFIG;

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SUPERPARTY_CONFIG;
}

console.log('✅ SuperParty Config loaded - Backend:', BACKEND_URL);
