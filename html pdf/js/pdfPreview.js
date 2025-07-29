// PDF Preview Generator for Resume Editor
class PDFPreview {
    constructor() {
        this.previewContainer = document.getElementById('pdfPreview');
        this.currentData = null;
        this.debounceTimer = null;
        this.initializePreview();
    }

    initializePreview() {
        // Create initial preview structure
        this.createPreviewTemplate();
        this.injectStyles();
    }

    injectStyles() {
        if (!document.getElementById('resume-preview-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'resume-preview-styles';
            styleElement.textContent = this.getPreviewStyles();
            document.head.appendChild(styleElement);
        }
    }

    getPreviewStyles() {
        return `
            /* A4 page setup */
            .resume-preview {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                background: white;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                padding: 10mm;
                box-sizing: border-box;
                font-family: "Calibri", Arial, sans-serif;
                color: #000;
                position: relative;
            }

            .preview-placeholder {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100%;
                color: #666;
                font-size: 14px;
            }

            .preview-placeholder i {
                font-size: 48px;
                margin-bottom: 16px;
                color: #a3d5f7;
            }

            .header {
                text-align: center;
                margin-bottom: 2px;
                border-bottom: 1.5px solid #2c3e50;
                padding-bottom: 2px;
            }

            .name {
                font-size: 18pt;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 1px;
            }

            .contact-info {
                font-size: 9pt;
                color: #666;
            }

            .section-header {
                background-color: #a3d5f7;
                padding: 1px 5px;
                font-size: 10.5pt;
                font-weight: bold;
                margin-top: 2px;
                margin-bottom: 1px;
                text-transform: uppercase;
                border-left: 3px solid #2c3e50;
            }

            .section {
                margin-bottom: 1px;
            }

            .subheader {
                display: flex;
                justify-content: space-between;
                font-weight: bold;
                font-size: 9.5pt;
                margin-top: 1px;
                margin-bottom: 0;
                background-color: #f0f0f0;
            }

            .subheader .title {
                flex: 1;
            }

            .subheader .date {
                font-style: italic;
                font-size: 8.5pt;
                margin-left: 5px;
                white-space: nowrap;
                font-weight: normal;
            }

            ul {
                margin: 0 0 0 20px;
                padding: 0;
                list-style-type: disc;
            }

            ul li {
                margin: 0;
                padding: 0;
                font-size: 9.5pt;
                line-height: 1.1;
            }

            .project-title {
                font-size: 10pt;
                font-weight: bold;
                margin: 1px 0 0;
            }

            .project-description {
                font-size: 9pt;
                margin: 0 0 0 0;
            }

            .project-description .date {
                font-style: italic;
                font-size: 8.5pt;
                float: right;
            }

            p {
                margin: 0 0 1px 0;
                font-size: 9.5pt;
            }

            .areas-text {
                font-size: 9.5pt;
                text-align: center;
                margin: 0 0;
            }

            .extra-category {
                font-weight: bold;
                margin-top: 1px;
                margin-bottom: 0;
                display: inline-block;
                width: 120px;
                vertical-align: top;
                font-size: 9.5pt;
            }

            .extra-content {
                display: inline-block;
                width: calc(100% - 125px);
                vertical-align: top;
                font-size: 9.5pt;
            }

            .extra-item {
                margin-bottom: 1px;
                display: block;
            }

            .extra-content ul {
                margin: 0;
                padding-left: 15px;
            }

            .extra-content ul li {
                list-style-type: none;
                position: relative;
                padding-left: 10px;
            }

            .extra-content ul li:before {
                content: "•";
                position: absolute;
                left: 0;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                margin: 1px 0;
            }

            table td {
                padding: 0 0;
                vertical-align: top;
                font-size: 9.5pt;
            }

            @media print {
                .resume-preview {
                    box-shadow: none;
                    padding: 0;
                    width: 100%;
                    height: 100%;
                }
            }
        `;
    }

    generatePreview(formData) {
        console.log('generatePreview called with data:', formData);
        // Debounce preview updates to avoid excessive re-rendering
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.currentData = formData;
            console.log('About to render preview with data:', this.currentData);
            this.renderPreview();
        }, 300);
    }

    createPreviewTemplate() {
        this.previewContainer.innerHTML = `
            <div class="resume-preview" id="resumePreview">
                <div class="preview-placeholder">
                    <i class="fas fa-file-pdf"></i>
                    <p>Resume preview will appear here</p>
                    <small>Start filling out the form to see your resume</small>
                </div>
            </div>
        `;
    }

    renderPreview() {
        console.log('renderPreview called with data:', this.currentData);
        console.log('Preview container exists:', !!this.previewContainer);
        
        if (!this.currentData) {
            console.warn('No data available for preview rendering');
            // Show placeholder instead
            this.previewContainer.innerHTML = `
                <div class="resume-preview" id="resumePreview">
                    <div class="preview-placeholder">
                        <i class="fas fa-file-pdf"></i>
                        <p>Resume preview will appear here</p>
                        <small>Start filling out the form to see your resume</small>
                    </div>
                </div>
            `;
            return;
        }

        try {
            const resumeHTML = this.generateResumeHTML(this.currentData);
            console.log('Generated resume HTML length:', resumeHTML.length);
            console.log('First 200 chars of HTML:', resumeHTML.substring(0, 200));
            
            this.previewContainer.innerHTML = `
                <div class="resume-preview" id="resumePreview">
                    ${resumeHTML}
                </div>
            `;
            
            console.log('Preview container updated successfully');
            console.log('Preview container HTML:', this.previewContainer.innerHTML.substring(0, 200));
        } catch (error) {
            console.error('Error generating preview:', error);
            this.previewContainer.innerHTML = `
                <div class="resume-preview" id="resumePreview">
                    <div class="preview-placeholder">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Error generating preview</p>
                        <small>${error.message}</small>
                    </div>
                </div>
            `;
        }
    }

    generateResumeHTML(data) {
        const { personalInfo, areasOfInterest, experience, positionOfResponsibility, projects, education, technicalSkills, extraCurricular } = data;

        return `
            <div class="resume-document">
                <div class="header">
                    ${this.generateHeader(personalInfo)}
                </div>

                ${areasOfInterest ? this.generateAreasOfInterest(areasOfInterest) : ''}
                ${education?.length ? this.generateEducation(education) : ''}
                ${experience?.length ? this.generateExperience(experience) : ''}
                ${positionOfResponsibility?.length ? this.generatePositionOfResponsibility(positionOfResponsibility) : ''}
                ${projects?.length ? this.generateProjects(projects) : ''}
                ${technicalSkills?.length ? this.generateTechnicalSkills(technicalSkills) : ''}
                ${extraCurricular?.length ? this.generateExtraCurricular(extraCurricular) : ''}
            </div>
        `;
    }

    generateHeader(personalInfo) {
        const { fullName = '[YOUR NAME]', email = '', phone = '', linkedIn = '', location = '' } = personalInfo;
        
        const contactParts = [];
        if (email) contactParts.push(this.escapeHtml(email));
        if (phone) contactParts.push(this.escapeHtml(phone));
        if (linkedIn) contactParts.push(this.escapeHtml(linkedIn));
        if (location) contactParts.push(this.escapeHtml(location));
        
        const contactInfo = contactParts.length > 0 ? contactParts.join(' | ') : '[Email] | [Phone] | [LinkedIn] | [Location]';
        
        return `
            <div class="name">${this.escapeHtml(fullName)}</div>
            <div class="contact-info">${contactInfo}</div>
        `;
    }

    generateAreasOfInterest(areasText) {
        if (!areasText.trim()) return '';
        
        return `
            <div class="section">
                <div class="section-header">SUMMARY</div>
                <p class="areas-text">${this.escapeHtml(areasText)}</p>
            </div>
        `;
    }

    generateEducation(educationList) {
        if (!educationList?.length) return '';

        const educationItems = educationList
            .filter(edu => edu.degree || edu.institution || edu.bulletPoints?.length)
            .map(edu => {
                const bullets = this.generateBulletPoints(edu.bulletPoints);
                const degreeText = edu.degree && edu.field ? 
                    `${this.escapeHtml(edu.degree)} | ${this.escapeHtml(edu.field)}` :
                    this.escapeHtml(edu.degree || '');
                    
                return `
                    <div class="subheader">
                        <div class="title">${degreeText}${edu.institution ? ` | ${this.escapeHtml(edu.institution)}` : ''}</div>
                        <div class="date">${this.escapeHtml(edu.duration || '')}</div>
                    </div>
                    ${bullets ? `<ul>${bullets}</ul>` : ''}
                `;
            }).join('');

        return `
            <div class="section">
                <div class="section-header">EDUCATION</div>
                ${educationItems}
            </div>
        `;
    }

    generateExperience(experiences) {
        if (!experiences?.length) return '';

        const experienceItems = experiences
            .filter(exp => exp.position || exp.company || exp.bulletPoints?.length)
            .map(exp => {
                const bullets = this.generateBulletPoints(exp.bulletPoints);
                return `
                    <div class="subheader">
                        <div class="title">${this.escapeHtml(exp.position || '')}${exp.company ? ` | ${this.escapeHtml(exp.company)}` : ''}</div>
                        <div class="date">${this.escapeHtml(exp.duration || '')}</div>
                    </div>
                    ${bullets ? `<ul>${bullets}</ul>` : ''}
                `;
            }).join('');

        return `
            <div class="section">
                <div class="section-header">PROFESSIONAL EXPERIENCE</div>
                ${experienceItems}
            </div>
        `;
    }

    generateProjects(projects) {
        if (!projects?.length) return '';

        const projectItems = projects
            .filter(proj => proj.title || proj.bulletPoints?.length)
            .map(proj => {
                const bullets = this.generateBulletPoints(proj.bulletPoints);
                const descriptionParts = [];
                if (proj.technologies) descriptionParts.push(`<strong>${this.escapeHtml(proj.technologies)}</strong>`);
                if (proj.organization) descriptionParts.push(`${this.escapeHtml(proj.organization)}`);
                if (proj.type) descriptionParts.push(`${this.escapeHtml(proj.type)}`);
                
                const description = descriptionParts.join(' | ');
                
                return `
                    <div class="project">
                        <div class="project-title">${this.escapeHtml(proj.title || '')}</div>
                        <p class="project-description">${description} <span class="date">${this.escapeHtml(proj.duration || '')}</span></p>
                        ${bullets ? `<ul>${bullets}</ul>` : ''}
                    </div>
                `;
            }).join('');

        return `
            <div class="section">
                <div class="section-header">KEY PROJECTS</div>
                ${projectItems}
            </div>
        `;
    }

    generateTechnicalSkills(skills) {
        if (!skills?.length) return '';

        const languages = [];
        const tools = [];
        
        skills.forEach(skill => {
            if (skill.category === 'language') {
                languages.push(this.escapeHtml(skill.name));
            } else {
                tools.push(this.escapeHtml(skill.name));
            }
        });

        return `
            <div class="section">
                <div class="section-header">TECHNICAL SKILLS</div>
                ${languages.length ? `<p><strong>Languages & Software:</strong> ${languages.join(' | ')}</p>` : ''}
                ${tools.length ? `<p><strong>Tools & Libraries:</strong> ${tools.join(' | ')}</p>` : ''}
            </div>
        `;
    }

    generatePositionOfResponsibility(positions) {
        if (!positions?.length) return '';

        const positionItems = positions
            .filter(pos => pos.position || pos.organization || pos.bulletPoints?.length)
            .map(pos => {
                const bullets = this.generateBulletPoints(pos.bulletPoints);
                return `
                    <div class="subheader">
                        <div class="title">${this.escapeHtml(pos.position || '')}${pos.organization ? ` | ${this.escapeHtml(pos.organization)}` : ''}</div>
                        <div class="date">${this.escapeHtml(pos.duration || '')}</div>
                    </div>
                    ${bullets ? `<ul>${bullets}</ul>` : ''}
                `;
            }).join('');

        return `
            <div class="section">
                <div class="section-header">ACHIEVEMENTS</div>
                ${positionItems}
            </div>
        `;
    }

    generateExtraCurricular(activities) {
        if (!activities?.length) return '';

        const groupedActivities = {};
        
        activities.forEach(activity => {
            const category = activity.category || 'Other';
            if (!groupedActivities[category]) {
                groupedActivities[category] = [];
            }
            groupedActivities[category].push(activity);
        });

        const activityItems = Object.entries(groupedActivities)
            .map(([category, items]) => {
                const itemList = items
                    .map(item => {
                        const date = item.date ? `<span style="font-style: italic; float: right;">${this.escapeHtml(item.date)}</span>` : '';
                        return `<li>${this.escapeHtml(item.description || '')} ${date}</li>`;
                    })
                    .join('');
                
                return `
                    <div class="extra-item">
                        <div class="extra-category">${this.escapeHtml(category)}</div>
                        <div class="extra-content">
                            <ul>${itemList}</ul>
                        </div>
                    </div>
                `;
            })
            .join('');

        return `
            <div class="section">
                <div class="section-header">EXTRA-CURRICULAR</div>
                ${activityItems}
            </div>
        `;
    }

    generateBulletPoints(bulletPoints) {
        if (bulletPoints && bulletPoints.length > 0) {
            const validBullets = bulletPoints.filter(point => point && point.trim());
            if (validBullets.length > 0) {
                return validBullets
                    .map(point => {
                        // Format bullet points with strong tags for action verbs
                        const formattedPoint = point.replace(/^(<strong>)?([A-Z][a-z]+[a-z]*)<\/strong>?\s*/i, 
                            (match, p1, p2) => `<strong>${p2}</strong>`);
                        return `<li>${formattedPoint}</li>`;
                    })
                    .join('');
            }
        }
        return '';
    }

    escapeHtml(text) {
        if (!text) return '';
        return text.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Method to export the current preview as image or PDF
    async exportPreview(format = 'pdf') {
        const resumeElement = document.getElementById('resumePreview');
        
        if (!resumeElement) {
            throw new Error('No preview available to export');
        }

        if (format === 'image') {
            // Use html2canvas for image export
            const canvas = await html2canvas(resumeElement);
            const link = document.createElement('a');
            link.download = 'resume_preview.png';
            link.href = canvas.toDataURL();
            link.click();
        } else {
            // For PDF, send to server for generation
            return this.currentData;
        }
    }

    // Method to update specific section without full re-render
    updateSection(sectionName, data) {
        if (!this.currentData) return;
        
        this.currentData[sectionName] = data;
        this.renderPreview();
    }
}

// Initialize PDF preview when DOM is loaded
let pdfPreview;
document.addEventListener('DOMContentLoaded', () => {
    pdfPreview = new PDFPreview();
    window.pdfPreview = pdfPreview;
});