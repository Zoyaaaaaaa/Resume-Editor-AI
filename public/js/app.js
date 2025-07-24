// Test if JavaScript is loading at all
console.log('app.js file loaded successfully');

class ResumeEditorApp {
    constructor() {
        console.log('ResumeEditorApp constructor called');
        this.currentTemplate = 'professional';
        this.resumeData = this.getEmptyResumeData();
        this.pdfBlob = null;
        
        this.init();
        console.log('ResumeEditorApp initialization complete');
    }

    init() {
        this.setupEventListeners();
        this.loadSampleData();
        this.addInitialSections();
    }

    getEmptyResumeData() {
        return {
            personalInfo: {
                name: '',
                email: '',
                phone: '',
                location: '',
                linkedin: '',
                website: ''
            },
            professionalSummary: '',
            experience: [],
            education: [],
            projects: [],
            skills: {
                'Languages': '',
                'Frameworks': '',
                'Tools': '',
                'Concepts': ''
            },
            certifications: [],
            positions: [],
            interests: ''
        };
    }

    setupEventListeners() {
        // Template selector
        const templateSelector = document.getElementById('templateSelector');
        if (templateSelector) {
            templateSelector.addEventListener('change', (e) => {
                this.currentTemplate = e.target.value;
                this.generatePreview();
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.generatePreview();
            });
        }

        // Resume upload
        const resumeUpload = document.getElementById('resumeUpload');
        if (resumeUpload) {
            resumeUpload.addEventListener('change', (e) => {
                this.handleResumeUpload(e.target.files[0]);
            });
        }

        // Main AI Enhance button (top level)
        const aiEnhanceBtn = document.getElementById('aiEnhanceBtn');
        if (aiEnhanceBtn) {
            aiEnhanceBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.enhanceSection('summary');
            });
        }

        // Use event delegation for dynamically added buttons
        document.addEventListener('click', (e) => {
            // Debug all button clicks
            if (e.target.classList.contains('btn') || e.target.closest('.btn')) {
                console.log('Button clicked:', e.target);
            }

            // AI enhance buttons (section specific)
            if (e.target.classList.contains('btn-ai') || e.target.closest('.btn-ai')) {
                e.preventDefault();
                console.log('AI enhance button clicked');
                const btn = e.target.classList.contains('btn-ai') ? e.target : e.target.closest('.btn-ai');
                const section = btn.closest('[data-section]')?.dataset.section || btn.dataset.section;
                console.log('Section to enhance:', section);
                if (section) {
                    this.enhanceSection(section);
                } else {
                    console.error('No section found for AI enhance button');
                }
            }

            // Add section buttons
            if (e.target.classList.contains('btn-add') || e.target.closest('.btn-add')) {
                e.preventDefault();
                console.log('Add section button clicked');
                const btn = e.target.classList.contains('btn-add') ? e.target : e.target.closest('.btn-add');
                const target = btn.dataset.target || btn.closest('[data-target]')?.dataset.target;
                console.log('Target to add:', target);
                if (target) {
                    this.addDynamicSection(target);
                } else {
                    console.error('No target specified for add button');
                }
            }
        });

        // ATS Score button
        const calculateAtsBtn = document.getElementById('calculateAtsBtn');
        if (calculateAtsBtn) {
            calculateAtsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.calculateATSScore();
            });
        }

        // Download PDF button
        const downloadPdfBtn = document.getElementById('downloadPdfBtn');
        if (downloadPdfBtn) {
            downloadPdfBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.downloadPDF();
            });
        }

        // Form inputs
        this.setupFormListeners();

        // Modal close
        const modalClose = document.querySelector('.modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                const atsModal = document.getElementById('atsModal');
                if (atsModal) {
                    atsModal.style.display = 'none';
                }
            });
        }

        // Click outside modal to close
        const atsModal = document.getElementById('atsModal');
        if (atsModal) {
            atsModal.addEventListener('click', (e) => {
                if (e.target === atsModal) {
                    atsModal.style.display = 'none';
                }
            });
        }
    }

    setupFormListeners() {
        // Personal info fields
        const personalFields = ['fullName', 'email', 'phone', 'location', 'linkedin', 'website'];
        personalFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.addEventListener('input', () => this.updateResumeData());
            }
        });

        // Professional summary
        document.getElementById('professionalSummary').addEventListener('input', () => {
            this.updateResumeData();
        });

        // Skills fields
        const skillFields = ['skillsLanguages', 'skillsFrameworks', 'skillsTools', 'skillsConcepts'];
        skillFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.addEventListener('input', () => this.updateResumeData());
            }
        });
    }

    loadSampleData() {
        // Optional: Load minimal sample data only if needed for demo
        // Comment out or remove this section to start with empty forms
        const sampleData = {
            personalInfo: {
                name: '',
                email: '',
                phone: '',
                location: '',
                linkedin: '',
                website: ''
            },
            professionalSummary: '',
            skills: {
                'Languages': '',
                'Tools': '',
                'Frameworks': '',
                'Concepts': ''
            }
        };

        this.resumeData = { ...this.resumeData, ...sampleData };
        this.populateForm();
    }

    populateForm() {
        // Personal info
        document.getElementById('fullName').value = this.resumeData.personalInfo.name || '';
        document.getElementById('email').value = this.resumeData.personalInfo.email || '';
        document.getElementById('phone').value = this.resumeData.personalInfo.phone || '';
        document.getElementById('location').value = this.resumeData.personalInfo.location || '';
        document.getElementById('linkedin').value = this.resumeData.personalInfo.linkedin || '';
        document.getElementById('website').value = this.resumeData.personalInfo.website || '';

        // Professional summary
        document.getElementById('professionalSummary').value = this.resumeData.professionalSummary || '';

        // Skills
        document.getElementById('skillsLanguages').value = this.resumeData.skills['Languages'] || '';
        document.getElementById('skillsFrameworks').value = this.resumeData.skills['Frameworks'] || '';
        document.getElementById('skillsTools').value = this.resumeData.skills['Tools'] || '';
        document.getElementById('skillsConcepts').value = this.resumeData.skills['Concepts'] || '';
    }

    addInitialSections() {
        // Start with empty sections - users can add content using the "Add" buttons
        // No initial sample data loaded
        console.log('Starting with empty sections - users will add their own content');
    }

    updateResumeData() {
        // Update personal info
        this.resumeData.personalInfo = {
            name: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            location: document.getElementById('location').value,
            linkedin: document.getElementById('linkedin').value,
            website: document.getElementById('website').value
        };

        // Update professional summary
        this.resumeData.professionalSummary = document.getElementById('professionalSummary').value;

        // Update skills
        this.resumeData.skills = {
            'Languages': document.getElementById('skillsLanguages').value,
            'Frameworks': document.getElementById('skillsFrameworks').value,
            'Tools': document.getElementById('skillsTools').value,
            'Concepts': document.getElementById('skillsConcepts').value
        };

        // Update dynamic sections
        this.updateDynamicSections();

        // Generate preview with debouncing
        this.debouncePreview();
    }

    updateDynamicSections() {
        // Update experience
        this.resumeData.experience = [];
        document.querySelectorAll('#experienceContainer .dynamic-item').forEach(item => {
            const data = this.extractItemData(item, ['position', 'company', 'location', 'dates', 'details']);
            if (data.position) this.resumeData.experience.push(data);
        });

        // Update education
        this.resumeData.education = [];
        document.querySelectorAll('#educationContainer .dynamic-item').forEach(item => {
            const data = this.extractItemData(item, ['institution', 'degree', 'dates', 'gpa', 'details']);
            if (data.institution) this.resumeData.education.push(data);
        });

        // Update projects
        this.resumeData.projects = [];
        document.querySelectorAll('#projectsContainer .dynamic-item').forEach(item => {
            const data = this.extractItemData(item, ['name', 'type', 'location', 'dates', 'details']);
            if (data.name) this.resumeData.projects.push(data);
        });
    }

    extractItemData(item, fields) {
        const data = {};
        fields.forEach(field => {
            const input = item.querySelector(`[data-field="${field}"]`);
            data[field] = input ? input.value : '';
        });
        return data;
    }

    debouncePreview() {
        clearTimeout(this.previewTimeout);
        this.previewTimeout = setTimeout(() => {
            this.generatePreview();
        }, 1000);
    }

    async generatePreview() {
        console.log('generatePreview called'); // Debug log
        
        if (!this.resumeData.personalInfo.name || !this.resumeData.personalInfo.email) {
            console.log('Missing required fields, showing placeholder');
            this.showPlaceholder();
            return;
        }

        this.showLoading('Generating preview...');

        try {
            console.log('Sending request to /api/pdf/generate with data:', {
                templateName: this.currentTemplate,
                data: this.resumeData
            });

            const response = await fetch('/api/pdf/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    templateName: this.currentTemplate,
                    data: this.resumeData
                })
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const pdfBlob = await response.blob();
            this.pdfBlob = pdfBlob;
            
            const pdfUrl = URL.createObjectURL(pdfBlob);
            this.displayPDF(pdfUrl);
            
            this.showToast('PDF preview generated successfully!', 'success');

        } catch (error) {
            console.error('PDF generation failed:', error);
            this.showToast(`Failed to generate PDF preview: ${error.message}`, 'error');
            this.showPlaceholder();
        } finally {
            this.hideLoading();
        }
    }

    displayPDF(pdfUrl) {
        const viewer = document.getElementById('pdfViewer');
        
        // Try different methods for PDF display based on browser support
        const userAgent = navigator.userAgent.toLowerCase();
        const isChrome = userAgent.includes('chrome');
        const isFirefox = userAgent.includes('firefox');
        const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
        
        if (isChrome || isFirefox) {
            // Use iframe for Chrome and Firefox
            viewer.innerHTML = `<iframe src="${pdfUrl}" type="application/pdf" class="pdf-frame" style="width: 100%; height: 100%; border: none;"></iframe>`;
        } else if (isSafari) {
            // Safari has issues with PDF embedding, provide download option
            viewer.innerHTML = `
                <div class="pdf-download-container">
                    <i class="fas fa-file-pdf fa-3x"></i>
                    <p>PDF generated successfully!</p>
                    <button onclick="window.open('${pdfUrl}', '_blank')" class="btn btn-primary">
                        <i class="fas fa-external-link-alt"></i> View PDF
                    </button>
                </div>
            `;
        } else {
            // Fallback for other browsers
            viewer.innerHTML = `
                <embed src="${pdfUrl}" type="application/pdf" class="pdf-frame" style="width: 100%; height: 100%;">
                <div class="pdf-fallback">
                    <p>Cannot display PDF inline.</p>
                    <button onclick="window.open('${pdfUrl}', '_blank')" class="btn btn-primary">
                        <i class="fas fa-external-link-alt"></i> Open PDF
                    </button>
                </div>
            `;
        }
    }

    showPlaceholder() {
        const viewer = document.getElementById('pdfViewer');
        viewer.innerHTML = `
            <div class="loading-placeholder">
                <i class="fas fa-file-pdf"></i>
                <p>Fill in your information to generate a preview</p>
            </div>
        `;
    }

    async handleResumeUpload(file) {
        if (!file) return;

        this.showLoading('Parsing resume...');

        const formData = new FormData();
        formData.append('resume', file);

        try {
            const response = await fetch('/api/ai/parse-resume', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                this.resumeData = { ...this.resumeData, ...result.data.parsed };
                this.populateForm();
                this.populateDynamicSections();
                this.generatePreview();
                this.showToast('Resume parsed successfully!', 'success');
            } else {
                throw new Error(result.error || 'Failed to parse resume');
            }

        } catch (error) {
            console.error('Resume parsing failed:', error);
            this.showToast('Failed to parse resume: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    populateDynamicSections() {
        // Clear existing sections
        document.getElementById('experienceContainer').innerHTML = '';
        document.getElementById('educationContainer').innerHTML = '';
        document.getElementById('projectsContainer').innerHTML = '';

        // Populate experience
        this.resumeData.experience.forEach(exp => this.addExperienceSection(exp));
        
        // Populate education
        this.resumeData.education.forEach(edu => this.addEducationSection(edu));
        
        // Populate projects
        this.resumeData.projects.forEach(proj => this.addProjectSection(proj));
    }

    async enhanceSection(sectionType) {
        this.showLoading('Enhancing section with AI...');

        try {
            let sectionData;
            
            switch (sectionType) {
                case 'summary':
                    sectionData = this.resumeData.professionalSummary;
                    sectionType = 'professionalSummary'; // Map to backend format
                    break;
                case 'skills':
                    sectionData = this.resumeData.skills;
                    break;
                case 'experience':
                    sectionData = this.resumeData.experience[0] || {}; // Enhance first experience
                    break;
                default:
                    throw new Error('Unknown section type');
            }

            const response = await fetch('/api/ai/enhance-section', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sectionData,
                    sectionType,
                    jobDescription: ''
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                // Apply enhanced content
                this.applyEnhancedContent(sectionType, result.data.enhanced);
                this.showToast('Section enhanced successfully!', 'success');
            } else {
                throw new Error(result.error || 'Failed to enhance section');
            }

        } catch (error) {
            console.error('Section enhancement failed:', error);
            this.showToast('Failed to enhance section: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    applyEnhancedContent(sectionType, enhancedContent) {
        switch (sectionType) {
            case 'summary':
            case 'professionalSummary':
                document.getElementById('professionalSummary').value = enhancedContent;
                this.resumeData.professionalSummary = enhancedContent;
                break;
            case 'skills':
                // Handle enhanced skills object
                if (typeof enhancedContent === 'object') {
                    Object.entries(enhancedContent).forEach(([key, value]) => {
                        const fieldMap = {
                            'Languages': 'skillsLanguages',
                            'Frameworks': 'skillsFrameworks', 
                            'Tools': 'skillsTools',
                            'Concepts': 'skillsConcepts'
                        };
                        const fieldId = fieldMap[key];
                        if (fieldId) {
                            const element = document.getElementById(fieldId);
                            if (element) {
                                element.value = Array.isArray(value) ? value.join(', ') : value;
                            }
                        }
                    });
                    this.resumeData.skills = enhancedContent;
                } else {
                    // If it's a string, try to parse it or just display it
                    console.log('Enhanced skills content:', enhancedContent);
                }
                break;
            case 'experience':
                // For experience, we'd need to update the specific experience item
                console.log('Enhanced experience content:', enhancedContent);
                break;
        }
        
        this.generatePreview();
    }

    async calculateATSScore() {
        this.showLoading('Calculating ATS score...');

        try {
            const response = await fetch('/api/ai/ats-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    resumeData: this.resumeData,
                    jobDescription: ''
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                this.displayATSScore(result.data);
                this.showATSModal(result.data);
            } else {
                throw new Error(result.error || 'Failed to calculate ATS score');
            }

        } catch (error) {
            console.error('ATS score calculation failed:', error);
            this.showToast('Failed to calculate ATS score: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    displayATSScore(atsData) {
        const scoreElement = document.getElementById('atsScoreValue');
        const scoreContainer = document.getElementById('atsScore');
        
        scoreElement.textContent = `${atsData.score}/${atsData.maxScore}`;
        
        // Add color based on score
        scoreElement.className = 'score-value';
        if (atsData.score < 60) {
            scoreElement.classList.add('low');
        } else if (atsData.score < 80) {
            scoreElement.classList.add('medium');
        } else {
            scoreElement.classList.add('high');
        }
        
        scoreContainer.style.display = 'flex';
    }

    showATSModal(atsData) {
        const modal = document.getElementById('atsModal');
        const content = document.getElementById('atsAnalysisContent');
        
        content.innerHTML = `
            <div class="ats-analysis">
                <div class="score-summary">
                    <h4>Overall Score: ${atsData.score}/${atsData.maxScore}</h4>
                    <div class="score-breakdown">
                        <p><strong>Formatting:</strong> ${atsData.feedback.formatting.score}/100</p>
                        <p><strong>Content:</strong> ${atsData.feedback.content.score}/100</p>
                    </div>
                </div>
                
                <div class="feedback-section">
                    <h4>Strengths</h4>
                    <ul>
                        ${atsData.feedback.strengths.map(strength => `<li>${strength}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="feedback-section">
                    <h4>Areas for Improvement</h4>
                    <ul>
                        ${atsData.feedback.improvements.map(improvement => `<li>${improvement}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="feedback-section">
                    <h4>Keyword Analysis</h4>
                    <p><strong>Found:</strong> ${atsData.feedback.keywords.found.join(', ')}</p>
                    <p><strong>Missing:</strong> ${atsData.feedback.keywords.missing.join(', ')}</p>
                    <p><strong>Suggestions:</strong> ${atsData.feedback.keywords.suggestions.join(', ')}</p>
                </div>
                
                <div class="feedback-section">
                    <h4>Recommendations</h4>
                    <ul>
                        ${atsData.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
    }

    downloadPDF() {
        if (!this.pdfBlob) {
            this.showToast('Please generate a preview first', 'warning');
            return;
        }

        const url = URL.createObjectURL(this.pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.resumeData.personalInfo.name || 'resume'}_resume.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('PDF downloaded successfully!', 'success');
    }

    addDynamicSection(type) {
        console.log('addDynamicSection called with type:', type);
        
        switch (type) {
            case 'experience':
                this.addExperienceSection();
                break;
            case 'education':
                this.addEducationSection();
                break;
            case 'projects':
                this.addProjectSection();
                break;
            default:
                console.error('Unknown section type:', type);
        }
        
        this.showToast(`Added new ${type} section`, 'success');
    }

    addExperienceSection(data = {}) {
        const container = document.getElementById('experienceContainer');
        const item = this.createDynamicItem('experience', [
            { field: 'position', label: 'Position', value: data.position || '' },
            { field: 'company', label: 'Company', value: data.company || '' },
            { field: 'location', label: 'Location', value: data.location || '' },
            { field: 'dates', label: 'Dates', value: data.dates || '' },
            { field: 'details', label: 'Description', type: 'textarea', value: data.details || '' }
        ]);
        container.appendChild(item);
        this.setupDynamicItemListeners(item);
    }

    addEducationSection(data = {}) {
        const container = document.getElementById('educationContainer');
        const item = this.createDynamicItem('education', [
            { field: 'institution', label: 'Institution', value: data.institution || '' },
            { field: 'degree', label: 'Degree', value: data.degree || '' },
            { field: 'dates', label: 'Dates', value: data.dates || '' },
            { field: 'gpa', label: 'GPA/Grade', value: data.gpa || data.grade || '' },
            { field: 'details', label: 'Details', type: 'textarea', value: data.details || '' }
        ]);
        container.appendChild(item);
        this.setupDynamicItemListeners(item);
    }

    addProjectSection(data = {}) {
        const container = document.getElementById('projectsContainer');
        const item = this.createDynamicItem('project', [
            { field: 'name', label: 'Project Name', value: data.name || '' },
            { field: 'type', label: 'Type', value: data.type || '' },
            { field: 'location', label: 'Location', value: data.location || '' },
            { field: 'dates', label: 'Dates', value: data.dates || '' },
            { field: 'details', label: 'Description', type: 'textarea', value: data.details || '' }
        ]);
        container.appendChild(item);
        this.setupDynamicItemListeners(item);
    }

    createDynamicItem(type, fields) {
        const item = document.createElement('div');
        item.className = 'dynamic-item';
        
        let fieldsHTML = '';
        fields.forEach(field => {
            const inputType = field.type || 'input';
            const inputHTML = inputType === 'textarea' 
                ? `<textarea data-field="${field.field}" rows="4" placeholder="${field.label}">${field.value}</textarea>`
                : `<input type="text" data-field="${field.field}" placeholder="${field.label}" value="${field.value}">`;
            
            fieldsHTML += `
                <div class="form-group">
                    <label>${field.label}</label>
                    ${inputHTML}
                </div>
            `;
        });
        
        item.innerHTML = `
            <button class="dynamic-item-remove" onclick="this.parentElement.remove(); app.updateResumeData();">×</button>
            <div class="form-row">
                ${fieldsHTML}
            </div>
        `;
        
        return item;
    }

    setupDynamicItemListeners(item) {
        const inputs = item.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.updateResumeData());
        });
    }

    showLoading(text = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        const loadingText = document.getElementById('loadingText');
        loadingText.textContent = text;
        overlay.style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    
    // Debug: Check if buttons exist
    const addButtons = document.querySelectorAll('.btn-add');
    const aiButtons = document.querySelectorAll('.btn-ai');
    console.log('Found add buttons:', addButtons.length);
    console.log('Found AI buttons:', aiButtons.length);
    
    window.app = new ResumeEditorApp();
    console.log('App initialized:', window.app);
    
    // Add a simple test click handler to verify buttons work
    document.addEventListener('click', (e) => {
        if (e.target.closest('button')) {
            console.log('Button clicked (global handler):', e.target.closest('button'));
        }
    });
});