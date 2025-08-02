class ResumeEditorApp {
    constructor() {
        window.resumeEditorApp = this;              // bind instance globally
        this.isLoading = false;
        this.zoom = 100;
        this.currentBox = 'personalInfoBox'; // Start with the personal info box
        this.initializeEventListeners();
        this.showBox(this.currentBox); // Show the initial box
    }

    initializeEventListeners() {
        // Upload resume button
        document.getElementById('uploadBtn').addEventListener('click', () => this.triggerFileUpload());
        
        // File input change
        document.getElementById('fileInput').addEventListener('change', e => this.handleFileUpload(e.target.files[0]));

        // Download PDF button
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadPDF());

        // Zoom controls
        document.getElementById('zoomIn').addEventListener('click', () => this.adjustZoom(10));
        document.getElementById('zoomOut').addEventListener('click', () => this.adjustZoom(-10));

        // Refresh preview button
        document.getElementById('refreshPreview').addEventListener('click', () => this.refreshPreview());

        // Keyboard shortcuts
        document.addEventListener('keydown', e => this.handleKeyboardShortcuts(e));


        // Single click listener for AI enhancement buttons
        document.addEventListener('click', e => {
            const btn = e.target.closest('.btn-enhance');
            if (!btn) return;
            const section = btn.getAttribute('data-section');
            this.handleAIEnhancement(section, btn);
        });
        document.getElementById('role')?.value || 'software';

        // These button listeners are now handled by FormHandler
        // No need for box navigation since we removed the box system
    }

    // showBox method removed - no longer needed without box system

    triggerFileUpload() {
        document.getElementById('fileInput').click();
    }
    

    async handleFileUpload(file) {
        if (!file) return;
        const allowed = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (!allowed.includes(file.type)) {
            this.showError('Please upload a PDF or Word document.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            this.showError('File size must be less than 10MB.');
            return;
        }
        this.showLoading('Analyzing resume...');
        try {
            const formData = new FormData();
            formData.append('resume', file);
            const res = await fetch('/api/parse-resume', { method: 'POST', body: formData });
            if (!res.ok) throw new Error('Failed to parse resume');
            const data = (await res.json()).data || await res.json();
            if (window.formHandler) {
                window.formHandler.populateFromData(data);
            } else if (typeof FormHandler !== 'undefined') {
                window.formHandler = new FormHandler();
                window.formHandler.populateFromData(data);
            } else {
                setTimeout(() => {
                    if (window.formHandler) window.formHandler.populateFromData(data);
                    else alert('Form handler not ready. Please refresh and try again.');
                }, 1000);
            }
            this.showSuccess('Resume uploaded and parsed successfully!');
        } catch (err) {
            console.error(err);
            this.showError('Failed to parse resume. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async downloadPDF() {
        if (!window.formHandler) {
            this.showError('Form data not available');
            return;
        }
        this.showLoading('Generating PDF...');
        try {
            const payload = window.formHandler.getFormData();
            const res = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const txt = await res.text();
                throw new Error(`Failed to generate PDF: ${res.status} ${txt}`);
            }
            const blob = await res.blob();
            if (blob.size === 0) throw new Error('Generated PDF is empty');
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${payload.personalInfo.fullName || 'resume'}_resume.pdf`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            this.showSuccess('PDF downloaded successfully!');
        } catch (err) {
            console.error(err);
            this.showError(err.message);
        } finally {
            this.hideLoading();
        }
    }

    adjustZoom(delta) {
        this.zoom = Math.max(50, Math.min(200, this.zoom + delta));
        document.getElementById('zoomLevel').textContent = `${this.zoom}%`;
        const preview = document.getElementById('pdfPreview');
        preview.style.transform = `scale(${this.zoom/100})`;
        preview.style.transformOrigin = 'top center';
    }

    refreshPreview() {
        if (window.formHandler && window.pdfPreview) {
            const data = window.formHandler.getFormData();
            window.pdfPreview.generatePreview(data);
            this.showInfo('Preview refreshed', 1000);
        } else {
            this.showError('Preview refresh failed - components not ready');
        }
    }

    handleKeyboardShortcuts(e) {
        if ((e.ctrlKey||e.metaKey) && e.key==='d') { e.preventDefault(); this.downloadPDF(); }
        if ((e.ctrlKey||e.metaKey) && e.key==='u') { e.preventDefault(); this.triggerFileUpload(); }
        if ((e.ctrlKey||e.metaKey) && e.key==='=') { e.preventDefault(); this.adjustZoom(10); }
        if ((e.ctrlKey||e.metaKey) && e.key==='-') { e.preventDefault(); this.adjustZoom(-10); }
        if ((e.ctrlKey||e.metaKey) && e.key==='0') {
            e.preventDefault(); this.zoom=100;
            document.getElementById('zoomLevel').textContent='100%';
            document.getElementById('pdfPreview').style.transform='scale(1)';
        }
    }

    showLoading(msg='Loading...') {
        this.isLoading=true;
        const o = document.getElementById('loadingOverlay');
        o.querySelector('p').textContent=msg;
        o.style.display='flex';
    }

    hideLoading() {
        this.isLoading=false;
        document.getElementById('loadingOverlay').style.display='none';
    }

    showMessage(text,type='info',dur=3000) {
        const msg = document.createElement('div');
        msg.className=`message ${type}`;
        const icon = type==='success'?'fa-check-circle':type==='error'?'fa-exclamation-circle':'fa-info-circle';
        msg.innerHTML=`<i class="fas ${icon}"></i><span>${text}</span>`;
        document.querySelectorAll('.message').forEach(m=>m.remove());
        document.querySelector('.scroll-container').prepend(msg);
        if(dur>0) setTimeout(()=>msg.remove(), dur);
        return msg;
    }
    showSuccess(t,d=3000){return this.showMessage(t,'success',d);}    
    showError(t,d=5000){return this.showMessage(t,'error',d);}    
    showInfo(t,d=3000){return this.showMessage(t,'info',d);}    
 
    // async handleAIEnhancement(section, button) {
    //     const origHTML = button.innerHTML;
    //     const origDisabled = button.disabled;
    //     button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enhancing...';
    //     button.disabled = true;
    //     this.showLoading('Enhancing content with AI...');
    //     try {
    //         const content = this.getSectionContent(section);
    //         if (!content.trim()) { this.showError('No content to enhance.'); return; }
    //         const jobDesc = document.getElementById('jobDescription')?.value || '';
    //         const res = await fetch('/api/gemini/enhance', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({ section, content, jobDescription: jobDesc, enhancementType: 'content-improvement',role })
    //         });
    //         if (!res.ok) {
    //             let errMsg;
    //             try { errMsg = (await res.json()).message; } catch { errMsg = await res.text(); }
    //             console.error(`Enhance API error (${res.status}):`, errMsg);
    //             throw new Error(errMsg || 'Enhancement failed');
    //         }
    //         const result = await res.json();
    //         console.log('Enhance result:', result);
    //         const { enhancedContent, improvements, keywordsAdded } = result.enhancedContent || {};
    //         this.applyEnhancedContent(section, { text: enhancedContent, improvements, keywordsAdded });
    //         let msg = 'Content enhanced successfully!';
    //         if (improvements?.length) msg += '<br><strong>Improvements:</strong><br>• ' + improvements.join('<br>• ');
    //         if (keywordsAdded?.length) msg += '<br><strong>Keywords added:</strong><br>• ' + keywordsAdded.join('<br>• ');
    //         this.showSuccess(msg, 8000);
    //         if (window.pdfPreview) this.refreshPreview();
    //     } catch (err) {
    //         console.error('AI Enhancement error:', err);
    //         this.showError(`Enhancement failed: ${err.message}`);
    //     } finally {
    //         button.innerHTML = origHTML;
    //         button.disabled = origDisabled;
    //         this.hideLoading();
    //     }
    // }
    async handleAIEnhancement(section, button) {
    const origHTML = button.innerHTML;
    const origDisabled = button.disabled;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enhancing...';
    button.disabled = true;
    this.showLoading('Enhancing content with AI...');
    try {
        const content = this.getSectionContent(section);
        if (!content.trim()) { this.showError('No content to enhance.'); return; }

        const jobDesc = document.getElementById('jobDescription')?.value || '';
        const selectedRole = document.getElementById('role')?.value || 'software';
        console.log(selectedRole);

        const res = await fetch('/api/gemini/enhance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                section,
                content,
                jobDescription: jobDesc,
                enhancementType: 'content-improvement',
                role: selectedRole
            })
        });

        if (!res.ok) {
            let errMsg;
            try { errMsg = (await res.json()).message; } catch { errMsg = await res.text(); }
            console.error(`Enhance API error (${res.status}):`, errMsg);
            throw new Error(errMsg || 'Enhancement failed');
        }

        const result = await res.json();
        const { enhancedContent, improvements, keywordsAdded } = result.enhancedContent || {};
        this.applyEnhancedContent(section, { text: enhancedContent, improvements, keywordsAdded });

        let msg = 'Content enhanced successfully!';
        if (improvements?.length) msg += '<br><strong>Improvements:</strong><br>• ' + improvements.join('<br>• ');
        if (keywordsAdded?.length) msg += '<br><strong>Keywords added:</strong><br>• ' + keywordsAdded.join('<br>• ');
        this.showSuccess(msg, 8000);
        if (window.pdfPreview) this.refreshPreview();
    } catch (err) {
        console.error('AI Enhancement error:', err);
        this.showError(`Enhancement failed: ${err.message}`);
    } finally {
        button.innerHTML = origHTML;
        button.disabled = origDisabled;
        this.hideLoading();
    }
}

    
    getSectionContent(section) {
        try {
            const container = document.getElementById(`${section}Container`);
            if(!container) return '';
            const entries = container.querySelectorAll('.entry-item');
            return Array.from(entries).map(entry => {
                const parts=[];
                const t = entry.querySelector('[name*="title"],[name*="degree"]')?.value;
                const c = entry.querySelector('[name*="company"],[name*="institution"]')?.value;
                const d = entry.querySelector('[name*="description"],[name*="details"]')?.value;
                if(t) parts.push(`Title: ${t}`);
                if(c) parts.push(`At: ${c}`);
                if(d) parts.push(`Details: ${d}`);
                return parts.join('\n');
            }).filter(x=>x.trim()).join('\n\n');
        } catch(err) { console.error(err); return ''; }
    }

    applyEnhancedContent(section, { text, improvements, keywordsAdded }) {
        try {
            const container = document.getElementById(`${section}Container`);
            const first = container.querySelector('.entry-item');
            const field = first.querySelector('textarea,[name*="description"],[name*="details"]');
            if(field) {
                field.value = text;
                field.dispatchEvent(new Event('input',{ bubbles:true }));
            } else {
                this.showEnhancedContentModal(section, { text, improvements });
            }
        } catch(err) {
            console.error(err);
            this.showEnhancedContentModal(section, { text, improvements });
        }
    }

    showEnhancedContentModal(section, { text, improvements }) {
        const existing = document.getElementById(`enhancementModal-${section}`);
        if(existing) existing.remove();
        const modal = document.createElement('div');
        modal.id = `enhancementModal-${section}`;
        modal.className = 'enhancement-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Enhanced ${section.charAt(0).toUpperCase() + section.slice(1)} Content</h3>
                <div class="enhanced-content">${text.replace(/\n/g,'<br>')}</div>
                <div class="improvements-list">
                    <h4>Improvements Made:</h4>
                    <ul>${(improvements||[]).map(i=>`<li>${i}</li>`).join('')||'<li>No specific improvements listed</li>'}</ul>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-cancel">Cancel</button>
                    <button class="btn btn-primary btn-apply">Copy to Clipboard</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('.close-modal').onclick = () => modal.remove();
        modal.querySelector('.btn-cancel').onclick = () => modal.remove();
        modal.querySelector('.btn-apply').onclick = () => {
            navigator.clipboard.writeText(text)
                .then(()=> this.showSuccess('Content copied to clipboard!',2000))
                .catch(()=> this.showError('Failed to copy content'));
            modal.remove();
        };
        modal.style.display = 'block';
    }

    async checkForUpdates() {
        try {
            const res = await fetch('/api/version');
            if(res.ok){ const {version}=await res.json(); console.log('App version:',version); }
        } catch(e) { console.error(e); }
    }

    init() {
        this.checkForUpdates();
        setTimeout(() => this.initializeDragAndDrop(), 500);
        console.log('Resume Editor App initialized');
    }

    initializeDragAndDrop() {
        document.querySelectorAll('.entry-item').forEach(entry => {
            entry.draggable = true;
            entry.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', entry.dataset.id);
                entry.classList.add('dragging');
            });
            entry.addEventListener('dragend', () => entry.classList.remove('dragging'));
        });
    }
}

// Initialize on DOM ready
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new ResumeEditorApp();
    app.init();
});

// Optionally export class globally
window.ResumeEditorApp = ResumeEditorApp;