const sectionPrompts = {
  professionalSummary: (sectionData, jobDescription = '') => {
    const jobContext = jobDescription ? `\n\nJob Description Context:\n${jobDescription}\n\nAlign the summary with this professional role.` : '';
    
    return `Transform this professional summary for corporate executives and senior business leaders. Create authoritative, results-driven language that commands respect:

Current Summary:
${sectionData}

PROFESSIONAL ENHANCEMENT FOCUS:
- Executive presence with commanding, confident tone
- Quantified business achievements as proof of capability
- Strategic leadership scope and P&L responsibility
- Industry authority and years of proven track record
- Conservative language suitable for board-level review
- **Bold** formatting for executive credentials and major wins

REQUIREMENTS:
- 2-3 powerful sentences maximum
- Lead with **years of experience** and **leadership scope**
- Include **quantified business impact** (revenue, savings, scale)
- Use executive action verbs: "led," "delivered," "transformed," "optimized"
- Emphasize **strategic initiatives** and **organizational impact**
- Highlight relevant **certifications** or **advanced degrees**

**Bold formatting examples**: **20+ years executive leadership**, **$50M P&L responsibility**, **MBA**${jobContext}

Return only the enhanced executive summary with strategic but LIMITED **bold** formatting (max 2-3 bold items). Focus on authority, credibility, and top measurable business impact.`;
  },

  experience: (sectionData, jobDescription = '') => {
    const jobContext = jobDescription ? `\n\nJob Description Context:\n${jobDescription}\n\nTailor the experience to match these corporate requirements.` : '';
    
    return `Enhance this work experience entry for maximum impact in corporate/professional settings.

Current Experience Entry:
Position: ${sectionData.position}
Company: ${sectionData.company}
Details: ${sectionData.details}

Enhancement Focus for Professional Template:
- Use strong action verbs (led, managed, implemented, delivered, optimized)
- Quantify all achievements with specific metrics (%, $, numbers)
- Emphasize leadership, team management, and stakeholder engagement
- Highlight process improvements and efficiency gains
- Show progression and increasing responsibility
- Include relevant industry keywords and technical competencies
- Focus on business impact, cost savings, revenue generation
- Maintain professional, results-oriented tone
- **SELECTIVE**: Use **bold** markdown for only the most impactful metrics and achievements (limit 1-2 bold items per bullet point)
- Bold examples: **led team of 15**, **increased revenue by 25%**, **managed $5M budget**${jobContext}

Return only the enhanced bullet points (one per line) with LIMITED **bold** formatting for top achievements, no additional text.`;
  },

  skills: (sectionData, jobDescription = '') => {
    const jobContext = jobDescription ? `\n\nJob Description Context:\n${jobDescription}\n\nPrioritize skills that match these professional requirements.` : '';
    
    return `Enhance and optimize this skills section for corporate/professional environments.

Current Skills:
${JSON.stringify(sectionData, null, 2)}

Professional Template Skills Enhancement:
- Prioritize industry-standard and enterprise-level technologies
- Include relevant certifications and professional credentials
- Organize by relevance to corporate roles (Leadership, Technical, Business)
- Use exact terminology from job postings and industry standards
- Emphasize management and leadership capabilities
- Include business analysis and strategic planning skills
- Add project management and team coordination abilities
- Focus on skills valued in corporate hierarchies
- **IMPORTANT**: Use **bold** markdown formatting for key skills, certifications, and high-value competencies
- Bold examples: **PMP Certified**, **Enterprise Architecture**, **Six Sigma**, **Agile Leadership**, **Cloud Solutions**${jobContext}

Return only the enhanced skills in the same JSON format with **bold** formatting for important skills, no additional text.`;
  },

  projects: (sectionData, jobDescription = '') => {
    const jobContext = jobDescription ? `\n\nJob Description Context:\n${jobDescription}\n\nAlign project descriptions with these corporate objectives.` : '';
    
    return `Enhance this project description for corporate/professional audiences, emphasizing business value and stakeholder impact.

Current Project:
Name: ${sectionData.name}
Type: ${sectionData.type}
Details: ${sectionData.details}

Professional Template Project Enhancement:
- Emphasize business objectives and strategic alignment
- Quantify project scope, budget, timeline, and team size
- Highlight stakeholder management and cross-functional collaboration
- Show measurable business outcomes and ROI
- Use professional project management terminology
- Emphasize leadership roles and decision-making authority
- Include process improvements and efficiency gains
- Focus on corporate impact and organizational benefits
- **IMPORTANT**: Use **bold** markdown formatting for key project metrics, business impact, and leadership achievements
- Bold examples: **managed $2M budget**, **delivered 6 months ahead of schedule**, **led cross-functional team of 20**, **achieved 30% cost reduction**, **enterprise-wide implementation**${jobContext}

Return only the enhanced project details with **bold** formatting for key achievements, no additional text.`;
  },

  education: (sectionData, jobDescription = '') => {
    const jobContext = jobDescription ? `\n\nJob Description Context:\n${jobDescription}\n\nHighlight educational background relevant to this professional role.` : '';
    
    return `Enhance this education entry for professional/corporate presentation.

Current Education:
Institution: ${sectionData.institution}
Degree: ${sectionData.degree}
Details: ${sectionData.details || 'No additional details'}

Professional Template Education Enhancement:
- Highlight relevant coursework for business/corporate roles
- Include academic honors, scholarships, and achievements
- Emphasize leadership roles in academic organizations
- Add relevant projects with business applications
- Include professional development and continuing education
- Highlight networking and alumni connections
- Focus on academic achievements that demonstrate excellence
- **IMPORTANT**: Use **bold** markdown formatting for academic honors, GPA, leadership roles, and notable achievements
- Bold examples: **Magna Cum Laude**, **GPA: 3.8/4.0**, **President of Business Club**, **Dean's List**, **Phi Beta Kappa**, **Full Academic Scholarship**${jobContext}

Return only the enhanced education details with **bold** formatting for achievements, no additional text.`;
  }
};

module.exports = sectionPrompts;