// Form Handler for Resume Editor
class FormHandler {
    constructor() {
        this.formData = {
            personalInfo: {},
            areasOfInterest: '',
            experience: [],
            projects: [],
            education: [],
            extracurricular: []
        };
        
        this.initializeEventListeners();
        this.addInitialEntries();
    }

    initializeEventListeners() {
        // Personal info form listeners
        document.querySelectorAll('#fullName, #email, #phone, #location').forEach(input => {
            input.addEventListener('input', (e) => {
                this.updatePersonalInfo(e.target.name, e.target.value);
            });
        });

        // Areas of interest listener
        document.getElementById('areasOfInterest').addEventListener('input', (e) => {
            this.formData.areasOfInterest = e.target.value;
            this.updatePreview();
        });

        // Add section buttons
        document.getElementById('addExperience').addEventListener('click', () => {
            this.addExperienceEntry();
        });

        document.getElementById('addProject').addEventListener('click', () => {
            this.addProjectEntry();
        });

        document.getElementById('addEducation').addEventListener('click', () => {
            this.addEducationEntry();
        });

        document.getElementById('addExtracurricular').addEventListener('click', () => {
            this.addExtracurricularEntry();
        });

        // AI Enhance buttons
        document.querySelectorAll('.btn-enhance').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.enhanceSection(e.target.dataset.section);
            });
        });
    }

    updatePersonalInfo(field, value) {
        this.formData.personalInfo[field] = value;
        this.updatePreview();
    }

    addExperienceEntry(data = {}) {
        const container = document.getElementById('experienceContainer');
        const entryId = 'exp_' + Date.now();
        
        const entryHTML = `
            <div class="entry-item" data-id="${entryId}">
                <div class="entry-header">
                    <span class="entry-title">Professional Experience</span>
                    <div class="entry-actions">
                        <button class="remove-entry" onclick="formHandler.removeEntry('${entryId}', 'experience')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="entry-grid">
                    <div class="form-group">
                        <label>Position</label>
                        <input type="text" name="position" value="${data.position || ''}" placeholder="e.g., Data Analyst Intern">
                    </div>
                    <div class="form-group">
                        <label>Company</label>
                        <input type="text" name="company" value="${data.company || ''}" placeholder="e.g., Bewakoof.com">
                    </div>
                    <div class="form-group">
                        <label>Location</label>
                        <input type="text" name="location" value="${data.location || ''}" placeholder="e.g., Bengaluru, Karnataka">
                    </div>
                    <div class="form-group">
                        <label>Dates</label>
                        <input type="text" name="dates" value="${data.dates || ''}" placeholder="e.g., May 2025 - Present">
                    </div>
                </div>
                <div class="form-group description-group">
                    <label>Description</label>
                    <div class="formatting-controls">
                        <button type="button" class="format-btn" data-format="bold">
                            <i class="fas fa-bold"></i>
                        </button>
                        <button type="button" class="format-btn" data-format="italic">
                            <i class="fas fa-italic"></i>
                        </button>
                        <button type="button" class="format-btn" data-format="bullet">
                            <i class="fas fa-list-ul"></i>
                        </button>
                    </div>
                    <textarea name="description" rows="4" placeholder="Describe your key responsibilities and achievements...">${data.description || ''}</textarea>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', entryHTML);
        this.attachEntryListeners(entryId, 'experience');
        this.updateFormData();
    }

    addProjectEntry(data = {}) {
        const container = document.getElementById('projectsContainer');
        const entryId = 'proj_' + Date.now();
        
        const entryHTML = `
            <div class="entry-item" data-id="${entryId}">
                <div class="entry-header">
                    <span class="entry-title">Project</span>
                    <div class="entry-actions">
                        <button class="remove-entry" onclick="formHandler.removeEntry('${entryId}', 'projects')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="entry-grid">
                    <div class="form-group">
                        <label>Project Title</label>
                        <input type="text" name="title" value="${data.title || ''}" placeholder="e.g., Large Scale Rural Livelihood Generation">
                    </div>
                    <div class="form-group">
                        <label>Organization/Course</label>
                        <input type="text" name="organization" value="${data.organization || ''}" placeholder="e.g., IIT Bombay">
                    </div>
                    <div class="form-group">
                        <label>Duration</label>
                        <input type="text" name="duration" value="${data.duration || ''}" placeholder="e.g., Aug'23-Present">
                    </div>
                    <div class="form-group">
                        <label>Technologies</label>
                        <input type="text" name="technologies" value="${data.technologies || ''}" placeholder="e.g., Python, ML, Excel">
                    </div>
                </div>
                <div class="form-group description-group">
                    <label>Description</label>
                    <div class="formatting-controls">
                        <button type="button" class="format-btn" data-format="bold">
                            <i class="fas fa-bold"></i>
                        </button>
                        <button type="button" class="format-btn" data-format="italic">
                            <i class="fas fa-italic"></i>
                        </button>
                        <button type="button" class="format-btn" data-format="bullet">
                            <i class="fas fa-list-ul"></i>
                        </button>
                    </div>
                    <textarea name="description" rows="4" placeholder="Describe the project objectives, your role, and key outcomes...">${data.description || ''}</textarea>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', entryHTML);
        this.attachEntryListeners(entryId, 'projects');
        this.updateFormData();
    }

    addEducationEntry(data = {}) {
        const container = document.getElementById('educationContainer');
        const entryId = 'edu_' + Date.now();
        
        const entryHTML = `
            <div class="entry-item" data-id="${entryId}">
                <div class="entry-header">
                    <span class="entry-title">Education</span>
                    <div class="entry-actions">
                        <button class="remove-entry" onclick="formHandler.removeEntry('${entryId}', 'education')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="entry-grid">
                    <div class="form-group">
                        <label>Degree</label>
                        <input type="text" name="degree" value="${data.degree || ''}" placeholder="e.g., Bachelor of Technology">
                    </div>
                    <div class="form-group">
                        <label>Field of Study</label>
                        <input type="text" name="field" value="${data.field || ''}" placeholder="e.g., Computer Science">
                    </div>
                    <div class="form-group">
                        <label>Institution</label>
                        <input type="text" name="institution" value="${data.institution || ''}" placeholder="e.g., IIT Bombay">
                    </div>
                    <div class="form-group">
                        <label>Duration</label>
                        <input type="text" name="duration" value="${data.duration || ''}" placeholder="e.g., 2022-2026">
                    </div>
                    <div class="form-group">
                        <label>Grade/GPA</label>
                        <input type="text" name="grade" value="${data.grade || ''}" placeholder="e.g., 8.5/10">
                    </div>
                </div>
                <div class="form-group description-group">
                    <label>Additional Details (Optional)</label>
                    <textarea name="details" rows="2" placeholder="Relevant coursework, achievements, etc...">${data.details || ''}</textarea>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', entryHTML);
        this.attachEntryListeners(entryId, 'education');
        this.updateFormData();
    }

    addExtracurricularEntry(data = {}) {
        const container = document.getElementById('extracurricularContainer');
        const entryId = 'extra_' + Date.now();
        
        const entryHTML = `
            <div class="entry-item" data-id="${entryId}">
                <div class="entry-header">
                    <span class="entry-title">Extra-Curricular Activity</span>
                    <div class="entry-actions">
                        <button class="remove-entry" onclick="formHandler.removeEntry('${entryId}', 'extracurricular')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="entry-grid">
                    <div class="form-group">
                        <label>Activity/Role</label>
                        <input type="text" name="activity" value="${data.activity || ''}" placeholder="e.g., Volunteering">
                    </div>
                    <div class="form-group">
                        <label>Organization</label>
                        <input type="text" name="organization" value="${data.organization || ''}" placeholder="e.g., TA | Prayog Lab">
                    </div>
                    <div class="form-group">
                        <label>Duration</label>
                        <input type="text" name="duration" value="${data.duration || ''}" placeholder="e.g., July'23">
                    </div>
                </div>
                <div class="form-group description-group">
                    <label>Description</label>
                    <textarea name="description" rows="3" placeholder="Describe your involvement and achievements...">${data.description || ''}</textarea>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', entryHTML);
        this.attachEntryListeners(entryId, 'extracurricular');
        this.updateFormData();
    }

    attachEntryListeners(entryId, section) {
        const entry = document.querySelector(`[data-id="${entryId}"]`);
        
        // Add input listeners for all form fields in this entry
        entry.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => {
                this.updateFormData();
            });
        });

        // Add formatting control listeners
        entry.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.applyFormatting(btn, entry);
            });
        });
    }

    applyFormatting(btn, entry) {
        const format = btn.dataset.format;
        const textarea = entry.querySelector('textarea[name="description"]');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);

        if (!selectedText) {
            this.showMessage('Please select text to format', 'info');
            return;
        }

        let formattedText = selectedText;
        
        switch (format) {
            case 'bold':
                formattedText = `**${selectedText}**`;
                break;
            case 'italic':
                formattedText = `*${selectedText}*`;
                break;
            case 'bullet':
                formattedText = `• ${selectedText}`;
                break;
        }

        textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
        textarea.focus();
        textarea.setSelectionRange(start, start + formattedText.length);
        
        this.updateFormData();
    }

    removeEntry(entryId, section) {
        const entry = document.querySelector(`[data-id="${entryId}"]`);
        if (entry) {
            entry.remove();
            this.updateFormData();
        }
    }

    updateFormData() {
        // Update experience data
        this.formData.experience = this.getEntriesData('experienceContainer', [
            'position', 'company', 'location', 'dates', 'description'
        ]);

        // Update projects data
        this.formData.projects = this.getEntriesData('projectsContainer', [
            'title', 'organization', 'duration', 'technologies', 'description'
        ]);

        // Update education data
        this.formData.education = this.getEntriesData('educationContainer', [
            'degree', 'field', 'institution', 'duration', 'grade', 'details'
        ]);

        // Update extracurricular data
        this.formData.extracurricular = this.getEntriesData('extracurricularContainer', [
            'activity', 'organization', 'duration', 'description'
        ]);

        this.updatePreview();
    }

    getEntriesData(containerId, fields) {
        const container = document.getElementById(containerId);
        const entries = container.querySelectorAll('.entry-item');
        
        return Array.from(entries).map(entry => {
            const data = {};
            fields.forEach(field => {
                const input = entry.querySelector(`[name="${field}"]`);
                data[field] = input ? input.value : '';
            });
            return data;
        });
    }

    updatePreview() {
        console.log('updatePreview called, pdfPreview available:', !!window.pdfPreview);
        console.log('Current form data for preview:', this.formData);
        
        if (window.pdfPreview) {
            window.pdfPreview.generatePreview(this.formData);
        } else {
            console.warn('PDF preview not available yet');
        }
    }

    enhanceSection(section) {
        this.showMessage('AI Enhancement feature coming soon!', 'info');
        // TODO: Implement AI enhancement
    }

    addInitialEntries() {
        // Add one initial entry for each section
        this.addExperienceEntry();
        this.addProjectEntry();
        this.addEducationEntry();
        this.addExtracurricularEntry();
    }

    showMessage(text, type = 'info') {
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>${text}</span>
        `;

        const firstSection = document.querySelector('.form-section');
        firstSection.parentNode.insertBefore(message, firstSection);

        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    // Method to populate form from uploaded resume data
    populateFromData(resumeData) {
        console.log('populateFromData called with:', resumeData);
        
        // Debug: Check if DOM is ready
        console.log('Document ready state:', document.readyState);
        console.log('All form inputs found:', document.querySelectorAll('input').length);
        console.log('FormHandler instance:', this);
        
        if (!resumeData) {
            console.error('No resume data provided to populateFromData');
            return;
        }
        
        // Personal Information
        console.log('Processing personal info:', resumeData.personalInfo);
        if (resumeData.personalInfo) {
            Object.keys(resumeData.personalInfo).forEach(key => {
                console.log(`Looking for element with ID: ${key}`);
                const input = document.getElementById(key);
                console.log(`Element found:`, input);
                
                if (input) {
                    console.log(`Setting ${key} to:`, resumeData.personalInfo[key]);
                    console.log(`Current value before:`, input.value);
                    input.value = resumeData.personalInfo[key];
                    console.log(`Current value after:`, input.value);
                    
                    // Force trigger change event
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    
                    this.updatePersonalInfo(key, resumeData.personalInfo[key]);
                } else {
                    console.error(`Input element not found for key: ${key}`);
                    console.log('All elements with this tag:', document.getElementsByTagName('input'));
                }
            });
        } else {
            console.warn('No personal info in resume data');
        }

        // Areas of Interest
        console.log('Processing areas of interest:', resumeData.areasOfInterest);
        const areasInput = document.getElementById('areasOfInterest');
        if (areasInput) {
            areasInput.value = resumeData.areasOfInterest || '';
            this.formData.areasOfInterest = resumeData.areasOfInterest || '';
            console.log('Set areas of interest to:', areasInput.value);
        }

        // Clear existing entries
        console.log('Clearing existing entries...');
        const containers = ['experienceContainer', 'projectsContainer', 'educationContainer', 'extracurricularContainer'];
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '';
                console.log(`Cleared ${containerId}`);
            } else {
                console.error(`Container not found: ${containerId}`);
            }
        });

        // Add experience entries
        console.log('Adding experience entries:', resumeData.experience);
        if (resumeData.experience && resumeData.experience.length > 0) {
            resumeData.experience.forEach((exp, index) => {
                console.log(`Adding experience ${index + 1}:`, exp);
                this.addExperienceEntry(exp);
            });
        } else {
            console.log('No experience data, adding empty entry');
            this.addExperienceEntry();
        }

        // Add project entries
        console.log('Adding project entries:', resumeData.projects);
        if (resumeData.projects && resumeData.projects.length > 0) {
            resumeData.projects.forEach((proj, index) => {
                console.log(`Adding project ${index + 1}:`, proj);
                this.addProjectEntry(proj);
            });
        } else {
            console.log('No project data, adding empty entry');
            this.addProjectEntry();
        }

        // Add education entries
        console.log('Adding education entries:', resumeData.education);
        if (resumeData.education && resumeData.education.length > 0) {
            resumeData.education.forEach((edu, index) => {
                console.log(`Adding education ${index + 1}:`, edu);
                this.addEducationEntry(edu);
            });
        } else {
            console.log('No education data, adding empty entry');
            this.addEducationEntry();
        }

        // Add extracurricular entries
        console.log('Adding extracurricular entries:', resumeData.extracurricular);
        if (resumeData.extracurricular && resumeData.extracurricular.length > 0) {
            resumeData.extracurricular.forEach((extra, index) => {
                console.log(`Adding extracurricular ${index + 1}:`, extra);
                this.addExtracurricularEntry(extra);
            });
        } else {
            console.log('No extracurricular data, adding empty entry');
            this.addExtracurricularEntry();
        }

        console.log('About to update form data and preview...');
        this.updateFormData();
        console.log('Form data updated, current form data:', this.formData);
        
        // Force preview update
        console.log('Forcing preview update...');
        if (window.pdfPreview) {
            window.pdfPreview.generatePreview(this.formData);
        } else {
            console.error('PDF preview not available');
            // Try again after a short delay
            setTimeout(() => {
                if (window.pdfPreview) {
                    console.log('Retrying preview update...');
                    window.pdfPreview.generatePreview(this.formData);
                }
            }, 500);
        }
        
        this.showMessage('Resume data loaded successfully!', 'success');
    }

    // Method to get current form data
    getFormData() {
        return { ...this.formData };
    }
}

// Initialize form handler when DOM is loaded
let formHandler;

function initializeFormHandler() {
    console.log('Initializing FormHandler...');
    try {
        formHandler = new FormHandler();
        window.formHandler = formHandler; // Make it globally accessible
        console.log('FormHandler initialized and attached to window');
        console.log('window.formHandler is now:', window.formHandler);
    } catch (error) {
        console.error('Error initializing FormHandler:', error);
    }
}

// Try multiple initialization methods
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFormHandler);
} else {
    // DOM is already loaded
    initializeFormHandler();
}

// Also try when window loads (as a backup)
window.addEventListener('load', () => {
    if (!window.formHandler) {
        console.log('FormHandler not found on window load, reinitializing...');
        initializeFormHandler();
    }
});