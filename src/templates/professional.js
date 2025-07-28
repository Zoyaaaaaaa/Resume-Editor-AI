// function generateProfessionalTemplate(data) {
//   // Debug: Log the actual data being passed to template
//   console.log('Template received data:', JSON.stringify(data, null, 2));
  
//   const {
//     personalInfo = {},
//     professionalSummary = '',
//     education = [],
//     experience = [],
//     projects = [],
//     skills = {},
//     positions = [],
//     certifications = [],
//     interests = ''
//   } = data;
  
//   // Function to escape special LaTeX characters
//   function escapeLatex(text) {
//     if (!text) return '';
//     return text.toString()
//       .replace(/\\/g, '\\textbackslash{}')
//       .replace(/\{/g, '\\{')
//       .replace(/\}/g, '\\}')
//       .replace(/\$/g, '\\$')
//       .replace(/&/g, '\\&')
//       .replace(/%/g, '\\%')
//       .replace(/#/g, '\\#')
//       .replace(/\^/g, '\\textasciicircum{}')
//       .replace(/_/g, '\\_')
//       .replace(/~/g, '\\textasciitilde{}');
//   }
  
//   // Debug: Log extracted arrays to see what we're working with
//   console.log('Education array:', education);
//   console.log('Experience array:', experience);
//   console.log('Projects array:', projects);

//   const template = `\\documentclass[9pt, a4paper]{article}
// \\usepackage[utf8]{inputenc}
// \\usepackage[T1]{fontenc}
// \\usepackage{geometry}
// \\usepackage{hyperref}
// \\usepackage{textcomp}
// \\usepackage{ragged2e}
// \\usepackage{enumitem}
// \\usepackage{xcolor}

// \\newcommand{\\highlight}[1]{\\textcolor{black}{\\textbf{#1}}}

// \\geometry{
//     a4paper,
//     left=0.3in,
//     right=0.3in,
//     top=0.4in,
//     bottom=0.4in
// }

// \\pagestyle{empty}

// \\newcommand{\\sectionvspacepre}{0pt}
// \\newcommand{\\sectionvspacepostrule}{2pt}
// \\newcommand{\\sectionvspaceposttext}{2pt}
// \\newcommand{\\subheadingvspacepre}{2pt}
// \\newcommand{\\subheadingvspacepost}{-4pt}
// \\newcommand{\\itemlistsep}{-3pt}

// \\newcommand{\\ressection}[1]{%
//     \\vspace{\\sectionvspacepre}%
//     \\noindent\\rule{\\linewidth}{0.4pt}\\par%
//     \\vspace{\\sectionvspacepostrule}%
//     \\noindent\\highlight{\\large #1}\\par%
//     \\vspace{\\sectionvspaceposttext}%
// }

// \\newcommand{\\ressubheading}[4]{%
//     \\vspace{\\subheadingvspacepre}%
//     \\noindent\\highlight{#1} \\hfill \\highlight{#4} \\\\%
//     \\noindent\\textit{#2} \\hfill \\textit{#3} \\\\%
//     \\vspace{\\subheadingvspacepost}%
// }

// \\hypersetup{
//     colorlinks=true,
//     urlcolor=blue,
//     linkcolor=blue,
//     pdfborder={0 0 0}
// }

// \\begin{document}
// \\RaggedRight

// %-------------------- HEADING --------------------
// \\begin{center}
//     \\highlight{\\LARGE ${escapeLatex(personalInfo.name || 'Your Name')}} \\\\ \\vspace{2pt}
//     ${escapeLatex(personalInfo.phone || '+1 (555) 123-4567')} \\textbullet\\ \\href{mailto:${personalInfo.email || 'email@example.com'}}{${escapeLatex(personalInfo.email || 'email@example.com')}} \\\\
//     ${personalInfo.linkedin ? `\\href{${personalInfo.linkedin}}{LinkedIn: ${escapeLatex(personalInfo.linkedin.replace('https://', '').replace('http://', ''))}} \\\\` : ''}
//     ${personalInfo.website ? `\\href{${personalInfo.website}}{${escapeLatex(personalInfo.website.replace('https://', '').replace('http://', ''))}}` : ''}
// \\end{center}

// ${professionalSummary ? `%-------------------- PROFESSIONAL SUMMARY --------------------
// \\ressection{Professional Summary}
// \\begin{itemize}[leftmargin=*]
//     \\setlength\\itemsep{\\itemlistsep}
// ${professionalSummary.split('\n').filter(line => line.trim()).map(line => `    \\item ${escapeLatex(line.trim())}`).join('\n')}
// \\end{itemize}

// ` : ''}${education.length > 0 ? `%-------------------- EDUCATION --------------------
// \\ressection{Education}

// ${education.map(edu => `\\ressubheading
//     {${escapeLatex(edu.institution || 'Institution Name')}}
//     {${escapeLatex(edu.degree || 'Degree')}}
//     {${escapeLatex(edu.gpa ? `GPA: ${edu.gpa}` : edu.grade || 'Grade')}}
//     {${escapeLatex(edu.dates || 'Year')}}
// ${edu.details ? `\\begin{itemize}[leftmargin=*]
//     \\setlength\\itemsep{\\itemlistsep}
// ${edu.details.split('\n').filter(line => line.trim()).map(line => `    \\item ${escapeLatex(line.trim())}`).join('\n')}
// \\end{itemize}` : ''}`).join('\n\n')}

// ` : ''}${experience.length > 0 ? `%-------------------- PROFESSIONAL EXPERIENCE --------------------
// \\ressection{Professional Experience}

// ${experience.map(exp => `\\ressubheading
//     {${escapeLatex(exp.position || 'Position')}}
//     {${escapeLatex(exp.company || 'Company')}}
//     {${escapeLatex(exp.location || 'Location')}}
//     {${escapeLatex(exp.dates || 'Dates')}}
// ${exp.details ? `\\begin{itemize}[leftmargin=*]
//     \\setlength\\itemsep{\\itemlistsep}
// ${exp.details.split('\n').filter(line => line.trim()).map(line => `    \\item ${escapeLatex(line.trim())}`).join('\n')}
// \\end{itemize}` : ''}`).join('\n\n')}

// ` : ''}${projects.length > 0 ? `%-------------------- PROJECTS --------------------
// \\ressection{Projects}

// ${projects.map(proj => `\\ressubheading
//     {${escapeLatex(proj.name || 'Project Name')}}
//     {${escapeLatex(proj.type || 'Project Type')}}
//     {${escapeLatex(proj.location || 'Location')}}
//     {${escapeLatex(proj.dates || 'Year')}}
// ${proj.details ? `\\begin{itemize}[leftmargin=*]
//     \\setlength\\itemsep{\\itemlistsep}
// ${proj.details.split('\n').filter(line => line.trim()).map(line => `    \\item ${escapeLatex(line.trim())}`).join('\n')}
// \\end{itemize}` : ''}`).join('\n\n')}

// ` : ''}${skills && Object.keys(skills).length > 0 ? `%-------------------- TECHNICAL SKILLS --------------------
// \\ressection{Technical Skills}
// \\begin{itemize}[leftmargin=*]
//     \\setlength\\itemsep{\\itemlistsep}
// ${Object.entries(skills).map(([category, skillList]) => `    \\item \\textbf{${category}:} ${Array.isArray(skillList) ? skillList.join(', ') : skillList}`).join('\n')}
// \\end{itemize}

// ` : ''}${positions.length > 0 ? `%-------------------- POSITIONS OF RESPONSIBILITY --------------------
// \\ressection{Positions of Responsibility}
// \\begin{itemize}[leftmargin=*]
//     \\setlength\\itemsep{\\itemlistsep}
// ${positions.map(pos => `    \\item ${pos}`).join('\n')}
// \\end{itemize}

// ` : ''}${certifications.length > 0 ? `%-------------------- CERTIFICATIONS --------------------
// \\ressection{Certifications}
// \\begin{itemize}[leftmargin=*]
//     \\setlength\\itemsep{\\itemlistsep}
// ${certifications.map(cert => `    \\item \\textbf{${cert}}`).join('\n')}
// \\end{itemize}

// ` : ''}${interests ? `%-------------------- INTERESTS --------------------
// \\ressection{Interests}
// \\begin{itemize}[leftmargin=*]
//     \\setlength\\itemsep{\\itemlistsep}
//     \\item ${interests}
// \\end{itemize}

// ` : ''}\\end{document}`;

//   return template;
// }

// module.exports = { generateProfessionalTemplate };

const { processResumeDataMarkdown, estimateLatexSize } = require('../utils/markdownToLatex');

function generateProfessionalTemplate(data) {
  // Process markdown formatting to LaTeX before template generation
  const processedData = processResumeDataMarkdown(data);
  
  // Debug: Log the processed data
  console.log('Template received processed data:', JSON.stringify(processedData, null, 2));
  
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
  } = processedData;
  
  // Note: LaTeX escaping is now handled by markdownToLatex utility
  // No need for separate escapeLatex function
  
  // Helper function to format details (handles both string and array)
  function formatDetails(details) {
    if (!details) return '';
    
    let detailsArray;
    if (Array.isArray(details)) {
      detailsArray = details;
    } else if (typeof details === 'string') {
      detailsArray = details.split('\n').filter(line => line.trim());
    } else {
      // If it's neither string nor array, convert to string and split
      detailsArray = details.toString().split('\n').filter(line => line.trim());
    }
    
    return `\\begin{itemize}[leftmargin=*]
    \\raggedright
    \\setlength\\itemsep{\\itemlistsep}
${detailsArray.map(line => `    \\item ${line.trim()}`).join('\n')}
\\end{itemize}`;
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
\\usepackage[final]{microtype}

% Prevent hyphenation - force whole words to next line
\\hyphenpenalty=10000
\\exhyphenpenalty=10000
\\tolerance=9999
\\emergencystretch=10pt

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
    \\highlight{\\LARGE ${personalInfo.name || 'Your Name'}} \\\\ \\vspace{2pt}
    ${personalInfo.phone || '+1 (555) 123-4567'} \\textbullet\\ \\href{mailto:${personalInfo.email || 'email@example.com'}}{${personalInfo.email || 'email@example.com'}} \\\\
    ${personalInfo.linkedin ? `\\href{${personalInfo.linkedin}}{LinkedIn: ${personalInfo.linkedin.replace('https://', '').replace('http://', '')}} \\\\` : ''}
    ${personalInfo.website ? `\\href{${personalInfo.website}}{${personalInfo.website.replace('https://', '').replace('http://', '')}}` : ''}
\\end{center}

${professionalSummary ? `%-------------------- PROFESSIONAL SUMMARY --------------------
\\ressection{Professional Summary}
\\begin{itemize}[leftmargin=*]
    \\raggedright
    \\setlength\\itemsep{\\itemlistsep}
${(typeof professionalSummary === 'string' ? professionalSummary.split('\n') : [professionalSummary]).filter(line => line.trim()).map(line => `    \\item ${line.trim()}`).join('\n')}
\\end{itemize}

` : ''}${education.length > 0 ? `%-------------------- EDUCATION --------------------
\\ressection{Education}

${education.map(edu => `\\ressubheading
    {${edu.institution || 'Institution Name'}}
    {${edu.degree || 'Degree'}}
    {${edu.gpa ? `GPA: ${edu.gpa}` : edu.grade || 'Grade'}}
    {${edu.dates || 'Year'}}
${edu.details ? formatDetails(edu.details) : ''}`).join('\n\n')}

` : ''}${experience.length > 0 ? `%-------------------- PROFESSIONAL EXPERIENCE --------------------
\\ressection{Professional Experience}

${experience.map(exp => `\\ressubheading
    {${exp.position || 'Position'}}
    {${exp.company || 'Company'}}
    {${exp.location || 'Location'}}
    {${exp.dates || 'Dates'}}
${exp.details ? formatDetails(exp.details) : ''}`).join('\n\n')}

` : ''}${projects.length > 0 ? `%-------------------- PROJECTS --------------------
\\ressection{Projects}

${projects.map(proj => `\\ressubheading
    {${proj.name || 'Project Name'}}
    {${proj.type || 'Project Type'}}
    {${proj.location || 'Location'}}
    {${proj.dates || 'Year'}}
${proj.details ? formatDetails(proj.details) : ''}`).join('\n\n')}

` : ''}${skills && Object.keys(skills).length > 0 ? `%-------------------- TECHNICAL SKILLS --------------------
\\ressection{Technical Skills}
\\begin{itemize}[leftmargin=*]
    \\raggedright
    \\setlength\\itemsep{\\itemlistsep}
${Object.entries(skills).map(([category, skillList]) => `    \\item \\textbf{${category}:} ${Array.isArray(skillList) ? skillList.join(', ') : skillList}`).join('\n')}
\\end{itemize}

` : ''}${positions.length > 0 ? `%-------------------- POSITIONS OF RESPONSIBILITY --------------------
\\ressection{Positions of Responsibility}
\\begin{itemize}[leftmargin=*]
    \\raggedright
    \\setlength\\itemsep{\\itemlistsep}
${positions.map(pos => `    \\item ${pos}`).join('\n')}
\\end{itemize}

` : ''}${certifications.length > 0 ? `%-------------------- CERTIFICATIONS --------------------
\\ressection{Certifications}
\\begin{itemize}[leftmargin=*]
    \\raggedright
    \\setlength\\itemsep{\\itemlistsep}
${certifications.map(cert => `    \\item \\textbf{${cert}}`).join('\n')}
\\end{itemize}

` : ''}${interests ? `%-------------------- INTERESTS --------------------
\\ressection{Interests}
\\begin{itemize}[leftmargin=*]
    \\raggedright
    \\setlength\\itemsep{\\itemlistsep}
    \\item ${interests}
\\end{itemize}

` : ''}\\end{document}`;

  // Check LaTeX size and log warning if too large
  const sizeInfo = estimateLatexSize(template);
  if (sizeInfo.tooLarge) {
    console.warn(`⚠️  Generated LaTeX is ${sizeInfo.sizeKB}KB (threshold: ${sizeInfo.threshold}). This may cause PDF generation to fail.`);
  } else {
    console.log(`✅ Generated LaTeX size: ${sizeInfo.sizeKB}KB (within limits)`);
  }

  return template;
}

module.exports = { generateProfessionalTemplate };