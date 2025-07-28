const fullResumePrompts = {
  enhanceFullResume: (resumeData, jobDescription = '') => {
    const jobContext = jobDescription ? `\n\nJob Description Context:\n${jobDescription}\n\nTailor the enhancements to align with this software development/IT role.` : '';
    
    return `You are an expert technical resume writer specializing in software development and IT positions at top tech companies. Transform this resume for maximum impact in technical environments:

SOFTWARE DEVELOPMENT TEMPLATE FOCUS:
- Technical expertise and system architecture credibility
- Quantified technical achievements with specific performance metrics
- Modern technology stack and development methodologies
- ATS optimization for tech recruitment systems
- Professional tone appropriate for technical leadership review
- Strategic use of **bold** formatting for key technologies and technical achievements

Current Resume Data:
${JSON.stringify(resumeData, null, 2)}

ENHANCEMENT REQUIREMENTS:
1. Professional Summary: 2-3 lines showcasing technical leadership, years of development experience, and major system impact with **bold** key technologies and metrics
2. Experience: Transform each role to emphasize:
   - **Quantified technical achievements** (users served, performance improvements, uptime)
   - Technical scope (**codebase size**, **system architecture**, **team collaboration**)
   - Platform development and feature implementation
   - Technical action verbs (developed, architected, implemented, optimized, debugged, deployed)
3. Skills: Organize into technical categories emphasizing:
   - **Programming languages** and frameworks (JavaScript, Python, React, Node.js)
   - **Cloud platforms** and DevOps tools (AWS, Docker, CI/CD)
   - **Databases** and system architecture capabilities
   - **Certifications** (AWS Certified, Google Cloud, etc.)
4. Projects: Reframe as technical solutions highlighting:
   - **System performance** and scalability improvements
   - User impact and engagement metrics
   - Technical challenges solved and optimization achieved
5. Education: Emphasize Computer Science fundamentals, technical coursework, and coding achievements

**SELECTIVE FORMATTING**: Use **bold** markdown ONLY for the most critical quantified results, key technologies, and top technical achievements. Limit to 2-3 bold items per section to maintain readability.
**Bold examples**: **served 100K+ users**, **React/Node.js full-stack**, **reduced load time by 50%**, **AWS Certified Solutions Architect**, **99.9% uptime**${jobContext}

Return only the enhanced JSON with strategic but LIMITED **bold** formatting. Focus on technical credibility and top quantified system improvements only.`;
  },

  enhanceForATS: (resumeData, jobDescription = '') => {
    return `As an ATS optimization specialist for software development/IT roles, enhance this resume for maximum ATS compatibility in technical hiring:

Current Resume:
${JSON.stringify(resumeData, null, 2)}

${jobDescription ? `Target Job Description:\n${jobDescription}\n\n` : ''}

Focus Areas for Software Development ATS Optimization:
1. Technical Keywords: Integrate exact programming languages, frameworks, and tools mentioned in job descriptions
2. Skills: Use precise matches for technical stack (JavaScript, Python, React, Node.js, AWS, Docker, SQL)
3. Experience: Include relevant technical action verbs and performance metrics
4. Formatting: Ensure clean, ATS-friendly structure optimized for technical recruiters
5. Certifications: Highlight technical certifications and professional credentials
6. **IMPORTANT**: Use **bold** markdown formatting for critical technical keywords, performance metrics, certifications, and achievements that ATS systems and technical recruiters prioritize
7. Bold examples: **JavaScript**, **React**, **Node.js**, **AWS Certified**, **full-stack developer**, **5+ years experience**, **improved performance by 40%**, **CI/CD pipeline**, **microservices architecture**

TECHNICAL ATS PRIORITIES:
- **Programming Languages**: JavaScript, Python, Java, TypeScript, Swift, C++
- **Frameworks**: React, Angular, Node.js, Django, Spring Boot, ASP.NET
- **Cloud/DevOps**: AWS, Azure, Google Cloud, Docker, Kubernetes, Jenkins
- **Databases**: MySQL, PostgreSQL, MongoDB, Redis
- **Methodologies**: Agile, Scrum, DevOps, CI/CD, Test-Driven Development
- **Performance Metrics**: Load time, uptime, user engagement, scalability improvements

Return the ATS-optimized resume in the same JSON structure with strategic **bold** formatting focused on technical keywords and quantified achievements.`;
  }
};

module.exports = fullResumePrompts;