// ═══════════════════════════════════════════════════════════
// AI RATING CHAT
// ═══════════════════════════════════════════════════════════

const user = StorageUtils.getUser();
if (!user) {
    window.location.href = '../index.html';
}

const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('eventId');

let conversationId = null;
let currentEvent = null;

// Start AI rating
async function startRating() {
    try {
        const response = await API.request('startAIRating', {
            eventId: eventId,
            operatorEmail: user.email
        });

        conversationId = response.conversationId;
        currentEvent = response.event;
        
        displayEventInfo(currentEvent);
        addMessage('ai', response.aiMessage);
        
    } catch (error) {
        console.error('Start rating error:', error);
        addMessage('error', 'Eroare la pornirea AI: ' + error.message);
    }
}

// Display event info
function displayEventInfo(event) {
    document.getElementById('eventInfo').innerHTML = `
        <div class="event-detail">
            <strong>ID:</strong> ${event.id}
        </div>
        <div class="event-detail">
            <strong>Personaj:</strong> ${event.character}
        </div>
        <div class="event-detail">
            <strong>Angajat:</strong> ${event.employee}
        </div>
        <div class="event-detail">
            <strong>Data:</strong> ${new Date(event.date).toLocaleDateString('ro-RO')}
        </div>
        <div class="event-detail">
            <strong>Client:</strong> ${event.client}
        </div>
    `;
}

// Send message
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    addMessage('user', message);
    input.value = '';
    
    try {
        const response = await API.request('sendAIMessage', {
            conversationId: conversationId,
            eventId: eventId,
            message: message
        });

        addMessage('ai', response.aiMessage);
        
        if (response.analysis && response.analysis.hasProblems) {
            showValidationPanel(response.analysis);
        }
        
    } catch (error) {
        console.error('Send message error:', error);
        addMessage('error', 'Eroare: ' + error.message);
    }
}

// Add message to chat
function addMessage(type, text) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const icon = type === 'ai' ? '🤖' : type === 'user' ? '👤' : '⚠️';
    
    messageDiv.innerHTML = `
        <div class="message-icon">${icon}</div>
        <div class="message-content">${text.replace(/\n/g, '<br>')}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Upload photos
async function uploadPhotos() {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
        const files = e.target.files;
        
        addMessage('user', `[📎 Uploaded ${files.length} photos]`);
        
        try {
            const response = await API.request('uploadEvidence', {
                eventId: eventId,
                operatorEmail: user.email,
                photoCount: files.length,
                folderId: 'FOLDER_' + Date.now()
            });

            addMessage('ai', '🔍 Analizez pozele...');
            
            setTimeout(async () => {
                const validation = await API.request('validatePhotos', {
                    eventId: eventId,
                    photoCount: files.length
                });

                showValidationResults(validation.validation);
            }, 2000);
            
        } catch (error) {
            console.error('Upload error:', error);
            addMessage('error', 'Eroare upload: ' + error.message);
        }
    };
    
    input.click();
}

// Show validation results
function showValidationResults(validation) {
    const panel = document.getElementById('validationPanel');
    const results = document.getElementById('validationResults');
    
    let html = '<div class="validation-summary">';
    
    if (validation.isValid) {
        html += '<div class="validation-success">✅ VALIDARE REUȘITĂ</div>';
    } else {
        html += '<div class="validation-warning">⚠️ PROBLEME DETECTATE</div>';
    }
    
    html += `<div class="confidence">Confidence: ${validation.confidence}%</div>`;
    html += '</div>';
    
    html += '<div class="findings">';
    validation.findings.forEach(finding => {
        html += `<div class="finding">${finding}</div>`;
    });
    html += '</div>';
    
    if (validation.redFlags && validation.redFlags.length > 0) {
        html += '<div class="red-flags">';
        html += '<h4>🚨 RED FLAGS:</h4>';
        validation.redFlags.forEach(flag => {
            html += `<div class="red-flag">${flag}</div>`;
        });
        html += '</div>';
    }
    
    results.innerHTML = html;
    panel.style.display = 'block';
}

// Approve rating
async function approveRating() {
    try {
        await API.request('finalizeRating', {
            eventId: eventId,
            employeeCode: currentEvent.employee,
            scores: {
                punctuality: 5,
                costume: 5,
                performance: 5,
                feedback: 5
            },
            finalScore: 5.0,
            operatorEmail: user.email,
            aiValidated: true,
            amount: 450,
            penalty: 0
        });

        alert('✅ Rating salvat cu succes!');
        window.close();
        
    } catch (error) {
        console.error('Approve error:', error);
        alert('Eroare: ' + error.message);
    }
}

// Edit rating
function editRating() {
    alert('Editare manuală în dezvoltare...');
}

// Skip AI
function skipAI() {
    if (confirm('Vrei să sari peste AI și să notezi manual?')) {
        window.location.href = 'manual-rating.html?eventId=' + eventId;
    }
}

// Close chat
function closeChat() {
    if (confirm('Vrei să închizi chat-ul? Progresul nu va fi salvat.')) {
        window.close();
    }
}

// Enter to send
document.getElementById('messageInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Init
startRating();
