// ═══════════════════════════════════════════════════════════
// ANGAJAT - SALARIU PAGE
// ═══════════════════════════════════════════════════════════

const user = StorageUtils.getUser();
if (!user || user.role !== 'angajat') {
    window.location.href = '../index.html';
}

document.getElementById('userBadge').textContent = `${user.name} (${user.code})`;

// Load salary data
async function loadSalary() {
    try {
        const response = await API.request('getSalaryData', {
            employeeCode: user.code,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
        });

        const salary = response.salary;
        
        // Update stats
        document.getElementById('totalNet').textContent = salary.totalNet + ' RON';
        document.getElementById('eventCount').textContent = salary.eventCount;
        document.getElementById('avgRating').textContent = salary.avgRating + '/5';
        document.getElementById('totalBonus').textContent = salary.totalBonuses + ' RON';
        
        // Update breakdown
        document.getElementById('baseAmount').textContent = salary.base + ' RON';
        document.getElementById('ratingBonus').textContent = '+' + salary.bonuses.rating + ' RON';
        document.getElementById('targetBonus').textContent = '+' + salary.bonuses.target + ' RON';
        document.getElementById('penalties').textContent = '-' + salary.penalties + ' RON';
        document.getElementById('finalTotal').textContent = salary.totalNet + ' RON';
        
        // Render events
        renderEvents(salary.events);
        
    } catch (error) {
        console.error('Load salary error:', error);
    }
}

function renderEvents(events) {
    const container = document.getElementById('eventsList');
    
    if (!events || events.length === 0) {
        container.innerHTML = '<p>Nu ai evenimente înregistrate</p>';
        return;
    }
    
    let html = '';
    events.forEach(event => {
        html += `
            <div class="event-salary-card">
                <div class="event-info">
                    <strong>${event.character}</strong>
                    <span>${new Date(event.date).toLocaleDateString('ro-RO')}</span>
                </div>
                <div class="event-amounts">
                    <span class="base">${event.amount} RON</span>
                    ${event.bonus > 0 ? `<span class="bonus">+${event.bonus} RON</span>` : ''}
                    ${event.penalty > 0 ? `<span class="penalty">-${event.penalty} RON</span>` : ''}
                    <strong>${event.total} RON</strong>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function logout() {
    StorageUtils.removeUser();
    window.location.href = '../index.html';
}

// Init
loadSalary();
