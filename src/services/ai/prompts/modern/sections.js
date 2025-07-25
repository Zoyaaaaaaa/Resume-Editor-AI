const sectionPrompts = {
  professionalSummary: (sectionData, jobDescription = '') => {
    const jobContext = jobDescription ? `\n\nJob Description Context:\n${jobDescription}\n\nAlign the summary with this creative/innovative role.` : '';
    
    return `Craft a compelling professional story for creative, tech, and innovative roles. Create an authentic narrative that showcases unique perspective and creative problem-solving:

Current Summary:
${sectionData}

CREATIVE ENHANCEMENT FOCUS:
- Authentic personal voice with creative storytelling
- Innovative problem-solving and user-centered thinking
- Passion for cutting-edge technology and creative solutions
- Collaborative spirit and cross-functional impact
- Growth mindset and continuous learning approach
- **Bold** formatting for creative achievements and innovations

REQUIREMENTS:
- 2-3 engaging sentences that tell your unique story
- Lead with **creative specialization** and **innovative approach**
- Showcase **user impact** and **technology expertise**
- Use creative action verbs: "designed," "innovated," "crafted," "pioneered"
- Highlight **modern methodologies** and **creative tools**
- Express passion for **user experience** and **creative solutions**

**Bold formatting examples**: **UX/UI design specialist**, **React/TypeScript developer**, **improved user engagement by 75%**${jobContext}

Return only the enhanced creative summary with inspiring but LIMITED **bold** formatting (max 2-3 bold items). Focus on innovation, user impact, and authentic creative voice.`;
  },

  experience: (sectionData, jobDescription = '') => {
    const jobContext = jobDescription ? `\n\nJob Description Context:\n${jobDescription}\n\nTailor the experience to match these creative/innovative requirements.` : '';
    
    return `Enhance this work experience entry for maximum impact in creative, tech, and innovative environments.

Current Experience Entry:
Position: ${sectionData.position}
Company: ${sectionData.company}
Details: ${sectionData.details}

Enhancement Focus for Modern Template:
- Use dynamic action verbs (designed, innovated, created, transformed, pioneered)
- Emphasize creative problem-solving and innovative solutions
- Highlight user impact, engagement metrics, and experience improvements
- Show collaborative achievements and cross-functional teamwork
- Include creative process and design thinking methodologies
- Focus on technology adoption and digital transformation
- Emphasize agile practices and iterative improvement
- Use modern industry terminology and creative language
- **IMPORTANT**: Use **bold** markdown formatting for creative innovations, user impact metrics, technologies used, and collaborative achievements
- Bold examples: **designed user-centered interfaces**, **increased user engagement by 60%**, **led agile development**, **implemented React/Node.js stack**, **mentored junior developers**${jobContext}

Return only the enhanced bullet points (one per line) with **bold** formatting for creative achievements, no additional text.`;
  },

  skills: (sectionData, jobDescription = '') => {
    const jobContext = jobDescription ? `\n\nJob Description Context:\n${jobDescription}\n\nPrioritize skills that match these creative/innovative requirements.` : '';
    
    return `Enhance and optimize this skills section for creative, tech, and innovative environments.

Current Skills:
${JSON.stringify(sectionData, null, 2)}

Modern Template Skills Enhancement:
- Prioritize cutting-edge and trending technologies
- Include creative tools and design software
- Organize by relevance to modern roles (Creative, Technical, Collaborative)
- Use contemporary terminology and emerging technologies
- Emphasize design thinking and user experience skills
- Include agile methodologies and modern development practices
- Add collaboration tools and remote work capabilities
- Focus on skills valued in innovative and creative industries
- **IMPORTANT**: Use **bold** markdown formatting for cutting-edge technologies, creative tools, and in-demand modern skills
- Bold examples: **React/Next.js**, **Figma/Adobe Creative Suite**, **Machine Learning**, **Cloud Architecture**, **Agile/Scrum**, **Design Systems**${jobContext}

Return only the enhanced skills in the same JSON format with **bold** formatting for modern/innovative skills, no additional text.`;
  },

  projects: (sectionData, jobDescription = '') => {
    const jobContext = jobDescription ? `\n\nJob Description Context:\n${jobDescription}\n\nAlign project descriptions with these creative/innovative objectives.` : '';
    
    return `Enhance this project description for creative, tech, and innovative audiences, emphasizing user experience and creative impact.

Current Project:
Name: ${sectionData.name}
Type: ${sectionData.type}
Details: ${sectionData.details}

Modern Template Project Enhancement:
- Emphasize user experience and creative problem-solving approach
- Highlight innovative technologies and creative methodologies used
- Show user engagement metrics and experience improvements
- Include creative process and iterative design thinking
- Emphasize collaboration with designers, developers, and stakeholders
- Focus on visual impact and user-centered outcomes
- Use modern project terminology and creative language
- Show innovation and creative solutions to complex problems
- **IMPORTANT**: Use **bold** markdown formatting for innovative technologies, user impact metrics, creative processes, and collaborative achievements
- Bold examples: **built with React/TypeScript**, **improved user satisfaction by 75%**, **designed using human-centered approach**, **collaborated with cross-functional team**, **open-source contribution**${jobContext}

Return only the enhanced project details with **bold** formatting for innovative achievements, no additional text.`;
  },

  education: (sectionData, jobDescription = '') => {
    const jobContext = jobDescription ? `\n\nJob Description Context:\n${jobDescription}\n\nHighlight educational background relevant to this creative/innovative role.` : '';
    
    return `Enhance this education entry for creative, tech, and innovative industry presentation.

Current Education:
Institution: ${sectionData.institution}
Degree: ${sectionData.degree}
Details: ${sectionData.details || 'No additional details'}

Modern Template Education Enhancement:
- Highlight creative coursework and design thinking projects
- Include innovative projects with user impact and creative solutions
- Emphasize collaboration in creative teams and cross-disciplinary work
- Add relevant creative competitions, hackathons, and design challenges
- Include modern technologies and creative tools learned
- Highlight creative leadership and community involvement
- Focus on educational achievements that demonstrate creativity and innovation
- **IMPORTANT**: Use **bold** markdown formatting for creative achievements, innovative projects, technical coursework, and leadership roles
- Bold examples: **UI/UX Design Specialization**, **won hackathon**, **led design team**, **published research**, **full-stack development**, **creative portfolio**${jobContext}

Return only the enhanced education details with **bold** formatting for creative achievements, no additional text.`;
  }
};

module.exports = sectionPrompts;