// Form Handler for Resume Editor
class FormHandler {
    constructor() {
        this.formData = {
            personalInfo: {},
            areasOfInterest: '',
            experience: [],
            positionOfResponsibility: [],
            projects: [],
            education: []
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

        document.getElementById('addPosition').addEventListener('click', () => {
            this.addPositionEntry();
        });

        document.getElementById('addProject').addEventListener('click', () => {
            this.addProjectEntry();
        });

        document.getElementById('addEducation').addEventListener('click', () => {
            this.addEducationEntry();
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
                <div class="form-group bullet-points-group">
                    <label>Key Responsibilities & Achievements</label>
                    <div class="point-enhancement-area">
                        <small>Add individual bullet points for your achievements:</small>
                        <div class="bullet-points-container"></div>
                        <button type="button" class="btn-add-point" style="margin-top: 10px; padding: 8px 12px; font-size: 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-plus"></i> Add Bullet Point
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', entryHTML);
        this.attachEntryListeners(entryId, 'experience');
        this.updateFormData();
    }

    addPositionEntry(data = {}) {
        const container = document.getElementById('positionContainer');
        const entryId = 'pos_' + Date.now();
        
        const entryHTML = `
            <div class="entry-item" data-id="${entryId}">
                <div class="entry-header">
                    <span class="entry-title">Position of Responsibility</span>
                    <div class="entry-actions">
                        <button class="remove-entry" onclick="formHandler.removeEntry('${entryId}', 'positionOfResponsibility')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="entry-grid">
                    <div class="form-group">
                        <label>Position</label>
                        <input type="text" name="position" value="${data.position || ''}" placeholder="e.g., Executive Member">
                    </div>
                    <div class="form-group">
                        <label>Organization</label>
                        <input type="text" name="organization" value="${data.organization || ''}" placeholder="e.g., Post Graduate Academic Council">
                    </div>
                    <div class="form-group">
                        <label>Institution</label>
                        <input type="text" name="institution" value="${data.institution || ''}" placeholder="e.g., IIT Bombay">
                    </div>
                    <div class="form-group">
                        <label>Dates</label>
                        <input type="text" name="dates" value="${data.dates || ''}" placeholder="e.g., June'23-Present">
                    </div>
                </div>
                <div class="form-group bullet-points-group">
                    <label>Key Responsibilities & Achievements</label>
                    <div class="point-enhancement-area">
                        <small>Add individual bullet points for your achievements:</small>
                        <div class="bullet-points-container"></div>
                        <button type="button" class="btn-add-point" style="margin-top: 10px; padding: 8px 12px; font-size: 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-plus"></i> Add Bullet Point
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', entryHTML);
        this.attachEntryListeners(entryId, 'positionOfResponsibility');
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
                    <div class="point-enhancement-area" style="margin-top: 10px;">
                        <small>Click "Add Bullet Point" then enhance individual points:</small>
                        <div class="bullet-points-container"></div>
                        <button type="button" class="btn-add-point" style="margin-top: 5px; padding: 3px 8px; font-size: 12px;">
                            <i class="fas fa-plus"></i> Add Bullet Point
                        </button>
                    </div>
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
                <div class="form-group bullet-points-group">
                    <label>Achievements & Coursework (Optional)</label>
                    <div class="point-enhancement-area">
                        <small>Add relevant coursework, achievements, or other details:</small>
                        <div class="bullet-points-container"></div>
                        <button type="button" class="btn-add-point" style="margin-top: 10px; padding: 8px 12px; font-size: 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-plus"></i> Add Bullet Point
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', entryHTML);
        this.attachEntryListeners(entryId, 'education');
        this.updateFormData();
    }


    attachEntryListeners(entryId, section) {
        const entry = document.querySelector(`[data-id="${entryId}"]`);
        
        // Add input listeners for all form fields in this entry
        entry.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                this.updateFormData();
            });
        });

        // Add bullet point functionality
        const addPointBtn = entry.querySelector('.btn-add-point');
        if (addPointBtn) {
            addPointBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.addBulletPoint(entry, section);
            });
        }
    }

    addBulletPoint(entry, section) {
        const container = entry.querySelector('.bullet-points-container');
        const pointId = 'point_' + Date.now();
        
        const pointHTML = `
            <div class="bullet-point-item" data-point-id="${pointId}" style="margin-bottom: 8px; display: flex; align-items: center;">
                <span style="margin-right: 8px;">•</span>
                <input type="text" class="bullet-point-input" placeholder="Enter a bullet point..." style="flex: 1; margin-right: 8px; padding: 4px;">
                <button type="button" class="btn-enhance-point" data-section="${section}" style="padding: 2px 6px; font-size: 11px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">
                    ✨ Enhance
                </button>
                <button type="button" class="btn-remove-point" style="padding: 2px 6px; font-size: 11px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer; margin-left: 4px;">
                    ×
                </button>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', pointHTML);
        
        // Add listeners for the new point
        const pointElement = container.querySelector(`[data-point-id="${pointId}"]`);
        const input = pointElement.querySelector('.bullet-point-input');
        const enhanceBtn = pointElement.querySelector('.btn-enhance-point');
        const removeBtn = pointElement.querySelector('.btn-remove-point');
        
        input.addEventListener('input', () => this.updateFormData());
        
        enhanceBtn.addEventListener('click', () => {
            this.enhancePoint(input, section, entry);
        });
        
        removeBtn.addEventListener('click', () => {
            pointElement.remove();
            this.updateFormData();
        });
        
        input.focus();
    }

    async enhancePoint(input, section, entry) {
        const originalText = input.value.trim();
        if (!originalText) {
            alert('Please enter some text first');
            return;
        }

        const enhanceBtn = input.parentElement.querySelector('.btn-enhance-point');
        const originalBtnText = enhanceBtn.innerHTML;
        enhanceBtn.innerHTML = '⏳';
        enhanceBtn.disabled = true;

        try {
            // Get context from the entry
            const context = this.getEntryContext(entry);
            
            const response = await fetch('/api/gemini/enhance-point', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    section: section,
                    content: originalText,
                    context: context
                })
            });

            if (!response.ok) {
                throw new Error('Enhancement failed');
            }

            const result = await response.json();
            input.value = result.enhancedContent || originalText;
            
            enhanceBtn.innerHTML = '✅';
            setTimeout(() => {
                enhanceBtn.innerHTML = originalBtnText;
                enhanceBtn.disabled = false;
            }, 2000);
            
            this.updateFormData();
            
        } catch (error) {
            console.error('Enhancement error:', error);
            alert('Enhancement failed. Please try again.');
            enhanceBtn.innerHTML = originalBtnText;
            enhanceBtn.disabled = false;
        }
    }

    getEntryContext(entry) {
        // Extract context information from the entry
        const position = entry.querySelector('[name="position"]')?.value || '';
        const company = entry.querySelector('[name="company"]')?.value || '';
        const organization = entry.querySelector('[name="organization"]')?.value || '';
        const title = entry.querySelector('[name="title"]')?.value || '';
        
        return `${position} ${company} ${organization} ${title}`.trim();
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
            'position', 'company', 'location', 'dates'
        ]);

        // Update position of responsibility data
        this.formData.positionOfResponsibility = this.getEntriesData('positionContainer', [
            'position', 'organization', 'institution', 'dates'
        ]);

        // Update projects data
        this.formData.projects = this.getEntriesData('projectsContainer', [
            'title', 'organization', 'duration', 'technologies'
        ]);

        // Update education data
        this.formData.education = this.getEntriesData('educationContainer', [
            'degree', 'field', 'institution', 'duration', 'grade'
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
            
            // Collect bullet points
            const bulletPoints = [];
            const bulletInputs = entry.querySelectorAll('.bullet-point-input');
            bulletInputs.forEach(input => {
                if (input.value.trim()) {
                    bulletPoints.push(input.value.trim());
                }
            });
            data.bulletPoints = bulletPoints;
            
            return data;
        });
    }

    updatePreview() {
        // Wait for pdfPreview to be available
        if (window.pdfPreview && typeof window.pdfPreview.generatePreview === 'function') {
            window.pdfPreview.generatePreview(this.formData);
        } else {
            // Retry after a short delay if pdfPreview is not ready
            setTimeout(() => {
                if (window.pdfPreview && typeof window.pdfPreview.generatePreview === 'function') {
                    window.pdfPreview.generatePreview(this.formData);
                }
            }, 100);
        }
    }

    addInitialEntries() {
        // Add one initial entry for each section
        this.addExperienceEntry();
        this.addPositionEntry();
        this.addProjectEntry();
        this.addEducationEntry();
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
        
        if (!resumeData) {
            console.error('No resume data provided to populateFromData');
            return;
        }
        
        // Personal Information
        if (resumeData.personalInfo) {
            Object.keys(resumeData.personalInfo).forEach(key => {
                const input = document.getElementById(key);
                if (input) {
                    input.value = resumeData.personalInfo[key];
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    this.updatePersonalInfo(key, resumeData.personalInfo[key]);
                }
            });
        }

        // Areas of Interest
        const areasInput = document.getElementById('areasOfInterest');
        if (areasInput) {
            areasInput.value = resumeData.areasOfInterest || '';
            this.formData.areasOfInterest = resumeData.areasOfInterest || '';
        }

        // Clear existing entries
        const containers = ['experienceContainer', 'positionContainer', 'projectsContainer', 'educationContainer'];
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '';
            }
        });

        // Add experience entries
        if (resumeData.experience && resumeData.experience.length > 0) {
            resumeData.experience.forEach((exp, index) => {
                this.addExperienceEntry(exp);
                // Add bullet points after entry is created with specific index
                if (exp.bulletPoints && exp.bulletPoints.length > 0) {
                    setTimeout(() => this.populateBulletPointsForEntry('experienceContainer', index, exp.bulletPoints), 100);
                }
            });
        } else {
            this.addExperienceEntry();
        }

        // Add position entries
        if (resumeData.positionOfResponsibility && resumeData.positionOfResponsibility.length > 0) {
            resumeData.positionOfResponsibility.forEach((pos, index) => {
                this.addPositionEntry(pos);
                // Add bullet points after entry is created with specific index
                if (pos.bulletPoints && pos.bulletPoints.length > 0) {
                    setTimeout(() => this.populateBulletPointsForEntry('positionContainer', index, pos.bulletPoints), 100);
                }
            });
        } else {
            this.addPositionEntry();
        }

        // Add project entries
        if (resumeData.projects && resumeData.projects.length > 0) {
            resumeData.projects.forEach((proj, index) => {
                this.addProjectEntry(proj);
                // Add bullet points after entry is created with specific index
                if (proj.bulletPoints && proj.bulletPoints.length > 0) {
                    setTimeout(() => this.populateBulletPointsForEntry('projectsContainer', index, proj.bulletPoints), 100);
                }
            });
        } else {
            this.addProjectEntry();
        }

        // Add education entries
        if (resumeData.education && resumeData.education.length > 0) {
            resumeData.education.forEach((edu, index) => {
                this.addEducationEntry(edu);
                // Add bullet points after entry is created with specific index
                if (edu.bulletPoints && edu.bulletPoints.length > 0) {
                    setTimeout(() => this.populateBulletPointsForEntry('educationContainer', index, edu.bulletPoints), 100);
                }
            });
        } else {
            this.addEducationEntry();
        }

        this.updateFormData();
        
        // Force preview update
        if (window.pdfPreview) {
            window.pdfPreview.generatePreview(this.formData);
        } else {
            setTimeout(() => {
                if (window.pdfPreview) {
                    window.pdfPreview.generatePreview(this.formData);
                }
            }, 500);
        }
        
        this.showMessage('Resume data loaded successfully!', 'success');
    }

    // Method to populate bullet points for a specific entry
    populateBulletPointsForEntry(containerId, entryIndex, bulletPoints) {
        if (!bulletPoints || bulletPoints.length === 0) return;
        
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Get the specific entry by index
        const entries = container.querySelectorAll('.entry-item');
        const targetEntry = entries[entryIndex];
        if (!targetEntry) return;
        
        const bulletContainer = targetEntry.querySelector('.bullet-points-container');
        if (!bulletContainer) return;
        
        // Clear any existing bullet points in this specific entry
        bulletContainer.innerHTML = '';
        
        // Determine section name for bullet point functionality
        let section = '';
        if (containerId === 'experienceContainer') section = 'experience';
        else if (containerId === 'positionContainer') section = 'positionOfResponsibility';
        else if (containerId === 'projectsContainer') section = 'projects';
        else if (containerId === 'educationContainer') section = 'education';
        
        // Add each bullet point to this specific entry
        bulletPoints.forEach(point => {
            if (point && point.trim()) {
                this.addBulletPointWithText(targetEntry, section, point.trim());
            }
        });
    }

    // Method to populate bullet points from parsed resume data (kept for backward compatibility)
    populateBulletPoints(section, bulletPoints) {
        if (!bulletPoints || bulletPoints.length === 0) return;
        
        let containerId = '';
        switch(section) {
            case 'experience':
                containerId = 'experienceContainer';
                break;
            case 'positionOfResponsibility':
                containerId = 'positionContainer';
                break;
            case 'projects':
                containerId = 'projectsContainer';
                break;
            case 'education':
                containerId = 'educationContainer';
                break;
            default:
                return;
        }
        
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Get the last entry (most recently added)
        const entries = container.querySelectorAll('.entry-item');
        const lastEntry = entries[entries.length - 1];
        if (!lastEntry) return;
        
        const bulletContainer = lastEntry.querySelector('.bullet-points-container');
        if (!bulletContainer) return;
        
        // Add each bullet point
        bulletPoints.forEach(point => {
            if (point && point.trim()) {
                this.addBulletPointWithText(lastEntry, section, point.trim());
            }
        });
    }
    
    // Method to add bullet point with pre-filled text
    addBulletPointWithText(entry, section, text) {
        const container = entry.querySelector('.bullet-points-container');
        const pointId = 'point_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const pointHTML = `
            <div class="bullet-point-item" data-point-id="${pointId}" style="margin-bottom: 8px; display: flex; align-items: center;">
                <span style="margin-right: 8px;">•</span>
                <input type="text" class="bullet-point-input" value="${this.escapeHtml(text)}" style="flex: 1; margin-right: 8px; padding: 4px;">
                <button type="button" class="btn-enhance-point" data-section="${section}" style="padding: 2px 6px; font-size: 11px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">
                    ✨ Enhance
                </button>
                <button type="button" class="btn-remove-point" style="padding: 2px 6px; font-size: 11px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer; margin-left: 4px;">
                    ×
                </button>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', pointHTML);
        
        // Add listeners for the new point
        const pointElement = container.querySelector(`[data-point-id="${pointId}"]`);
        const input = pointElement.querySelector('.bullet-point-input');
        const enhanceBtn = pointElement.querySelector('.btn-enhance-point');
        const removeBtn = pointElement.querySelector('.btn-remove-point');
        
        input.addEventListener('input', () => this.updateFormData());
        
        enhanceBtn.addEventListener('click', () => {
            this.enhancePoint(input, section, entry);
        });
        
        removeBtn.addEventListener('click', () => {
            pointElement.remove();
            this.updateFormData();
        });
    }

    // Helper method to escape HTML
    escapeHtml(text) {
        if (!text) return '';
        return text.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Method to get current form data
    getFormData() {
        return { ...this.formData };
    }
}

// Initialize form handler when DOM is loaded
let formHandler;

function initializeFormHandler() {
    try {
        formHandler = new FormHandler();
        window.formHandler = formHandler; // Make it globally accessible
    } catch (error) {
        console.error('Error initializing FormHandler:', error);
    }
}

// Initialize after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for all scripts to load
    setTimeout(initializeFormHandler, 100);
});