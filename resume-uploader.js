class ResumeUploader {
    constructor() {
        this.isProcessing = false;
        this.init();
    }

    init() {
        this.createUploadButton();
        this.setupEventListeners();
    }

    createUploadButton() {
        const templateSelector = document.querySelector('.template-selector');
        
        const uploadSection = document.createElement('div');
        uploadSection.className = 'upload-section';
        uploadSection.innerHTML = `
            <div class="upload-container">
                <input type="file" id="resumeUpload" accept=".pdf" style="display: none;">
                <button class="btn upload-btn" id="uploadResumeBtn" onclick="resumeUploader.triggerFileUpload()">
                    📄 Upload Your Resume
                </button>
                <div class="upload-status" id="uploadStatus" style="display: none; margin-top: 10px; padding: 10px; border-radius: 5px;"></div>
            </div>
        `;
        
        templateSelector.insertAdjacentElement('afterend', uploadSection);
    }

    setupEventListeners() {
        const fileInput = document.getElementById('resumeUpload');
        fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
    }

    triggerFileUpload() {
        document.getElementById('resumeUpload').click();
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            this.showStatus('Please upload a PDF file.', 'error');
            return;
        }

        this.showStatus('Processing your resume...', 'loading');
        this.isProcessing = true;

        try {
            const pdfText = await this.extractTextFromPDF(file);
            const resumeData = await this.parseResumeWithBackend(pdfText);
            this.fillFormWithData(resumeData);
            this.showStatus('Resume uploaded and filled successfully!', 'success');
        } catch (error) {
            console.error('Error processing resume:', error);
            this.showStatus('Error processing resume. Please try again.', 'error');
        } finally {
            this.isProcessing = false;
        }
    }

    async extractTextFromPDF(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async function(e) {
                try {
                    // Check if PDF.js is available
                    if (typeof pdfjsLib !== 'undefined') {
                        // Set worker source for PDF.js
                        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                        
                        const pdf = await pdfjsLib.getDocument({data: e.target.result}).promise;
                        let fullText = '';
                        
                        for (let i = 1; i <= pdf.numPages; i++) {
                            const page = await pdf.getPage(i);
                            const textContent = await page.getTextContent();
                            const pageText = textContent.items.map(item => item.str).join(' ');
                            fullText += pageText + '\n';
                        }
                        
                        if (fullText.trim()) {
                            resolve(fullText);
                        } else {
                            // Fallback if no text extracted
                            reject(new Error('No text could be extracted from the PDF. Please ensure the PDF contains selectable text.'));
                        }
                    } else {
                        // Fallback: send raw data to backend for processing
                        const arrayBuffer = e.target.result;
                        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
                        resolve(`[PDF_BINARY_DATA]${base64}`);
                    }
                } catch (error) {
                    console.error('PDF extraction error:', error);
                    reject(new Error(`Failed to process PDF: ${error.message}`));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read PDF file'));
            reader.readAsArrayBuffer(file);
        });
    }

    async parseResumeWithBackend(pdfContent) {
        const response = await fetch('/api/parse-resume', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                resumeContent: pdfContent
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to parse resume');
        }
        
        return result.data;
    }

    fillFormWithData(data) {
        // Clear existing form data
        this.clearAllSections();

        // Fill personal information
        if (data.fullName) document.getElementById('fullName').value = data.fullName;
        if (data.email) document.getElementById('email').value = data.email;
        if (data.phone) document.getElementById('phone').value = data.phone;
        if (data.address) document.getElementById('address').value = data.address;
        if (data.linkedin) document.getElementById('linkedin').value = data.linkedin;
        if (data.website) document.getElementById('website').value = data.website;
        if (data.summary) document.getElementById('summary').value = data.summary;
        if (data.skills) document.getElementById('skills').value = data.skills;

        // Fill experiences
        if (data.experiences && data.experiences.length > 0) {
            const experienceContainer = document.getElementById('experienceContainer');
            experienceContainer.innerHTML = '';
            
            data.experiences.forEach((exp, index) => {
                addExperience();
                const section = experienceContainer.children[index];
                if (exp.jobTitle) section.querySelector('.jobTitle').value = exp.jobTitle;
                if (exp.company) section.querySelector('.company').value = exp.company;
                if (exp.duration) section.querySelector('.duration').value = exp.duration;
                if (exp.location && section.querySelector('.location')) section.querySelector('.location').value = exp.location;
                if (exp.description) section.querySelector('.description').value = exp.description;
            });
        }

        // Fill education
        if (data.education && data.education.length > 0) {
            const educationContainer = document.getElementById('educationContainer');
            educationContainer.innerHTML = '';
            
            data.education.forEach((edu, index) => {
                addEducation();
                const section = educationContainer.children[index];
                if (edu.degree) section.querySelector('.degree').value = edu.degree;
                if (edu.institution) section.querySelector('.institution').value = edu.institution;
                if (edu.year) section.querySelector('.year').value = edu.year;
                if (edu.gpa) section.querySelector('.gpa').value = edu.gpa;
            });
        }

        // Fill projects
        if (data.projects && data.projects.length > 0) {
            const projectsContainer = document.getElementById('projectsContainer');
            projectsContainer.innerHTML = '';
            
            data.projects.forEach((proj, index) => {
                addProject();
                const section = projectsContainer.children[index];
                if (proj.name) section.querySelector('.projectName').value = proj.name;
                if (proj.technologies) section.querySelector('.technologies').value = proj.technologies;
                if (proj.description) section.querySelector('.projectDescription').value = proj.description;
                if (proj.year && section.querySelector('.projectYear')) section.querySelector('.projectYear').value = proj.year;
                if (proj.location && section.querySelector('.projectLocation')) section.querySelector('.projectLocation').value = proj.location;
            });
        }

        // Update the resume after filling all data
        updateResume();
    }

    clearAllSections() {
        // Clear personal info
        document.getElementById('fullName').value = '';
        document.getElementById('email').value = '';
        document.getElementById('phone').value = '';
        document.getElementById('address').value = '';
        document.getElementById('linkedin').value = '';
        document.getElementById('website').value = '';
        document.getElementById('summary').value = '';
        document.getElementById('skills').value = '';

        // Clear dynamic sections
        document.querySelectorAll('#experienceContainer .dynamic-section').forEach(section => section.remove());
        document.querySelectorAll('#educationContainer .dynamic-section').forEach(section => section.remove());
        document.querySelectorAll('#projectsContainer .dynamic-section').forEach(section => section.remove());
    }

    showStatus(message, type) {
        const statusDiv = document.getElementById('uploadStatus');
        statusDiv.style.display = 'block';
        statusDiv.textContent = message;
        
        // Remove all status classes
        statusDiv.className = 'upload-status';
        
        // Add appropriate class
        if (type === 'error') {
            statusDiv.style.backgroundColor = '#fee';
            statusDiv.style.color = '#c33';
            statusDiv.style.border = '1px solid #fcc';
        } else if (type === 'success') {
            statusDiv.style.backgroundColor = '#efe';
            statusDiv.style.color = '#363';
            statusDiv.style.border = '1px solid #cfc';
        } else if (type === 'loading') {
            statusDiv.style.backgroundColor = '#fef5e7';
            statusDiv.style.color = '#8a6d3b';
            statusDiv.style.border = '1px solid #faebcc';
        }

        // Auto-hide after 5 seconds for success/error messages
        if (type !== 'loading') {
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 5000);
        }
    }
}

// Initialize the resume uploader when the page loads
let resumeUploader;
document.addEventListener('DOMContentLoaded', () => {
    resumeUploader = new ResumeUploader();
});