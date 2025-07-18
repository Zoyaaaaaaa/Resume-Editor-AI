function generateLatex(data, template) {
    const templates = {
        modern: generateModernTemplate,
        classic: generateClassicTemplate,
        minimal: generateMinimalTemplate
    };
    return templates[template](data);
}

function generateModernTemplate(data) {
    return `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{xcolor}
\\usepackage{fontawesome5}
\\usepackage{hyperref}

\\geometry{margin=0.8in}
\\pagestyle{empty}

\\definecolor{primarycolor}{RGB}{52, 73, 94}
\\definecolor{accentcolor}{RGB}{52, 152, 219}

\\hypersetup{
    colorlinks=true,
    linkcolor=accentcolor,
    filecolor=accentcolor,
    urlcolor=accentcolor,
}

\\titleformat{\\section}{\\Large\\bfseries\\color{primarycolor}}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{20pt}{10pt}

\\begin{document}

% Header
\\begin{center}
    {\\Huge\\bfseries\\color{primarycolor} ${data.fullName || 'Your Name'}}\\\\[0.5em]
    ${data.email ? `\\faEnvelope\\hspace{0.5em}\\href{mailto:${data.email}}{${data.email}}` : ''}
    ${data.phone ? `\\hspace{1em}\\faPhone\\hspace{0.5em}${data.phone}` : ''}\\\\
    ${data.address ? `\\faMapMarker\\hspace{0.5em}${data.address}` : ''}\\\\
    ${data.linkedin ? `\\faLinkedin\\hspace{0.5em}\\href{https://${data.linkedin}}{${data.linkedin}}` : ''}
    ${data.website ? `\\hspace{1em}\\faGlobe\\hspace{0.5em}\\href{https://${data.website}}{${data.website}}` : ''}
\\end{center}

${data.summary ? `\\section{Professional Summary}
${data.summary}

` : ''}${data.experiences.length > 0 ? `\\section{Work Experience}
${data.experiences.map(exp => `\\textbf{${exp.jobTitle}} \\hfill \\textit{${exp.duration}}\\\\
\\textit{${exp.company}}\\\\
${exp.description}\\\\[0.5em]
`).join('')}
` : ''}${data.education.length > 0 ? `\\section{Education}
${data.education.map(edu => `\\textbf{${edu.degree}} \\hfill \\textit{${edu.year}}\\\\
\\textit{${edu.institution}}${edu.gpa ? ` \\hfill GPA: ${edu.gpa}` : ''}\\\\[0.5em]
`).join('')}
` : ''}${data.skills ? `\\section{Technical Skills}
${data.skills}

` : ''}${data.projects.length > 0 ? `\\section{Projects}
${data.projects.map(proj => `\\textbf{${proj.name}} \\hfill \\textit{${proj.technologies}}\\\\
${proj.description}\\\\[0.5em]
`).join('')}
` : ''}\\end{document}`;
}

function generateClassicTemplate(data) {
    return `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{times}
\\usepackage{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{hyperref}

\\geometry{margin=1in}
\\pagestyle{empty}

\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[\\hrule]
\\titlespacing*{\\section}{0pt}{15pt}{8pt}

\\begin{document}

% Header
\\begin{center}
    {\\Large\\bfseries ${data.fullName || 'Your Name'}}\\\\[0.3em]
    ${data.address ? `${data.address}\\\\` : ''}
    ${data.phone ? `${data.phone}` : ''}${data.email ? ` \\textbullet\\ ${data.email}` : ''}\\\\
    ${data.linkedin ? `LinkedIn: ${data.linkedin}` : ''}${data.website ? ` \\textbullet\\ ${data.website}` : ''}
\\end{center}

${data.summary ? `\\section{Summary}
${data.summary}

` : ''}${data.experiences.length > 0 ? `\\section{Experience}
\\begin{itemize}[leftmargin=*]
${data.experiences.map(exp => `    \\item \\textbf{${exp.jobTitle}}, \\textit{${exp.company}} \\hfill \\textit{${exp.duration}}
    \\begin{itemize}
        \\item ${exp.description.replace(/\n/g, '\\\\item ')}
    \\end{itemize}
`).join('')}
\\end{itemize}

` : ''}${data.education.length > 0 ? `\\section{Education}
\\begin{itemize}[leftmargin=*]
${data.education.map(edu => `    \\item \\textbf{${edu.degree}}, \\textit{${edu.institution}} \\hfill ${edu.year}${edu.gpa ? ` (GPA: ${edu.gpa})` : ''}
`).join('')}
\\end{itemize}

` : ''}${data.skills ? `\\section{Skills}
${data.skills}

` : ''}${data.projects.length > 0 ? `\\section{Projects}
\\begin{itemize}[leftmargin=*]
${data.projects.map(proj => `    \\item \\textbf{${proj.name}} (${proj.technologies})
    \\begin{itemize}
        \\item ${proj.description.replace(/\n/g, '\\\\item ')}
    \\end{itemize}
`).join('')}
\\end{itemize}
` : ''}\\end{document}`;
}

function generateMinimalTemplate(data) {
    return `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{helvet}
\\usepackage{geometry}
\\usepackage{parskip}
\\usepackage{enumitem}

\\geometry{margin=1in}
\\pagestyle{empty}
\\renewcommand{\\familydefault}{\\sfdefault}

\\begin{document}

% Header
\\begin{center}
    {\\LARGE\\bfseries ${data.fullName || 'Your Name'}}\\\\[0.5em]
    ${data.email ? `${data.email}` : ''}${data.phone ? ` \\textbullet\\ ${data.phone}` : ''}\\\\
    ${data.linkedin ? `${data.linkedin}` : ''}${data.website ? ` \\textbullet\\ ${data.website}` : ''}
\\end{center}

${data.summary ? `\\section*{SUMMARY}
${data.summary}

` : ''}${data.experiences.length > 0 ? `\\section*{EXPERIENCE}
${data.experiences.map(exp => `\\textbf{${exp.jobTitle}} \\hfill ${exp.duration}\\\\
${exp.company}\\\\
${exp.description}\\\\[0.5em]
`).join('')}
` : ''}${data.education.length > 0 ? `\\section*{EDUCATION}
${data.education.map(edu => `${edu.degree} \\hfill ${edu.year}\\\\
${edu.institution}${edu.gpa ? ` \\hfill GPA: ${edu.gpa}` : ''}\\\\[0.5em]
`).join('')}
` : ''}${data.skills ? `\\section*{SKILLS}
${data.skills}

` : ''}${data.projects.length > 0 ? `\\section*{PROJECTS}
${data.projects.map(proj => `\\textbf{${proj.name}} (${proj.technologies})\\\\
${proj.description}\\\\[0.5em]
`).join('')}
` : ''}\\end{document}`;
}