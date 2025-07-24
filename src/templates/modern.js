function generateModernTemplate(data) {
  const {
    personalInfo = {},
    professionalSummary = '',
    education = [],
    experience = [],
    projects = [],
    skills = {},
    positions = [],
    certifications = [],
    interests = ''
  } = data;

  const template = `\\documentclass[10pt, a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{geometry}
\\usepackage{hyperref}
\\usepackage{xcolor}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{fontawesome5}
\\usepackage{graphicx}
\\usepackage{tikz}

% Define colors
\\definecolor{accent}{RGB}{52, 152, 219}
\\definecolor{dark}{RGB}{44, 62, 80}
\\definecolor{light}{RGB}{236, 240, 241}

\\geometry{
    a4paper,
    left=0.4in,
    right=0.4in,
    top=0.5in,
    bottom=0.5in
}

\\pagestyle{empty}

% Custom section formatting
\\titleformat{\\section}{\\color{accent}\\Large\\bfseries}{}{0em}{}[\\color{accent}\\titlerule]
\\titlespacing*{\\section}{0pt}{12pt}{6pt}

% Custom subsection formatting  
\\titleformat{\\subsection}{\\color{dark}\\large\\bfseries}{}{0em}{}
\\titlespacing*{\\subsection}{0pt}{8pt}{4pt}

% Custom commands
\\newcommand{\\resumeItem}[1]{\\item\\small{#1}}
\\newcommand{\\resumeSubHeading}[4]{
  \\vspace{-1pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-5pt}
}

\\hypersetup{
    colorlinks=true,
    urlcolor=accent,
    linkcolor=accent,
    pdfborder={0 0 0}
}

\\begin{document}

%-------------------- HEADER --------------------
\\begin{center}
    {\\Huge \\color{dark}\\textbf{${personalInfo.name || 'Your Name'}}} \\\\
    \\vspace{4pt}
    \\color{accent}
    ${personalInfo.phone ? `\\faPhone\\ ${personalInfo.phone}` : '\\faPhone\\ +1 (555) 123-4567'} \\quad
    ${personalInfo.email ? `\\faEnvelope\\ \\href{mailto:${personalInfo.email}}{${personalInfo.email}}` : '\\faEnvelope\\ email@example.com'} \\\\
    \\vspace{2pt}
    ${personalInfo.linkedin ? `\\faLinkedin\\ \\href{${personalInfo.linkedin}}{LinkedIn}` : ''} 
    ${personalInfo.website ? `\\quad \\faGlobe\\ \\href{${personalInfo.website}}{Portfolio}` : ''}
\\end{center}

\\vspace{8pt}

${professionalSummary ? `\\section{Professional Summary}
\\begin{itemize}[leftmargin=15pt, label={}]
${professionalSummary.split('\n').filter(line => line.trim()).map(line => `    \\resumeItem{${line.trim()}}`).join('\n')}
\\end{itemize}

` : ''}${experience.length > 0 ? `\\section{Experience}
\\begin{itemize}[leftmargin=15pt, label={}]
${experience.map(exp => `    \\resumeSubHeading
      {${exp.position || 'Position'}}{${exp.dates || 'Dates'}}
      {${exp.company || 'Company'}}{${exp.location || 'Location'}}
${exp.details ? `      \\resumeItemListStart
${exp.details.split('\n').filter(line => line.trim()).map(line => `        \\resumeItem{${line.trim()}}`).join('\n')}
      \\resumeItemListEnd` : ''}`).join('\n')}
\\end{itemize}

` : ''}${education.length > 0 ? `\\section{Education}
\\begin{itemize}[leftmargin=15pt, label={}]
${education.map(edu => `    \\resumeSubHeading
      {${edu.institution || 'Institution'}}{${edu.dates || 'Year'}}
      {${edu.degree || 'Degree'}}{${edu.gpa ? `GPA: ${edu.gpa}` : edu.grade || ''}}
${edu.details ? `      \\resumeItemListStart
${edu.details.split('\n').filter(line => line.trim()).map(line => `        \\resumeItem{${line.trim()}}`).join('\n')}
      \\resumeItemListEnd` : ''}`).join('\n')}
\\end{itemize}

` : ''}${projects.length > 0 ? `\\section{Projects}
\\begin{itemize}[leftmargin=15pt, label={}]
${projects.map(proj => `    \\resumeSubHeading
      {${proj.name || 'Project Name'}}{${proj.dates || 'Year'}}
      {${proj.type || 'Project Type'}}{${proj.location || ''}}
${proj.details ? `      \\resumeItemListStart
${proj.details.split('\n').filter(line => line.trim()).map(line => `        \\resumeItem{${line.trim()}}`).join('\n')}
      \\resumeItemListEnd` : ''}`).join('\n')}
\\end{itemize}

` : ''}${skills && Object.keys(skills).length > 0 ? `\\section{Technical Skills}
\\begin{itemize}[leftmargin=15pt, label={}]
${Object.entries(skills).map(([category, skillList]) => `    \\item \\textbf{${category}:} ${Array.isArray(skillList) ? skillList.join(', ') : skillList}`).join('\n')}
\\end{itemize}

` : ''}${certifications.length > 0 ? `\\section{Certifications}
\\begin{itemize}[leftmargin=15pt, label={}]
${certifications.map(cert => `    \\item ${cert}`).join('\n')}
\\end{itemize}

` : ''}${positions.length > 0 ? `\\section{Leadership \\& Activities}
\\begin{itemize}[leftmargin=15pt, label={}]
${positions.map(pos => `    \\item ${pos}`).join('\n')}
\\end{itemize}

` : ''}${interests ? `\\section{Interests}
\\begin{itemize}[leftmargin=15pt, label={}]
    \\item ${interests}
\\end{itemize}
` : ''}
\\end{document}`;

  return template;
}

module.exports = { generateModernTemplate };