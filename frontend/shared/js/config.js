// ═══════════════════════════════════════════════════════════
// SUPERPARTY v7.0 - BACKEND CONFIGURATION
// ═══════════════════════════════════════════════════════════

const SUPERPARTY_CONFIG = {
  isDebug() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname === '';
  }
};

// Backend URL - Apps Script Deployment
const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbxpV3NKZJLzNe5tTGX5TlUVnAQc1j6z82kPz7QkzartJpFfdPgvvg0T84ay1Ljlrxk/exec';

// Debug logging
if (SUPERPARTY_CONFIG.isDebug()) {
  console.log('🔧 SuperParty Debug Mode: ON');
  console.log('🌐 Backend URL:', BACKEND_URL);
}

// Export pentru a fi folosit în alte fișiere
if (typeof window !== 'undefined') {
  window.BACKEND_URL = BACKEND_URL;
  window.SUPERPARTY_CONFIG = SUPERPARTY_CONFIG;
}
