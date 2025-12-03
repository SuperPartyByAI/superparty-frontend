// ═══════════════════════════════════════════════════════════
// SUPERPARTY v7.0 - ADMIN EVENTS MANAGEMENT
// Management evenimente cu CRUD
// ═══════════════════════════════════════════════════════════

const AdminEvents = {
    
    async render() {
        const container = document.getElementById('page-events');
        if (!container) return;
        
        const events = AdminState.getFilteredEvents();
        
        container.innerHTML = `
            <div class="admin-page-header">
                <h2 class="admin-page-title">Management Evenimente</h2>
                <div class="admin-page-actions">
                    <button class="btn btn-primary" onclick="AdminEvents.showCreateForm()">
                        + Creare Petrecere
                    </button>
                </div>
            </div>
            
            ${this.renderFilters()}
            ${this.renderEventsTable(events)}
        `;
        
        this.setupListeners();
    },
    
    renderFilters() {
        return `
            <div style="display: flex; gap: var(--spacing-sm); margin-bottom: var(--spacing-lg); flex-wrap: wrap;">
                <button class="btn ${AdminState.eventsFilter === 'all' ? 'btn-primary' : 'btn-secondary'}" 
                        onclick="AdminEvents.setFilter('all')">
                    Toate (${AdminState.events.length})
                </button>
                <button class="btn ${AdminState.eventsFilter === 'upcoming' ? 'btn-primary' : 'btn-secondary'}" 
                        onclick="AdminEvents.setFilter('upcoming')">
                    Viitoare
                </button>
                <button class="btn ${AdminState.eventsFilter === 'past' ? 'btn-primary' : 'btn-secondary'}" 
                        onclick="AdminEvents.setFilter('past')">
                    Trecute
                </button>
            </div>
        `;
    },
    
    renderEventsTable(events) {
        if (events.length === 0) {
            return `
                <div class="admin-empty-state">
                    <div class="admin-empty-icon">🎉</div>
                    <div class="admin-empty-title">Nu există evenimente</div>
                    <button class="btn btn-primary" onclick="AdminEvents.showCreateForm()">
                        Creare Prima Petrecere
                    </button>
                </div>
            `;
        }
        
        return `
            <div class="admin-table-container">
                <div class="admin-table-header">
                    <h3 class="admin-table-title">Evenimente (${events.length})</h3>
                    <div class="admin-table-search">
                        <input type="text" id="search-events" placeholder="Caută...">
                    </div>
                </div>
                
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Titlu</th>
                            <th>Dată</th>
                            <th>Locație</th>
                            <th>Alocat</th>
                            <th>Status</th>
                            <th>Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${events.map(event => {
                            const isPast = new Date(event.date) < new Date();
                            return `
                                <tr>
                                    <td><strong>${event.title || 'Petrecere'}</strong></td>
                                    <td>${FormatUtils.formatDate(event.date)}</td>
                                    <td>${event.location || 'N/A'}</td>
                                    <td>${event.assignedTo || 'Nealocată'}</td>
                                    <td>
                                        <span class="admin-badge ${isPast ? 'active' : 'pending'}">
                                            ${isPast ? 'Finalizată' : 'Viitoare'}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="admin-table-actions">
                                            <button class="admin-btn-icon view" onclick="AdminEvents.viewEvent('${event.id}')">👁️</button>
                                            <button class="admin-btn-icon edit" onclick="AdminEvents.editEvent('${event.id}')">✏️</button>
                                            <button class="admin-btn-icon delete" onclick="AdminEvents.deleteEvent('${event.id}')">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },
    
    setupListeners() {
        const searchInput = document.getElementById('search-events');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                document.querySelectorAll('.admin-table tbody tr').forEach(row => {
                    row.style.display = row.textContent.toLowerCase().includes(query) ? '' : 'none';
                });
            });
        }
    },
    
    setFilter(filter) {
        AdminState.eventsFilter = filter;
        this.render();
    },
    
    showCreateForm() {
        const users = AdminState.users.filter(u => u.status === 'active');
        
        ModalSystem.show({
            title: 'Creare Petrecere Nouă',
            content: `
                <form id="form-create-event">
                    <div class="form-group">
                        <label class="form-label">Titlu Petrecere*</label>
                        <input type="text" class="form-input" name="title" required placeholder="Ex: Petrecere Ana 5 ani">
                    </div>
                    
                    <div class="admin-form-row">
                        <div class="form-group">
                            <label class="form-label">Dată*</label>
                            <input type="date" class="form-input" name="date" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Oră*</label>
                            <input type="time" class="form-input" name="time" required value="14:00">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Locație*</label>
                        <input type="text" class="form-input" name="location" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Alocă Angajat</label>
                        <select class="form-input" name="assignedTo">
                            <option value="">Nealocată (deocamdată)</option>
                            ${users.map(u => `
                                <option value="${u.id}">${u.name} (${u.team}${u.code})</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Note</label>
                        <textarea class="form-input" name="notes" rows="3"></textarea>
                    </div>
                </form>
            `,
            buttons: [
                { id: 'cancel', text: 'Anulează', primary: false },
                {
                    id: 'create',
                    text: 'Creează Petrecere',
                    primary: true,
                    onClick: () => this.handleCreateEvent()
                }
            ]
        });
    },
    
    async handleCreateEvent() {
        const form = document.getElementById('form-create-event');
        if (!form || !form.checkValidity()) {
            toast.error('Completează toate câmpurile obligatorii!');
            return false;
        }
        
        const formData = new FormData(form);
        const eventData = {
            title: formData.get('title'),
            date: formData.get('date'),
            time: formData.get('time'),
            location: formData.get('location'),
            assignedTo: formData.get('assignedTo') || null,
            notes: formData.get('notes')
        };
        
        try {
            await AdminState.createEvent(eventData);
            toast.success('Petrecere creată!');
            this.render();
            return true;
        } catch (error) {
            toast.error('Eroare la creare');
            return false;
        }
    },
    
    viewEvent(eventId) {
        const event = AdminState.getEvent(eventId);
        if (!event) return;
        
        ModalSystem.show({
            title: `🎉 ${event.title}`,
            content: `
                <div style="line-height: 2;">
                    <p><strong>Dată:</strong> ${FormatUtils.formatDateTime(event.date)}</p>
                    <p><strong>Locație:</strong> ${event.location}</p>
                    <p><strong>Alocat către:</strong> ${event.assignedTo || 'Nealocată'}</p>
                    ${event.notes ? `<p><strong>Note:</strong> ${event.notes}</p>` : ''}
                </div>
            `,
            buttons: [{ id: 'close', text: 'Închide', primary: true }]
        });
    },
    
    editEvent(eventId) {
        const event = AdminState.getEvent(eventId);
        const users = AdminState.users.filter(u => u.status === 'active');
        if (!event) return;
        
        ModalSystem.show({
            title: `Editează: ${event.title}`,
            content: `
                <form id="form-edit-event">
                    <div class="form-group">
                        <label class="form-label">Titlu</label>
                        <input type="text" class="form-input" name="title" value="${event.title || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Locație</label>
                        <input type="text" class="form-input" name="location" value="${event.location || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Alocă Angajat</label>
                        <select class="form-input" name="assignedTo">
                            <option value="">Nealocată</option>
                            ${users.map(u => `
                                <option value="${u.id}" ${event.assignedTo === u.id ? 'selected' : ''}>
                                    ${u.name} (${u.team}${u.code})
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </form>
            `,
            buttons: [
                { id: 'cancel', text: 'Anulează', primary: false },
                {
                    id: 'save',
                    text: 'Salvează',
                    primary: true,
                    onClick: () => this.handleEditEvent(eventId)
                }
            ]
        });
    },
    
    async handleEditEvent(eventId) {
        const form = document.getElementById('form-edit-event');
        const formData = new FormData(form);
        
        try {
            await AdminState.updateEvent(eventId, {
                title: formData.get('title'),
                location: formData.get('location'),
                assignedTo: formData.get('assignedTo') || null
            });
            toast.success('Petrecere actualizată!');
            this.render();
            return true;
        } catch (error) {
            toast.error('Eroare la actualizare');
            return false;
        }
    },
    
    deleteEvent(eventId) {
        const event = AdminState.getEvent(eventId);
        if (!event) return;
        
        ModalSystem.confirm(
            `Sigur vrei să ștergi petrecerea "${event.title}"?`,
            async () => {
                try {
                    await AdminState.deleteEvent(eventId);
                    toast.success('Petrecere ștearsă!');
                    this.render();
                } catch (error) {
                    toast.error('Eroare la ștergere');
                }
            },
            null
        );
    }
};

window.AdminEvents = AdminEvents;
