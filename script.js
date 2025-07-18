// Main Application State
let currentTemplate = 'custom';
let updateTimer = null;
let isInitialLoad = true;

// Custom LaTeX Template
const customTemplate = `\\documentclass[9pt, a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{geometry}
\\usepackage{hyperref}
\\usepackage{textcomp}
\\usepackage{ragged2e}
\\usepackage{enumitem}
\\usepackage{xcolor}

\\newcommand{\\highlight}[1]{\\textcolor{black}{\\textbf{#1}}}

\\geometry{
    a4paper,
    left=0.3in,
    right=0.3in,
    top=0.4in,
    bottom=0.4in
}

\\pagestyle{empty}

\\newcommand{\\sectionvspacepre}{0pt}
\\newcommand{\\sectionvspacepostrule}{2pt}
\\newcommand{\\sectionvspaceposttext}{2pt}
\\newcommand{\\subheadingvspacepre}{2pt}
\\newcommand{\\subheadingvspacepost}{-4pt}
\\newcommand{\\itemlistsep}{-3pt}

\\newcommand{\\ressection}[1]{%
    \\vspace{\\sectionvspacepre}%
    \\noindent\\rule{\\linewidth}{0.4pt}\\par%
    \\vspace{\\sectionvspacepostrule}%
    \\noindent\\highlight{\\large #1}\\par%
    \\vspace{\\sectionvspaceposttext}%
}

\\newcommand{\\ressubheading}[4]{%
    \\vspace{\\subheadingvspacepre}%
    \\noindent\\highlight{#1} \\hfill \\highlight{#4} \\\\%
    \\noindent\\textit{#2} \\hfill \\textit{#3} \\\\%
    \\vspace{\\subheadingvspacepost}%
}

\\hypersetup{
    colorlinks=true,
    urlcolor=blue,
    linkcolor=blue,
    pdfborder={0 0 0}
}

\\begin{document}
\\RaggedRight

%-------------------- HEADING --------------------
\\begin{center}
    \\highlight{\\LARGE @fullName} \\\\ \\vspace{2pt}
    @phone \\textbullet\\ \\href{mailto:@email}{@email} \\\\
    @linkedin
\\end{center}

@content

\\end{document}`;

// Initialize the application
function initApp() {
    // Set up event listeners
    document.querySelectorAll('input, textarea').forEach(element => {
        element.addEventListener('input', updateResume);
    });
    
    // Load sample data on first load
    if (isInitialLoad) {
        loadSampleData();
        isInitialLoad = false;
    }
    
    updateResume();
}

// Template Selection
function selectTemplate(template) {
    currentTemplate = template;
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    updateResume();
}

// Update Resume Function
function updateResume() {
    clearTimeout(updateTimer);
    updateTimer = setTimeout(() => {
        const data = collectFormData();
        const latex = generateLatex(data, currentTemplate);
        document.getElementById('latexContent').value = latex;
        updatePreview(data);
        updateStatus('Ready');
    }, 300);
}

// Collect Form Data
function collectFormData() {
    const experiences = [];
    document.querySelectorAll('#experienceContainer .dynamic-section').forEach(section => {
        const exp = {
            jobTitle: section.querySelector('.jobTitle').value,
            company: section.querySelector('.company').value,
            duration: section.querySelector('.duration').value,
            location: section.querySelector('.location')?.value || '',
            description: section.querySelector('.description').value
        };
        if (exp.jobTitle || exp.company || exp.duration || exp.description) {
            experiences.push(exp);
        }
    });

    const education = [];
    document.querySelectorAll('#educationContainer .dynamic-section').forEach(section => {
        const edu = {
            degree: section.querySelector('.degree').value,
            institution: section.querySelector('.institution').value,
            year: section.querySelector('.year').value,
            gpa: section.querySelector('.gpa').value
        };
        if (edu.degree || edu.institution || edu.year) {
            education.push(edu);
        }
    });

    const projects = [];
    document.querySelectorAll('#projectsContainer .dynamic-section').forEach(section => {
        const proj = {
            name: section.querySelector('.projectName').value,
            description: section.querySelector('.projectDescription').value,
            technologies: section.querySelector('.technologies').value,
            year: section.querySelector('.projectYear')?.value || '',
            location: section.querySelector('.projectLocation')?.value || ''
        };
        if (proj.name || proj.description || proj.technologies) {
            projects.push(proj);
        }
    });

    return {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        linkedin: document.getElementById('linkedin').value,
        website: document.getElementById('website').value,
        summary: document.getElementById('summary').value,
        skills: document.getElementById('skills').value,
        experiences: experiences,
        education: education,
        projects: projects
    };
}

// Generate LaTeX Code
function generateLatex(data, template) {
    if (template === 'custom') {
        return generateCustomTemplate(data);
    }
    
    const templates = {
        modern: generateModernTemplate,
        classic: generateClassicTemplate,
        minimal: generateMinimalTemplate
    };
    return templates[template](data);
}

// Custom Template Generator
function generateCustomTemplate(data) {
    let content = '';
    
    // Professional Summary
    if (data.summary) {
        content += `\\ressection{Professional Summary}
\\begin{itemize}[leftmargin=*]
    \\setlength\\itemsep{\\itemlistsep}
    ${data.summary.split('\n').filter(item => item.trim()).map(item => `    \\item ${item.trim()}`).join('\n')}
\\end{itemize}\n\n`;
    }

    // Education
    if (data.education.length > 0) {
        content += `\\ressection{Education}\n`;
        data.education.forEach(edu => {
            content += `\\ressubheading
    {${escapeLaTeX(edu.institution)}}
    {${escapeLaTeX(edu.degree)}}
    {${edu.gpa ? 'GPA: ' + escapeLaTeX(edu.gpa) : ''}}
    {${escapeLaTeX(edu.year)}}\n\n`;
        });
    }

    // Experience
    if (data.experiences.length > 0) {
        content += `\\ressection{Professional Experience}\n`;
        data.experiences.forEach(exp => {
            content += `\\ressubheading
    {${escapeLaTeX(exp.jobTitle)}}
    {${escapeLaTeX(exp.company)}}
    {${escapeLaTeX(exp.duration)}}
    {${escapeLaTeX(exp.location)}}\n`;
            content += `\\begin{itemize}[leftmargin=*]
    \\setlength\\itemsep{\\itemlistsep}
    ${exp.description.split('\n').filter(item => item.trim()).map(item => `    \\item ${escapeLaTeX(item.trim())}`).join('\n')}
\\end{itemize}\n\n`;
        });
    }

    // Projects
    if (data.projects.length > 0) {
        content += `\\ressection{Projects}\n`;
        data.projects.forEach(proj => {
            content += `\\ressubheading
    {${escapeLaTeX(proj.name)}}
    {${escapeLaTeX(proj.technologies)}}
    {${proj.year ? escapeLaTeX(proj.year) : ''}}
    {${proj.location ? escapeLaTeX(proj.location) : ''}}\n`;
            content += `\\begin{itemize}[leftmargin=*]
    \\setlength\\itemsep{\\itemlistsep}
    ${proj.description.split('\n').filter(item => item.trim()).map(item => `    \\item ${escapeLaTeX(item.trim())}`).join('\n')}
\\end{itemize}\n\n`;
        });
    }

    // Skills
    if (data.skills) {
        content += `\\ressection{Technical Skills}
\\begin{itemize}[leftmargin=*]
    \\setlength\\itemsep{\\itemlistsep}
    ${data.skills.split('\n').filter(item => item.trim()).map(item => `    \\item ${escapeLaTeX(item.trim())}`).join('\n')}
\\end{itemize}\n\n`;
    }

    // Replace placeholders
    let latex = customTemplate
        .replace('@fullName', escapeLaTeX(data.fullName) || 'Your Name')
        .replace('@email', escapeLaTeX(data.email) || 'your@email.com')
        .replace('@phone', escapeLaTeX(data.phone) || 'Your Phone')
        .replace('@linkedin', data.linkedin ? `\\href{https://${escapeLaTeX(data.linkedin)}}{${escapeLaTeX(data.linkedin)}}` : '')
        .replace('@content', content);

    return latex;
}

// Escape LaTeX special characters
function escapeLaTeX(text) {
    if (!text) return '';
    return text.toString()
        .replace(/\\/g, '\\textbackslash{}')
        .replace(/&/g, '\\&')
        .replace(/%/g, '\\%')
        .replace(/\$/g, '\\$')
        .replace(/#/g, '\\#')
        .replace(/_/g, '\\_')
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}')
        .replace(/~/g, '\\textasciitilde{}')
        .replace(/\^/g, '\\textasciicircum{}');
}

// Status Updates
function updateStatus(status) {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    statusDot.className = 'status-dot';
    if (status === 'Loading') {
        statusDot.classList.add('loading');
    } else if (status === 'Error') {
        statusDot.classList.add('error');
    } else if (status === 'Success') {
        statusDot.classList.add('success');
    }
    
    statusText.textContent = status;
}

// Dynamic Section Management
function addExperience() {
    const container = document.getElementById('experienceContainer');
    const newSection = document.createElement('div');
    newSection.className = 'dynamic-section';
    newSection.innerHTML = `
        <button class="remove-btn" onclick="removeExperience(this)">×</button>
        <div class="form-group">
            <label>Job Title</label>
            <input type="text" class="jobTitle" placeholder="Software Engineer" oninput="updateResume()">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Company</label>
                <input type="text" class="company" placeholder="Tech Company Inc." oninput="updateResume()">
            </div>
            <div class="form-group">
                <label>Location</label>
                <input type="text" class="location" placeholder="City, Country" oninput="updateResume()">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Duration</label>
                <input type="text" class="duration" placeholder="Jan 2020 - Present" oninput="updateResume()">
            </div>
        </div>
        <div class="form-group">
            <label>Description (one per line)</label>
            <textarea class="description" placeholder="Key responsibilities and achievements..." oninput="updateResume()"></textarea>
        </div>
    `;
    container.appendChild(newSection);
    updateResume();
}

function removeExperience(button) {
    if (document.querySelectorAll('#experienceContainer .dynamic-section').length > 1) {
        button.parentElement.remove();
        updateResume();
    } else {
        alert("You need at least one experience entry.");
    }
}

function addEducation() {
    const container = document.getElementById('educationContainer');
    const newSection = document.createElement('div');
    newSection.className = 'dynamic-section';
    newSection.innerHTML = `
        <button class="remove-btn" onclick="removeEducation(this)">×</button>
        <div class="form-group">
            <label>Degree</label>
            <input type="text" class="degree" placeholder="Bachelor of Science in Computer Science" oninput="updateResume()">
        </div>
        <div class="form-group">
            <label>Institution</label>
            <input type="text" class="institution" placeholder="University Name" oninput="updateResume()">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Year</label>
                <input type="text" class="year" placeholder="2020" oninput="updateResume()">
            </div>
            <div class="form-group">
                <label>GPA</label>
                <input type="text" class="gpa" placeholder="3.8/4.0" oninput="updateResume()">
            </div>
        </div>
    `;
    container.appendChild(newSection);
    updateResume();
}

function removeEducation(button) {
    if (document.querySelectorAll('#educationContainer .dynamic-section').length > 1) {
        button.parentElement.remove();
        updateResume();
    } else {
        alert("You need at least one education entry.");
    }
}

function addProject() {
    const container = document.getElementById('projectsContainer');
    const newSection = document.createElement('div');
    newSection.className = 'dynamic-section';
    newSection.innerHTML = `
        <button class="remove-btn" onclick="removeProject(this)">×</button>
        <div class="form-group">
            <label>Project Name</label>
            <input type="text" class="projectName" placeholder="E-commerce Website" oninput="updateResume()">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Technologies</label>
                <input type="text" class="technologies" placeholder="React, Node.js, MongoDB" oninput="updateResume()">
            </div>
            <div class="form-group">
                <label>Year</label>
                <input type="text" class="projectYear" placeholder="2023" oninput="updateResume()">
            </div>
        </div>
        <div class="form-group">
            <label>Description (one per line)</label>
            <textarea class="projectDescription" placeholder="Built a full-stack e-commerce website..." oninput="updateResume()"></textarea>
        </div>
    `;
    container.appendChild(newSection);
    updateResume();
}

function removeProject(button) {
    if (document.querySelectorAll('#projectsContainer .dynamic-section').length > 1) {
        button.parentElement.remove();
        updateResume();
    } else {
        alert("You need at least one project entry.");
    }
}

// File Operations
function copyLatexToClipboard() {
    const latexContent = document.getElementById('latexContent');
    latexContent.select();
    document.execCommand('copy');
    updateStatus('Copied!');
    setTimeout(() => updateStatus('Ready'), 2000);
}

function downloadLatex() {
    const latexContent = document.getElementById('latexContent').value;
    if (!latexContent) {
        updateStatus('Error: No content');
        return;
    }
    
    const blob = new Blob([latexContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.tex';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    updateStatus('Downloaded .tex');
}

async function downloadPDF() {
    updateStatus('Loading');
    const latexContent = document.getElementById('latexContent').value;
    
    try {
        // Using latex-online.cc for compilation
        const latexOnlineUrl = `https://latexonline.cc/compile?text=${encodeURIComponent(latexContent)}&target=template.tex`;
        
        // Open in new tab
        window.open(latexOnlineUrl, '_blank');
        
        updateStatus('PDF Generated');
    } catch (error) {
        console.error('PDF generation error:', error);
        updateStatus('Error');
        alert('PDF generation failed. Please copy the LaTeX code and compile it manually using:\n\n1. Overleaf (https://www.overleaf.com)\n2. latex-online.cc\n3. Or a local LaTeX installation');
    }
}

// Sample Data Loader
function loadSampleData() {
    // Personal Info
    document.getElementById('fullName').value = 'Nidhi Dhiliwal';
    document.getElementById('email').value = 'NidhiDhiliwal@gmail.com';
    document.getElementById('phone').value = '+91 91168 60148';
    document.getElementById('linkedin').value = 'linkedin.com/in/nidhi-dhiliwal-73349123b/';
    
    // Summary
    document.getElementById('summary').value = 'Frontend developer with 1.5 years of experience building scalable, user-friendly product interfaces.\nSkilled in React.js, Next.js, Redux Toolkit, Tailwind CSS, HTML5, ShadCN, and other modern frontend frameworks.';
    
    // Skills
    document.getElementById('skills').value = 'Languages: Python, C++, Java, HTML, CSS\nTools: Excel, Tableau, Power BI\nFrameworks: React, Next.js, Redux Toolkit, Node.js, Express, MongoDB, Tailwind CSS, ShadCN\nConcepts: NLP, Machine Learning, Web Development, Problem Solving';
    
    // Clear existing sections
    document.querySelectorAll('#experienceContainer .dynamic-section').forEach(section => section.remove());
    document.querySelectorAll('#educationContainer .dynamic-section').forEach(section => section.remove());
    document.querySelectorAll('#projectsContainer .dynamic-section').forEach(section => section.remove());
    
    // Add sample experience
    addExperience();
    const expSection = document.querySelector('#experienceContainer .dynamic-section');
    expSection.querySelector('.jobTitle').value = 'Software Engineer Intern';
    expSection.querySelector('.company').value = 'Scalefull Technologies';
    expSection.querySelector('.location').value = 'Pune (Remote)';
    expSection.querySelector('.duration').value = 'Jan 2024 – Feb 2024';
    expSection.querySelector('.description').value = 'Developed a genre classification model using Python and scikit-learn to predict movie genres from plot summaries.\nImplemented advanced NLP techniques to extract features from text data, improving the model\'s accuracy and efficiency.\nFine-tuned model parameters, evaluated using classification metrics, and optimized prediction logic for better decision-making.';
    
    // Add sample education
    addEducation();
    const eduSection = document.querySelector('#educationContainer .dynamic-section');
    eduSection.querySelector('.degree').value = 'B.E. in Computer Engineering';
    eduSection.querySelector('.institution').value = 'D.Y. Patil Institute of Engineering, Management and Research, Pune';
    eduSection.querySelector('.year').value = 'Jun 2021 – Present';
    eduSection.querySelector('.gpa').value = '9.29/10';
    
    // Add sample project
    addProject();
    const projSection = document.querySelector('#projectsContainer .dynamic-section');
    projSection.querySelector('.projectName').value = 'Online Bookstore Application';
    projSection.querySelector('.technologies').value = 'React, Node.js, MongoDB';
    projSection.querySelector('.projectYear').value = '2023';
    projSection.querySelector('.projectDescription').value = 'Designed a user-friendly web platform where users can browse, purchase, and receive receipts for selected books.\nIntegrated an admin interface to manage book inventory, pricing, and view sales analytics through an intuitive dashboard.\nBuilt the complete solution using ReactJS, Node.js, and MongoDB with secure login and session handling.';
    
    updateResume();
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);