// ═══════════════════════════════════════════════════════════
// ANGAJAT - EVENIMENTE PAGE
// ═══════════════════════════════════════════════════════════

// Check auth
const user = StorageUtils.getUser();
if (!user || user.role !== 'angajat') {
    window.location.href = '../index.html';
}

// Display user
document.getElementById('userBadge').textContent = `${user.name} (${user.code})`;

let allEvents = [];
let currentFilter = 'all';

// Load events
async function loadEvents() {
    try {
        const response = await API.request('getEvents', {
            userCode: user.code,
            userRole: user.role
        });

        allEvents = response.events || [];
        renderEvents(filterEvents(allEvents));
    } catch (error) {
        console.error('Load events error:', error);
        document.getElementById('eventsList').innerHTML = '<p>Eroare la încărcare</p>';
    }
}

// Filter events
function filterEvents(events) {
    const now = new Date();
    
    switch(currentFilter) {
        case 'today':
            return events.filter(e => {
                const eventDate = new Date(e.date);
                return eventDate.toDateString() === now.toDateString();
            });
        
        case 'week':
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 7);
            
            return events.filter(e => {
                const eventDate = new Date(e.date);
                return eventDate >= weekStart && eventDate < weekEnd;
            });
        
        default:
            return events;
    }
}

// Render events
function renderEvents(events) {
    const container = document.getElementById('eventsList');
    
    if (events.length === 0) {
        container.innerHTML = '<p class="no-events">Nu ai evenimente</p>';
        return;
    }
    
    // Group by date
    const grouped = {};
    events.forEach(event => {
        const date = new Date(event.date).toLocaleDateString('ro-RO');
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(event);
    });
    
    let html = '';
    Object.keys(grouped).forEach(date => {
        html += `<div class="date-group">
            <h3>${date}</h3>`;
        
        grouped[date].forEach(event => {
            const statusClass = event.status === 'completed' ? 'completed' : 'pending';
            
            html += `
                <div class="event-card ${statusClass}">
                    <h4>${event.character}</h4>
                    <p>⏰ ${event.time}</p>
                    <p>📍 ${event.client}</p>
                    <p>💰 ${event.price} RON</p>
                    <span class="status">${event.status}</span>
                    <button onclick="uploadEvidence('${event.id}')">📸 Upload Dovezi</button>
                </div>
            `;
        });
        
        html += '</div>';
    });
    
    container.innerHTML = html;
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderEvents(filterEvents(allEvents));
    });
});

// Upload evidence
function uploadEvidence(eventId) {
    window.location.href = `angajat-dovezi.html?eventId=${eventId}`;
}

// Logout
function logout() {
    StorageUtils.removeUser();
    window.location.href = '../index.html';
}

// Init
loadEvents();
