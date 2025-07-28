// Main Application Logic for Resume Editor
class ResumeEditorApp {
    constructor() {
        this.isLoading = false;
        this.zoom = 100;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Upload resume button
        document.getElementById('uploadBtn').addEventListener('click', () => {
            this.triggerFileUpload();
        });

        // File input change
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0]);
        });

        // Download PDF button
        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadPDF();
        });

        // Zoom controls
        document.getElementById('zoomIn').addEventListener('click', () => {
            this.adjustZoom(10);
        });

        document.getElementById('zoomOut').addEventListener('click', () => {
            this.adjustZoom(-10);
        });

        // Refresh preview button
        document.getElementById('refreshPreview').addEventListener('click', () => {
            this.refreshPreview();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Auto-save functionality
        setInterval(() => {
            this.autoSave();
        }, 30000); // Auto-save every 30 seconds
    }

    triggerFileUpload() {
        document.getElementById('fileInput').click();
    }

    async handleFileUpload(file) {
        if (!file) return;

        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        
        if (!allowedTypes.includes(file.type)) {
            this.showError('Please upload a PDF or Word document.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            this.showError('File size must be less than 10MB.');
            return;
        }

        this.showLoading('Analyzing resume...');

        try {
            const formData = new FormData();
            formData.append('resume', file);

            const response = await fetch('/api/parse-resume', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to parse resume');
            }

            const responseData = await response.json();
            console.log('Upload response:', responseData);
            
            // Extract the actual resume data from the response
            const resumeData = responseData.data || responseData;
            console.log('Resume data to populate:', resumeData);
            console.log('FormHandler available:', !!window.formHandler);
            console.log('FormHandler object:', window.formHandler);
            
            // Populate form with extracted data
            if (window.formHandler && resumeData) {
                console.log('Calling populateFromData...');
                try {
                    window.formHandler.populateFromData(resumeData);
                    console.log('populateFromData call completed successfully');
                } catch (error) {
                    console.error('Error during populateFromData:', error);
                }
            } else {
                console.error('No formHandler available or no resume data received');
                console.error('FormHandler:', window.formHandler);
                console.error('Resume data:', resumeData);
                
                // If formHandler is not ready, try to initialize it manually
                if (!window.formHandler && resumeData) {
                    console.log('FormHandler not ready, attempting manual initialization...');
                    
                    // Try to manually initialize formHandler
                    if (typeof FormHandler !== 'undefined') {
                        console.log('FormHandler class available, creating instance...');
                        try {
                            window.formHandler = new FormHandler();
                            console.log('Manual FormHandler initialization successful');
                            window.formHandler.populateFromData(resumeData);
                        } catch (error) {
                            console.error('Manual FormHandler initialization failed:', error);
                        }
                    } else {
                        console.error('FormHandler class not available');
                        
                        // Last resort: wait and try again
                        setTimeout(() => {
                            if (window.formHandler) {
                                console.log('Retrying populateFromData after delay...');
                                window.formHandler.populateFromData(resumeData);
                            } else {
                                console.error('FormHandler still not available after delay');
                                alert('Form handler not ready. Please refresh the page and try again.');
                            }
                        }, 1000);
                    }
                }
            }

            this.showSuccess('Resume uploaded and parsed successfully!');
        } catch (error) {
            console.error('Error parsing resume:', error);
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
        console.log('Starting PDF download process...');

        try {
            const formData = window.formHandler.getFormData();
            console.log('Form data for PDF:', formData);
            
            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            console.log('PDF generation response status:', response.status);
            console.log('PDF generation response headers:', response.headers);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('PDF generation error response:', errorText);
                throw new Error(`Failed to generate PDF: ${response.status} ${errorText}`);
            }

            const blob = await response.blob();
            console.log('PDF blob size:', blob.size, 'bytes');
            console.log('PDF blob type:', blob.type);

            if (blob.size === 0) {
                throw new Error('Generated PDF is empty');
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${formData.personalInfo.fullName || 'resume'}_resume.pdf`;
            a.style.display = 'none';
            document.body.appendChild(a);
            
            console.log('Triggering PDF download...');
            a.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 100);

            this.showSuccess('PDF downloaded successfully!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            this.showError(`Failed to generate PDF: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }

    adjustZoom(delta) {
        this.zoom = Math.max(50, Math.min(200, this.zoom + delta));
        document.getElementById('zoomLevel').textContent = `${this.zoom}%`;
        
        const preview = document.getElementById('pdfPreview');
        preview.style.transform = `scale(${this.zoom / 100})`;
        preview.style.transformOrigin = 'top center';
    }

    refreshPreview() {
        console.log('Manual preview refresh triggered');
        if (window.formHandler && window.pdfPreview) {
            const formData = window.formHandler.getFormData();
            console.log('Refreshing preview with form data:', formData);
            window.pdfPreview.generatePreview(formData);
            this.showInfo('Preview refreshed', 1000);
        } else {
            console.error('FormHandler or PDFPreview not available');
            this.showError('Preview refresh failed - components not ready');
        }
    }

    handleKeyboardShortcuts(e) {
        // Ctrl+S or Cmd+S for save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.autoSave();
        }

        // Ctrl+D or Cmd+D for download
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            this.downloadPDF();
        }

        // Ctrl+U or Cmd+U for upload
        if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
            e.preventDefault();
            this.triggerFileUpload();
        }

        // Zoom shortcuts
        if ((e.ctrlKey || e.metaKey) && e.key === '=') {
            e.preventDefault();
            this.adjustZoom(10);
        }
        if ((e.ctrlKey || e.metaKey) && e.key === '-') {
            e.preventDefault();
            this.adjustZoom(-10);
        }
        if ((e.ctrlKey || e.metaKey) && e.key === '0') {
            e.preventDefault();
            this.zoom = 100;
            document.getElementById('zoomLevel').textContent = '100%';
            document.getElementById('pdfPreview').style.transform = 'scale(1)';
        }
    }

    autoSave() {
        if (!window.formHandler) return;

        try {
            const formData = window.formHandler.getFormData();
            localStorage.setItem('resumeEditorData', JSON.stringify({
                data: formData,
                timestamp: Date.now()
            }));
            
            this.showInfo('Auto-saved', 1000);
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    }

    loadAutoSavedData() {
        try {
            const saved = localStorage.getItem('resumeEditorData');
            if (saved) {
                const { data, timestamp } = JSON.parse(saved);
                
                // Only load if saved within last 24 hours
                if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
                    if (window.formHandler) {
                        window.formHandler.populateFromData(data);
                        this.showInfo('Previous session restored');
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load auto-saved data:', error);
        }
    }

    showLoading(message = 'Loading...') {
        this.isLoading = true;
        const overlay = document.getElementById('loadingOverlay');
        const text = overlay.querySelector('p');
        text.textContent = message;
        overlay.style.display = 'flex';
    }

    hideLoading() {
        this.isLoading = false;
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    showMessage(text, type = 'info', duration = 3000) {
        const message = document.createElement('div');
        message.className = `message ${type}`;
        
        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-exclamation-circle';
        
        message.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${text}</span>
        `;

        // Remove existing messages
        document.querySelectorAll('.message').forEach(msg => msg.remove());

        // Insert at top of editor panel
        const scrollContainer = document.querySelector('.scroll-container');
        scrollContainer.insertBefore(message, scrollContainer.firstChild);

        if (duration > 0) {
            setTimeout(() => {
                message.remove();
            }, duration);
        }

        return message;
    }

    showSuccess(text, duration = 3000) {
        return this.showMessage(text, 'success', duration);
    }

    showError(text, duration = 5000) {
        return this.showMessage(text, 'error', duration);
    }

    showInfo(text, duration = 3000) {
        return this.showMessage(text, 'info', duration);
    }

    // Method to handle drag and drop functionality
    initializeDragAndDrop() {
        // This can be implemented later for reordering sections
        const entries = document.querySelectorAll('.entry-item');
        
        entries.forEach(entry => {
            entry.draggable = true;
            
            entry.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', entry.dataset.id);
                entry.classList.add('dragging');
            });

            entry.addEventListener('dragend', () => {
                entry.classList.remove('dragging');
            });
        });
    }

    // Method to check for updates or new features
    async checkForUpdates() {
        try {
            const response = await fetch('/api/version');
            if (response.ok) {
                const { version, features } = await response.json();
                // Handle version updates or new features
                console.log('App version:', version);
            }
        } catch (error) {
            console.error('Failed to check for updates:', error);
        }
    }

    // Initialize the application
    init() {
        // Load auto-saved data after form handler is ready
        setTimeout(() => {
            this.loadAutoSavedData();
        }, 100);

        // Check for updates
        this.checkForUpdates();

        // Initialize drag and drop after initial entries are created
        setTimeout(() => {
            this.initializeDragAndDrop();
        }, 500);

        console.log('Resume Editor App initialized');
    }
}

// Initialize the application when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ResumeEditorApp();
    app.init();
});

// Export for global access
window.ResumeEditorApp = ResumeEditorApp;