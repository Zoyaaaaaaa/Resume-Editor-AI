const fullResumePrompts = {
  enhanceFullResume: (resumeData, jobDescription = '') => {
    const jobContext = jobDescription ? `\n\nJob Description Context:\n${jobDescription}\n\nTailor the enhancements to align with this corporate/professional role.` : '';
    
    return `You are an expert corporate resume writer specializing in Fortune 500 companies and traditional business environments. Transform this resume for maximum impact in conservative corporate settings:

PROFESSIONAL TEMPLATE FOCUS:
- Executive presence and leadership credibility
- Quantified business achievements with specific metrics
- Industry-standard terminology and corporate language  
- ATS optimization for enterprise recruitment systems
- Conservative tone appropriate for C-suite review
- Strategic use of **bold** formatting for key metrics and achievements

Current Resume Data:
${JSON.stringify(resumeData, null, 2)}

ENHANCEMENT REQUIREMENTS:
1. Professional Summary: 2-3 lines showcasing executive leadership, years of experience, and major business impact with **bold** key metrics
2. Experience: Transform each role to emphasize:
   - **Quantified achievements** (revenue, cost savings, efficiency gains)
   - Leadership scope (**team size**, **budget responsibility**)
   - Strategic initiatives and business transformation
   - Industry-standard action verbs (managed, implemented, delivered, optimized)
3. Skills: Organize into professional categories emphasizing:
   - **Certifications** and professional credentials
   - Enterprise technologies and business systems
   - Leadership and management capabilities
4. Projects: Reframe as strategic business initiatives highlighting:
   - **Business value** and ROI
   - Stakeholder impact and organizational change
   - Process improvements and efficiency gains
5. Education: Emphasize business relevance, honors, and leadership roles

**SELECTIVE FORMATTING**: Use **bold** markdown ONLY for the most critical quantified results, leadership scope, and top achievements. Limit to 2-3 bold items per section to maintain readability.
**Bold examples**: **$2.5M revenue increase**, **led 45-person team**, **MBA**, **PMP certified**${jobContext}

Return only the enhanced JSON with strategic but LIMITED **bold** formatting. Focus on corporate credibility and top quantified achievements only.`;
  },

  enhanceForATS: (resumeData, jobDescription = '') => {
    return `As an ATS optimization specialist for professional/corporate roles, enhance this resume for maximum ATS compatibility:

Current Resume:
${JSON.stringify(resumeData, null, 2)}

${jobDescription ? `Target Job Description:\n${jobDescription}\n\n` : ''}

Focus Areas for Professional ATS Optimization:
1. Keywords: Integrate industry-standard professional terminology
2. Skills: Use exact matches for technical and soft skills
3. Experience: Include relevant action verbs and metrics
4. Formatting: Ensure clean, ATS-friendly structure
5. Certifications: Highlight professional certifications and credentials
6. **IMPORTANT**: Use **bold** markdown formatting for critical keywords, metrics, certifications, and achievements that ATS systems and recruiters prioritize
7. Bold examples: **PMP Certified**, **10+ years management experience**, **Fortune 500**, **increased efficiency by 35%**, **enterprise solutions**

Return the ATS-optimized resume in the same JSON structure with strategic **bold** formatting.`;
  }
};

module.exports = fullResumePrompts;