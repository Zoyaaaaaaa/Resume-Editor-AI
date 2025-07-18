// Generate HTML Preview
function updatePreview(data) {
    const preview = document.getElementById('livePreview');
    
    if (!data.fullName && !data.email && !data.phone && data.experiences.length === 0) {
        preview.innerHTML = `
            <div style="text-align: center; color: #666; padding: 40px;">
                <h3>👋 Welcome!</h3>
                <p>Start filling out your information to see your resume come to life!</p>
            </div>
        `;
        return;
    }

    let html = '';
    
    // Header with custom styling
    html += `<div style="text-align: center; margin-bottom: 25px; font-family: 'Times New Roman', serif;">
        <h1 style="font-size: 22px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase;">${escapeHtml(data.fullName) || 'Your Name'}</h1>
        <div style="font-size: 12px; line-height: 1.4;">
            ${data.phone ? escapeHtml(data.phone) : ''}${data.email ? ` • <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a>` : ''}
            ${data.linkedin ? `<br><a href="https://${escapeHtml(data.linkedin)}" target="_blank">${escapeHtml(data.linkedin)}</a>` : ''}
        </div>
    </div>`;

    // Professional Summary
    if (data.summary) {
        html += `<div style="border-top: 1px solid #000; margin-top: 15px; padding-top: 5px;">
            <h2 style="font-size: 14px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px;">Professional Summary</h2>
            <ul style="margin-left: 20px; padding-left: 0; list-style-type: none; font-size: 12px; line-height: 1.5;">
                ${data.summary.split('\n').filter(item => item.trim()).map(item => `
                <li style="margin-bottom: 5px; position: relative; padding-left: 15px;">
                    <span style="position: absolute; left: 0; top: 6px; width: 5px; height: 5px; background-color: #000; border-radius: 50%;"></span>
                    ${escapeHtml(item.trim())}
                </li>`).join('')}
            </ul>
        </div>`;
    }

    // Education
    if (data.education.length > 0) {
        html += `<div style="border-top: 1px solid #000; margin-top: 15px; padding-top: 5px;">
            <h2 style="font-size: 14px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px;">Education</h2>`;
        
        data.education.forEach(edu => {
            html += `<div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 12px;">
                    <span>${escapeHtml(edu.institution)}</span>
                    <span>${escapeHtml(edu.year)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-style: italic; font-size: 11px;">
                    <span>${escapeHtml(edu.degree)}</span>
                    <span>${edu.gpa ? 'GPA: ' + escapeHtml(edu.gpa) : ''}</span>
                </div>
            </div>`;
        });
        
        html += `</div>`;
    }

    // Experience
    if (data.experiences.length > 0) {
        html += `<div style="border-top: 1px solid #000; margin-top: 15px; padding-top: 5px;">
            <h2 style="font-size: 14px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px;">Professional Experience</h2>`;
        
        data.experiences.forEach(exp => {
            html += `<div style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 12px;">
                    <span>${escapeHtml(exp.jobTitle)}</span>
                    <span>${escapeHtml(exp.duration)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-style: italic; font-size: 11px; margin-bottom: 8px;">
                    <span>${escapeHtml(exp.company)}</span>
                    <span>${escapeHtml(exp.location)}</span>
                </div>
                <ul style="margin-left: 20px; padding-left: 0; list-style-type: none; font-size: 12px; line-height: 1.5;">
                    ${exp.description.split('\n').filter(item => item.trim()).map(item => `
                    <li style="margin-bottom: 5px; position: relative; padding-left: 15px;">
                        <span style="position: absolute; left: 0; top: 6px; width: 5px; height: 5px; background-color: #000; border-radius: 50%;"></span>
                        ${escapeHtml(item.trim())}
                    </li>`).join('')}
                </ul>
            </div>`;
        });
        
        html += `</div>`;
    }

    // Projects
    if (data.projects.length > 0) {
        html += `<div style="border-top: 1px solid #000; margin-top: 15px; padding-top: 5px;">
            <h2 style="font-size: 14px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px;">Projects</h2>`;
        
        data.projects.forEach(proj => {
            html += `<div style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 12px;">
                    <span>${escapeHtml(proj.name)}</span>
                    <span>${escapeHtml(proj.year)}</span>
                </div>
                <div style="font-style: italic; font-size: 11px; margin-bottom: 8px;">
                    ${escapeHtml(proj.technologies)}
                </div>
                <ul style="margin-left: 20px; padding-left: 0; list-style-type: none; font-size: 12px; line-height: 1.5;">
                    ${proj.description.split('\n').filter(item => item.trim()).map(item => `
                    <li style="margin-bottom: 5px; position: relative; padding-left: 15px;">
                        <span style="position: absolute; left: 0; top: 6px; width: 5px; height: 5px; background-color: #000; border-radius: 50%;"></span>
                        ${escapeHtml(item.trim())}
                    </li>`).join('')}
                </ul>
            </div>`;
        });
        
        html += `</div>`;
    }

    // Skills
    if (data.skills) {
        html += `<div style="border-top: 1px solid #000; margin-top: 15px; padding-top: 5px;">
            <h2 style="font-size: 14px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px;">Technical Skills</h2>
            <ul style="margin-left: 20px; padding-left: 0; list-style-type: none; font-size: 12px; line-height: 1.5;">
                ${data.skills.split('\n').filter(item => item.trim()).map(item => `
                <li style="margin-bottom: 5px; position: relative; padding-left: 15px;">
                    <span style="position: absolute; left: 0; top: 6px; width: 5px; height: 5px; background-color: #000; border-radius: 50%;"></span>
                    ${escapeHtml(item.trim())}
                </li>`).join('')}
            </ul>
        </div>`;
    }

    preview.innerHTML = html;
}

// Escape HTML special characters
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Refresh Preview
function refreshPreview() {
    updateResume();
    updateStatus('Refreshed');
}