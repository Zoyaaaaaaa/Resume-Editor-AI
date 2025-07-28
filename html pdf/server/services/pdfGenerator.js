const puppeteer = require('puppeteer');
const path = require('path');

class PDFGenerator {
    constructor() {
        this.browser = null;
    }

    async initBrowser() {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu'
                ]
            });
        }
        return this.browser;
    }

    async generatePDF(resumeData) {
        let page = null;
        
        try {
            console.log('Initializing browser for PDF generation...');
            const browser = await this.initBrowser();
            page = await browser.newPage();

            // Generate HTML content
            console.log('Generating HTML content...');
            const htmlContent = this.generateHTML(resumeData);
            console.log('HTML content length:', htmlContent.length);
            console.log('First 500 chars of HTML:', htmlContent.substring(0, 500));

            // Set page content
            console.log('Setting page content...');
            await page.setContent(htmlContent, {
                waitUntil: 'networkidle0'
            });

            console.log('Page content set, generating PDF...');
            // Generate PDF
            const pdfBuffer = await page.pdf({
                format: 'A4',
                margin: {
                    top: '0.5in',
                    right: '0.5in',
                    bottom: '0.5in',
                    left: '0.5in'
                },
                printBackground: true,
                preferCSSPageSize: true
            });

            console.log('PDF generated, buffer size:', pdfBuffer.length, 'bytes');
            console.log('PDF buffer type:', typeof pdfBuffer);
            console.log('PDF buffer is Buffer:', Buffer.isBuffer(pdfBuffer));
            
            // Ensure we return a proper Buffer
            const finalBuffer = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
            console.log('Final buffer size:', finalBuffer.length, 'bytes');
            console.log('Final buffer is Buffer:', Buffer.isBuffer(finalBuffer));
            
            return finalBuffer;

        } catch (error) {
            console.error('PDF generation error:', error);
            throw new Error(`Failed to generate PDF: ${error.message}`);
        } finally {
            if (page) {
                await page.close();
            }
        }
    }

    generateHTML(data) {
        const { personalInfo, areasOfInterest, experience, projects, education, extracurricular } = data;

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume</title>
    <style>
        ${this.getStyles()}
    </style>
</head>
<body>
    <div class="resume-document">
        ${this.generateHeader(personalInfo)}
        ${areasOfInterest ? this.generateAreasOfInterest(areasOfInterest) : ''}
        ${experience?.length ? this.generateExperience(experience) : ''}
        ${projects?.length ? this.generateProjects(projects) : ''}
        ${education?.length ? this.generateEducation(education) : ''}
        ${extracurricular?.length ? this.generateExtracurricular(extracurricular) : ''}
    </div>
</body>
</html>
        `;
    }

    getStyles() {
        return `
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Times New Roman', serif;
    line-height: 1.4;
    color: #000;
    background: white;
}

.resume-document {
    max-width: 8.5in;
    margin: 0 auto;
    padding: 0.5in;
    font-size: 11pt;
}

.resume-header {
    text-align: center;
    margin-bottom: 1rem;
    border-bottom: 1px solid #ccc;
    padding-bottom: 0.5rem;
}

.resume-name {
    font-size: 18pt;
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: #000;
}

.resume-contact {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
    font-size: 10pt;
}

.contact-item {
    color: #333;
}

.resume-section {
    margin-bottom: 1rem;
    page-break-inside: avoid;
}

.section-header-blue {
    background: linear-gradient(135deg, #4a90e2, #357abd);
    color: white;
    padding: 0.3rem 0.8rem;
    margin-bottom: 0.5rem;
    font-weight: bold;
}

.section-header-blue h2 {
    font-size: 12pt;
    margin: 0;
    font-weight: bold;
    letter-spacing: 0.5px;
}

.section-content {
    padding: 0 0.5rem;
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
    margin-bottom: 0.2rem;
}

.item-subtitle {
    font-style: italic;
    color: #555;
    font-size: 10pt;
}

.item-date {
    font-style: italic;
    color: #666;
    font-size: 10pt;
    white-space: nowrap;
}

.item-description {
    margin-top: 0.3rem;
    text-align: justify;
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
    font-size: 10pt;
    margin: 0;
}

@page {
    margin: 0.5in;
    size: A4;
}

@media print {
    body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
    }
    
    .resume-document {
        box-shadow: none;
        padding: 0;
    }
    
    .section-header-blue {
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
    }
}
        `;
    }

    generateHeader(personalInfo) {
        const { fullName = '', email = '', phone = '', location = '' } = personalInfo;
        
        return `
            <div class="resume-header">
                <h1 class="resume-name">${this.escapeHtml(fullName)}</h1>
                <div class="resume-contact">
                    ${email ? `<span class="contact-item">${this.escapeHtml(email)}</span>` : ''}
                    ${phone ? `<span class="contact-item">${this.escapeHtml(phone)}</span>` : ''}
                    ${location ? `<span class="contact-item">${this.escapeHtml(location)}</span>` : ''}
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
                    <p class="areas-text">${this.escapeHtml(areasText)}</p>
                </div>
            </div>
        `;
    }

    generateExperience(experiences) {
        if (!experiences?.length) return '';

        const experienceItems = experiences
            .filter(exp => exp.position || exp.company || exp.description)
            .map(exp => `
                <div class="experience-item">
                    <div class="item-header">
                        <div class="item-title-row">
                            <strong>${this.escapeHtml(exp.position || 'Position')}</strong>
                            <span class="item-date">${this.escapeHtml(exp.dates || '')}</span>
                        </div>
                        <div class="item-subtitle">
                            ${this.escapeHtml(exp.company || '')}${exp.location ? ` | ${this.escapeHtml(exp.location)}` : ''}
                        </div>
                    </div>
                    ${exp.description ? `<div class="item-description">${this.formatDescription(exp.description)}</div>` : ''}
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
            .filter(proj => proj.title || proj.description)
            .map(proj => `
                <div class="project-item">
                    <div class="item-header">
                        <div class="item-title-row">
                            <strong>${this.escapeHtml(proj.title || 'Project Title')}</strong>
                            <span class="item-date">${this.escapeHtml(proj.duration || '')}</span>
                        </div>
                        <div class="item-subtitle">
                            ${this.escapeHtml(proj.organization || '')}
                            ${proj.technologies ? ` | Technologies: ${this.escapeHtml(proj.technologies)}` : ''}
                        </div>
                    </div>
                    ${proj.description ? `<div class="item-description">${this.formatDescription(proj.description)}</div>` : ''}
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
            .filter(edu => edu.degree || edu.institution)
            .map(edu => `
                <div class="education-item">
                    <div class="item-header">
                        <div class="item-title-row">
                            <strong>${this.escapeHtml(edu.degree || 'Degree')}${edu.field ? ` in ${this.escapeHtml(edu.field)}` : ''}</strong>
                            <span class="item-date">${this.escapeHtml(edu.duration || '')}</span>
                        </div>
                        <div class="item-subtitle">
                            ${this.escapeHtml(edu.institution || '')}
                            ${edu.grade ? ` | Grade: ${this.escapeHtml(edu.grade)}` : ''}
                        </div>
                    </div>
                    ${edu.details ? `<div class="item-description">${this.formatDescription(edu.details)}</div>` : ''}
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
                            <strong>${this.escapeHtml(activity.activity || 'Activity')}</strong>
                            <span class="item-date">${this.escapeHtml(activity.duration || '')}</span>
                        </div>
                        ${activity.organization ? `<div class="item-subtitle">${this.escapeHtml(activity.organization)}</div>` : ''}
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

    formatDescription(description) {
        if (!description) return '';
        
        // Handle markdown-style formatting
        let formatted = this.escapeHtml(description)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
            .replace(/^• (.+)$/gm, '<li>$1</li>') // Bullet points
            .replace(/\n/g, '<br>'); // Line breaks

        // Wrap bullet points in ul tags
        if (formatted.includes('<li>')) {
            formatted = formatted.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
        }

        return formatted;
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

    async closeBrowser() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}

module.exports = PDFGenerator;