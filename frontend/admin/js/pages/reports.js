// ═══════════════════════════════════════════════════════════
// SUPERPARTY v7.0 - ADMIN REPORTS
// Rapoarte și statistici detaliate
// ═══════════════════════════════════════════════════════════

const AdminReports = {
    
    selectedPeriod: 'month',
    
    async render() {
        const container = document.getElementById('page-reports');
        if (!container) return;
        
        container.innerHTML = `
            <div class="admin-page-header">
                <h2 class="admin-page-title">Rapoarte & Statistici</h2>
                <div class="admin-page-actions">
                    <button class="btn btn-secondary" onclick="AdminReports.exportReport()">
                        📥 Export CSV
                    </button>
                </div>
            </div>
            
            ${this.renderPeriodSelector()}
            ${this.renderOverviewStats()}
            ${this.renderTeamPerformance()}
            ${this.renderTopPerformers()}
        `;
        
        this.setupListeners();
    },
    
    renderPeriodSelector() {
        return `
            <div style="display: flex; gap: var(--spacing-sm); margin-bottom: var(--spacing-xl); flex-wrap: wrap;">
                <button class="btn ${this.selectedPeriod === 'week' ? 'btn-primary' : 'btn-secondary'}" 
                        onclick="AdminReports.setPeriod('week')">
                    Săptămâna Aceasta
                </button>
                <button class="btn ${this.selectedPeriod === 'month' ? 'btn-primary' : 'btn-secondary'}" 
                        onclick="AdminReports.setPeriod('month')">
                    Luna Aceasta
                </button>
                <button class="btn ${this.selectedPeriod === 'year' ? 'btn-primary' : 'btn-secondary'}" 
                        onclick="AdminReports.setPeriod('year')">
                    Anul Acesta
                </button>
            </div>
        `;
    },
    
    renderOverviewStats() {
        const stats = AdminState.statistics || {};
        
        return `
            <div class="admin-stats-grid">
                <div class="admin-stat-card success">
                    <div class="admin-stat-header">
                        <div class="admin-stat-label">Total Evenimente</div>
                        <div class="admin-stat-icon">🎉</div>
                    </div>
                    <div class="admin-stat-value">${stats.totalEvents || AdminState.events.length}</div>
                    <div class="admin-stat-change positive">
                        +${stats.eventsGrowth || 0}% față de perioada anterioară
                    </div>
                </div>
                
                <div class="admin-stat-card info">
                    <div class="admin-stat-header">
                        <div class="admin-stat-label">Salarii Totale</div>
                        <div class="admin-stat-icon">💰</div>
                    </div>
                    <div class="admin-stat-value">${FormatUtils.formatCompactCurrency(stats.totalSalaries || 0)}</div>
                    <div class="admin-stat-change">
                        ${FormatUtils.formatCurrency(stats.averageSalary || 0)} / angajat
                    </div>
                </div>
                
                <div class="admin-stat-card warning">
                    <div class="admin-stat-header">
                        <div class="admin-stat-label">Rată Participare</div>
                        <div class="admin-stat-icon">📊</div>
                    </div>
                    <div class="admin-stat-value">${stats.participationRate || 0}%</div>
                    <div class="admin-stat-change">
                        ${stats.activeEmployees || 0} angajați activi
                    </div>
                </div>
                
                <div class="admin-stat-card error">
                    <div class="admin-stat-header">
                        <div class="admin-stat-label">Target Atins</div>
                        <div class="admin-stat-icon">🎯</div>
                    </div>
                    <div class="admin-stat-value">${stats.targetRate || 0}%</div>
                    <div class="admin-stat-change">
                        ${stats.targetsAchieved || 0} / ${stats.totalTargets || 0} targeturi
                    </div>
                </div>
            </div>
        `;
    },
    
    renderTeamPerformance() {
        const teams = this.calculateTeamStats();
        
        return `
            <div class="card" style="margin-bottom: var(--spacing-xl);">
                <div class="card-header">
                    <h3 class="card-title">📊 Performance per Echipă</h3>
                </div>
                <div class="card-body">
                    <div style="overflow-x: auto;">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>Echipă</th>
                                    <th>Angajați</th>
                                    <th>Evenimente</th>
                                    <th>Salarii Totale</th>
                                    <th>Medie/Angajat</th>
                                    <th>Rating</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${teams.map(team => `
                                    <tr>
                                        <td><strong>Echipa ${team.name}</strong></td>
                                        <td>${team.members}</td>
                                        <td>${team.events}</td>
                                        <td>${FormatUtils.formatCurrency(team.totalSalary)}</td>
                                        <td>${FormatUtils.formatCurrency(team.avgSalary)}</td>
                                        <td>
                                            <div style="display: flex; align-items: center; gap: 4px;">
                                                ${'⭐'.repeat(Math.min(5, Math.round(team.rating)))}
                                                <span style="margin-left: 8px; color: var(--text-secondary);">
                                                    ${team.rating.toFixed(1)}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderTopPerformers() {
        const topPerformers = this.getTopPerformers();
        
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">🏆 Top Performeri</h3>
                </div>
                <div class="card-body">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--spacing-lg);">
                        ${topPerformers.map((user, index) => `
                            <div style="display: flex; align-items: center; gap: var(--spacing-md); padding: var(--spacing-md); background: var(--bg-tertiary); border-radius: var(--radius-md);">
                                <div style="
                                    width: 48px; 
                                    height: 48px; 
                                    border-radius: 50%; 
                                    background: ${index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : '#d97706'}; 
                                    color: white; 
                                    display: flex; 
                                    align-items: center; 
                                    justify-content: center; 
                                    font-size: 24px;
                                    font-weight: bold;
                                ">
                                    ${index + 1}
                                </div>
                                <div style="flex: 1;">
                                    <div style="font-weight: var(--font-semibold); margin-bottom: 4px;">
                                        ${user.name}
                                    </div>
                                    <div style="font-size: var(--text-sm); color: var(--text-secondary);">
                                        ${user.events} evenimente • ${FormatUtils.formatCurrency(user.totalEarned)}
                                    </div>
                                </div>
                                <div style="font-size: 24px;">
                                    ${index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },
    
    setupListeners() {
        // Setup any additional listeners
    },
    
    setPeriod(period) {
        this.selectedPeriod = period;
        this.render();
    },
    
    calculateTeamStats() {
        const teams = {};
        
        // Initialize teams A-Z
        Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').forEach(letter => {
            teams[letter] = {
                name: letter,
                members: 0,
                events: 0,
                totalSalary: 0,
                avgSalary: 0,
                rating: 0
            };
        });
        
        // Count members
        AdminState.users.forEach(user => {
            if (user.team && teams[user.team]) {
                teams[user.team].members++;
            }
        });
        
        // Mock events and salaries (in real app, calculate from events)
        Object.keys(teams).forEach(key => {
            const team = teams[key];
            if (team.members > 0) {
                team.events = Math.floor(Math.random() * 50) + 10;
                team.totalSalary = team.events * 450 * team.members;
                team.avgSalary = team.totalSalary / team.members;
                team.rating = 3 + Math.random() * 2; // 3-5 stars
            }
        });
        
        return Object.values(teams)
            .filter(t => t.members > 0)
            .sort((a, b) => b.totalSalary - a.totalSalary);
    },
    
    getTopPerformers() {
        // Mock data - în realitate ar veni din evenimente reale
        return AdminState.users
            .filter(u => u.status === 'active')
            .map(u => ({
                ...u,
                events: Math.floor(Math.random() * 30) + 10,
                totalEarned: (Math.floor(Math.random() * 30) + 10) * 450
            }))
            .sort((a, b) => b.totalEarned - a.totalEarned)
            .slice(0, 6);
    },
    
    exportReport() {
        toast.info('Export în dezvoltare...');
        
        // Mock CSV generation
        const csv = [
            ['Nume', 'Email', 'Rol', 'Echipă', 'Status'],
            ...AdminState.users.map(u => [
                u.name,
                u.email,
                u.role,
                u.team || 'N/A',
                u.status
            ])
        ];
        
        console.log('📥 Export CSV:', csv);
    }
};

window.AdminReports = AdminReports;
