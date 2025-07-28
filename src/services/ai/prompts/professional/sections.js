// const sectionPrompts = {
//   professionalSummary: (sectionData, jobDescription = '') => {
//     const jobContext = jobDescription ? `\n\nJob Description Context:\n${jobDescription}\n\nAlign the summary with this software development role.` : '';
    
//     return `Transform this professional summary for software development and IT positions. Create technical authority with results-driven language:

// Current Summary:
// ${sectionData}

// SOFTWARE DEVELOPMENT ENHANCEMENT FOCUS:
// - Technical expertise with confident, professional tone
// - Quantified technical achievements and system impact
// - Programming languages, frameworks, and technology stack
// - Years of development experience and project scope
// - Technical leadership and architectural contributions
// - **Bold** formatting for key technologies and major technical wins

// REQUIREMENTS:
// - 2-3 powerful sentences maximum
// - Lead with **years of experience** and **technical specializations**
// - Include **quantified system impact** (users served, performance gains, scale)
// - Use technical action verbs: "developed," "architected," "optimized," "implemented"
// - Emphasize **platform growth**, **system architecture**, and **performance optimization**
// - Highlight relevant **programming languages**, **frameworks**, and **certifications**

// **Bold formatting examples**: **5+ years full-stack development**, **React/Node.js expert**, **served 100K+ users**, **AWS Certified**${jobContext}

// Return only the enhanced technical summary with strategic but LIMITED **bold** formatting (max 2-3 bold items). Focus on technical authority, proven impact, and measurable system improvements.`;
//   },

//   experience: (sectionData, jobDescription = '') => {
//     const jobContext = jobDescription ? `\n\nJob Description Context:\n${jobDescription}\n\nTailor the experience to match these software development requirements.` : '';
    
//     return `Enhance this software development work experience entry for maximum technical impact.

// Current Experience Entry:
// Position: ${sectionData.position}
// Company: ${sectionData.company}
// Details: ${sectionData.details}

// Enhancement Focus for Software Development:
// - Use technical action verbs (developed, implemented, architected, optimized, debugged, deployed)
// - Quantify all technical achievements with specific metrics (users, performance %, load time, uptime)
// - Emphasize programming languages, frameworks, and tools used
// - Highlight system architecture, database design, and platform scalability
// - Show technical problem-solving and debugging capabilities
// - Include relevant technologies: **JavaScript, Python, React, Node.js, SQL, AWS, GitHub**
// - Focus on user impact, system performance, code quality, and feature development
// - Maintain technical, results-oriented tone following **[Action Verb] + [What] + [How] + [Impact/Result]**
// - **SELECTIVE**: Use **bold** markdown for only the most impactful metrics and technologies (limit 1-2 bold items per bullet point)
// - Bold examples: **React and Node.js**, **reduced load time by 40%**, **serving 50K+ users**, **99.9% uptime**, **improved performance by 35%**${jobContext}

// Return only the enhanced bullet points (one per line, max 16 words each) with LIMITED **bold** formatting for top technical achievements, no additional text.`;
//   },

//   skills: (sectionData, jobDescription = '') => {
//     const jobContext = jobDescription ? `\n\nJob Description Context:\n${jobDescription}\n\nPrioritize skills that match these software development requirements.` : '';
    
//     return `Enhance and optimize this skills section for software development/IT environments.

// Current Skills:
// ${JSON.stringify(sectionData, null, 2)}

// Software Development Skills Enhancement:
// - Prioritize modern programming languages and frameworks
// - Include relevant certifications and technical credentials
// - Organize by categories: Programming Languages, Frameworks, Tools, Databases, Specializations
// - Use exact technology names and industry-standard terminology
// - Emphasize full-stack development capabilities
// - Include DevOps, CI/CD, and system architecture skills
// - Add version control, testing, and debugging tools
// - Focus on skills valued in software development roles
// - **IMPORTANT**: Use **bold** markdown formatting for key technologies, certifications, and high-demand skills
// - Bold examples: **JavaScript**, **React**, **Python**, **AWS Certified**, **Docker**, **Node.js**, **SQL**, **Git/GitHub**, **CI/CD**, **Agile**

// TECHNICAL SKILLS CATEGORIES:
// - **Languages**: JavaScript, Python, Java, TypeScript, Swift, HTML, CSS, SQL
// - **Frameworks**: React, Angular, Node.js, Django, ASP.NET, Bootstrap
// - **Tools**: Git/GitHub, Docker, Jenkins, Linux, AWS, Visual Studio Code
// - **Databases**: MySQL, PostgreSQL, MongoDB, Redis
// - **Specializations**: Full-stack development, Mobile development, Cloud architecture, DevOps${jobContext}

// Return only the enhanced skills in the same JSON format with **bold** formatting for important technologies, no additional text.`;
//   },

//   projects: (sectionData, jobDescription = '') => {
//     const jobContext = jobDescription ? `\n\nJob Description Context:\n${jobDescription}\n\nAlign project descriptions with these software development objectives.` : '';
    
//     return `Enhance this project description for software development audiences, emphasizing technical implementation and system impact.

// Current Project:
// Name: ${sectionData.name}
// Type: ${sectionData.type}
// Details: ${sectionData.details}

// Software Development Project Enhancement:
// - Emphasize technical architecture and implementation approach
// - Quantify project scope: users served, data processed, performance metrics
// - Highlight programming languages, frameworks, and tools used
// - Show measurable technical outcomes: load time, uptime, user engagement
// - Use software development terminology and best practices
// - Emphasize problem-solving and technical decision-making
// - Include system scalability and performance optimization
// - Focus on user experience improvements and feature development
// - **IMPORTANT**: Use **bold** markdown formatting for key technologies, performance metrics, and technical achievements
// - Bold examples: **built with React/Node.js**, **serves 25K+ daily users**, **reduced load time by 60%**, **99.8% uptime**, **real-time data processing**, **full-stack implementation**

// TECHNICAL PROJECT FRAMEWORK:
// - **Technologies Used**: Specific languages, frameworks, databases, tools
// - **System Architecture**: Design patterns, scalability solutions, performance optimization
// - **User Impact**: Number of users, engagement metrics, performance improvements
// - **Technical Challenges**: Problems solved, debugging approaches, optimization strategies${jobContext}

// Return only the enhanced project details with **bold** formatting for key technical achievements, no additional text.`;
//   },

//   education: (sectionData, jobDescription = '') => {
//     const jobContext = jobDescription ? `\n\nJob Description Context:\n${jobDescription}\n\nHighlight educational background relevant to this software development role.` : '';
    
//     return `Enhance this education entry for software development/IT presentation.

// Current Education:
// Institution: ${sectionData.institution}
// Degree: ${sectionData.degree}
// Details: ${sectionData.details || 'No additional details'}

// Software Development Education Enhancement:
// - Highlight relevant coursework: Data Structures, Algorithms, Software Engineering, Database Systems
// - Include technical projects with programming languages and frameworks used
// - Emphasize computer science fundamentals and system design knowledge
// - Add hackathons, coding competitions, and technical achievements
// - Include relevant certifications and online learning (AWS, Google Cloud, etc.)
// - Highlight technical leadership in student organizations or projects
// - Focus on academic achievements demonstrating technical excellence
// - **IMPORTANT**: Use **bold** markdown formatting for technical honors, GPA, relevant coursework, and coding achievements
// - Bold examples: **Computer Science**, **GPA: 3.8/4.0**, **Dean's List**, **Data Structures & Algorithms**, **Software Engineering**, **Hackathon Winner**, **Coding Bootcamp Graduate**

// TECHNICAL EDUCATION FOCUS:
// - **Core Coursework**: Data Structures, Algorithms, Object-Oriented Programming, Database Systems
// - **Technical Projects**: Web applications, mobile apps, system design projects
// - **Certifications**: AWS, Google Cloud, Microsoft Azure, programming certifications
// - **Achievements**: Academic honors, coding competition wins, technical leadership roles${jobContext}

// Return only the enhanced education details with **bold** formatting for technical achievements, no additional text.`;
//   }
// };

// module.exports = sectionPrompts;

const sectionPrompts = {
  professionalSummary: (sectionData, jobDescription = '') => {
    const jobContext = jobDescription ? `Job context: ${jobDescription.substring(0, 200)}...` : '';
    
    return `Enhance this professional summary with technical language and quantified achievements. Keep the same length and core message, just make it more technical and impactful:

Original: ${sectionData}

${jobContext}

Focus:
- Use technical terms and programming languages
- Add specific numbers and metrics where possible
- Keep the same structure and length
- Use **bold** for 2-3 key technical skills or achievements only

Return only the enhanced summary, nothing else.`;
  },

  experience: (sectionData, jobDescription = '') => {
    const jobContext = jobDescription ? `Match these requirements: ${jobDescription.substring(0, 200)}...` : '';
    
    return `Enhance these work experience bullet points with technical language and quantified results. Keep the same number of points and similar structure:

Position: ${sectionData.position}
Company: ${sectionData.company}
Current bullets: ${sectionData.details}

${jobContext}

Enhancement rules:
- Start with technical action verbs (developed, implemented, built, optimized)
- Add specific technologies and programming languages
- Include metrics and numbers where logical
- Use **bold** for 1-2 key technologies or metrics per bullet
- Keep bullets concise (under 20 words each)

Return only the enhanced bullet points, one per line.`;
  },

  skills: (sectionData, jobDescription = '') => {
    const jobContext = jobDescription ? `Prioritize skills matching: ${jobDescription.substring(0, 200)}...` : '';
    
    return `Enhance this skills section by making it more technical and software development focused. Keep the same structure:

Current skills: ${JSON.stringify(sectionData, null, 2)}

${jobContext}

Rules:
- Replace generic terms with specific technical terms
- Add relevant programming languages and frameworks
- Use **bold** for high-demand technical skills
- Keep the same JSON structure
- Don't add completely new categories, just enhance existing ones

Return only the enhanced skills in the same JSON format.`;
  },

  projects: (sectionData, jobDescription = '') => {
    const jobContext = jobDescription ? `Align with: ${jobDescription.substring(0, 200)}...` : '';
    
    return `Enhance this project description with technical details and measurable impact. Keep the core project the same:

Project: ${sectionData.name}
Type: ${sectionData.type}
Current details: ${sectionData.details}

${jobContext}

Enhancement:
- Add specific technologies used
- Include quantified results (users, performance, etc.)
- Use technical language
- Use **bold** for key technologies and metrics
- Keep the same project, just make it sound more technical

Return only the enhanced project details.`;
  },

  education: (sectionData, jobDescription = '') => {
    const jobContext = jobDescription ? `Relevant to: ${jobDescription.substring(0, 200)}...` : '';
    
    return `Enhance this education entry to highlight technical relevance. Don't change the basic facts:

Institution: ${sectionData.institution}
Degree: ${sectionData.degree}
Details: ${sectionData.details || 'No additional details'}

${jobContext}

Enhancement:
- Emphasize technical coursework if mentioned
- Add relevant technical achievements if logical
- Use **bold** for technical honors, GPA, or relevant coursework
- Don't invent facts, just enhance what's there

Return only the enhanced education details.`;
  }
};

module.exports = sectionPrompts;