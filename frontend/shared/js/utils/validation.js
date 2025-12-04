// ═══════════════════════════════════════════════════════════
// VALIDATION UTILS - Input validation
// ═══════════════════════════════════════════════════════════

const ValidationUtils = {
  /**
   * Validate email
   */
  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  
  /**
   * Validate phone
   */
  isValidPhone(phone) {
    const re = /^[0-9]{10}$/;
    return re.test(phone.replace(/\s/g, ''));
  },
  
  /**
   * Validate required field
   */
  isRequired(value) {
    return value && value.toString().trim().length > 0;
  }
};
