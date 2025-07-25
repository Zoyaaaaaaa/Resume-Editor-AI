const fullResumePrompts = {
  enhanceFullResume: (resumeData, jobDescription = '') => {
    const jobContext = jobDescription ? `\n\nJob Description Context:\n${jobDescription}\n\nTailor the enhancements to align with this creative/innovative role.` : '';
    
    return `You are an expert resume writer for creative, tech, and innovative industries. Transform this resume to showcase creativity, innovation, and modern industry expertise:

MODERN TEMPLATE FOCUS:
- Creative storytelling with authentic personal voice
- Innovation and problem-solving narratives
- User-centered impact and engagement metrics
- Cutting-edge technologies and modern methodologies
- Collaborative achievements and cross-functional success
- Dynamic language that reflects startup/creative culture
- Strategic **bold** formatting for innovation highlights

Current Resume Data:
${JSON.stringify(resumeData, null, 2)}

CREATIVE ENHANCEMENT REQUIREMENTS:
1. Professional Summary: Compelling 2-3 line story showcasing unique creative perspective, innovative approach, and passion for user impact with **bold** standout qualities
2. Experience: Reimagine each role to highlight:
   - **User impact metrics** (engagement, satisfaction, conversion rates)
   - Creative problem-solving and innovative solutions
   - **Modern tech stacks** and cutting-edge tools
   - Collaborative wins and cross-functional achievements
   - Creative process and design thinking applications
3. Skills: Organize into modern categories emphasizing:
   - **Trending technologies** (React, TypeScript, AI/ML, Cloud)
   - **Creative tools** (Figma, Adobe Creative Suite)
   - Modern methodologies (Agile, Design Thinking, DevOps)
4. Projects: Transform into innovation showcases highlighting:
   - **User experience improvements** and creative solutions
   - Technical innovation and modern architecture
   - Creative process and iterative design thinking
   - Open source contributions and community impact
5. Education: Emphasize creative coursework, hackathons, and innovative projects

**SELECTIVE CREATIVE FORMATTING**: Use **bold** markdown ONLY for the most impressive innovations, key technologies, and standout user impact metrics. Limit to 2-3 bold items per section for clean readability.
**Bold examples**: **improved user satisfaction by 85%**, **React/TypeScript**, **design thinking leader**, **award-winning UI**${jobContext}

Return only the enhanced JSON with strategic but LIMITED **bold** formatting. Focus on top innovations and user impact achievements only.`;
  },

  enhanceForCreativity: (resumeData, jobDescription = '') => {
    return `As a creative industry specialist, enhance this resume to showcase innovation, creativity, and modern industry alignment:

Current Resume:
${JSON.stringify(resumeData, null, 2)}

${jobDescription ? `Target Job Description:\n${jobDescription}\n\n` : ''}

Focus Areas for Modern Creative Enhancement:
1. Storytelling: Create compelling narrative around creative journey
2. Innovation: Highlight creative problem-solving and innovative solutions
3. Technology: Emphasize cutting-edge tools and modern methodologies
4. Collaboration: Show cross-functional teamwork and creative partnerships
5. Impact: Focus on user experience and creative/technical outcomes
6. **IMPORTANT**: Use **bold** markdown formatting for creative innovations, design achievements, modern technologies, and user impact metrics
7. Bold examples: **innovative design solutions**, **award-winning campaign**, **improved user satisfaction by 90%**, **modern React/TypeScript stack**, **creative problem-solver**

Return the creativity-enhanced resume in the same JSON structure with strategic **bold** formatting.`;
  }
};

module.exports = fullResumePrompts;