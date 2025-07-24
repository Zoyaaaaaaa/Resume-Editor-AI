function generateProfessionalTemplate(data) {
  // Debug: Log the actual data being passed to template
  console.log('Template received data:', JSON.stringify(data, null, 2));
  
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
  
  // Function to escape special LaTeX characters
  function escapeLatex(text) {
    if (!text) return '';
    return text.toString()
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/\$/g, '\\$')
      .replace(/&/g, '\\&')
      .replace(/%/g, '\\%')
      .replace(/#/g, '\\#')
      .replace(/\^/g, '\\textasciicircum{}')
      .replace(/_/g, '\\_')
      .replace(/~/g, '\\textasciitilde{}');
  }
  
  // Debug: Log extracted arrays to see what we're working with
  console.log('Education array:', education);
  console.log('Experience array:', experience);
  console.log('Projects array:', projects);

  const template = `\\documentclass[9pt, a4paper]{article}
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
    \\highlight{\\LARGE ${escapeLatex(personalInfo.name || 'Your Name')}} \\\\ \\vspace{2pt}
    ${escapeLatex(personalInfo.phone || '+1 (555) 123-4567')} \\textbullet\\ \\href{mailto:${personalInfo.email || 'email@example.com'}}{${escapeLatex(personalInfo.email || 'email@example.com')}} \\\\
    ${personalInfo.linkedin ? `\\href{${personalInfo.linkedin}}{LinkedIn: ${escapeLatex(personalInfo.linkedin.replace('https://', '').replace('http://', ''))}} \\\\` : ''}
    ${personalInfo.website ? `\\href{${personalInfo.website}}{${escapeLatex(personalInfo.website.replace('https://', '').replace('http://', ''))}}` : ''}
\\end{center}

${professionalSummary ? `%-------------------- PROFESSIONAL SUMMARY --------------------
\\ressection{Professional Summary}
\\begin{itemize}[leftmargin=*]
    \\setlength\\itemsep{\\itemlistsep}
${professionalSummary.split('\n').filter(line => line.trim()).map(line => `    \\item ${escapeLatex(line.trim())}`).join('\n')}
\\end{itemize}

` : ''}${education.length > 0 ? `%-------------------- EDUCATION --------------------
\\ressection{Education}

${education.map(edu => `\\ressubheading
    {${escapeLatex(edu.institution || 'Institution Name')}}
    {${escapeLatex(edu.degree || 'Degree')}}
    {${escapeLatex(edu.gpa ? `GPA: ${edu.gpa}` : edu.grade || 'Grade')}}
    {${escapeLatex(edu.dates || 'Year')}}
${edu.details ? `\\begin{itemize}[leftmargin=*]
    \\setlength\\itemsep{\\itemlistsep}
${edu.details.split('\n').filter(line => line.trim()).map(line => `    \\item ${escapeLatex(line.trim())}`).join('\n')}
\\end{itemize}` : ''}`).join('\n\n')}

` : ''}${experience.length > 0 ? `%-------------------- PROFESSIONAL EXPERIENCE --------------------
\\ressection{Professional Experience}

${experience.map(exp => `\\ressubheading
    {${escapeLatex(exp.position || 'Position')}}
    {${escapeLatex(exp.company || 'Company')}}
    {${escapeLatex(exp.location || 'Location')}}
    {${escapeLatex(exp.dates || 'Dates')}}
${exp.details ? `\\begin{itemize}[leftmargin=*]
    \\setlength\\itemsep{\\itemlistsep}
${exp.details.split('\n').filter(line => line.trim()).map(line => `    \\item ${escapeLatex(line.trim())}`).join('\n')}
\\end{itemize}` : ''}`).join('\n\n')}

` : ''}${projects.length > 0 ? `%-------------------- PROJECTS --------------------
\\ressection{Projects}

${projects.map(proj => `\\ressubheading
    {${escapeLatex(proj.name || 'Project Name')}}
    {${escapeLatex(proj.type || 'Project Type')}}
    {${escapeLatex(proj.location || 'Location')}}
    {${escapeLatex(proj.dates || 'Year')}}
${proj.details ? `\\begin{itemize}[leftmargin=*]
    \\setlength\\itemsep{\\itemlistsep}
${proj.details.split('\n').filter(line => line.trim()).map(line => `    \\item ${escapeLatex(line.trim())}`).join('\n')}
\\end{itemize}` : ''}`).join('\n\n')}

` : ''}${skills && Object.keys(skills).length > 0 ? `%-------------------- TECHNICAL SKILLS --------------------
\\ressection{Technical Skills}
\\begin{itemize}[leftmargin=*]
    \\setlength\\itemsep{\\itemlistsep}
${Object.entries(skills).map(([category, skillList]) => `    \\item \\textbf{${escapeLatex(category)}:} ${escapeLatex(Array.isArray(skillList) ? skillList.join(', ') : skillList)}`).join('\n')}
\\end{itemize}

` : ''}${positions.length > 0 ? `%-------------------- POSITIONS OF RESPONSIBILITY --------------------
\\ressection{Positions of Responsibility}
\\begin{itemize}[leftmargin=*]
    \\setlength\\itemsep{\\itemlistsep}
${positions.map(pos => `    \\item ${escapeLatex(pos)}`).join('\n')}
\\end{itemize}

` : ''}${certifications.length > 0 ? `%-------------------- CERTIFICATIONS --------------------
\\ressection{Certifications}
\\begin{itemize}[leftmargin=*]
    \\setlength\\itemsep{\\itemlistsep}
${certifications.map(cert => `    \\item \\textbf{${escapeLatex(cert)}}`).join('\n')}
\\end{itemize}

` : ''}${interests ? `%-------------------- INTERESTS --------------------
\\ressection{Interests}
\\begin{itemize}[leftmargin=*]
    \\setlength\\itemsep{\\itemlistsep}
    \\item ${escapeLatex(interests)}
\\end{itemize}

` : ''}\\end{document}`;

  return template;
}

module.exports = { generateProfessionalTemplate };