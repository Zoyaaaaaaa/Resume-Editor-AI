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
        const { personalInfo, areasOfInterest, experience, projects, education, positionOfResponsibility } = data;

        return `
            <div class="resume-document">
                ${this.generateHeader(personalInfo)}
                ${education?.length ? this.generateEducation(education) : ''}
                ${areasOfInterest ? this.generateAreasOfInterest(areasOfInterest) : ''}
                ${experience?.length ? this.generateExperience(experience) : ''}
                ${positionOfResponsibility?.length ? this.generatePositionOfResponsibility(positionOfResponsibility) : ''}
                ${projects?.length ? this.generateProjects(projects) : ''}
            </div>
        `;
    }

    generateHeader(personalInfo) {
        const { fullName = '', email = '', phone = '', location = '' } = personalInfo;
        
        return `
            <div class="resume-header">
                <h1 class="resume-name">${this.formatText(fullName)}</h1>
                <div class="resume-contact">
                    ${email ? `<span class="contact-item">${email}</span>` : ''}
                    ${phone ? `<span class="contact-item">${phone}</span>` : ''}
                    ${location ? `<span class="contact-item">${location}</span>` : ''}
                </div>
            </div>
        `;
    }

    generateAreasOfInterest(areasText) {
        if (!areasText.trim()) return '';
        
        return `
            <div class="resume-section">
                <div class="section-header-blue">
                    <h2>AREAS OF INTEREST</h2>
                </div>
                <div class="section-content">
                    <p class="areas-text">${this.formatText(areasText)}</p>
                </div>
            </div>
        `;
    }

    generateExperience(experiences) {
        if (!experiences?.length) return '';

        const experienceItems = experiences
            .filter(exp => exp.position || exp.company || (exp.bulletPoints && exp.bulletPoints.length > 0))
            .map(exp => `
                <div class="experience-item">
                    <div class="item-header">
                        <div class="item-title-row">
                            <strong>${this.formatText(exp.position || 'Position')}</strong>
                            <span class="item-date">${this.formatText(exp.dates || '')}</span>
                        </div>
                        <div class="item-subtitle">
                            ${this.formatText(exp.company || '')}${exp.location ? ` | ${this.formatText(exp.location)}` : ''}
                        </div>
                    </div>
                    ${exp.bulletPoints && exp.bulletPoints.length > 0 ? this.generateBulletPointsHTML(exp.bulletPoints) : ''}
                </div>
            `).join('');

        return `
            <div class="resume-section">
                <div class="section-header-blue">
                    <h2>PROFESSIONAL EXPERIENCE</h2>
                </div>
                <div class="section-content">
                    ${experienceItems}
                </div>
            </div>
        `;
    }

    generateProjects(projects) {
        if (!projects?.length) return '';

        const projectItems = projects
            .filter(proj => proj.title || (proj.bulletPoints && proj.bulletPoints.length > 0))
            .map(proj => `
                <div class="project-item">
                    <div class="item-header">
                        <div class="item-title-row">
                            <strong>${this.formatText(proj.title || 'Project Title')}</strong>
                            <span class="item-date">${this.formatText(proj.duration || '')}</span>
                        </div>
                        <div class="item-subtitle">
                            ${this.formatText(proj.organization || '')}
                            ${proj.technologies ? ` | Technologies: ${this.formatText(proj.technologies)}` : ''}
                        </div>
                    </div>
                    ${proj.bulletPoints && proj.bulletPoints.length > 0 ? this.generateBulletPointsHTML(proj.bulletPoints) : ''}
                </div>
            `).join('');

        return `
            <div class="resume-section">
                <div class="section-header-blue">
                    <h2>KEY PROJECTS</h2>
                </div>
                <div class="section-content">
                    ${projectItems}
                </div>
            </div>
        `;
    }

    generateEducation(educationList) {
        if (!educationList?.length) return '';

        const educationItems = educationList
            .filter(edu => edu.degree || edu.institution || (edu.bulletPoints && edu.bulletPoints.length > 0))
            .map(edu => `
                <div class="education-item">
                    <div class="item-header">
                        <div class="item-title-row">
                            <strong>${this.formatText(edu.degree || 'Degree')}${edu.field ? ` in ${this.formatText(edu.field)}` : ''}</strong>
                            <span class="item-date">${this.formatText(edu.duration || '')}</span>
                        </div>
                        <div class="item-subtitle">
                            ${this.formatText(edu.institution || '')}
                            ${edu.grade ? ` | Grade: ${this.formatText(edu.grade)}` : ''}
                        </div>
                    </div>
                    ${edu.bulletPoints && edu.bulletPoints.length > 0 ? this.generateBulletPointsHTML(edu.bulletPoints) : ''}
                </div>
            `).join('');

        return `
            <div class="resume-section">
                <div class="section-header-blue">
                    <h2>EDUCATION</h2>
                </div>
                <div class="section-content">
                    ${educationItems}
                </div>
            </div>
        `;
    }

    generateExtracurricular(activities) {
        if (!activities?.length) return '';

        const activityItems = activities
            .filter(activity => activity.activity || activity.description)
            .map(activity => `
                <div class="activity-item">
                    <div class="item-header">
                        <div class="item-title-row">
                            <strong>${this.formatText(activity.activity || 'Activity')}</strong>
                            <span class="item-date">${this.formatText(activity.duration || '')}</span>
                        </div>
                        ${activity.organization ? `<div class="item-subtitle">${this.formatText(activity.organization)}</div>` : ''}
                    </div>
                    ${activity.description ? `<div class="item-description">${this.formatDescription(activity.description)}</div>` : ''}
                </div>
            `).join('');

        return `
            <div class="resume-section">
                <div class="section-header-blue">
                    <h2>EXTRA-CURRICULAR</h2>
                </div>
                <div class="section-content">
                    ${activityItems}
                </div>
            </div>
        `;
    }

    generatePositionOfResponsibility(positions) {
        if (!positions?.length) return '';

        const positionItems = positions
            .filter(pos => pos.position || pos.organization || (pos.bulletPoints && pos.bulletPoints.length > 0))
            .map(pos => `
                <div class="position-item">
                    <div class="item-header">
                        <div class="item-title-row">
                            <strong>${this.formatText(pos.position || 'Position')}</strong>
                            <span class="item-date">${this.formatText(pos.dates || '')}</span>
                        </div>
                        <div class="item-subtitle">
                            ${this.formatText(pos.organization || '')}${pos.institution ? ` | ${this.formatText(pos.institution)}` : ''}
                        </div>
                    </div>
                    ${pos.bulletPoints && pos.bulletPoints.length > 0 ? this.generateBulletPointsHTML(pos.bulletPoints) : ''}
                </div>
            `).join('');

        return `
            <div class="resume-section">
                <div class="section-header-blue">
                    <h2>POSITION OF RESPONSIBILITY</h2>
                </div>
                <div class="section-content">
                    ${positionItems}
                </div>
            </div>
        `;
    }

    generateBulletPointsHTML(bulletPoints) {
        if (!bulletPoints || bulletPoints.length === 0) return '';
        
        const validBullets = bulletPoints.filter(point => point && point.trim());
        if (validBullets.length === 0) return '';
        
        const bulletHTML = validBullets
            .map(point => `<li>${this.formatText(point.trim())}</li>`)
            .join('');
            
        return `<ul class="bullet-points">${bulletHTML}</ul>`;
    }

    formatText(text) {
        if (!text) return '';
        return text.toString().trim();
    }

    formatDescription(description) {
        if (!description) return '';
        
        let text = description;
        
        // Split into sentences/points and convert to bullet format
        let points = text
            .split(/[•\n]/) // Split by existing bullets or line breaks
            .map(point => point.trim())
            .filter(point => point.length > 0);
        
        // If no existing bullet structure, split by periods for longer text
        if (points.length === 1 && points[0].length > 100) {
            points = points[0]
                .split(/\.\s+/) // Split by periods followed by space
                .map(point => point.trim())
                .filter(point => point.length > 10) // Only keep substantial points
                .map(point => point.endsWith('.') ? point : point + '.'); // Ensure periods
        }
        
        // Format as bullet points
        if (points.length > 1) {
            const bulletPoints = points.map(point => {
                // Handle bold formatting
                point = point.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                point = point.replace(/\*(.*?)\*/g, '<em>$1</em>');
                return `<li>${point}</li>`;
            }).join('');
            
            return `<ul>${bulletPoints}</ul>`;
        } else {
            // Single point, just format it
            let formatted = text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>');
            return `<ul><li>${formatted}</li></ul>`;
        }
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

// Add CSS styles for the resume preview
const previewStyles = `
<style>
.resume-document {
    font-family: "Calibri", sans-serif;
    font-size: 10pt;
    line-height: 1;
    color: #000;
    background: white;
    padding: 1.5rem;
    max-width: 8.5in;
    margin: 0 auto;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

.resume-header {
    text-align: center;
    margin-bottom: 1.2rem;
    border-bottom: 2px solid #4a90e2;
    padding-bottom: 0.8rem;
}

.resume-name {
    font-size: 20pt;
    font-weight: bold;
    margin-bottom: 0.6rem;
    color: #000;
    letter-spacing: 0.5px;
}

.resume-contact {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
    font-size: 10pt;
}

.contact-item {
    color: #000;
    font-weight: 500;
}

.resume-section {
    margin-bottom: 1.2rem;
}

.section-header-blue {
    background-color: #a3d5f7;
    padding: 4px 6px;
    font-size: 11pt;
    font-weight: bold;
    letter-spacing: 1px;
    margin-top: 12px;
    border-radius: 2px;
    color: #000;
}

.section-header-blue h2 {
    font-size: 11pt;
    margin: 0;
    font-weight: bold;
    letter-spacing: 1px;
}

.section-content {
    padding: 0 0.8rem;
}

.experience-item,
.project-item,
.education-item,
.activity-item {
    margin-bottom: 1rem;
    page-break-inside: avoid;
}

.item-header {
    margin-bottom: 0.3rem;
}

.item-title-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.3rem;
}

.item-title-row strong {
    color: #000;
    font-weight: bold;
    font-size: 11pt;
}

.item-subtitle {
    font-style: italic;
    color: #333;
    font-size: 10pt;
    font-weight: 500;
}

.item-date {
    font-style: italic;
    color: #444;
    font-size: 10pt;
    white-space: nowrap;
    font-weight: 500;
}

.item-description {
    margin-top: 0.4rem;
    text-align: justify;
    color: #000;
    line-height: 1.5;
}

.item-description ul {
    margin: 0.2rem 0;
    padding-left: 1.2rem;
}

.item-description li {
    margin-bottom: 0.1rem;
}

.areas-text {
    text-align: center;
    font-weight: bold;
    font-size: 11pt;
    margin: 0;
    color: #000;
    padding: 0.2rem 0;
}

@media print {
    .resume-document {
        box-shadow: none;
        padding: 0.5in;
    }
}
</style>
`;

// Inject styles into the document
if (!document.getElementById('resume-preview-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'resume-preview-styles';
    styleElement.textContent = previewStyles.replace('<style>', '').replace('</style>', '');
    document.head.appendChild(styleElement);
}

// Initialize PDF preview when DOM is loaded
let pdfPreview;
document.addEventListener('DOMContentLoaded', () => {
    pdfPreview = new PDFPreview();
    window.pdfPreview = pdfPreview;
});