// ═══════════════════════════════════════════════════════════
// FORMAT UTILS - Date, Number, String formatting
// ═══════════════════════════════════════════════════════════

const FormatUtils = {
  /**
   * Format date to Romanian format
   */
  formatDate(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('ro-RO');
  },
  
  /**
   * Format currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON'
    }).format(amount);
  },
  
  /**
   * Format number
   */
  formatNumber(num) {
    return new Intl.NumberFormat('ro-RO').format(num);
  }
};

FormatUtils.formatCompact = function(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

FormatUtils.formatPercentage = function(num) {
  return num.toFixed(1) + '%';
};

FormatUtils.formatChange = function(num) {
  const sign = num >= 0 ? '+' : '';
  return sign + num.toFixed(1) + '%';
};
