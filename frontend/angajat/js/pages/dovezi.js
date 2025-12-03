// ═══════════════════════════════════════════════════════════
// SUPERPARTY v7.0 - ANGAJAT DOVEZI
// Pagină upload dovezi foto
// ═══════════════════════════════════════════════════════════

const AngajatDovezi = {
    
    selectedEvent: null,
    selectedStage: null,
    selectedPhotos: [],
    
    // Render page
    async render() {
        const container = document.getElementById('page-dovezi');
        if (!container) return;
        
        const todayEvents = AngajatState.getTodayEvents();
        
        container.innerHTML = `
            <div class="angajat-page-header">
                <h2 class="angajat-page-title">Trimite Dovezi</h2>
                <p class="angajat-page-subtitle">Încarcă fotografii pentru petrecerile de astăzi</p>
            </div>
            
            ${todayEvents.length > 0 ? this.renderUploadForm(todayEvents) : this.renderNoEvents()}
        `;
        
        this.setupListeners();
    },
    
    // Render upload form
    renderUploadForm(events) {
        return `
            <!-- Select Event -->
            <div class="form-group">
                <label class="form-label">Selectează Petrecerea:</label>
                <select class="form-input" id="select-event">
                    <option value="">Alege petrecerea...</option>
                    ${events.map(e => `
                        <option value="${e.id}">
                            ${e.title || 'Petrecere'} - ${FormatUtils.formatTime(e.date)}
                        </option>
                    `).join('')}
                </select>
            </div>
            
            <!-- Select Stage -->
            <div class="form-group">
                <label class="form-label">Selectează Etapa:</label>
                <select class="form-input" id="select-stage">
                    <option value="">Alege etapa...</option>
                    <option value="Bagaj">📦 Bagaj (la plecare)</option>
                    <option value="Am Ajuns">📍 Am Ajuns (la locație)</option>
                    <option value="Returnare">🔄 Returnare (înapoi acasă)</option>
                    <option value="Recuperare">✅ Recuperare (finalizare)</option>
                </select>
            </div>
            
            <!-- Upload Area -->
            <div class="angajat-upload-card" id="upload-card" style="display: none;">
                <div class="angajat-upload-area" id="upload-area">
                    <div class="angajat-upload-icon">📷</div>
                    <div class="angajat-upload-title">Click sau trage fotografiile aici</div>
                    <div class="angajat-upload-subtitle">Maximum 5 MB per fotografie • JPG, PNG</div>
                    <input type="file" id="file-input" accept="image/*" multiple style="display: none;">
                </div>
                
                <!-- Photo Preview -->
                <div class="angajat-photo-preview" id="photo-preview"></div>
                
                <!-- Submit Button -->
                <button class="btn btn-primary" id="btn-submit-evidence" style="margin-top: var(--spacing-lg); display: none;">
                    Trimite Dovezile
                </button>
            </div>
        `;
    },
    
    // Render no events
    renderNoEvents() {
        return `
            <div class="angajat-empty-state">
                <div class="angajat-empty-icon">📷</div>
                <div class="angajat-empty-title">Nu ai petreceri astăzi</div>
                <div class="angajat-empty-text">Dovezile pot fi trimise doar pentru petrecerile din ziua curentă</div>
            </div>
        `;
    },
    
    // Setup listeners
    setupListeners() {
        const eventSelect = document.getElementById('select-event');
        const stageSelect = document.getElementById('select-stage');
        const uploadCard = document.getElementById('upload-card');
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');
        const submitBtn = document.getElementById('btn-submit-evidence');
        
        if (eventSelect) {
            eventSelect.addEventListener('change', () => {
                this.selectedEvent = eventSelect.value;
                this.checkFormComplete();
            });
        }
        
        if (stageSelect) {
            stageSelect.addEventListener('change', () => {
                this.selectedStage = stageSelect.value;
                this.checkFormComplete();
            });
        }
        
        if (uploadArea) {
            uploadArea.addEventListener('click', () => fileInput?.click());
        }
        
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelect(e.target.files);
            });
        }
        
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitEvidence());
        }
    },
    
    // Check if form is complete
    checkFormComplete() {
        const uploadCard = document.getElementById('upload-card');
        if (this.selectedEvent && this.selectedStage && uploadCard) {
            uploadCard.style.display = 'block';
        }
    },
    
    // Handle file selection
    handleFileSelect(files) {
        Array.from(files).forEach(file => {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} este prea mare (max 5 MB)`);
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                this.selectedPhotos.push({
                    file,
                    data: e.target.result
                });
                this.renderPhotoPreview();
            };
            reader.readAsDataURL(file);
        });
    },
    
    // Render photo preview
    renderPhotoPreview() {
        const container = document.getElementById('photo-preview');
        const submitBtn = document.getElementById('btn-submit-evidence');
        
        if (!container) return;
        
        container.innerHTML = this.selectedPhotos.map((photo, index) => `
            <div class="angajat-photo-item">
                <img src="${photo.data}" alt="Preview ${index + 1}">
                <button class="angajat-photo-remove" onclick="AngajatDovezi.removePhoto(${index})">
                    ×
                </button>
            </div>
        `).join('');
        
        if (submitBtn) {
            submitBtn.style.display = this.selectedPhotos.length > 0 ? 'block' : 'none';
        }
    },
    
    // Remove photo
    removePhoto(index) {
        this.selectedPhotos.splice(index, 1);
        this.renderPhotoPreview();
    },
    
    // Submit evidence
    async submitEvidence() {
        if (!this.selectedEvent || !this.selectedStage || this.selectedPhotos.length === 0) {
            toast.error('Completează toate câmpurile!');
            return;
        }
        
        const submitBtn = document.getElementById('btn-submit-evidence');
        LoadingSystem.buttonStart(submitBtn, 'Se trimite...');
        
        try {
            for (const photo of this.selectedPhotos) {
                await AngajatState.submitEvidence(
                    this.selectedEvent,
                    this.selectedStage,
                    photo.data
                );
            }
            
            toast.success('Dovezi trimise cu succes!');
            
            // Reset form
            this.selectedEvent = null;
            this.selectedStage = null;
            this.selectedPhotos = [];
            this.render();
            
        } catch (error) {
            toast.error('Eroare la trimitere dovezi');
            LoadingSystem.buttonEnd(submitBtn);
        }
    }
};

window.AngajatDovezi = AngajatDovezi;
