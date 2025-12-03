// ═══════════════════════════════════════════════════════════
// SUPERPARTY v7.0 - MODAL SYSTEM
// Sistem dialog modals (confirm, alert, custom)
// ═══════════════════════════════════════════════════════════

const ModalSystem = {
    
    activeModal: null,
    
    /**
     * Afișează modal
     */
    show(options = {}) {
        const {
            title = '',
            content = '',
            buttons = [],
            closable = true,
            onClose = null
        } = options;
        
        // Închide modalul activ dacă există
        if (this.activeModal) {
            this.close();
        }
        
        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'modal-overlay';
        
        // Modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        // Header
        let headerHTML = '';
        if (title) {
            headerHTML = `
                <div class="modal-header">
                    <h3>${title}</h3>
                    ${closable ? '<button class="modal-close" onclick="ModalSystem.close()">×</button>' : ''}
                </div>
            `;
        }
        
        // Buttons
        let buttonsHTML = '';
        if (buttons.length > 0) {
            buttonsHTML = '<div class="modal-footer">';
            buttons.forEach(btn => {
                const btnClass = btn.primary ? 'btn btn-primary' : 'btn btn-secondary';
                buttonsHTML += `
                    <button class="${btnClass}" onclick="ModalSystem._handleButton('${btn.id}')">
                        ${btn.text}
                    </button>
                `;
            });
            buttonsHTML += '</div>';
        }
        
        modal.innerHTML = `
            ${headerHTML}
            <div class="modal-body">
                ${content}
            </div>
            ${buttonsHTML}
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Close on overlay click
        if (closable) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close();
                }
            });
        }
        
        // Store callbacks
        this.activeModal = {
            overlay,
            modal,
            buttons: buttons.reduce((acc, btn) => {
                acc[btn.id] = btn.onClick || null;
                return acc;
            }, {}),
            onClose
        };
        
        return { overlay, modal };
    },
    
    /**
     * Închide modalul activ
     */
    close() {
        if (!this.activeModal) return;
        
        const { overlay, onClose } = this.activeModal;
        
        if (overlay && overlay.parentElement) {
            overlay.parentElement.removeChild(overlay);
        }
        
        if (onClose) {
            onClose();
        }
        
        this.activeModal = null;
    },
    
    /**
     * Handle button click
     */
    _handleButton(buttonId) {
        if (!this.activeModal || !this.activeModal.buttons[buttonId]) {
            this.close();
            return;
        }
        
        const callback = this.activeModal.buttons[buttonId];
        
        if (callback) {
            const result = callback();
            // Închide modalul dacă callback-ul returnează !== false
            if (result !== false) {
                this.close();
            }
        } else {
            this.close();
        }
    },
    
    /**
     * Confirm dialog
     */
    confirm(message, onConfirm, onCancel) {
        return this.show({
            title: 'Confirmare',
            content: `<p>${message}</p>`,
            buttons: [
                {
                    id: 'cancel',
                    text: 'Anulează',
                    primary: false,
                    onClick: onCancel
                },
                {
                    id: 'confirm',
                    text: 'Confirmă',
                    primary: true,
                    onClick: onConfirm
                }
            ]
        });
    },
    
    /**
     * Alert dialog
     */
    alert(message, onClose) {
        return this.show({
            title: 'Atenție',
            content: `<p>${message}</p>`,
            buttons: [
                {
                    id: 'ok',
                    text: 'OK',
                    primary: true,
                    onClick: onClose
                }
            ]
        });
    }
};

// Export global
window.ModalSystem = ModalSystem;

if (SUPERPARTY_CONFIG && SUPERPARTY_CONFIG.isDebug()) {
    console.log('✅ Modal System loaded');
}
