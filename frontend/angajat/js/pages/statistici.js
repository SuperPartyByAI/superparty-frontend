// ═══════════════════════════════════════════════════════════
// SUPERPARTY v7.0 - ANGAJAT STATISTICI
// Pagină statistici salarii și performance
// ═══════════════════════════════════════════════════════════

const AngajatStatistici = {
    
    // Render page
    async render() {
        const container = document.getElementById('page-statistici');
        if (!container) return;
        
        const stats = AngajatState.statistics || {};
        
        container.innerHTML = `
            <div class="angajat-page-header">
                <h2 class="angajat-page-title">Statistici</h2>
                <p class="angajat-page-subtitle">Overview salarii și performance</p>
            </div>
            
            ${this.renderSalarySummary(stats)}
            ${this.renderMonthlyBreakdown(stats)}
            ${this.renderPerformanceStats(stats)}
        `;
    },
    
    // Render salary summary
    renderSalarySummary(stats) {
        const currentMonth = stats.monthSalary || 0;
        const lastMonth = stats.lastMonthSalary || 0;
        const yearTotal = stats.yearSalary || 0;
        const average = stats.averageSalary || 0;
        
        return `
            <div class="angajat-stats-grid">
                <div class="angajat-stat-card">
                    <div class="angajat-stat-header">
                        <div class="angajat-stat-icon success">
                            💰
                        </div>
                        <div class="angajat-stat-info">
                            <div class="angajat-stat-label">Luna Curentă</div>
                            <div class="angajat-stat-value">${FormatUtils.formatCurrency(currentMonth)}</div>
                        </div>
                    </div>
                    ${lastMonth > 0 ? `
                        <div class="angajat-stat-change ${currentMonth >= lastMonth ? 'positive' : 'negative'}">
                            ${currentMonth >= lastMonth ? '↑' : '↓'} 
                            ${FormatUtils.formatCurrency(Math.abs(currentMonth - lastMonth))}
                        </div>
                    ` : ''}
                </div>
                
                <div class="angajat-stat-card">
                    <div class="angajat-stat-header">
                        <div class="angajat-stat-icon primary">
                            📅
                        </div>
                        <div class="angajat-stat-info">
                            <div class="angajat-stat-label">Luna Trecută</div>
                            <div class="angajat-stat-value">${FormatUtils.formatCurrency(lastMonth)}</div>
                        </div>
                    </div>
                </div>
                
                <div class="angajat-stat-card">
                    <div class="angajat-stat-header">
                        <div class="angajat-stat-icon warning">
                            📊
                        </div>
                        <div class="angajat-stat-info">
                            <div class="angajat-stat-label">Total Anul Acesta</div>
                            <div class="angajat-stat-value">${FormatUtils.formatCurrency(yearTotal)}</div>
                        </div>
                    </div>
                </div>
                
                <div class="angajat-stat-card">
                    <div class="angajat-stat-header">
                        <div class="angajat-stat-icon primary">
                            📈
                        </div>
                        <div class="angajat-stat-info">
                            <div class="angajat-stat-label">Medie Lunară</div>
                            <div class="angajat-stat-value">${FormatUtils.formatCurrency(average)}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Render monthly breakdown
    renderMonthlyBreakdown(stats) {
        const breakdown = stats.salaryBreakdown || {};
        
        return `
            <div style="background: var(--bg-secondary); padding: var(--spacing-lg); border-radius: var(--radius-lg); margin-top: var(--spacing-xl);">
                <h3 style="font-size: var(--text-xl); font-weight: var(--font-semibold); margin-bottom: var(--spacing-lg);">
                    Breakdown Salariu Luna Aceasta
                </h3>
                
                <div style="display: grid; gap: var(--spacing-md);">
                    <div style="display: flex; justify-content: space-between; padding: var(--spacing-sm) 0; border-bottom: 1px solid var(--border);">
                        <span style="color: var(--text-secondary);">Salariu de Bază:</span>
                        <span style="font-weight: var(--font-semibold);">${FormatUtils.formatCurrency(breakdown.salariuBaza || 0)}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; padding: var(--spacing-sm) 0; border-bottom: 1px solid var(--border);">
                        <span style="color: var(--text-secondary);">Target Animație:</span>
                        <span style="font-weight: var(--font-semibold); color: var(--success);">${FormatUtils.formatCurrency(breakdown.targetAnimatie || 0)}</span>
                    </div>
                    
                    ${breakdown.salariuTraine > 0 ? `
                        <div style="display: flex; justify-content: space-between; padding: var(--spacing-sm) 0; border-bottom: 1px solid var(--border);">
                            <span style="color: var(--text-secondary);">Salariu Traîne:</span>
                            <span style="font-weight: var(--font-semibold); color: var(--success);">${FormatUtils.formatCurrency(breakdown.salariuTraine)}</span>
                        </div>
                    ` : ''}
                    
                    ${breakdown.overtime > 0 ? `
                        <div style="display: flex; justify-content: space-between; padding: var(--spacing-sm) 0; border-bottom: 1px solid var(--border);">
                            <span style="color: var(--text-secondary);">Overtime:</span>
                            <span style="font-weight: var(--font-semibold); color: var(--success);">${FormatUtils.formatCurrency(breakdown.overtime)}</span>
                        </div>
                    ` : ''}
                    
                    <div style="display: flex; justify-content: space-between; padding: var(--spacing-md) 0; font-size: var(--text-lg);">
                        <span style="font-weight: var(--font-bold);">TOTAL:</span>
                        <span style="font-weight: var(--font-bold); color: var(--primary);">${FormatUtils.formatCurrency(stats.monthSalary || 0)}</span>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Render performance stats
    renderPerformanceStats(stats) {
        const monthEvents = stats.monthEvents || 0;
        const targetRate = stats.targetRate || 0;
        const evidenceRate = stats.evidenceRate || 100;
        
        return `
            <div style="margin-top: var(--spacing-xl);">
                <h3 style="font-size: var(--text-xl); font-weight: var(--font-semibold); margin-bottom: var(--spacing-lg);">
                    Performance
                </h3>
                
                <div class="angajat-stats-grid">
                    <div class="angajat-stat-card">
                        <div class="angajat-stat-header">
                            <div class="angajat-stat-icon primary">
                                🎉
                            </div>
                            <div class="angajat-stat-info">
                                <div class="angajat-stat-label">Petreceri Luna Aceasta</div>
                                <div class="angajat-stat-value">${monthEvents}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="angajat-stat-card">
                        <div class="angajat-stat-header">
                            <div class="angajat-stat-icon ${targetRate >= 80 ? 'success' : 'warning'}">
                                🎯
                            </div>
                            <div class="angajat-stat-info">
                                <div class="angajat-stat-label">Rata Target</div>
                                <div class="angajat-stat-value">${targetRate}%</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="angajat-stat-card">
                        <div class="angajat-stat-header">
                            <div class="angajat-stat-icon ${evidenceRate >= 90 ? 'success' : 'error'}">
                                📷
                            </div>
                            <div class="angajat-stat-info">
                                <div class="angajat-stat-label">Dovezi Trimise</div>
                                <div class="angajat-stat-value">${evidenceRate}%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

window.AngajatStatistici = AngajatStatistici;

if (SUPERPARTY_CONFIG && SUPERPARTY_CONFIG.isDebug()) {
    console.log('✅ Angajat Statistici loaded');
}
