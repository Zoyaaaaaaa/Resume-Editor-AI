
class FormHandler {
    constructor() {
        this.formData = {
            personalInfo: {},
            areasOfInterest: '',
            experience: [],
            achievements: [],
            positionOfResponsibility: [],
            projects: [],
            education: [],
            publications:[],
            skills: '',
            sectionOrder: ['areasOfInterest', 'education', 'experience', 'achievements', 'projects', 'positionOfResponsibility','skills','publications']
        };
        
        this.initializeEventListeners();
        this.addInitialEntries();
        
        // Initialize section reordering after a short delay to ensure DOM is ready
        setTimeout(() => {
            this.initializeSectionReordering();
        }, 100);
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

        // Skills fields listeners
        document.getElementById('languages').addEventListener('input', () => {
            this.updateFormData();
        });
        
        document.getElementById('frameworks').addEventListener('input', () => {
            this.updateFormData();
        });
        
        document.getElementById('developerTools').addEventListener('input', () => {
            this.updateFormData();
        });

        // Add section buttons
        document.getElementById('addExperience').addEventListener('click', () => {
            this.addExperienceEntry();
        });

        document.getElementById('addAchievement').addEventListener('click', () => {
            this.addAchievementEntry();
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

        // Auto-generate interests button
        document.getElementById('generateInterests').addEventListener('click', () => {
            this.generateAreasOfInterest();
        });

        // Section reordering
        document.getElementById('saveSectionOrder').addEventListener('click', () => {
            this.saveSectionOrder();
        });

        document.getElementById('addPublication').addEventListener('click', () => {
            this.addPublicationEntry();
        });

        

        // Generate technical skills button
        document.getElementById('generateTechnicalSkills').addEventListener('click', () => {
            this.generateSkillsSuggestions();
        });
    }

    updatePersonalInfo(field, value) {
        this.formData.personalInfo[field] = value;
        this.updatePreview();
    }

    // Helper method to clean and process bullet points from parsed data
    processBulletPoints(bulletPoints, description = '') {
        if (!bulletPoints || !Array.isArray(bulletPoints)) {
            return [];
        }

        const allText = [];
        
        // Add description if it exists and isn't empty
        if (description && description.trim()) {
            allText.push(description.trim());
        }
        
        // Add all bullet points
        bulletPoints.forEach(point => {
            if (point && typeof point === 'string' && point.trim()) {
                allText.push(point.trim());
            }
        });

        // Remove duplicates and clean up
        const uniquePoints = [];
        const seen = new Set();
        
        allText.forEach(text => {
            // Skip very short fragments that are likely duplicates
            if (text.length < 10) return;
            
            // Normalize for comparison (lowercase, remove punctuation)
            const normalized = text.toLowerCase().replace(/[^\w\s]/g, '').trim();
            
            // Skip if we've seen this content before
            if (seen.has(normalized)) return;
            
            // Check if this text is a substring of any existing point
            const isSubstring = uniquePoints.some(existing => 
                existing.toLowerCase().includes(normalized) || 
                normalized.includes(existing.toLowerCase().replace(/[^\w\s]/g, '').trim())
            );
            
            if (!isSubstring) {
                seen.add(normalized);
                uniquePoints.push(text);
            }
        });

        // Split long bullet points into coherent sentences if needed
        const finalPoints = [];
        uniquePoints.forEach(point => {
            if (point.length > 200 && point.includes('.') && !point.includes('e.g.')) {
                // Split on periods but keep related content together
                const sentences = point.split(/\.\s+(?=[A-Z])/);
                sentences.forEach((sentence, index) => {
                    if (sentence.trim()) {
                        const cleanSentence = sentence.trim();
                        if (index < sentences.length - 1 && !cleanSentence.endsWith('.')) {
                            finalPoints.push(cleanSentence + '.');
                        } else {
                            finalPoints.push(cleanSentence);
                        }
                    }
                });
            } else {
                finalPoints.push(point);
            }
        });

        return finalPoints.slice(0, 5); // Limit to 5 bullet points per entry
    }

    // Clean entry data by removing bullet points for form population
    cleanEntryData(data) {
        const cleaned = { ...data };
        delete cleaned.bulletPoints;
        delete cleaned.description;
        return cleaned;
    }

    addExperienceEntry(data = {}) {
        const container = document.getElementById('experienceContainer');
        const entryId = 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        
        // Clean data for form fields
        const cleanData = this.cleanEntryData(data);
        
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
                        <input type="text" name="position" value="${this.escapeHtml(cleanData.position || '')}" placeholder="e.g., Data Analyst Intern">
                    </div>
                    <div class="form-group">
                        <label>Company</label>
                        <input type="text" name="company" value="${this.escapeHtml(cleanData.company || '')}" placeholder="e.g., Bewakoof.com">
                    </div>
                    <div class="form-group">
                        <label>Location</label>
                        <input type="text" name="location" value="${this.escapeHtml(cleanData.location || '')}" placeholder="e.g., Bengaluru, Karnataka">
                    </div>
                    <div class="form-group">
                        <label>Dates</label>
                        <input type="text" name="dates" value="${this.escapeHtml(cleanData.dates || '')}" placeholder="e.g., May 2025 - Present">
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
        
        // Add bullet points if they exist in the original data
        if (data.bulletPoints || data.description) {
            setTimeout(() => {
                const processedPoints = this.processBulletPoints(data.bulletPoints, data.description);
                this.addBulletPointsToEntry(entryId, processedPoints, 'experience');
            }, 50);
        }
        
        this.updateFormData();
    }
    addPublicationEntry(data = {}) {
    const container = document.getElementById('publicationsContainer');
    const entryId = 'pub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    
    // Clean data for form fields
    const cleanData = this.cleanEntryData(data);
    
    const entryHTML = `
        <div class="entry-item" data-id="${entryId}">
            <div class="entry-header">
                <span class="entry-title">Publication</span>
                <div class="entry-actions">
                    <button class="remove-entry" onclick="formHandler.removeEntry('${entryId}', 'publications')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="entry-grid">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" name="title" value="${this.escapeHtml(cleanData.title || '')}" placeholder="Publication Title">
                </div>
                <div class="form-group">
                    <label>Journal/Conference</label>
                    <input type="text" name="journal" value="${this.escapeHtml(cleanData.journal || '')}" placeholder="Journal or Conference Name">
                </div>
                <div class="form-group">
                    <label>Authors</label>
                    <input type="text" name="authors" value="${this.escapeHtml(cleanData.authors || '')}" placeholder="List of authors">
                </div>
                <div class="form-group">
                    <label>Date</label>
                    <input type="text" name="date" value="${this.escapeHtml(cleanData.date || '')}" placeholder="Publication Date">
                </div>
                <div class="form-group">
                    <label>DOI/URL</label>
                    <input type="text" name="doi" value="${this.escapeHtml(cleanData.doi || '')}" placeholder="DOI or URL">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select name="status">
                        <option value="">Select status</option>
                        <option value="Published" ${cleanData.status === 'Published' ? 'selected' : ''}>Published</option>
                        <option value="Submitted" ${cleanData.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
                        <option value="In Review" ${cleanData.status === 'In Review' ? 'selected' : ''}>In Review</option>
                        <option value="In Preparation" ${cleanData.status === 'In Preparation' ? 'selected' : ''}>In Preparation</option>
                    </select>
                </div>
            </div>
            <div class="form-group bullet-points-group">
                <label>Description</label>
                <div class="point-enhancement-area">
                    <small>Add details about the publication:</small>
                    <div class="bullet-points-container"></div>
                    <button type="button" class="btn-add-point" style="margin-top: 10px; padding: 8px 12px; font-size: 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-plus"></i> Add Bullet Point
                    </button>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', entryHTML);
    this.attachEntryListeners(entryId, 'publications');
    
    // Add bullet points if they exist in the original data
    if (data.bulletPoints || data.description) {
        setTimeout(() => {
            const processedPoints = this.processBulletPoints(data.bulletPoints, data.description);
            this.addBulletPointsToEntry(entryId, processedPoints, 'publications');
        }, 50);
    }
    
    this.updateFormData();
}

    addAchievementEntry(data = {}) {
        const container = document.getElementById('achievementsContainer');
        const entryId = 'ach_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        
        // Clean data for form fields
        const cleanData = this.cleanEntryData(data);
        
        const entryHTML = `
            <div class="entry-item" data-id="${entryId}">
                <div class="entry-header">
                    <span class="entry-title">Achievement</span>
                    <div class="entry-actions">
                        <button class="remove-entry" onclick="formHandler.removeEntry('${entryId}', 'achievements')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="entry-grid">
                    <div class="form-group">
                        <label>Achievement Title</label>
                        <input type="text" name="title" value="${this.escapeHtml(cleanData.title || '')}" placeholder="e.g., Winner - National Hackathon">
                    </div>
                    <div class="form-group">
                        <label>Organization/Institution</label>
                        <input type="text" name="organization" value="${this.escapeHtml(cleanData.organization || '')}" placeholder="e.g., Ministry of Electronics & IT">
                    </div>
                    <div class="form-group">
                        <label>Date</label>
                        <input type="text" name="date" value="${this.escapeHtml(cleanData.date || '')}" placeholder="e.g., March 2024">
                    </div>
                </div>
                <div class="form-group bullet-points-group">
                    <label>Achievement Details</label>
                    <div class="point-enhancement-area">
                        <small>Add details about your achievement:</small>
                        <div class="bullet-points-container"></div>
                        <button type="button" class="btn-add-point" style="margin-top: 10px; padding: 8px 12px; font-size: 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-plus"></i> Add Bullet Point
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', entryHTML);
        this.attachEntryListeners(entryId, 'achievements');
        
        // Add bullet points if they exist in the original data
        if (data.bulletPoints || data.description) {
            setTimeout(() => {
                const processedPoints = this.processBulletPoints(data.bulletPoints, data.description);
                this.addBulletPointsToEntry(entryId, processedPoints, 'achievements');
            }, 50);
        }
        
        this.updateFormData();
    }

    addPositionEntry(data = {}) {
        const container = document.getElementById('positionContainer');
        const entryId = 'pos_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        
        // Clean data for form fields
        const cleanData = this.cleanEntryData(data);
        
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
                        <input type="text" name="position" value="${this.escapeHtml(cleanData.position || '')}" placeholder="e.g., Executive Member">
                    </div>
                    <div class="form-group">
                        <label>Organization</label>
                        <input type="text" name="organization" value="${this.escapeHtml(cleanData.organization || '')}" placeholder="e.g., Post Graduate Academic Council">
                    </div>
                    <div class="form-group">
                        <label>Institution</label>
                        <input type="text" name="institution" value="${this.escapeHtml(cleanData.institution || '')}" placeholder="e.g., IIT Bombay">
                    </div>
                    <div class="form-group">
                        <label>Dates</label>
                        <input type="text" name="dates" value="${this.escapeHtml(cleanData.dates || '')}" placeholder="e.g., June'23-Present">
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
        
        // Add bullet points if they exist in the original data
        if (data.bulletPoints || data.description) {
            setTimeout(() => {
                const processedPoints = this.processBulletPoints(data.bulletPoints, data.description);
                this.addBulletPointsToEntry(entryId, processedPoints, 'positionOfResponsibility');
            }, 50);
        }
        
        this.updateFormData();
    }

    addProjectEntry(data = {}) {
        const container = document.getElementById('projectsContainer');
        const entryId = 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        
        // Clean data for form fields
        const cleanData = this.cleanEntryData(data);
        
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
                        <input type="text" name="title" value="${this.escapeHtml(cleanData.title || '')}" placeholder="e.g., Large Scale Rural Livelihood Generation">
                    </div>
                    <div class="form-group">
                        <label>Organization/Course</label>
                        <input type="text" name="organization" value="${this.escapeHtml(cleanData.organization || '')}" placeholder="e.g., IIT Bombay">
                    </div>
                    <div class="form-group">
                        <label>Duration</label>
                        <input type="text" name="duration" value="${this.escapeHtml(cleanData.duration || '')}" placeholder="e.g., Aug'23-Present">
                    </div>
                    <div class="form-group">
                        <label>Technologies</label>
                        <input type="text" name="technologies" value="${this.escapeHtml(cleanData.technologies || '')}" placeholder="e.g., Python, ML, Excel">
                    </div>
                </div>
                <div class="form-group description-group">
                    <label>Project Details</label>
                    <div class="point-enhancement-area">
                        <small>Add key project highlights and achievements:</small>
                        <div class="bullet-points-container"></div>
                        <button type="button" class="btn-add-point" style="margin-top: 10px; padding: 8px 12px; font-size: 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-plus"></i> Add Bullet Point
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', entryHTML);
        this.attachEntryListeners(entryId, 'projects');
        
        // Add bullet points if they exist in the original data
        if (data.bulletPoints || data.description) {
            setTimeout(() => {
                const processedPoints = this.processBulletPoints(data.bulletPoints, data.description);
                this.addBulletPointsToEntry(entryId, processedPoints, 'projects');
            }, 50);
        }
        
        this.updateFormData();
    }

    addEducationEntry(data = {}) {
        const container = document.getElementById('educationContainer');
        const entryId = 'edu_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        
        // Clean data for form fields
        const cleanData = this.cleanEntryData(data);
        
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
                        <input type="text" name="degree" value="${this.escapeHtml(cleanData.degree || '')}" placeholder="e.g., Bachelor of Technology">
                    </div>
                    <div class="form-group">
                        <label>Field of Study</label>
                        <input type="text" name="field" value="${this.escapeHtml(cleanData.field || '')}" placeholder="e.g., Computer Science">
                    </div>
                    <div class="form-group">
                        <label>Institution</label>
                        <input type="text" name="institution" value="${this.escapeHtml(cleanData.institution || '')}" placeholder="e.g., IIT Bombay">
                    </div>
                    <div class="form-group">
                        <label>Duration</label>
                        <input type="text" name="duration" value="${this.escapeHtml(cleanData.duration || '')}" placeholder="e.g., 2022-2026">
                    </div>
                    <div class="form-group">
                        <label>Grade/GPA</label>
                        <input type="text" name="grade" value="${this.escapeHtml(cleanData.grade || '')}" placeholder="e.g., 8.5/10">
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
        
        // Add bullet points if they exist in the original data
        if (data.bulletPoints || data.description) {
            setTimeout(() => {
                const processedPoints = this.processBulletPoints(data.bulletPoints, data.description);
                this.addBulletPointsToEntry(entryId, processedPoints, 'education');
            }, 50);
        }
        
        this.updateFormData();
    }
    

    // Helper method to add multiple bullet points to a specific entry
    addBulletPointsToEntry(entryId, bulletPoints, section) {
        if (!bulletPoints || bulletPoints.length === 0) return;
        
        const entry = document.querySelector(`[data-id="${entryId}"]`);
        if (!entry) return;
        
        bulletPoints.forEach(point => {
            if (point && point.trim()) {
                this.addBulletPointWithText(entry, section, point.trim());
            }
        });
        
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
        const pointId = 'point_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const pointHTML = `
            <div class="bullet-point-item" data-point-id="${pointId}" style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px;">
                <span style="margin-top: 6px; font-weight: bold;">•</span>
                <textarea class="bullet-point-input" placeholder="Enter a bullet point..." style="flex: 1; min-height: 40px; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-family: inherit; font-size: 14px; resize: vertical;"></textarea>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <button type="button" class="btn-enhance-point" data-section="${section}" style="padding: 4px 8px; font-size: 11px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer; white-space: nowrap;">
                        ✨ Enhance
                    </button>
                    <button type="button" class="btn-remove-point" style="padding: 4px 8px; font-size: 11px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;">
                        ×
                    </button>
                </div>
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

    // Method to add bullet point with pre-filled text
    addBulletPointWithText(entry, section, text) {
        const container = entry.querySelector('.bullet-points-container');
        const pointId = 'point_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const pointHTML = `
            <div class="bullet-point-item" data-point-id="${pointId}" style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px;">
                <span style="margin-top: 6px; font-weight: bold;">•</span>
                <textarea class="bullet-point-input" style="flex: 1; min-height: 40px; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-family: inherit; font-size: 14px; resize: vertical;">${this.escapeHtml(text)}</textarea>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <button type="button" class="btn-enhance-point" data-section="${section}" style="padding: 4px 8px; font-size: 11px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer; white-space: nowrap;">
                        ✨ Enhance
                    </button>
                    <button type="button" class="btn-remove-point" style="padding: 4px 8px; font-size: 11px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;">
                        ×
                    </button>
                </div>
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
        
        // Auto-resize the textarea to fit content
        this.autoResizeTextarea(input);
    }

    // Auto-resize textarea to fit content
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.max(40, textarea.scrollHeight) + 'px';
        
        // Add resize listener
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = Math.max(40, textarea.scrollHeight) + 'px';
        });
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
            
            // Auto-resize after enhancement
            this.autoResizeTextarea(input);
            
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

        // Update achievements data
        this.formData.achievements = this.getEntriesData('achievementsContainer', [
            'title', 'organization', 'date'
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
        // Collect skills from three separate fields
        const languagesInput = document.getElementById('languages');
        const frameworksInput = document.getElementById('frameworks');
        const developerToolsInput = document.getElementById('developerTools');
        
        const skillsData = {
            languages: languagesInput ? languagesInput.value.trim() : '',
            frameworks: frameworksInput ? frameworksInput.value.trim() : '',
            developerTools: developerToolsInput ? developerToolsInput.value.trim() : ''
        };
        
        this.formData.skillsData = skillsData;
        
        // For backward compatibility, also create a combined skills string
        const allSkills = [];
        if (skillsData.languages) allSkills.push(skillsData.languages);
        if (skillsData.frameworks) allSkills.push(skillsData.frameworks);
        if (skillsData.developerTools) allSkills.push(skillsData.developerTools);
        this.formData.skills = allSkills.join(', ');
        

        // Update publications data
        this.formData.publications = this.getEntriesData('publicationsContainer', [
            'title', 'journal', 'authors', 'date', 'doi', 'status'
        ]);


        this.updatePreview();
    }

    autoCategorizeSkills(skillsString) {
        if (!skillsString) return;
        
        const skillsArray = skillsString.split(/[,|]/).map(s => s.trim()).filter(s => s);
        
        const categories = {
            languages: [],
            frameworks: [],
            developerTools: []
        };

        // Keywords for categorization
        const languageKeywords = [
            'javascript', 'java', 'python', 'c++', 'c/c++', 'sql', 'mysql', 'html/css', 'html', 'css', 
            'php', 'ruby', 'go', 'rust', 'typescript', 'c#', 'swift', 'kotlin', 'scala', 'r', 'matlab'
        ];
        
        const frameworkKeywords = [
            'react', 'vue', 'angular', 'node.js', 'nodejs', 'express', 'django', 'flask', 'spring', 
            'rails', 'laravel', 'bootstrap', 'tailwind', 'jquery', 'nextjs', 'nuxt', 'grails',
            'djangorest', 'rest framework', 'fastapi', 'gin'
        ];
        
        const toolKeywords = [
            'git', 'docker', 'vs code', 'visual studio', 'pycharm', 'intellij', 'eclipse', 'xcode',
            'postman', 'figma', 'sketch', 'photoshop', 'illustrator', 'kubernetes', 'jenkins', 
            'travis', 'circleci', 'aws', 'azure', 'gcp', 'heroku', 'vercel', 'netlify'
        ];

        // Categorize each skill
        skillsArray.forEach(skill => {
            const skillLower = skill.toLowerCase();
            
            if (languageKeywords.some(keyword => skillLower.includes(keyword))) {
                categories.languages.push(skill);
            } else if (frameworkKeywords.some(keyword => skillLower.includes(keyword))) {
                categories.frameworks.push(skill);
            } else if (toolKeywords.some(keyword => skillLower.includes(keyword))) {
                categories.developerTools.push(skill);
            } else {
                // Default to languages if unsure
                categories.languages.push(skill);
            }
        });

        // Populate the form fields
        const languagesInput = document.getElementById('languages');
        const frameworksInput = document.getElementById('frameworks');
        const developerToolsInput = document.getElementById('developerTools');
        
        if (languagesInput) languagesInput.value = categories.languages.join(', ');
        if (frameworksInput) frameworksInput.value = categories.frameworks.join(', ');
        if (developerToolsInput) developerToolsInput.value = categories.developerTools.join(', ');
        
        // Update form data
        this.formData.skillsData = {
            languages: categories.languages.join(', '),
            frameworks: categories.frameworks.join(', '),
            developerTools: categories.developerTools.join(', ')
        };
        this.formData.skills = skillsString;
    }

    getEntriesData(containerId, fields) {
        const container = document.getElementById(containerId);
        if (!container) return [];
        
        const entries = container.querySelectorAll('.entry-item');
        
        return Array.from(entries).map(entry => {
            const data = {};
            fields.forEach(field => {
                const input = entry.querySelector(`[name="${field}"]`);
                data[field] = input ? input.value.trim() : '';
            });
            
            // Collect bullet points
            const bulletPoints = [];
            const bulletInputs = entry.querySelectorAll('.bullet-point-input');
            bulletInputs.forEach(input => {
                const text = input.value.trim();
                if (text) {
                    bulletPoints.push(text);
                }
            });
            data.bulletPoints = bulletPoints;
            
            return data;
        }).filter(entry => {
            // Filter out completely empty entries
            const hasContent = Object.values(entry).some(value => 
                value && (typeof value === 'string' ? value.trim() : value.length > 0)
            );
            return hasContent;
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
        this.addAchievementEntry();
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
        if (firstSection) {
            firstSection.parentNode.insertBefore(message, firstSection);

            setTimeout(() => {
                if (message.parentNode) {
                    message.remove();
                }
            }, 3000);
        }
    }

    // Method to populate form from uploaded resume data
    populateFromData(resumeData) {
        console.log('populateFromData called with:', resumeData);
        
        if (!resumeData) {
            console.error('No resume data provided to populateFromData');
            return;
        }
        
        try {
            // Personal Information
            if (resumeData.personalInfo) {
                Object.keys(resumeData.personalInfo).forEach(key => {
                    const input = document.getElementById(key);
                    if (input && resumeData.personalInfo[key]) {
                        input.value = resumeData.personalInfo[key];
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        this.updatePersonalInfo(key, resumeData.personalInfo[key]);
                    }
                });
            }

            // Areas of Interest
            const areasInput = document.getElementById('areasOfInterest');
            if (areasInput && resumeData.areasOfInterest) {
                areasInput.value = resumeData.areasOfInterest;
                this.formData.areasOfInterest = resumeData.areasOfInterest;
            }

            // Clear existing entries
            const containers = ['experienceContainer', 'achievementsContainer', 'positionContainer', 'projectsContainer', 'educationContainer'];
            containers.forEach(containerId => {
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = '';
                }
            });

            // Add experience entries
            if (resumeData.experience && resumeData.experience.length > 0) {
                resumeData.experience.forEach(exp => {
                    if (exp && (exp.position || exp.company || (exp.bulletPoints && exp.bulletPoints.length > 0))) {
                        this.addExperienceEntry(exp);
                    }
                });
            } else {
                this.addExperienceEntry();
            }

            // Add achievement entries
            if (resumeData.achievements && resumeData.achievements.length > 0) {
                resumeData.achievements.forEach(ach => {
                    if (ach && (ach.title || ach.organization || (ach.bulletPoints && ach.bulletPoints.length > 0))) {
                        this.addAchievementEntry(ach);
                    }
                });
            } else {
                this.addAchievementEntry();
            }

            // Add position entries
            if (resumeData.positionOfResponsibility && resumeData.positionOfResponsibility.length > 0) {
                resumeData.positionOfResponsibility.forEach(pos => {
                    if (pos && (pos.position || pos.organization || (pos.bulletPoints && pos.bulletPoints.length > 0))) {
                        this.addPositionEntry(pos);
                    }
                });
            } else {
                this.addPositionEntry();
            }

            // Add project entries
            if (resumeData.projects && resumeData.projects.length > 0) {
                resumeData.projects.forEach(proj => {
                    if (proj && (proj.title || proj.technologies || (proj.bulletPoints && proj.bulletPoints.length > 0))) {
                        this.addProjectEntry(proj);
                    }
                });
            } else {
                this.addProjectEntry();
            }

            // Add education entries
            if (resumeData.education && resumeData.education.length > 0) {
                resumeData.education.forEach(edu => {
                    if (edu && (edu.degree || edu.institution || (edu.bulletPoints && edu.bulletPoints.length > 0))) {
                        this.addEducationEntry(edu);
                    }
                });
            } else {
                this.addEducationEntry();
            }

            // Load skills data into separate fields
            if (resumeData.skillsData) {
                const languagesInput = document.getElementById('languages');
                const frameworksInput = document.getElementById('frameworks');
                const developerToolsInput = document.getElementById('developerTools');
                
                if (languagesInput && resumeData.skillsData.languages) {
                    languagesInput.value = resumeData.skillsData.languages;
                }
                if (frameworksInput && resumeData.skillsData.frameworks) {
                    frameworksInput.value = resumeData.skillsData.frameworks;
                }
                if (developerToolsInput && resumeData.skillsData.developerTools) {
                    developerToolsInput.value = resumeData.skillsData.developerTools;
                }
                
                this.formData.skillsData = resumeData.skillsData;
                this.formData.skills = resumeData.skills || '';
            } else if (resumeData.skills) {
                // Fallback: if only old-format skills available, try to auto-categorize
                this.autoCategorizeSkills(resumeData.skills);
            }

            // Add publication entries
            if (resumeData.publications && resumeData.publications.length > 0) {
                resumeData.publications.forEach(pub => {
                    if (pub && (pub.title || pub.journal || (pub.bulletPoints && pub.bulletPoints.length > 0))) {
                        this.addPublicationEntry(pub);
                    }
                });
            } else {
                this.addPublicationEntry();
            }
            
            // Update form data and preview
            setTimeout(() => {
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
            }, 200);
            
            this.showMessage('Resume data loaded successfully!', 'success');
            
        } catch (error) {
            console.error('Error populating form data:', error);
            this.showMessage('Error loading resume data. Please try again.', 'error');
        }
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

    // Method to export form data as JSON
    exportFormData() {
        return JSON.stringify(this.formData, null, 2);
    }

    // Method to import form data from JSON
    importFormData(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            this.populateFromData(data);
            return true;
        } catch (error) {
            console.error('Error importing form data:', error);
            this.showMessage('Error importing data. Please check the format.', 'error');
            return false;
        }
    }

    // Method to validate form data
    validateFormData() {
        const errors = [];
        
        // Check personal info
        if (!this.formData.personalInfo.fullName?.trim()) {
            errors.push('Full name is required');
        }
        
        if (!this.formData.personalInfo.email?.trim()) {
            errors.push('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.personalInfo.email)) {
            errors.push('Please enter a valid email address');
        }
        
        if (!this.formData.personalInfo.phone?.trim()) {
            errors.push('Phone number is required');
        }
        
        // Check if at least one section has content
        const hasExperience = this.formData.experience.some(exp => 
            exp.position?.trim() || exp.company?.trim() || exp.bulletPoints?.length > 0
        );
        
        const hasProjects = this.formData.projects.some(proj => 
            proj.title?.trim() || proj.technologies?.trim() || proj.bulletPoints?.length > 0
        );
        
        const hasEducation = this.formData.education.some(edu => 
            edu.degree?.trim() || edu.institution?.trim()
        );
        
        if (!hasExperience && !hasProjects && !hasEducation) {
            errors.push('Please add at least one experience, project, or education entry');
        }
        
        return errors;
    }

    // Method to reset form to initial state
    resetForm() {
        // Reset form data
        this.formData = {
            personalInfo: {},
            areasOfInterest: '',
            experience: [],
            achievements: [],
            positionOfResponsibility: [],
            projects: [],
            education: [],
            sectionOrder: ['areasOfInterest', 'education', 'experience', 'achievements', 'projects', 'positionOfResponsibility']
        };
        
        // Clear all inputs
        document.querySelectorAll('input, textarea').forEach(input => {
            input.value = '';
        });
        
        // Clear all containers
        const containers = ['experienceContainer', 'achievementsContainer', 'positionContainer', 'projectsContainer', 'educationContainer'];
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '';
            }
        });
        
        // Add initial entries
        this.addInitialEntries();
        
        this.showMessage('Form reset successfully!', 'info');
    }

    // Method to get summary of form completion
    getFormSummary() {
        const summary = {
            personalInfo: Object.keys(this.formData.personalInfo).filter(key => 
                this.formData.personalInfo[key]?.trim()
            ).length,
            areasOfInterest: this.formData.areasOfInterest?.trim() ? 1 : 0,
            experience: this.formData.experience.filter(exp => 
                exp.position?.trim() || exp.company?.trim() || exp.bulletPoints?.length > 0
            ).length,
            positionOfResponsibility: this.formData.positionOfResponsibility.filter(pos => 
                pos.position?.trim() || pos.organization?.trim() || pos.bulletPoints?.length > 0
            ).length,
            projects: this.formData.projects.filter(proj => 
                proj.title?.trim() || proj.technologies?.trim() || proj.bulletPoints?.length > 0
            ).length,
            education: this.formData.education.filter(edu => 
                edu.degree?.trim() || edu.institution?.trim()
            ).length
        };
        
        const totalBulletPoints = [
            ...this.formData.experience,
            ...this.formData.positionOfResponsibility,
            ...this.formData.projects,
            ...this.formData.education
        ].reduce((total, item) => total + (item.bulletPoints?.length || 0), 0);
        
        summary.totalBulletPoints = totalBulletPoints;
        summary.completionPercentage = Math.round(
            ((summary.personalInfo / 4) + 
             (summary.areasOfInterest) + 
             (Math.min(summary.experience, 3) / 3) + 
             (Math.min(summary.projects, 2) / 2) + 
             (Math.min(summary.education, 1))) / 7 * 100
        );
        
        return summary;
    }

    // Generate Areas of Interest using AI
    async generateAreasOfInterest() {
        const button = document.getElementById('generateInterests');
        const originalText = button.innerText;
        const roleSelect = document.getElementById('role');
        const jobRole = roleSelect ? roleSelect.value : 'software';
        
        try {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            button.disabled = true;
            
            // Get current form data as context
            const resumeData = this.getFormData();
            
            const response = await fetch('/api/gemini/generate-interests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    resumeData: resumeData,
                    jobRole: jobRole
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to generate interests');
            }
            
            const result = await response.json();
            
            // Update the areas of interest field
            const areasInput = document.getElementById('areasOfInterest');
            if (areasInput && result.areasOfInterest) {
                areasInput.value = result.areasOfInterest;
                this.formData.areasOfInterest = result.areasOfInterest;
                areasInput.dispatchEvent(new Event('input', { bubbles: true }));
                this.updatePreview();
            }
            
            this.showMessage('Areas of Interest generated successfully!', 'success');
            
        } catch (error) {
            console.error('Generate interests error:', error);
            this.showMessage('Failed to generate areas of interest. Please try again.', 'error');
        } finally {
            button.innerText = originalText;
            button.disabled = false;
        }
    }

    // Save section order using drag and drop
    saveSectionOrder() {
        const sectionOrderContainer = document.getElementById('sectionOrderContainer');
        if (!sectionOrderContainer) {
            console.error('sectionOrderContainer not found');
            return;
        }
        
        const sectionItems = sectionOrderContainer.querySelectorAll('.section-order-item');
        const sectionOrder = Array.from(sectionItems).map(item => item.dataset.section);
        
        console.log('Saving section order:', sectionOrder);
        
        // Update local form data
        this.formData.sectionOrder = sectionOrder;
        
        // Send to backend
        fetch('/api/reorder-sections', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sectionOrder: sectionOrder
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                this.showMessage('Section order saved successfully!', 'success');
                console.log('New section order:', result.sectionOrder);
                
                // Update preview with new section order
                this.updatePreview();
            } else {
                throw new Error(result.error || 'Failed to save section order');
            }
        })
        .catch(error => {
            console.error('Save section order error:', error);
            this.showMessage('Failed to save section order. Please try again.', 'error');
        });
    }

    // Initialize drag and drop for section reordering
    initializeSectionReordering() {
        const container = document.getElementById('sectionOrderContainer');
        if (!container) return;
        
        let draggedElement = null;
        
        // Add drag event listeners to all section items
        container.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('section-order-item')) {
                draggedElement = e.target;
                e.target.style.opacity = '0.5';
            }
        });
        
        container.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('section-order-item')) {
                e.target.style.opacity = '';
                draggedElement = null;
            }
        });
        
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            if (draggedElement && e.target.classList.contains('section-order-item') && e.target !== draggedElement) {
                const rect = e.target.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;
                
                if (e.clientY < midpoint) {
                    container.insertBefore(draggedElement, e.target);
                } else {
                    container.insertBefore(draggedElement, e.target.nextSibling);
                }
            }
        });
        
        // Make all section items draggable
        container.querySelectorAll('.section-order-item').forEach(item => {
            item.draggable = true;
        });
    }
}

// Initialize form handler when DOM is loaded
let formHandler;

function initializeFormHandler() {
    try {
        formHandler = new FormHandler();
        window.formHandler = formHandler; // Make it globally accessible
        console.log('FormHandler initialized successfully');
    } catch (error) {
        console.error('Error initializing FormHandler:', error);
    }
}

// Utility function to handle resume file uploads
function handleResumeUpload(file) {
    if (!formHandler) {
        console.error('FormHandler not initialized');
        return;
    }
    
    const formData = new FormData();
    formData.append('resume', file);
    
    formHandler.showMessage('Processing resume...', 'info');
    
    fetch('/upload-resume', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.structuredData) {
            formHandler.populateFromData(data.structuredData);
        } else {
            formHandler.showMessage('Error processing resume: ' + (data.error || 'Unknown error'), 'error');
        }
    })
    .catch(error => {
        console.error('Upload error:', error);
        formHandler.showMessage('Error uploading resume. Please try again.', 'error');
    });
}

// Initialize after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for all scripts to load
    setTimeout(initializeFormHandler, 100);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormHandler;
}