// const puppeteer = require('puppeteer');
// const path = require('path');

// class PDFGenerator {
//     constructor() {
//         this.browser = null;
//     }

//     async initBrowser() {
//         if (!this.browser) {
//             this.browser = await puppeteer.launch({
//                 headless: 'new',
//                 args: [
//                     '--no-sandbox',
//                     '--disable-setuid-sandbox',
//                     '--disable-dev-shm-usage',
//                     '--disable-accelerated-2d-canvas',
//                     '--disable-gpu'
//                 ]
//             });
//         }
//         return this.browser;
//     }

//     async generatePDF(resumeData) {
//         let page = null;
        
//         try {
//             console.log('Initializing browser for PDF generation...');
//             const browser = await this.initBrowser();
//             page = await browser.newPage();

//             // Generate HTML content
//             console.log('Generating HTML content...');
//             const htmlContent = this.generateHTML(resumeData);
//             console.log('HTML content length:', htmlContent.length);
//             console.log('First 500 chars of HTML:', htmlContent.substring(0, 500));

//             // Set page content
//             console.log('Setting page content...');
//             await page.setContent(htmlContent, {
//                 waitUntil: 'networkidle0'
//             });

//             console.log('Page content set, generating PDF...');
//             // Generate PDF
//             const pdfBuffer = await page.pdf({
//                 format: 'A4',
//                 margin: {
//                     top: '15mm',
//                     right: '15mm',
//                     bottom: '15mm',
//                     left: '15mm'
//                 },
//                 printBackground: true,
//                 preferCSSPageSize: true
//             });

//             console.log('PDF generated, buffer size:', pdfBuffer.length, 'bytes');
//             console.log('PDF buffer type:', typeof pdfBuffer);
//             console.log('PDF buffer is Buffer:', Buffer.isBuffer(pdfBuffer));
            
//             // Ensure we return a proper Buffer
//             const finalBuffer = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
//             console.log('Final buffer size:', finalBuffer.length, 'bytes');
//             console.log('Final buffer is Buffer:', Buffer.isBuffer(finalBuffer));
            
//             return finalBuffer;

//         } catch (error) {
//             console.error('PDF generation error:', error);
//             throw new Error(`Failed to generate PDF: ${error.message}`);
//         } finally {
//             if (page) {
//                 await page.close();
//             }
//         }
//     }

//     generateHTML(data) {
//         const { personalInfo, areasOfInterest, experience, positionOfResponsibility, projects, education, technicalSkills, extraCurricular } = data;

//         return `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>${personalInfo?.fullName || 'Professional'} – Resume</title>
//     <style>
//         ${this.getStyles()}
//     </style>
// </head>
// <body>
//     <div class="header">
//         ${this.generateHeader(personalInfo)}
//     </div>

//     ${areasOfInterest ? this.generateAreasOfInterest(areasOfInterest) : ''}
//     ${education?.length ? this.generateEducation(education) : ''}
//     ${experience?.length ? this.generateExperience(experience) : ''}
//     ${positionOfResponsibility?.length ? this.generatePositionOfResponsibility(positionOfResponsibility) : ''}
//     ${projects?.length ? this.generateProjects(projects) : ''}
//     ${technicalSkills?.length ? this.generateTechnicalSkills(technicalSkills) : ''}
//     ${extraCurricular?.length ? this.generateExtraCurricular(extraCurricular) : ''}
// </body>
// </html>
//         `;
//     }

//     getStyles() {
//         return `
//         /* A4 page setup */
//         @page {
//             size: A4 portrait;
//             margin: 15mm;
//         }
        
//         html, body {
//             width: 210mm;
//             height: 297mm;
//             margin: 0;
//             padding: 0;
//         }
        
//         body {
//             font-family: "Calibri", sans-serif;
//             font-size: 10pt;
//             line-height: 1.2;
//             margin: 15mm;
//             color: #000;
//             background-color: #fff;
//         }
        
//         .header {
//             text-align: center;
//             margin-bottom: 10px;
//             border-bottom: 2px solid #2c3e50;
//             padding-bottom: 8px;
//         }
        
//         .name {
//             font-size: 24px;
//             font-weight: bold;
//             color: #2c3e50;
//             margin-bottom: 2px;
//         }
        
//         .contact-info {
//             font-size: 10pt;
//             color: #666;
//         }
        
//         .section-header {
//             background-color: #a3d5f7;
//             padding: 2px 6px;
//             font-size: 11pt;
//             font-weight: bold;
//             letter-spacing: 1px;
//             margin-top: 8px;
//             margin-bottom: 4px;
//             text-transform: uppercase;
//         }
        
//         .section {
//             margin-bottom: 4px;
//         }
        
//         .subheader {
//             display: flex;
//             justify-content: space-between;
//             align-items: baseline;
//             font-weight: bold;
//             font-size: 10pt;
//             margin-top: 4px;
//             margin-bottom: 2px;
//             background-color: #f0f0f0;
//             padding: 2px 4px;
//         }
        
//         .subheader .title {
//             flex: 1;
//         }
        
//         .subheader .date {
//             font-style: italic;
//             font-size: 9pt;
//             margin-left: 8px;
//             white-space: nowrap;
//             font-weight: normal;
//         }
        
//         ul {
//             margin: 0 0 2px 24px;
//             padding: 0;
//             list-style-type: disc;
//             list-style-position: outside;
//         }
        
//         ul li {
//             margin: 0 0 1px;
//             text-indent: -6px;
//             padding-left: 6px;
//             font-size: 10pt;
//         }
        
//         .project-title {
//             font-size: 11pt;
//             font-weight: bold;
//             font-style: italic;
//             margin: 4px 0 1px;
//         }
        
//         .project-description {
//             font-size: 10pt;
//             margin: 0 0 2px 0;
//         }
        
//         .project-description .date {
//             font-style: italic;
//             font-size: 9pt;
//             float: right;
//         }
        
//         p {
//             margin: 0 0 2px 0;
//             font-size: 10pt;
//         }
        
//         .areas-text {
//             font-size: 10pt;
//             text-align: center;
//             margin: 2px 0;
//         }
        
//         .extra-category {
//             font-weight: bold;
//             margin-top: 4px;
//             margin-bottom: 2px;
//             background-color: #f0f0f0;
//             padding: 1px 4px;
//             display: inline-block;
//             width: 140px;
//             vertical-align: top;
//         }
        
//         .extra-content {
//             display: inline-block;
//             width: calc(100% - 150px);
//             vertical-align: top;
//         }
        
//         .extra-item {
//             margin-bottom: 4px;
//             display: block;
//         }
        
//         .extra-content ul {
//             margin: 0 0 2px 0;
//         }
        
//         .extra-content ul li {
//             margin: 1px 0;
//             list-style-position: outside;
//         }
//         `;
//     }

//     generateHeader(personalInfo) {
//         const { fullName = '[YOUR NAME]', email = '', phone = '', linkedIn = '', location = '' } = personalInfo;
        
//         const contactParts = [];
//         if (email) contactParts.push(this.escapeHtml(email));
//         if (phone) contactParts.push(this.escapeHtml(phone));
//         if (linkedIn) contactParts.push(this.escapeHtml(linkedIn));
//         if (location) contactParts.push(this.escapeHtml(location));
        
//         const contactInfo = contactParts.length > 0 ? contactParts.join(' | ') : '[Email] | [Phone] | [LinkedIn] | [Location]';
        
//         return `
//             <div class="name">${this.escapeHtml(fullName)}</div>
//             <div class="contact-info">${contactInfo}</div>
//         `;
//     }

//     generateAreasOfInterest(areasText) {
//         if (!areasText.trim()) return '';
        
//         return `
//     <div class="section">
//         <div class="section-header">AREAS OF INTEREST</div>
//         <p class="areas-text">${this.escapeHtml(areasText)}</p>
//     </div>
//         `;
//     }

//     generateEducation(educationList) {
//         if (!educationList?.length) return '';

//         const educationItems = educationList
//             .filter(edu => edu.degree || edu.institution || edu.bulletPoints?.length)
//             .map(edu => {
//                 const bullets = this.generateBulletPoints(edu.bulletPoints);
//                 const degreeText = edu.degree && edu.field ? 
//                     `${this.escapeHtml(edu.degree)} | ${this.escapeHtml(edu.field)}` :
//                     this.escapeHtml(edu.degree || '');
                    
//                 return `
//         <div class="subheader">
//             <div class="title">${degreeText}${edu.institution ? ` | ${this.escapeHtml(edu.institution)}` : ''}</div>
//             <div class="date">${this.escapeHtml(edu.duration || '')}</div>
//         </div>
//         ${bullets ? `<ul>${bullets}</ul>` : ''}
//                 `;
//             }).join('');

//         return `
//     <div class="section">
//         <div class="section-header">EDUCATION</div>
//         ${educationItems}
//     </div>
//         `;
//     }

//     generateExperience(experiences) {
//         if (!experiences?.length) return '';

//         const experienceItems = experiences
//             .filter(exp => exp.position || exp.company || exp.bulletPoints?.length)
//             .map(exp => {
//                 const bullets = this.generateBulletPoints(exp.bulletPoints);
//                 return `
//         <div class="subheader">
//             <div class="title">${this.escapeHtml(exp.position || '')}${exp.company ? ` | ${this.escapeHtml(exp.company)}` : ''}</div>
//             <div class="date">${this.escapeHtml(exp.duration || '')}</div>
//         </div>
//         ${bullets ? `<ul>${bullets}</ul>` : ''}
//                 `;
//             }).join('');

//         return `
//     <div class="section">
//         <div class="section-header">PROFESSIONAL EXPERIENCE</div>
//         ${experienceItems}
//     </div>
//         `;
//     }

//     generateProjects(projects) {
//         if (!projects?.length) return '';

//         const projectItems = projects
//             .filter(proj => proj.title || proj.bulletPoints?.length)
//             .map(proj => {
//                 const bullets = this.generateBulletPoints(proj.bulletPoints);
//                 const descriptionParts = [];
//                 if (proj.technologies) descriptionParts.push(`<strong>${this.escapeHtml(proj.technologies)}</strong>`);
//                 if (proj.organization) descriptionParts.push(`${this.escapeHtml(proj.organization)}`);
//                 if (proj.type) descriptionParts.push(`${this.escapeHtml(proj.type)}`);
                
//                 const description = descriptionParts.join(' | ');
                
//                 return `
//         <div class="project">
//             <div class="project-title">${this.escapeHtml(proj.title || '')}</div>
//             <p class="project-description">${description} <span class="date">${this.escapeHtml(proj.duration || '')}</span></p>
//             ${bullets ? `<ul>${bullets}</ul>` : ''}
//         </div>
//                 `;
//             }).join('');

//         return `
//     <div class="section">
//         <div class="section-header">KEY PROJECTS</div>
//         ${projectItems}
//     </div>
//         `;
//     }

//     generateTechnicalSkills(skills) {
//         if (!skills?.length) return '';

//         const languages = [];
//         const tools = [];
        
//         skills.forEach(skill => {
//             if (skill.category === 'language') {
//                 languages.push(this.escapeHtml(skill.name));
//             } else {
//                 tools.push(this.escapeHtml(skill.name));
//             }
//         });

//         return `
//     <div class="section">
//         <div class="section-header">TECHNICAL SKILLS</div>
//         ${languages.length ? `<p><strong>Languages & Software:</strong> ${languages.join(' | ')}</p>` : ''}
//         ${tools.length ? `<p><strong>Tools & Libraries:</strong> ${tools.join(' | ')}</p>` : ''}
//     </div>
//         `;
//     }

//     generatePositionOfResponsibility(positions) {
//         if (!positions?.length) return '';

//         const positionItems = positions
//             .filter(pos => pos.position || pos.organization || pos.bulletPoints?.length)
//             .map(pos => {
//                 const bullets = this.generateBulletPoints(pos.bulletPoints);
//                 return `
//         <div class="subheader">
//             <div class="title">${this.escapeHtml(pos.position || '')}${pos.organization ? ` | ${this.escapeHtml(pos.organization)}` : ''}</div>
//             <div class="date">${this.escapeHtml(pos.duration || '')}</div>
//         </div>
//         ${bullets ? `<ul>${bullets}</ul>` : ''}
//                 `;
//             }).join('');

//         return `
//     <div class="section">
//         <div class="section-header">POSITION OF RESPONSIBILITY</div>
//         ${positionItems}
//     </div>
//         `;
//     }

//     generateExtraCurricular(activities) {
//         if (!activities?.length) return '';

//         const groupedActivities = {};
        
//         activities.forEach(activity => {
//             const category = activity.category || 'Other';
//             if (!groupedActivities[category]) {
//                 groupedActivities[category] = [];
//             }
//             groupedActivities[category].push(activity);
//         });

//         const activityItems = Object.entries(groupedActivities)
//             .map(([category, items]) => {
//                 const itemList = items
//                     .map(item => {
//                         const date = item.date ? `<span style="font-style: italic; float: right;">${this.escapeHtml(item.date)}</span>` : '';
//                         return `<li><strong>${this.escapeHtml(item.action || '')}</strong> ${this.escapeHtml(item.description || '')} ${date}</li>`;
//                     })
//                     .join('');
                
//                 return `
//         <div class="extra-item">
//             <div class="extra-category">${this.escapeHtml(category)}</div>
//             <div class="extra-content">
//                 <ul>${itemList}</ul>
//             </div>
//         </div>
//                 `;
//             })
//             .join('');

//         return `
//     <div class="section">
//         <div class="section-header">EXTRA-CURRICULAR</div>
//         ${activityItems}
//     </div>
//         `;
//     }

//     generateBulletPoints(bulletPoints) {
//         if (bulletPoints && bulletPoints.length > 0) {
//             const validBullets = bulletPoints.filter(point => point && point.trim());
//             if (validBullets.length > 0) {
//                 return validBullets
//                     .map(point => {
//                         // Format bullet points with strong tags for action verbs
//                         const formattedPoint = point.replace(/^(<strong>)?([A-Z][a-z]+[a-z]*)<\/strong>?\s*/i, 
//                             (match, p1, p2) => `<strong>${p2}</strong>`);
//                         return `<li>${formattedPoint}</li>`;
//                     })
//                     .join('');
//             }
//         }
//         return '';
//     }

//     escapeHtml(text) {
//         if (!text) return '';
//         return text.toString()
//             .replace(/&/g, '&amp;')
//             .replace(/</g, '&lt;')
//             .replace(/>/g, '&gt;')
//             .replace(/"/g, '&quot;')
//             .replace(/'/g, '&#39;');
//     }

//     async closeBrowser() {
//         if (this.browser) {
//             await this.browser.close();
//             this.browser = null;
//         }
//     }
// }

// module.exports = PDFGenerator;

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
                    top: '10mm',
                    right: '10mm',
                    bottom: '10mm',
                    left: '10mm'
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
        const { personalInfo, areasOfInterest, experience, positionOfResponsibility, projects, education, technicalSkills, extraCurricular } = data;

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${personalInfo?.fullName || 'Professional'} – Resume</title>
    <style>
        ${this.getStyles()}
    </style>
</head>
<body>
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
</body>
</html>
        `;
    }

  getStyles() {
    return `
    /* A4 page setup */
    @page {
        size: A4 portrait;
        margin: 10mm;
    }
    
    html, body {
        margin: 0;
        padding: 0;
        font-family: "Calibri", Arial, sans-serif;
        box-sizing: border-box;
    }
    
    body {
        font-size: 10pt;
        line-height: 1.1;
        color: #000;
        background-color: #fff;
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
        <div class="section-header">AREAS OF INTEREST</div>
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
        <div class="section-header">POSITIONS OF RESPONSIBILITY</div>
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

    async closeBrowser() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}

module.exports = PDFGenerator;
