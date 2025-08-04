// PDF Preview Generator for Resume Editor
// class PDFPreview {
//     constructor() {
//         this.previewContainer = document.getElementById('pdfPreview');
//         this.currentData = null;
//         this.debounceTimer = null;
//         this.initializePreview();
//     }

//     initializePreview() {
//         // Create initial preview structure
//         this.createPreviewTemplate();
//         this.injectStyles();
//     }

//     injectStyles() {
//         if (!document.getElementById('resume-preview-styles')) {
//             const styleElement = document.createElement('style');
//             styleElement.id = 'resume-preview-styles';
//             styleElement.textContent = this.getPreviewStyles();
//             document.head.appendChild(styleElement);
//         }
//     }

//     getPreviewStyles() {
//         return `
//             /* A4 page setup */
//             .resume-preview {
//                 width: 210mm;
//                 min-height: 297mm;
//                 margin: 0 auto;
//                 background: white;
//                 box-shadow: 0 0 10px rgba(0,0,0,0.1);
//                 padding: 10mm;
//                 box-sizing: border-box;
//                 font-family: "Calibri", Arial, sans-serif;
//                 color: #000;
//                 position: relative;
//             }

//             .preview-placeholder {
//                 display: flex;
//                 flex-direction: column;
//                 align-items: center;
//                 justify-content: center;
//                 height: 100%;
//                 color: #666;
//                 font-size: 14px;
//             }

//             .preview-placeholder i {
//                 font-size: 48px;
//                 margin-bottom: 16px;
//                 color: #a3d5f7;
//             }

//             .header {
//                 text-align: center;
//                 margin-bottom: 2px;
//                 border-bottom: 1.5px solid #2c3e50;
//                 padding-bottom: 2px;
//             }

//             .name {
//                 font-size: 18pt;
//                 font-weight: bold;
//                 color: #2c3e50;
//                 margin-bottom: 1px;
//             }

//             .contact-info {
//                 font-size: 9pt;
//                 color: #666;
//             }

//             .section-header {
//                 background-color: #a3d5f7;
//                 padding: 1px 5px;
//                 font-size: 10.5pt;
//                 font-weight: bold;
//                 margin-top: 2px;
//                 margin-bottom: 1px;
//                 text-transform: uppercase;
//                 // border-left: 3px solid #2c3e50;
//             }

//             .section {
//                 margin-bottom: 1px;
//             }

//             .subheader {
//                 display: flex;
//                 justify-content: space-between;
//                 font-weight: bold;
//                 font-size: 9.5pt;
//                 margin-top: 1px;
//                 margin-bottom: 0;
//                 background-color: #f0f0f0;
//             }

//             .subheader .title {
//                 flex: 1;
//             }

//             .subheader .date {
//                 font-style: italic;
//                 font-size: 8.5pt;
//                 margin-left: 5px;
//                 white-space: nowrap;
//                 font-weight: normal;
//             }

//             ul {
//                 margin: 0 0 0 20px;
//                 padding: 0;
//                 list-style-type: disc;
//             }

//             ul li {
//                 margin: 0;
//                 padding: 0;
//                 font-size: 9.5pt;
//                 line-height: 1.1;
//             }

//             .project-title {
//                 font-size: 10pt;
//                 font-weight: bold;
//                 margin: 1px 0 0;
//             }

//             .project-description {
//                 font-size: 9pt;
//                 margin: 0 0 0 0;
//             }

//             .project-description .date {
//                 font-style: italic;
//                 font-size: 8.5pt;
//                 float: right;
//             }

//             p {
//                 margin: 0 0 1px 0;
//                 font-size: 9.5pt;
//             }

//             .areas-text {
//                 font-size: 9.5pt;
//                 text-align: center;
//                 margin: 0 0;
//             }

//             .extra-category {
//                 font-weight: bold;
//                 margin-top: 1px;
//                 margin-bottom: 0;
//                 display: inline-block;
//                 width: 120px;
//                 vertical-align: top;
//                 font-size: 9.5pt;
//             }

//             .extra-content {
//                 display: inline-block;
//                 width: calc(100% - 125px);
//                 vertical-align: top;
//                 font-size: 9.5pt;
//             }

//             .extra-item {
//                 margin-bottom: 1px;
//                 display: block;
//             }

//             .extra-content ul {
//                 margin: 0;
//                 padding-left: 15px;
//             }

//             .extra-content ul li {
//                 list-style-type: none;
//                 position: relative;
//                 padding-left: 10px;
//             }

//             .extra-content ul li:before {
//                 content: "•";
//                 position: absolute;
//                 left: 0;
//             }

//             table {
//                 width: 100%;
//                 border-collapse: collapse;
//                 margin: 1px 0;
//             }

//             table td {
//                 padding: 0 0;
//                 vertical-align: top;
//                 font-size: 9.5pt;
//             }

//             @media print {
//                 .resume-preview {
//                     box-shadow: none;
//                     padding: 0;
//                     width: 100%;
//                     height: 100%;
//                 }
//             }
//         `;
//     }

//     generatePreview(formData) {
//         console.log('generatePreview called with data:', formData);
//         // Debounce preview updates to avoid excessive re-rendering
//         clearTimeout(this.debounceTimer);
//         this.debounceTimer = setTimeout(() => {
//             this.currentData = formData;
//             console.log('About to render preview with data:', this.currentData);
//             this.renderPreview();
//         }, 300);
//     }

//     createPreviewTemplate() {
//         this.previewContainer.innerHTML = `
//             <div class="resume-preview" id="resumePreview">
//                 <div class="preview-placeholder">
//                     <i class="fas fa-file-pdf"></i>
//                     <p>Resume preview will appear here</p>
//                     <small>Start filling out the form to see your resume</small>
//                 </div>
//             </div>
//         `;
//     }

//     renderPreview() {
//         console.log('renderPreview called with data:', this.currentData);
//         console.log('Preview container exists:', !!this.previewContainer);
        
//         if (!this.currentData) {
//             console.warn('No data available for preview rendering');
//             // Show placeholder instead
//             this.previewContainer.innerHTML = `
//                 <div class="resume-preview" id="resumePreview">
//                     <div class="preview-placeholder">
//                         <i class="fas fa-file-pdf"></i>
//                         <p>Resume preview will appear here</p>
//                         <small>Start filling out the form to see your resume</small>
//                     </div>
//                 </div>
//             `;
//             return;
//         }

//         try {
//             const resumeHTML = this.generateResumeHTML(this.currentData);
//             console.log('Generated resume HTML length:', resumeHTML.length);
//             console.log('First 200 chars of HTML:', resumeHTML.substring(0, 200));
            
//             this.previewContainer.innerHTML = `
//                 <div class="resume-preview" id="resumePreview">
//                     ${resumeHTML}
//                 </div>
//             `;
            
//             console.log('Preview container updated successfully');
//             console.log('Preview container HTML:', this.previewContainer.innerHTML.substring(0, 200));
//         } catch (error) {
//             console.error('Error generating preview:', error);
//             this.previewContainer.innerHTML = `
//                 <div class="resume-preview" id="resumePreview">
//                     <div class="preview-placeholder">
//                         <i class="fas fa-exclamation-triangle"></i>
//                         <p>Error generating preview</p>
//                         <small>${error.message}</small>
//                     </div>
//                 </div>
//             `;
//         }
//     }

//     generateResumeHTML(data) {
//         const { personalInfo, areasOfInterest, experience, achievements, positionOfResponsibility, projects, education, technicalSkills, extraCurricular, sectionOrder } = data;

//         // Default section order if none provided
//         const defaultOrder = ['areasOfInterest', 'education', 'experience', 'achievements', 'projects', 'positionOfResponsibility'];
//         const order = sectionOrder || defaultOrder;

//         // Section generators map
//         const sectionGenerators = {
//             areasOfInterest: () => areasOfInterest ? this.generateAreasOfInterest(areasOfInterest) : '',
//             education: () => education?.length ? this.generateEducation(education) : '',
//             experience: () => experience?.length ? this.generateExperience(experience) : '',
//             achievements: () => achievements?.length ? this.generateAchievements(achievements) : '',
//             projects: () => projects?.length ? this.generateProjects(projects) : '',
//             positionOfResponsibility: () => positionOfResponsibility?.length ? this.generatePositionOfResponsibility(positionOfResponsibility) : ''
//         };

//         // Generate sections in the specified order
//         const orderedSections = order.map(sectionName => sectionGenerators[sectionName] ? sectionGenerators[sectionName]() : '').join('');

//         return `
//             <div class="resume-document">
//                 <div class="header">
//                     ${this.generateHeader(personalInfo)}
//                 </div>

//                 ${orderedSections}
//                 ${technicalSkills?.length ? this.generateTechnicalSkills(technicalSkills) : ''}
//                 ${extraCurricular?.length ? this.generateExtraCurricular(extraCurricular) : ''}
//             </div>
//         `;
//     }

//     generateHeader(personalInfo) {
//         const { fullName = '[YOUR NAME]', email = '', phone = '', linkedIn = '', location = '' } = personalInfo;
        
//         const contactParts = [];
//         if (email) contactParts.push(this.formatText(email));
//         if (phone) contactParts.push(this.formatText(phone));
//         if (linkedIn) contactParts.push(this.formatText(linkedIn));
//         if (location) contactParts.push(this.formatText(location));
        
//         const contactInfo = contactParts.length > 0 ? contactParts.join(' | ') : '[Email] | [Phone] | [LinkedIn] | [Location]';
        
//         return `
//             <div class="name">${this.formatText(fullName)}</div>
//             <div class="contact-info">${contactInfo}</div>
//         `;
//     }

//     generateAreasOfInterest(areasText) {
//         if (!areasText.trim()) return '';
        
//         return `
//             <div class="section">
//                 <div class="section-header">AREAS OF INTEREST</div>
//                 <p class="areas-text">${this.formatText(areasText)}</p>
//             </div>
//         `;
//     }

//     generateEducation(educationList) {
//         if (!educationList?.length) return '';

//         const educationItems = educationList
//             .filter(edu => edu.degree || edu.institution || edu.bulletPoints?.length)
//             .map(edu => {
//                 // const bullets = this.generateBulletPoints(edu.bulletPoints);
//                  const degreeText = edu.degree && edu.field ? 
//                     `${this.formatText(edu.degree)} | ${this.formatText(edu.field)}` :
//                     this.formatText(edu.degree || '');
                    
//                 return `
//                     <div class="subheader">
//                         <div class="title">${degreeText}${edu.institution ? ` | ${this.formatText(edu.institution)}` : ''}</div>
//                         <div class="date">${this.formatText(edu.duration || '')}</div>
//                     </div>
//                  ${this.formatText(edu.field) || ''} | ${this.formatText(edu.grade)}
                    
//                 `;
//             }).join('');

//         return `
//             <div class="section">
//                 <div class="section-header">EDUCATION</div>
//                 ${educationItems}
//             </div>
//         `;
//     }

//     generateExperience(experiences) {
//         if (!experiences?.length) return '';

//         const experienceItems = experiences
//             .filter(exp => exp.position || exp.company || exp.bulletPoints?.length)
//             .map(exp => {
//                 const bullets = this.generateBulletPoints(exp.bulletPoints);
//                 return `
//                     <div class="subheader">
//                         <div class="title">${this.formatText(exp.position || '')}${exp.company ? ` | ${this.formatText(exp.company)}` : ''}</div>
//                         <div class="date">${this.formatText(exp.duration || '')}</div>
//                     </div>
//                     ${bullets ? `<ul>${bullets}</ul>` : ''}
//                 `;
//             }).join('');

//         return `
//             <div class="section">
//                 <div class="section-header">PROFESSIONAL EXPERIENCE</div>
//                 ${experienceItems}
//             </div>
//         `;
//     }

//     generateAchievements(achievements) {
//         if (!achievements?.length) return '';

//         const achievementItems = achievements
//             .filter(ach => ach.title || ach.organization || ach.bulletPoints?.length)
//             .map(ach => {
//                 const bullets = this.generateBulletPoints(ach.bulletPoints);
//                 return `
//                     <div class="subheader">
//                         <div class="title">${this.formatText(ach.title || '')}${ach.organization ? ` | ${this.formatText(ach.organization)}` : ''}</div>
//                         <div class="date">${this.formatText(ach.date || '')}</div>
//                     </div>
//                     ${bullets ? `<ul>${bullets}</ul>` : ''}
//                 `;
//             }).join('');

//         return `
//             <div class="section">
//                 <div class="section-header">ACHIEVEMENTS</div>
//                 ${achievementItems}
//             </div>
//         `;
//     }

//     generateProjects(projects) {
//         if (!projects?.length) return '';

//         const projectItems = projects
//             .filter(proj => proj.title || proj.bulletPoints?.length)
//             .map(proj => {
//                 const bullets = this.generateBulletPoints(proj.bulletPoints);
//                 const descriptionParts = [];
//                 if (proj.technologies) descriptionParts.push(`<strong>${this.formatText(proj.technologies)}</strong>`);
//                 if (proj.organization) descriptionParts.push(`${this.formatText(proj.organization)}`);
//                 if (proj.type) descriptionParts.push(`${this.formatText(proj.type)}`);
                
//                 const description = descriptionParts.join(' | ');
                
//                 return `
//                     <div class="project">
//                         <div class="project-title">${this.formatText(proj.title || '')}</div>
//                         <p class="project-description">${description} <span class="date">${this.formatText(proj.duration || '')}</span></p>
//                         ${bullets ? `<ul>${bullets}</ul>` : ''}
//                     </div>
//                 `;
//             }).join('');

//         return `
//             <div class="section">
//                 <div class="section-header">KEY PROJECTS</div>
//                 ${projectItems}
//             </div>
//         `;
//     }

//     generateTechnicalSkills(skills) {
//         if (!skills?.length) return '';

//         const languages = [];
//         const tools = [];
        
//         skills.forEach(skill => {
//             if (skill.category === 'language') {
//                 languages.push(this.formatText(skill.name));
//             } else {
//                 tools.push(this.formatText(skill.name));
//             }
//         });

//         return `
//             <div class="section">
//                 <div class="section-header">TECHNICAL SKILLS</div>
//                 ${languages.length ? `<p><strong>Languages & Software:</strong> ${languages.join(' | ')}</p>` : ''}
//                 ${tools.length ? `<p><strong>Tools & Libraries:</strong> ${tools.join(' | ')}</p>` : ''}
//             </div>
//         `;
//     }

//     generatePositionOfResponsibility(positions) {
//         if (!positions?.length) return '';

//         const positionItems = positions
//             .filter(pos => pos.position || pos.organization || pos.bulletPoints?.length)
//             .map(pos => {
//                 const bullets = this.generateBulletPoints(pos.bulletPoints);
//                 return `
//                     <div class="subheader">
//                         <div class="title">${this.formatText(pos.position || '')}${pos.organization ? ` | ${this.formatText(pos.organization)}` : ''}</div>
//                         <div class="date">${this.formatText(pos.duration || '')}</div>
//                     </div>
//                     ${bullets ? `<ul>${bullets}</ul>` : ''}
//                 `;
//             }).join('');

//         return `
//             <div class="section">
//                 <div class="section-header">POSITION OF RESPONSIBILITY</div>
//                 ${positionItems}
//             </div>
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
//                         const date = item.date ? `<span style="font-style: italic; float: right;">${this.formatText(item.date)}</span>` : '';
//                         return `<li>${this.formatText(item.description || '')} ${date}</li>`;
//                     })
//                     .join('');
                
//                 return `
//                     <div class="extra-item">
//                         <div class="extra-category">${this.formatText(category)}</div>
//                         <div class="extra-content">
//                             <ul>${itemList}</ul>
//                         </div>
//                     </div>
//                 `;
//             })
//             .join('');

//         return `
//             <div class="section">
//                 <div class="section-header">EXTRA-CURRICULAR</div>
//                 ${activityItems}
//             </div>
//         `;
//     }

//     generateBulletPoints(bulletPoints) {
//     if (bulletPoints && bulletPoints.length > 0) {
//         const validBullets = bulletPoints.filter(point => point && point.trim());
//         if (validBullets.length > 0) {
//             // Process each bullet point and split by bullet characters or periods followed by spaces
//             const allBullets = [];
            
//             validBullets.forEach(point => {
//                 // Split by bullet characters (•) or periods followed by spaces
//                 let splitPoints = point.split(/[•·]/).filter(p => p.trim());
                
//                 // If no bullet characters found, try splitting by ". " (period followed by space)
//                 if (splitPoints.length === 1) {
//                     splitPoints = point.split(/\.\s+/).filter(p => p.trim());
//                 }
                
//                 // Add each split point to the array
//                 splitPoints.forEach(splitPoint => {
//                     const trimmed = splitPoint.trim();
//                     if (trimmed) {
//                         allBullets.push(trimmed);
//                     }
//                 });
//             });
            
//             return allBullets
//                 .map(point => {
//                     // Apply markdown formatting to bullet points
//                     const formattedPoint = this.formatText(point);
//                     return `<li>${formattedPoint}</li>`;
//                 })
//                 .join('');
//         }
//     }
//     return '';
//     }

//     // Format text with markdown-style formatting and HTML escaping
//     formatText(text) {
//         if (!text) return '';
        
//         // First escape HTML entities for security
//         let escaped = text.toString()
//             .replace(/&/g, '&amp;')
//             .replace(/</g, '&lt;')
//             .replace(/>/g, '&gt;')
//             .replace(/"/g, '&quot;')
//             .replace(/'/g, '&#39;');
        
//         // Then apply markdown formatting
//         return escaped
//             // Handle bold text: **text** -> <strong>text</strong>
//             .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
//             // Handle italic text: __text__ -> <em>text</em>
//             .replace(/__(.*?)__/g, '<em>$1</em>');
//     }

//     // Legacy method for backward compatibility
//     escapeHtml(text) {
//         return this.formatText(text);
//     }

//     // Method to export the current preview as image or PDF
//     async exportPreview(format = 'pdf') {
//         const resumeElement = document.getElementById('resumePreview');
        
//         if (!resumeElement) {
//             throw new Error('No preview available to export');
//         }

//         if (format === 'image') {
//             // Use html2canvas for image export
//             const canvas = await html2canvas(resumeElement);
//             const link = document.createElement('a');
//             link.download = 'resume_preview.png';
//             link.href = canvas.toDataURL();
//             link.click();
//         } else {
//             // For PDF, send to server for generation
//             return this.currentData;
//         }
//     }

//     // Method to update specific section without full re-render
//     updateSection(sectionName, data) {
//         if (!this.currentData) return;
        
//         this.currentData[sectionName] = data;
//         this.renderPreview();
//     }
// }
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
                // border-left: 3px solid #2c3e50;
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
                margin-left: 6px;
                margin-right: 4px;
                padding-right: 3px;
                white-space: nowrap;
                font-weight: normal;
                flex-shrink: 0;
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
                margin-right: 4px;
                padding-right: 3px;
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
        const { personalInfo, areasOfInterest, skills, skillsData, experience, achievements, publications, positionOfResponsibility, projects, education, technicalSkills, extraCurricular, sectionOrder } = data;

        // Default section order if none provided
        const defaultOrder = ['areasOfInterest', 'education', 'experience', 'achievements', 'publications', 'projects', 'positionOfResponsibility'];
        const order = sectionOrder || defaultOrder;

        // Section generators map
        const sectionGenerators = {
            areasOfInterest: () => areasOfInterest ? this.generateAreasOfInterest(areasOfInterest) : '',
            skills: () => (skillsData || skills) ? this.generateSkills(skills, skillsData) : '',
            education: () => education?.length ? this.generateEducation(education) : '',
            experience: () => experience?.length ? this.generateExperience(experience) : '',
            achievements: () => achievements?.length ? this.generateAchievements(achievements) : '',
            publications: () => publications?.length ? this.generatePublications(publications) : '',
            projects: () => projects?.length ? this.generateProjects(projects) : '',
            positionOfResponsibility: () => positionOfResponsibility?.length ? this.generatePositionOfResponsibility(positionOfResponsibility) : ''
        };

        // Generate sections in the specified order
        const orderedSections = order.map(sectionName => sectionGenerators[sectionName] ? sectionGenerators[sectionName]() : '').join('');

        return `
            <div class="resume-document">
                <div class="header">
                    ${this.generateHeader(personalInfo)}
                </div>

                ${orderedSections}
                ${technicalSkills?.length ? this.generateTechnicalSkills(technicalSkills) : ''}
                ${extraCurricular?.length ? this.generateExtraCurricular(extraCurricular) : ''}
            </div>
        `;
    }

    generateHeader(personalInfo) {
        const { fullName = '[YOUR NAME]', email = '', phone = '', linkedIn = '', location = '' } = personalInfo;
        
        const contactParts = [];
        if (email) contactParts.push(this.formatText(email));
        if (phone) contactParts.push(this.formatText(phone));
        if (linkedIn) contactParts.push(this.formatText(linkedIn));
        if (location) contactParts.push(this.formatText(location));
        
        const contactInfo = contactParts.length > 0 ? contactParts.join(' | ') : '[Email] | [Phone] | [LinkedIn] | [Location]';
        
        return `
            <div class="name">${this.formatText(fullName)}</div>
            <div class="contact-info">${contactInfo}</div>
        `;
    }

    generateAreasOfInterest(areasText) {
        if (!areasText.trim()) return '';
        
        return `
            <div class="section">
                <div class="section-header">AREAS OF INTEREST</div>
                <p class="areas-text">${this.formatText(areasText)}</p>
            </div>
        `;
    }

    generateEducation(educationList) {
        if (!educationList?.length) return '';

        const educationItems = educationList
            .filter(edu => edu.degree || edu.institution || edu.bulletPoints?.length)
            .map(edu => {
                // const bullets = this.generateBulletPoints(edu.bulletPoints);
                 const degreeText = edu.degree && edu.field ? 
                    `${this.formatText(edu.degree)} | ${this.formatText(edu.field)}` :
                    this.formatText(edu.degree || '');
                
                // Build title parts conditionally
                const titleParts = [];
                if (degreeText) titleParts.push(degreeText);
                if (edu.institution) titleParts.push(this.formatText(edu.institution));
                
                const fieldInfo = this.formatText(edu.field) || '';
                const gradeInfo = this.formatText(edu.grade) || '';
                const additionalInfo = [];
                
                if (fieldInfo) additionalInfo.push(fieldInfo);
                if (gradeInfo) additionalInfo.push(gradeInfo);
                
                return `
                    <div class="subheader">
                        <div class="title">${titleParts.join(' | ')}</div>
                        <div class="date">${this.formatText(edu.duration || '')}</div>
                    </div>
                    ${additionalInfo.length > 0 ? additionalInfo.join(' | ') : ''}
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
                        <div class="title">${this.formatText(exp.position || '')}${exp.company ? ` | ${this.formatText(exp.company)}` : ''}</div>
                        <div class="date">${this.formatText(exp.dates || exp.duration || '')}</div>
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

    generateAchievements(achievements) {
        if (!achievements?.length) return '';

        const achievementItems = achievements
            .filter(ach => ach.title || ach.organization || ach.bulletPoints?.length)
            .map(ach => {
                const bullets = this.generateBulletPoints(ach.bulletPoints);
                return `
                    <div class="subheader">
                        <div class="title">${this.formatText(ach.title || '')}${ach.organization ? ` | ${this.formatText(ach.organization)}` : ''}</div>
                        <div class="date">${this.formatText(ach.date || '')}</div>
                    </div>
                    ${bullets ? `<ul>${bullets}</ul>` : ''}
                `;
            }).join('');

        return `
            <div class="section">
                <div class="section-header">ACHIEVEMENTS</div>
                ${achievementItems}
            </div>
        `;
    }

    generatePublications(publications) {
        if (!publications?.length) return '';

        const publicationItems = publications
            .filter(pub => pub.title || pub.journal || pub.authors)
            .map(pub => {
                // Format authors - highlight if first author
                let authorsText = '';
                if (pub.authors) {
                    authorsText = this.formatText(pub.authors);
                }
                
                // Build title line with journal
                const titleParts = [];
                if (pub.title) titleParts.push(this.formatText(pub.title));
                if (pub.journal) titleParts.push(this.formatText(pub.journal));
                
                const titleLine = titleParts.join(' | ');
                
                // Build description line
                const descriptionParts = [];
                if (authorsText) descriptionParts.push(authorsText);
                if (pub.doi) descriptionParts.push(`DOI: ${this.formatText(pub.doi)}`);
                if (pub.description) descriptionParts.push(this.formatText(pub.description));
                
                const descriptionLine = descriptionParts.join(' | ');
                
                return `
                    <div class="subheader">
                        <div class="title">${titleLine}</div>
                        <div class="date">${this.formatText(pub.date || '')}</div>
                    </div>
                    ${descriptionLine ? `<p>${descriptionLine}</p>` : ''}
                `;
            }).join('');

        return `
            <div class="section">
                <div class="section-header">PUBLICATIONS</div>
                ${publicationItems}
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
                if (proj.technologies) descriptionParts.push(`<strong>${this.formatText(proj.technologies)}</strong>`);
                if (proj.organization) descriptionParts.push(`${this.formatText(proj.organization)}`);
                if (proj.type) descriptionParts.push(`${this.formatText(proj.type)}`);
                
                const description = descriptionParts.join(' | ');
                
                return `
                    <div class="project">
                        <div class="project-title">${this.formatText(proj.title || '')}</div>
                        <p class="project-description">${description} <span class="date">${this.formatText(proj.duration || '')}</span></p>
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

//    generateTechnicalSkills(skillsString) {
//     if (!skillsString?.trim()) return '';

//     // Split skills by pipe and clean them up
//     const skillsArray = skillsString.split('|').map(skill => skill.trim()).filter(skill => skill);
    
//     if (!skillsArray.length) return '';

//     // You can categorize skills or just list them all
//     // For now, let's just display them all together
//     return `
//         <div class="section">
//             <div class="section-header">TECHNICAL SKILLS</div>
//             <p>${skillsArray.join(' • ')}</p>
//         </div>
//     `;
//     }
    generateSkills(skillsString, skillsData) {
        let categories = {
            'Languages': [],
            'Frameworks': [],
            'Developer Tools': []
        };

        // If we have structured data, use it directly
        if (skillsData && (skillsData.languages || skillsData.frameworks || skillsData.developerTools)) {
            if (skillsData.languages) {
                categories['Languages'] = skillsData.languages.split(/[,|]/).map(s => s.trim()).filter(s => s);
            }
            if (skillsData.frameworks) {
                categories['Frameworks'] = skillsData.frameworks.split(/[,|]/).map(s => s.trim()).filter(s => s);
            }
            if (skillsData.developerTools) {
                categories['Developer Tools'] = skillsData.developerTools.split(/[,|]/).map(s => s.trim()).filter(s => s);
            }
        } else if (skillsString?.trim()) {
            // Fallback to old automatic categorization
            const skillsArray = skillsString.split(/[,|]/).map(skill => skill.trim()).filter(skill => skill);
            
            if (!skillsArray.length) return '';

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
                    categories['Languages'].push(skill);
                } else if (frameworkKeywords.some(keyword => skillLower.includes(keyword))) {
                    categories['Frameworks'].push(skill);
                } else if (toolKeywords.some(keyword => skillLower.includes(keyword))) {
                    categories['Developer Tools'].push(skill);
                } else {
                    // Default to Languages if unsure
                    categories['Languages'].push(skill);
                }
            });
        } else {
            return '';
        }

        // Generate HTML for each category
        let html = '';
        Object.entries(categories).forEach(([category, skills]) => {
            if (skills.length > 0) {
                html += `<p><strong>${category}:</strong> ${skills.join(', ')}</p>`;
            }
        });

        if (!html) return '';

        return `
            <div class="section">
                <div class="section-header">SKILLS</div>
                ${html}
            </div>
        `;
    }

    generateTechnicalSkills(skillsString) {
    if (!skillsString?.trim()) return '';

    const skillsArray = skillsString.split('|').map(skill => skill.trim()).filter(skill => skill);
    if (!skillsArray.length) return '';

    // Categorize skills (you can make this more intelligent)
    const categories = {
        'Programming Languages': [],
        'Web Technologies': [],
        'Tools & Platforms': [],
        'Soft Skills': [],
        'Other': []
    };

    const programmingKeywords = ['python', 'javascript', 'java', 'c++', 'sql', 'php', 'ruby', 'go', 'rust'];
    const webKeywords = ['html', 'css', 'react', 'vue', 'angular', 'node.js', 'express', 'django', 'flask'];
    const toolKeywords = ['git', 'docker', 'aws', 'linux', 'mongodb', 'postgresql', 'redis', 'kubernetes'];
    const softKeywords = ['leadership', 'communication', 'problem solving', 'team work', 'management'];

    skillsArray.forEach(skill => {
        const lowerSkill = skill.toLowerCase();
        if (programmingKeywords.some(keyword => lowerSkill.includes(keyword))) {
            categories['Programming Languages'].push(skill);
        } else if (webKeywords.some(keyword => lowerSkill.includes(keyword))) {
            categories['Web Technologies'].push(skill);
        } else if (toolKeywords.some(keyword => lowerSkill.includes(keyword))) {
            categories['Tools & Platforms'].push(skill);
        } else if (softKeywords.some(keyword => lowerSkill.includes(keyword))) {
            categories['Soft Skills'].push(skill);
        } else {
            categories['Other'].push(skill);
        }
    });

    let html = '<div class="section"><div class="section-header">TECHNICAL SKILLS</div>';
    
    Object.entries(categories).forEach(([category, skills]) => {
        if (skills.length > 0) {
            html += `<p><strong>${category}:</strong> ${skills.join(', ')}</p>`;
        }
    });
    
    html += '</div>';
    return html;
}


    generatePositionOfResponsibility(positions) {
        if (!positions?.length) return '';

        const positionItems = positions
            .filter(pos => pos.position || pos.organization || pos.bulletPoints?.length)
            .map(pos => {
                const bullets = this.generateBulletPoints(pos.bulletPoints);
                return `
                    <div class="subheader">
                        <div class="title">${this.formatText(pos.position || '')}${pos.organization ? ` | ${this.formatText(pos.organization)}` : ''}</div>
                        <div class="date">${this.formatText(pos.dates || pos.duration || '')}</div>
                    </div>
                    ${bullets ? `<ul>${bullets}</ul>` : ''}
                `;
            }).join('');

        return `
            <div class="section">
                <div class="section-header">POSITION OF RESPONSIBILITY</div>
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
                        const date = item.date ? `<span style="font-style: italic; float: right;">${this.formatText(item.date)}</span>` : '';
                        return `<li>${this.formatText(item.description || '')} ${date}</li>`;
                    })
                    .join('');
                
                return `
                    <div class="extra-item">
                        <div class="extra-category">${this.formatText(category)}</div>
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
            // Process each bullet point and split by bullet characters or periods followed by spaces
            const allBullets = [];
            
            validBullets.forEach(point => {
                // Split by bullet characters (•) or periods followed by spaces
                let splitPoints = point.split(/[•·]/).filter(p => p.trim());
                
                // If no bullet characters found, try splitting by ". " (period followed by space)
                if (splitPoints.length === 1) {
                    splitPoints = point.split(/\.\s+/).filter(p => p.trim());
                }
                
                // Add each split point to the array
                splitPoints.forEach(splitPoint => {
                    const trimmed = splitPoint.trim();
                    if (trimmed) {
                        allBullets.push(trimmed);
                    }
                });
            });
            
            return allBullets
                .map(point => {
                    // Apply markdown formatting to bullet points
                    const formattedPoint = this.formatText(point);
                    return `<li>${formattedPoint}</li>`;
                })
                .join('');
        }
    }
    return '';
    }

    // Format text with markdown-style formatting and HTML escaping
    formatText(text) {
        if (!text) return '';
        
        // First escape HTML entities for security
        let escaped = text.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        
        // Then apply markdown formatting
        return escaped
            // Handle bold text: **text** -> <strong>text</strong>
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Handle italic text: __text__ -> <em>text</em>
            .replace(/__(.*?)__/g, '<em>$1</em>');
    }

    // Legacy method for backward compatibility
    escapeHtml(text) {
        return this.formatText(text);
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