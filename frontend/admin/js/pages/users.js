// ═══════════════════════════════════════════════════════════
// SUPERPARTY v7.0 - ADMIN USERS MANAGEMENT
// Management useri cu CRUD complet
// ═══════════════════════════════════════════════════════════

const AdminUsers = {
    
    async render() {
        const container = document.getElementById('page-users');
        if (!container) return;
        
        const users = AdminState.getFilteredUsers();
        
        container.innerHTML = `
            <div class="admin-page-header">
                <h2 class="admin-page-title">Management Useri</h2>
                <div class="admin-page-actions">
                    <button class="btn btn-primary" onclick="AdminUsers.showCreateForm()">
                        + Adaugă Angajat
                    </button>
                </div>
            </div>
            
            ${this.renderFilters()}
            ${this.renderUsersTable(users)}
        `;
        
        this.setupListeners();
    },
    
    renderFilters() {
        return `
            <div style="display: flex; gap: var(--spacing-sm); margin-bottom: var(--spacing-lg); flex-wrap: wrap;">
                <button class="btn ${AdminState.usersFilter === 'all' ? 'btn-primary' : 'btn-secondary'}" 
                        onclick="AdminUsers.setFilter('all')">
                    Toți (${AdminState.users.length})
                </button>
                <button class="btn ${AdminState.usersFilter === 'active' ? 'btn-primary' : 'btn-secondary'}" 
                        onclick="AdminUsers.setFilter('active')">
                    Activi (${AdminState.users.filter(u => u.status === 'active').length})
                </button>
                <button class="btn ${AdminState.usersFilter === 'inactive' ? 'btn-primary' : 'btn-secondary'}" 
                        onclick="AdminUsers.setFilter('inactive')">
                    Inactivi (${AdminState.users.filter(u => u.status === 'inactive').length})
                </button>
            </div>
        `;
    },
    
    renderUsersTable(users) {
        if (users.length === 0) {
            return `
                <div class="admin-empty-state">
                    <div class="admin-empty-icon">👥</div>
                    <div class="admin-empty-title">Nu există angajați</div>
                    <button class="btn btn-primary" onclick="AdminUsers.showCreateForm()">
                        Adaugă Primul Angajat
                    </button>
                </div>
            `;
        }
        
        return `
            <div class="admin-table-container">
                <div class="admin-table-header">
                    <h3 class="admin-table-title">Angajați (${users.length})</h3>
                    <div class="admin-table-search">
                        <input type="text" id="search-users" placeholder="Caută după nume, email...">
                    </div>
                </div>
                
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Nume</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Echipă</th>
                            <th>Status</th>
                            <th>Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr>
                                <td><strong>${user.name || 'N/A'}</strong></td>
                                <td>${user.email}</td>
                                <td>${user.role === 'TRAINER' ? 'Trainer' : 'Operator'}</td>
                                <td>${user.team || 'N/A'}</td>
                                <td>
                                    <span class="admin-badge ${user.status === 'active' ? 'active' : 'inactive'}">
                                        ${user.status === 'active' ? '✓ Activ' : '✕ Inactiv'}
                                    </span>
                                </td>
                                <td>
                                    <div class="admin-table-actions">
                                        <button class="admin-btn-icon view" onclick="AdminUsers.viewUser('${user.id}')" title="Vezi">
                                            👁️
                                        </button>
                                        <button class="admin-btn-icon edit" onclick="AdminUsers.editUser('${user.id}')" title="Editează">
                                            ✏️
                                        </button>
                                        <button class="admin-btn-icon delete" onclick="AdminUsers.deleteUser('${user.id}')" title="Șterge">
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },
    
    setupListeners() {
        const searchInput = document.getElementById('search-users');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchUsers(e.target.value);
            });
        }
    },
    
    searchUsers(query) {
        const rows = document.querySelectorAll('.admin-table tbody tr');
        const lowerQuery = query.toLowerCase();
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(lowerQuery) ? '' : 'none';
        });
    },
    
    setFilter(filter) {
        AdminState.usersFilter = filter;
        this.render();
    },
    
    showCreateForm() {
        ModalSystem.show({
            title: 'Adaugă Angajat Nou',
            content: `
                <form id="form-create-user">
                    <div class="form-group">
                        <label class="form-label">Nume Complet*</label>
                        <input type="text" class="form-input" name="name" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Email*</label>
                        <input type="email" class="form-input" name="email" required>
                    </div>
                    
                    <div class="admin-form-row">
                        <div class="form-group">
                            <label class="form-label">Rol*</label>
                            <select class="form-input" name="role" required>
                                <option value="OPERATOR">Operator</option>
                                <option value="TRAINER">Trainer</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Echipă*</label>
                            <select class="form-input" name="team" required>
                                ${Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map(l => 
                                    `<option value="${l}">Echipa ${l}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Parola Temporară*</label>
                        <input type="password" class="form-input" name="password" required minlength="6">
                    </div>
                </form>
            `,
            buttons: [
                {
                    id: 'cancel',
                    text: 'Anulează',
                    primary: false
                },
                {
                    id: 'create',
                    text: 'Creează Angajat',
                    primary: true,
                    onClick: () => this.handleCreateUser()
                }
            ]
        });
    },
    
    async handleCreateUser() {
        const form = document.getElementById('form-create-user');
        if (!form || !form.checkValidity()) {
            toast.error('Completează toate câmpurile!');
            return false;
        }
        
        const formData = new FormData(form);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            role: formData.get('role'),
            team: formData.get('team'),
            password: formData.get('password'),
            status: 'active'
        };
        
        try {
            await AdminState.createUser(userData);
            toast.success('Angajat creat cu succes!');
            this.render();
            return true;
            
        } catch (error) {
            toast.error(error.message || 'Eroare la creare angajat');
            return false;
        }
    },
    
    viewUser(userId) {
        const user = AdminState.getUser(userId);
        if (!user) return;
        
        ModalSystem.show({
            title: `👤 ${user.name}`,
            content: `
                <div style="line-height: 2;">
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Rol:</strong> ${user.role === 'TRAINER' ? 'Trainer' : 'Operator'}</p>
                    <p><strong>Echipă:</strong> ${user.team || 'N/A'}</p>
                    <p><strong>Cod:</strong> ${user.code || 'N/A'}</p>
                    <p><strong>Status:</strong> 
                        <span class="admin-badge ${user.status === 'active' ? 'active' : 'inactive'}">
                            ${user.status === 'active' ? 'Activ' : 'Inactiv'}
                        </span>
                    </p>
                    ${user.phone ? `<p><strong>Telefon:</strong> ${FormatUtils.formatPhone(user.phone)}</p>` : ''}
                    ${user.joinDate ? `<p><strong>Membru din:</strong> ${FormatUtils.formatDate(user.joinDate)}</p>` : ''}
                </div>
            `,
            buttons: [
                { id: 'close', text: 'Închide', primary: true }
            ]
        });
    },
    
    editUser(userId) {
        const user = AdminState.getUser(userId);
        if (!user) return;
        
        ModalSystem.show({
            title: `Editează: ${user.name}`,
            content: `
                <form id="form-edit-user">
                    <div class="form-group">
                        <label class="form-label">Nume</label>
                        <input type="text" class="form-input" name="name" value="${user.name || ''}">
                    </div>
                    
                    <div class="admin-form-row">
                        <div class="form-group">
                            <label class="form-label">Rol</label>
                            <select class="form-input" name="role">
                                <option value="OPERATOR" ${user.role === 'OPERATOR' ? 'selected' : ''}>Operator</option>
                                <option value="TRAINER" ${user.role === 'TRAINER' ? 'selected' : ''}>Trainer</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Status</label>
                            <select class="form-input" name="status">
                                <option value="active" ${user.status === 'active' ? 'selected' : ''}>Activ</option>
                                <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>Inactiv</option>
                            </select>
                        </div>
                    </div>
                </form>
            `,
            buttons: [
                { id: 'cancel', text: 'Anulează', primary: false },
                {
                    id: 'save',
                    text: 'Salvează',
                    primary: true,
                    onClick: () => this.handleEditUser(userId)
                }
            ]
        });
    },
    
    async handleEditUser(userId) {
        const form = document.getElementById('form-edit-user');
        const formData = new FormData(form);
        
        const updates = {
            name: formData.get('name'),
            role: formData.get('role'),
            status: formData.get('status')
        };
        
        try {
            await AdminState.updateUser(userId, updates);
            toast.success('Angajat actualizat!');
            this.render();
            return true;
        } catch (error) {
            toast.error('Eroare la actualizare');
            return false;
        }
    },
    
    deleteUser(userId) {
        const user = AdminState.getUser(userId);
        if (!user) return;
        
        ModalSystem.confirm(
            `Sigur vrei să ștergi angajatul "${user.name}"? Această acțiune este permanentă!`,
            async () => {
                try {
                    await AdminState.deleteUser(userId);
                    toast.success('Angajat șters!');
                    this.render();
                } catch (error) {
                    toast.error('Eroare la ștergere');
                }
            },
            null
        );
    }
};

window.AdminUsers = AdminUsers;
