// ═══════════════════════════════════════════════════════════
// DOM UTILS - DOM manipulation helpers
// ═══════════════════════════════════════════════════════════

const DOMUtils = {
  /**
   * Get element by ID
   */
  get(id) {
    return document.getElementById(id);
  },
  
  /**
   * Show element
   */
  show(element) {
    if (typeof element === 'string') {
      element = this.get(element);
    }
    if (element) element.style.display = '';
  },
  
  /**
   * Hide element
   */
  hide(element) {
    if (typeof element === 'string') {
      element = this.get(element);
    }
    if (element) element.style.display = 'none';
  }
};
