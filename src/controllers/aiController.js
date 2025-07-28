// // const aiService = require('../services/aiService');
// // const aiServiceCoordinator = require('../services/ai');
// // const multer = require('multer');
// // const pdfParse = require('pdf-parse');
// // const { validationResult } = require('express-validator');
// // const logger = require('../utils/logger');
// // const sharp = require('sharp');

// // // Configure multer for file uploads
// // const upload = multer({
// //   storage: multer.memoryStorage(),
// //   limits: {
// //     fileSize: 10 * 1024 * 1024, // 10MB limit
// //   },
// //   fileFilter: (req, file, cb) => {
// //     if (file.mimetype === 'application/pdf') {
// //       cb(null, true);
// //     } else {
// //       cb(new Error('Only PDF files are allowed'), false);
// //     }
// //   }
// // });

// // class AIController {
// //   constructor() {
// //     this.upload = upload;
// //     // Bind methods to preserve 'this' context when used as callbacks
// //     this.parseResume = this.parseResume.bind(this);
// //     this.convertPdfToImages = this.convertPdfToImages.bind(this);
// //     this.convertWithPdf2pic = this.convertWithPdf2pic.bind(this);
// //     this.convertWithPdfPoppler = this.convertWithPdfPoppler.bind(this);
// //     this.calculateATSScore = this.calculateATSScore.bind(this);
// //     this.enhanceSection = this.enhanceSection.bind(this);
// //     this.getStatus = this.getStatus.bind(this);
// //     this.parseResumeText = this.parseResumeText.bind(this);
// //     this.enhanceFullResume = this.enhanceFullResume.bind(this);
// //     this.enhanceSectionWithTemplate = this.enhanceSectionWithTemplate.bind(this);
// //     this.getTemplateRecommendation = this.getTemplateRecommendation.bind(this);
// //     this.getTemplateCapabilities = this.getTemplateCapabilities.bind(this);
// //     this.getAvailableTemplates = this.getAvailableTemplates.bind(this);
// //     this.getEnhancedStatus = this.getEnhancedStatus.bind(this);
// //   }

// //   async convertWithPdf2pic(pdfBuffer) {
// //     try {
// //       const pdf2pic = require('pdf2pic');
// //       logger.info('Attempting PDF conversion with pdf2pic');
      
// //       const fs = require('fs');
// //       const path = require('path');
      
// //       // Ensure temp directory exists
// //       const tempDir = './temp';
// //       if (!fs.existsSync(tempDir)) {
// //         fs.mkdirSync(tempDir, { recursive: true });
// //       }
      
// //       const outputPrefix = `resume_${Date.now()}`;
      
// //       // Configure pdf2pic options with more conservative settings
// //       const convertOptions = {
// //         density: 200,           // Lower DPI to reduce memory usage
// //         saveFilename: outputPrefix,
// //         savePath: tempDir,
// //         format: "png",
// //         width: 1600,           // Smaller size to reduce memory issues
// //         height: 2200,          
// //         quality: 90
// //       };
      
// //       // Convert PDF to images using pdf2pic
// //       const convert = pdf2pic.fromBuffer(pdfBuffer, convertOptions);
// //       const results = await convert.bulk(-1, { responseType: "buffer" });
      
// //       if (!results || results.length === 0) {
// //         throw new Error('No images generated from PDF with pdf2pic');
// //       }
      
// //       const imageBuffers = [];
// //       for (const result of results) {
// //         if (result.buffer) {
// //           imageBuffers.push(result.buffer);
// //         }
        
// //         // Clean up any temporary files
// //         if (result.path && fs.existsSync(result.path)) {
// //           try {
// //             fs.unlinkSync(result.path);
// //           } catch (e) {
// //             logger.warn('Could not delete temp file:', e.message);
// //           }
// //         }
// //       }
      
// //       logger.info(`Successfully converted PDF using pdf2pic: ${imageBuffers.length} pages`);
// //       return imageBuffers;
      
// //     } catch (error) {
// //       logger.error('pdf2pic conversion failed:', error.message);
// //       throw error;
// //     }
// //   }

// //   async convertWithPdfPoppler(pdfBuffer) {
// //     try {
// //       const pdfPoppler = require('pdf-poppler');
// //       logger.info('Attempting PDF conversion with pdf-poppler');
      
// //       const fs = require('fs');
// //       const path = require('path');
      
// //       // Ensure temp directory exists
// //       const tempDir = './temp';
// //       if (!fs.existsSync(tempDir)) {
// //         fs.mkdirSync(tempDir, { recursive: true });
// //       }
      
// //       // Write buffer to temporary file
// //       const tempPdfPath = path.join(tempDir, `temp_${Date.now()}.pdf`);
// //       fs.writeFileSync(tempPdfPath, pdfBuffer);
      
// //       const options = {
// //         format: 'png',
// //         out_dir: tempDir,
// //         out_prefix: `resume_${Date.now()}`,
// //         page: null // Convert all pages
// //       };
      
// //       const results = await pdfPoppler.convert(tempPdfPath, options);
      
// //       const imageBuffers = [];
// //       for (const imagePath of results) {
// //         if (fs.existsSync(imagePath)) {
// //           const buffer = fs.readFileSync(imagePath);
// //           imageBuffers.push(buffer);
          
// //           // Clean up
// //           try {
// //             fs.unlinkSync(imagePath);
// //           } catch (e) {
// //             logger.warn('Could not delete temp image:', e.message);
// //           }
// //         }
// //       }
      
// //       // Clean up temp PDF
// //       if (fs.existsSync(tempPdfPath)) {
// //         try {
// //           fs.unlinkSync(tempPdfPath);
// //         } catch (e) {
// //           logger.warn('Could not delete temp PDF:', e.message);
// //         }
// //       }
      
// //       if (imageBuffers.length === 0) {
// //         throw new Error('No images generated from PDF with pdf-poppler');
// //       }
      
// //       logger.info(`Successfully converted PDF using pdf-poppler: ${imageBuffers.length} pages`);
// //       return imageBuffers;
      
// //     } catch (error) {
// //       logger.error('pdf-poppler conversion failed:', error.message);
// //       throw error;
// //     }
// //   }

// //   async convertPdfToImages(pdfBuffer) {
// //     const methods = [
// //       { name: 'pdf2pic', func: this.convertWithPdf2pic },
// //       { name: 'pdf-poppler', func: this.convertWithPdfPoppler }
// //     ];
    
// //     let lastError;
    
// //     for (const method of methods) {
// //       try {
// //         logger.info(`Trying PDF conversion with ${method.name}`);
// //         const imageBuffers = await method.func(pdfBuffer);
        
// //         if (imageBuffers && imageBuffers.length > 0) {
// //           // Optimize images with Sharp
// //           const optimizedBuffers = [];
// //           for (const buffer of imageBuffers) {
// //             try {
// //               const optimized = await sharp(buffer)
// //                 .sharpen()
// //                 .modulate({
// //                   brightness: 1.1,
// //                   contrast: 1.2
// //                 })
// //                 .png({ quality: 100 })
// //                 .resize(2400, 3200, {
// //                   fit: 'inside',
// //                   withoutEnlargement: true
// //                 })
// //                 .toBuffer();
              
// //               optimizedBuffers.push(optimized);
// //             } catch (sharpError) {
// //               logger.warn('Sharp optimization failed, using original buffer:', sharpError.message);
// //               optimizedBuffers.push(buffer);
// //             }
// //           }
          
// //           logger.info(`Successfully converted and optimized PDF: ${optimizedBuffers.length} pages`);
// //           return optimizedBuffers;
// //         }
// //       } catch (error) {
// //         logger.warn(`${method.name} failed:`, error.message);
// //         lastError = error;
// //         continue;
// //       }
// //     }
    
// //     // If all methods failed, throw the last error
// //     throw new Error(`All PDF conversion methods failed. Last error: ${lastError?.message || 'Unknown error'}`);
// //   }

// //   async parseResume(req, res) {
// //     try {
// //       if (!req.file) {
// //         return res.status(400).json({
// //           success: false,
// //           error: 'No PDF file uploaded'
// //         });
// //       }

// //       logger.info('Parsing uploaded resume PDF using vision-based approach');
      
// //       let parsedData;
// //       let processingMethod = 'vision-based';
// //       let pagesProcessed = 0;
      
// //       try {
// //         // Try vision-based approach first
// //         const imageBuffers = await this.convertPdfToImages(req.file.buffer);
        
// //         if (imageBuffers && imageBuffers.length > 0) {
// //           parsedData = await aiService.parseResumeFromImages(imageBuffers);
// //           pagesProcessed = imageBuffers.length;
// //         } else {
// //           throw new Error('No images generated from PDF');
// //         }
// //       } catch (visionError) {
// //         logger.warn('Vision-based parsing failed, falling back to text extraction:', visionError.message);
        
// //         // Fallback to text-based parsing
// //         try {
// //           const pdfData = await pdfParse(req.file.buffer);
// //           if (pdfData.text && pdfData.text.trim().length > 0) {
// //             parsedData = await aiService.parseResume(pdfData.text);
// //             processingMethod = 'text-based-fallback';
// //             pagesProcessed = pdfData.numpages || 1;
// //           } else {
// //             throw new Error('No text content found in PDF');
// //           }
// //         } catch (textError) {
// //           logger.error('Both vision and text parsing failed:', textError.message);
// //           throw new Error('Unable to parse PDF: Both vision and text extraction failed');
// //         }
// //       }
      
// //       // Also try to extract text for debugging purposes
// //       let extractedText = '';
// //       try {
// //         const pdfData = await pdfParse(req.file.buffer);
// //         extractedText = pdfData.text;
// //       } catch (textError) {
// //         logger.warn('Text extraction failed:', textError.message);
// //       }
      
// //       res.json({
// //         success: true,
// //         data: {
// //           parsed: parsedData,
// //           extractedText: extractedText,
// //           fileName: req.file.originalname,
// //           fileSize: req.file.size,
// //           pagesProcessed: pagesProcessed,
// //           processingMethod: processingMethod
// //         }
// //       });
      
// //     } catch (error) {
// //       logger.error('Resume parsing failed:', error);
      
// //       if (error.message.includes('rate limit')) {
// //         return res.status(429).json({
// //           success: false,
// //           error: error.message
// //         });
// //       }
      
// //       if (error.message.includes('authentication')) {
// //         return res.status(500).json({
// //           success: false,
// //           error: 'AI service configuration error'
// //         });
// //       }
      
// //       res.status(500).json({
// //         success: false,
// //         error: error.message || 'Failed to parse resume'
// //       });
// //     }
// //   }

// //   async calculateATSScore(req, res) {
// //     try {
// //       // Check for validation errors
// //       const errors = validationResult(req);
// //       if (!errors.isEmpty()) {
// //         return res.status(400).json({
// //           success: false,
// //           error: 'Validation failed',
// //           details: errors.array()
// //         });
// //       }

// //       const { resumeData, jobDescription } = req.body;
      
// //       logger.info('Calculating ATS score');
      
// //       const atsAnalysis = await aiService.calculateATSScore(resumeData, jobDescription);
      
// //       res.json({
// //         success: true,
// //         data: atsAnalysis
// //       });
      
// //     } catch (error) {
// //       logger.error('ATS score calculation error:', error);
      
// //       if (error.message.includes('rate limit')) {
// //         return res.status(429).json({
// //           success: false,
// //           error: error.message
// //         });
// //       }
      
// //       res.status(500).json({
// //         success: false,
// //         error: 'Failed to calculate ATS score'
// //       });
// //     }
// //   }

// //   async enhanceSection(req, res) {
// //     try {
// //       // Check for validation errors
// //       const errors = validationResult(req);
// //       if (!errors.isEmpty()) {
// //         return res.status(400).json({
// //           success: false,
// //           error: 'Validation failed',
// //           details: errors.array()
// //         });
// //       }

// //       const { sectionData, sectionType, jobDescription, templateName } = req.body;
      
// //       // Use template-specific enhancement if templateName is provided, otherwise default to professional
// //       const templateToUse = templateName || 'professional';
      
// //       logger.info(`Enhancing ${sectionType} section with ${templateToUse} template`);
      
// //       // Use template-specific enhancement
// //       const enhancedResult = await aiServiceCoordinator.enhanceSectionWithTemplate(
// //         templateToUse, 
// //         sectionData, 
// //         sectionType, 
// //         jobDescription || ''
// //       );
      
// //       res.json({
// //         success: true,
// //         data: {
// //           enhanced: enhancedResult.enhanced,
// //           templateUsed: enhancedResult.templateUsed,
// //           sectionType,
// //           original: sectionData
// //         }
// //       });
      
// //     } catch (error) {
// //       logger.error('Section enhancement error:', error);
      
// //       if (error.message.includes('rate limit')) {
// //         return res.status(429).json({
// //           success: false,
// //           error: error.message
// //         });
// //       }
      
// //       res.status(500).json({
// //         success: false,
// //         error: 'Failed to enhance section'
// //       });
// //     }
// //   }

// //   async getStatus(req, res) {
// //     try {
// //       const status = await aiService.getServiceStatus();
      
// //       res.json({
// //         success: true,
// //         data: status
// //       });
      
// //     } catch (error) {
// //       logger.error('Error checking AI service status:', error);
// //       res.status(500).json({
// //         success: false,
// //         error: 'Failed to check AI service status'
// //       });
// //     }
// //   }

// //   async parseResumeText(req, res) {
// //     try {
// //       // Check for validation errors
// //       const errors = validationResult(req);
// //       if (!errors.isEmpty()) {
// //         return res.status(400).json({
// //           success: false,
// //           error: 'Validation failed',
// //           details: errors.array()
// //         });
// //       }

// //       const { resumeText } = req.body;
      
// //       logger.info('Parsing resume text');
      
// //       const parsedData = await aiService.parseResume(resumeText);
      
// //       res.json({
// //         success: true,
// //         data: {
// //           parsed: parsedData,
// //           inputText: resumeText
// //         }
// //       });
      
// //     } catch (error) {
// //       logger.error('Resume text parsing error:', error);
      
// //       if (error.message.includes('rate limit')) {
// //         return res.status(429).json({
// //           success: false,
// //           error: error.message
// //         });
// //       }
      
// //       res.status(500).json({
// //         success: false,
// //         error: 'Failed to parse resume text'
// //       });
// //     }
// //   }

// //   // TEMPLATE-AWARE METHODS

// //   async enhanceFullResume(req, res) {
// //     try {
// //       // Check for validation errors
// //       const errors = validationResult(req);
// //       if (!errors.isEmpty()) {
// //         return res.status(400).json({
// //           success: false,
// //           error: 'Validation failed',
// //           details: errors.array()
// //         });
// //       }

// //       const { templateName, resumeData, jobDescription, enhancementType } = req.body;
      
// //       logger.info(`Enhancing full resume with template: ${templateName}`);
      
// //       const enhancedResult = await aiServiceCoordinator.enhanceFullResume(
// //         templateName, 
// //         resumeData, 
// //         jobDescription || '', 
// //         enhancementType || 'general'
// //       );
      
// //       res.json({
// //         success: true,
// //         data: enhancedResult
// //       });
      
// //     } catch (error) {
// //       logger.error('Template-aware full resume enhancement error:', error);
      
// //       if (error.message.includes('rate limit')) {
// //         return res.status(429).json({
// //           success: false,
// //           error: error.message
// //         });
// //       }
      
// //       if (error.message.includes('not found') || error.message.includes('Unsupported template')) {
// //         return res.status(400).json({
// //           success: false,
// //           error: error.message
// //         });
// //       }
      
// //       res.status(500).json({
// //         success: false,
// //         error: 'Failed to enhance full resume'
// //       });
// //     }
// //   }

// //   async enhanceSectionWithTemplate(req, res) {
// //     try {
// //       // Check for validation errors
// //       const errors = validationResult(req);
// //       if (!errors.isEmpty()) {
// //         return res.status(400).json({
// //           success: false,
// //           error: 'Validation failed',
// //           details: errors.array()
// //         });
// //       }

// //       const { templateName, sectionData, sectionType, jobDescription } = req.body;
      
// //       logger.info(`Enhancing ${sectionType} section with template: ${templateName}`);
      
// //       const enhancedResult = await aiServiceCoordinator.enhanceSectionWithTemplate(
// //         templateName, 
// //         sectionData, 
// //         sectionType, 
// //         jobDescription || ''
// //       );
      
// //       res.json({
// //         success: true,
// //         data: enhancedResult
// //       });
      
// //     } catch (error) {
// //       logger.error('Template-aware section enhancement error:', error);
      
// //       if (error.message.includes('rate limit')) {
// //         return res.status(429).json({
// //           success: false,
// //           error: error.message
// //         });
// //       }
      
// //       if (error.message.includes('not found') || error.message.includes('Unsupported')) {
// //         return res.status(400).json({
// //           success: false,
// //           error: error.message
// //         });
// //       }
      
// //       res.status(500).json({
// //         success: false,
// //         error: 'Failed to enhance section with template'
// //       });
// //     }
// //   }

// //   async getTemplateRecommendation(req, res) {
// //     try {
// //       // Check for validation errors
// //       const errors = validationResult(req);
// //       if (!errors.isEmpty()) {
// //         return res.status(400).json({
// //           success: false,
// //           error: 'Validation failed',
// //           details: errors.array()
// //         });
// //       }

// //       const { resumeData, jobDescription } = req.body;
      
// //       logger.info('Getting template recommendation');
      
// //       const recommendation = await aiServiceCoordinator.getTemplateRecommendation(
// //         resumeData, 
// //         jobDescription || ''
// //       );
      
// //       res.json({
// //         success: true,
// //         data: recommendation
// //       });
      
// //     } catch (error) {
// //       logger.error('Template recommendation error:', error);
      
// //       if (error.message.includes('rate limit')) {
// //         return res.status(429).json({
// //           success: false,
// //           error: error.message
// //         });
// //       }
      
// //       res.status(500).json({
// //         success: false,
// //         error: 'Failed to get template recommendation'
// //       });
// //     }
// //   }

// //   async getTemplateCapabilities(req, res) {
// //     try {
// //       const { templateName } = req.params;
      
// //       logger.info(`Getting capabilities for template: ${templateName || 'all'}`);
      
// //       const capabilities = await aiServiceCoordinator.getTemplateCapabilities(templateName);
      
// //       res.json({
// //         success: true,
// //         data: capabilities
// //       });
      
// //     } catch (error) {
// //       logger.error('Template capabilities error:', error);
      
// //       if (error.message.includes('not found') || error.message.includes('Unsupported template')) {
// //         return res.status(400).json({
// //           success: false,
// //           error: error.message
// //         });
// //       }
      
// //       res.status(500).json({
// //         success: false,
// //         error: 'Failed to get template capabilities'
// //       });
// //     }
// //   }

// //   async getAvailableTemplates(req, res) {
// //     try {
// //       logger.info('Getting available templates');
      
// //       const templates = aiServiceCoordinator.getAvailableTemplates();
      
// //       res.json({
// //         success: true,
// //         data: {
// //           templates,
// //           count: templates.length
// //         }
// //       });
      
// //     } catch (error) {
// //       logger.error('Available templates error:', error);
      
// //       res.status(500).json({
// //         success: false,
// //         error: 'Failed to get available templates'
// //       });
// //     }
// //   }

// //   async getEnhancedStatus(req, res) {
// //     try {
// //       const status = await aiServiceCoordinator.getEnhancedServiceStatus();
      
// //       res.json({
// //         success: true,
// //         data: status
// //       });
      
// //     } catch (error) {
// //       logger.error('Error checking enhanced AI service status:', error);
// //       res.status(500).json({
// //         success: false,
// //         error: 'Failed to check enhanced AI service status'
// //       });
// //     }
// //   }
// // }

// // module.exports = new AIController();

// const aiService = require('../services/aiService');
// const aiServiceCoordinator = require('../services/ai');
// const multer = require('multer');
// const pdfParse = require('pdf-parse');
// const { validationResult } = require('express-validator');
// const logger = require('../utils/logger');
// const sharp = require('sharp');

// // Configure multer for file uploads
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: {
//     fileSize: 10 * 1024 * 1024, // 10MB limit
//   },
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype === 'application/pdf') {
//       cb(null, true);
//     } else {
//       cb(new Error('Only PDF files are allowed'), false);
//     }
//   }
// });

// class AIController {
//   constructor() {
//     this.upload = upload;
//     // Bind methods to preserve 'this' context when used as callbacks
//     this.parseResume = this.parseResume.bind(this);
//     this.convertPdfToImages = this.convertPdfToImages.bind(this);
//     this.convertWithPdf2pic = this.convertWithPdf2pic.bind(this);
//     this.convertWithPdfPoppler = this.convertWithPdfPoppler.bind(this);
//     this.calculateATSScore = this.calculateATSScore.bind(this);
//     this.enhanceSection = this.enhanceSection.bind(this);
//     this.getStatus = this.getStatus.bind(this);
//     this.parseResumeText = this.parseResumeText.bind(this);
//     this.enhanceFullResume = this.enhanceFullResume.bind(this);
//     this.enhanceSectionWithTemplate = this.enhanceSectionWithTemplate.bind(this);
//     this.getTemplateRecommendation = this.getTemplateRecommendation.bind(this);
//     this.getTemplateCapabilities = this.getTemplateCapabilities.bind(this);
//     this.getAvailableTemplates = this.getAvailableTemplates.bind(this);
//     this.getEnhancedStatus = this.getEnhancedStatus.bind(this);
//   }

//   async convertWithPdf2pic(pdfBuffer) {
//     try {
//       const pdf2pic = require('pdf2pic');
//       logger.info('Attempting PDF conversion with pdf2pic');
      
//       const fs = require('fs');
//       const path = require('path');
      
//       // Ensure temp directory exists
//       const tempDir = './temp';
//       if (!fs.existsSync(tempDir)) {
//         fs.mkdirSync(tempDir, { recursive: true });
//       }
      
//       const outputPrefix = `resume_${Date.now()}`;
      
//       // Configure pdf2pic options with more conservative settings
//       const convertOptions = {
//         density: 200,           // Lower DPI to reduce memory usage
//         saveFilename: outputPrefix,
//         savePath: tempDir,
//         format: "png",
//         width: 1600,           // Smaller size to reduce memory issues
//         height: 2200,          
//         quality: 90
//       };
      
//       // Convert PDF to images using pdf2pic
//       const convert = pdf2pic.fromBuffer(pdfBuffer, convertOptions);
//       const results = await convert.bulk(-1, { responseType: "buffer" });
      
//       if (!results || results.length === 0) {
//         throw new Error('No images generated from PDF with pdf2pic');
//       }
      
//       const imageBuffers = [];
//       for (const result of results) {
//         if (result.buffer) {
//           imageBuffers.push(result.buffer);
//         }
        
//         // Clean up any temporary files
//         if (result.path && fs.existsSync(result.path)) {
//           try {
//             fs.unlinkSync(result.path);
//           } catch (e) {
//             logger.warn('Could not delete temp file:', e.message);
//           }
//         }
//       }
      
//       logger.info(`Successfully converted PDF using pdf2pic: ${imageBuffers.length} pages`);
//       return imageBuffers;
      
//     } catch (error) {
//       logger.error('pdf2pic conversion failed:', error.message);
//       throw error;
//     }
//   }

//   async convertWithPdfPoppler(pdfBuffer) {
//     try {
//       const pdfPoppler = require('pdf-poppler');
//       logger.info('Attempting PDF conversion with pdf-poppler');
      
//       const fs = require('fs');
//       const path = require('path');
      
//       // Ensure temp directory exists
//       const tempDir = './temp';
//       if (!fs.existsSync(tempDir)) {
//         fs.mkdirSync(tempDir, { recursive: true });
//       }
      
//       // Write buffer to temporary file
//       const tempPdfPath = path.join(tempDir, `temp_${Date.now()}.pdf`);
//       fs.writeFileSync(tempPdfPath, pdfBuffer);
      
//       const options = {
//         format: 'png',
//         out_dir: tempDir,
//         out_prefix: `resume_${Date.now()}`,
//         page: null // Convert all pages
//       };
      
//       const results = await pdfPoppler.convert(tempPdfPath, options);
      
//       const imageBuffers = [];
//       for (const imagePath of results) {
//         if (fs.existsSync(imagePath)) {
//           const buffer = fs.readFileSync(imagePath);
//           imageBuffers.push(buffer);
          
//           // Clean up
//           try {
//             fs.unlinkSync(imagePath);
//           } catch (e) {
//             logger.warn('Could not delete temp image:', e.message);
//           }
//         }
//       }
      
//       // Clean up temp PDF
//       if (fs.existsSync(tempPdfPath)) {
//         try {
//           fs.unlinkSync(tempPdfPath);
//         } catch (e) {
//           logger.warn('Could not delete temp PDF:', e.message);
//         }
//       }
      
//       if (imageBuffers.length === 0) {
//         throw new Error('No images generated from PDF with pdf-poppler');
//       }
      
//       logger.info(`Successfully converted PDF using pdf-poppler: ${imageBuffers.length} pages`);
//       return imageBuffers;
      
//     } catch (error) {
//       logger.error('pdf-poppler conversion failed:', error.message);
//       throw error;
//     }
//   }

//   async convertPdfToImages(pdfBuffer) {
//     const methods = [
//       { name: 'pdf2pic', func: this.convertWithPdf2pic },
//       { name: 'pdf-poppler', func: this.convertWithPdfPoppler }
//     ];
    
//     let lastError;
    
//     for (const method of methods) {
//       try {
//         logger.info(`Trying PDF conversion with ${method.name}`);
//         const imageBuffers = await method.func(pdfBuffer);
        
//         if (imageBuffers && imageBuffers.length > 0) {
//           // Optimize images with Sharp
//           const optimizedBuffers = [];
//           for (const buffer of imageBuffers) {
//             try {
//               const optimized = await sharp(buffer)
//                 .sharpen()
//                 .modulate({
//                   brightness: 1.1,
//                   contrast: 1.2
//                 })
//                 .png({ quality: 100 })
//                 .resize(2400, 3200, {
//                   fit: 'inside',
//                   withoutEnlargement: true
//                 })
//                 .toBuffer();
              
//               optimizedBuffers.push(optimized);
//             } catch (sharpError) {
//               logger.warn('Sharp optimization failed, using original buffer:', sharpError.message);
//               optimizedBuffers.push(buffer);
//             }
//           }
          
//           logger.info(`Successfully converted and optimized PDF: ${optimizedBuffers.length} pages`);
//           return optimizedBuffers;
//         }
//       } catch (error) {
//         logger.warn(`${method.name} failed:`, error.message);
//         lastError = error;
//         continue;
//       }
//     }
    
//     // If all methods failed, throw the last error
//     throw new Error(`All PDF conversion methods failed. Last error: ${lastError?.message || 'Unknown error'}`);
//   }

//   async parseResume(req, res) {
//     try {
//       if (!req.file) {
//         return res.status(400).json({
//           success: false,
//           error: 'No PDF file uploaded'
//         });
//       }

//       logger.info('Parsing uploaded resume PDF using vision-based approach');
      
//       let parsedData;
//       let processingMethod = 'vision-based';
//       let pagesProcessed = 0;
      
//       try {
//         // Try vision-based approach first
//         const imageBuffers = await this.convertPdfToImages(req.file.buffer);
        
//         if (imageBuffers && imageBuffers.length > 0) {
//           parsedData = await aiService.parseResumeFromImages(imageBuffers);
//           pagesProcessed = imageBuffers.length;
//         } else {
//           throw new Error('No images generated from PDF');
//         }
//       } catch (visionError) {
//         logger.warn('Vision-based parsing failed, falling back to text extraction:', visionError.message);
        
//         // Fallback to text-based parsing
//         try {
//           const pdfData = await pdfParse(req.file.buffer);
//           if (pdfData.text && pdfData.text.trim().length > 0) {
//             parsedData = await aiService.parseResume(pdfData.text);
//             processingMethod = 'text-based-fallback';
//             pagesProcessed = pdfData.numpages || 1;
//           } else {
//             throw new Error('No text content found in PDF');
//           }
//         } catch (textError) {
//           logger.error('Both vision and text parsing failed:', textError.message);
//           throw new Error('Unable to parse PDF: Both vision and text extraction failed');
//         }
//       }
      
//       // Also try to extract text for debugging purposes
//       let extractedText = '';
//       try {
//         const pdfData = await pdfParse(req.file.buffer);
//         extractedText = pdfData.text;
//       } catch (textError) {
//         logger.warn('Text extraction failed:', textError.message);
//       }
      
//       res.json({
//         success: true,
//         data: {
//           parsed: parsedData,
//           extractedText: extractedText,
//           fileName: req.file.originalname,
//           fileSize: req.file.size,
//           pagesProcessed: pagesProcessed,
//           processingMethod: processingMethod
//         }
//       });
      
//     } catch (error) {
//       logger.error('Resume parsing failed:', error);
      
//       if (error.message.includes('rate limit')) {
//         return res.status(429).json({
//           success: false,
//           error: error.message
//         });
//       }
      
//       if (error.message.includes('authentication')) {
//         return res.status(500).json({
//           success: false,
//           error: 'AI service configuration error'
//         });
//       }
      
//       res.status(500).json({
//         success: false,
//         error: error.message || 'Failed to parse resume'
//       });
//     }
//   }

//   async calculateATSScore(req, res) {
//     try {
//       // Check for validation errors
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({
//           success: false,
//           error: 'Validation failed',
//           details: errors.array()
//         });
//       }

//       const { resumeData, jobDescription } = req.body;
      
//       logger.info('Calculating ATS score');
      
//       const atsAnalysis = await aiService.calculateATSScore(resumeData, jobDescription);
      
//       res.json({
//         success: true,
//         data: atsAnalysis
//       });
      
//     } catch (error) {
//       logger.error('ATS score calculation error:', error);
      
//       if (error.message.includes('rate limit')) {
//         return res.status(429).json({
//           success: false,
//           error: error.message
//         });
//       }
      
//       res.status(500).json({
//         success: false,
//         error: 'Failed to calculate ATS score'
//       });
//     }
//   }

//   async enhanceSection(req, res) {
//     try {
//       // Check for validation errors
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({
//           success: false,
//           error: 'Validation failed',
//           details: errors.array()
//         });
//       }

//       const { sectionData, sectionType, jobDescription, templateName } = req.body;
      
//       // BEFORE ENHANCEMENT - Console logging
//       console.log('🚀 ===== SECTION ENHANCEMENT START =====');
//       console.log('📋 BEFORE ENHANCEMENT - Input Data:', {
//         sectionType,
//         templateName: templateName || 'professional (default)',
//         sectionData: JSON.stringify(sectionData, null, 2),
//         jobDescription: jobDescription ? `"${jobDescription.substring(0, 500)}..."` : 'not provided',
//         timestamp: new Date().toISOString()
//       });
      
//       // Use template-specific enhancement if templateName is provided, otherwise default to professional
//       const templateToUse = templateName || 'professional';
      
//       logger.info(`Enhancing ${sectionType} section with ${templateToUse} template`);
//       console.log(`🎯 TEMPLATE SELECTION: Using "${templateToUse}" template for ${sectionType} section`);
      
//       // Use template-specific enhancement
//       console.log('🔄 CALLING aiServiceCoordinator.enhanceSectionWithTemplate...');
//       const enhancedResult = await aiServiceCoordinator.enhanceSectionWithTemplate(
//         templateToUse, 
//         sectionData, 
//         sectionType, 
//         jobDescription || ''
//       );
      
//       // AFTER ENHANCEMENT - Console logging
//       console.log('✅ ===== SECTION ENHANCEMENT COMPLETE =====');
//       console.log('📝 AFTER ENHANCEMENT - Result Data:', {
//         enhanced: typeof enhancedResult.enhanced === 'string' 
//           ? enhancedResult.enhanced.substring(0, 300) + '...' 
//           : enhancedResult.enhanced,
//         templateUsed: enhancedResult.templateUsed,
//         sectionType,
//         originalLength: JSON.stringify(sectionData).length,
//         enhancedLength: typeof enhancedResult.enhanced === 'string' 
//           ? enhancedResult.enhanced.length 
//           : JSON.stringify(enhancedResult.enhanced).length,
//         timestamp: new Date().toISOString()
//       });
      
//       console.log('🎉 ENHANCEMENT SUMMARY:', {
//         status: 'SUCCESS',
//         template: enhancedResult.templateUsed,
//         section: sectionType,
//         improvement: 'Content enhanced with software development focus'
//       });
      
//       res.json({
//         success: true,
//         data: {
//           enhanced: enhancedResult.enhanced,
//           templateUsed: enhancedResult.templateUsed,
//           sectionType,
//           original: sectionData
//         }
//       });
      
//     } catch (error) {
//       // ERROR LOGGING
//       console.log('❌ ===== SECTION ENHANCEMENT ERROR =====');
//       console.log('🚨 ERROR Details:', {
//         error: error.message,
//         stack: error.stack,
//         sectionType: req.body.sectionType,
//         templateName: req.body.templateName,
//         timestamp: new Date().toISOString()
//       });
      
//       logger.error('Section enhancement error:', error);
      
//       if (error.message.includes('rate limit')) {
//         return res.status(429).json({
//           success: false,
//           error: error.message
//         });
//       }
      
//       res.status(500).json({
//         success: false,
//         error: 'Failed to enhance section'
//       });
//     }
//   }

//   async getStatus(req, res) {
//     try {
//       const status = await aiService.getServiceStatus();
      
//       res.json({
//         success: true,
//         data: status
//       });
      
//     } catch (error) {
//       logger.error('Error checking AI service status:', error);
//       res.status(500).json({
//         success: false,
//         error: 'Failed to check AI service status'
//       });
//     }
//   }

//   async parseResumeText(req, res) {
//     try {
//       // Check for validation errors
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({
//           success: false,
//           error: 'Validation failed',
//           details: errors.array()
//         });
//       }

//       const { resumeText } = req.body;
      
//       logger.info('Parsing resume text');
      
//       const parsedData = await aiService.parseResume(resumeText);
      
//       res.json({
//         success: true,
//         data: {
//           parsed: parsedData,
//           inputText: resumeText
//         }
//       });
      
//     } catch (error) {
//       logger.error('Resume text parsing error:', error);
      
//       if (error.message.includes('rate limit')) {
//         return res.status(429).json({
//           success: false,
//           error: error.message
//         });
//       }
      
//       res.status(500).json({
//         success: false,
//         error: 'Failed to parse resume text'
//       });
//     }
//   }

//   // TEMPLATE-AWARE METHODS

//   async enhanceFullResume(req, res) {
//     try {
//       // Check for validation errors
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({
//           success: false,
//           error: 'Validation failed',
//           details: errors.array()
//         });
//       }

//       const { templateName, resumeData, jobDescription, enhancementType } = req.body;
      
//       // BEFORE ENHANCEMENT - Console logging
//       console.log('🚀 ===== FULL RESUME ENHANCEMENT START =====');
//       console.log('📋 BEFORE ENHANCEMENT - Input Data:', {
//         templateName,
//         enhancementType: enhancementType || 'general',
//         resumeDataSections: Object.keys(resumeData || {}),
//         jobDescription: jobDescription ? `"${jobDescription.substring(0, 100)}..."` : 'not provided',
//         timestamp: new Date().toISOString()
//       });
      
//       logger.info(`Enhancing full resume with template: ${templateName}`);
//       console.log(`🎯 FULL RESUME TEMPLATE: Using "${templateName}" template`);
      
//       console.log('🔄 CALLING aiServiceCoordinator.enhanceFullResume...');
//       const enhancedResult = await aiServiceCoordinator.enhanceFullResume(
//         templateName, 
//         resumeData, 
//         jobDescription || '', 
//         enhancementType || 'general'
//       );
      
//       // AFTER ENHANCEMENT - Console logging
//       console.log('✅ ===== FULL RESUME ENHANCEMENT COMPLETE =====');
//       console.log('📝 AFTER ENHANCEMENT - Result Summary:', {
//         templateUsed: enhancedResult.templateUsed,
//         sectionsEnhanced: Object.keys(enhancedResult.enhanced || {}),
//         enhancementType: enhancedResult.enhancementType,
//         timestamp: new Date().toISOString()
//       });
      
//       console.log('🎉 FULL RESUME ENHANCEMENT SUMMARY:', {
//         status: 'SUCCESS',
//         template: enhancedResult.templateUsed,
//         sectionsCount: Object.keys(enhancedResult.enhanced || {}).length,
//         improvement: 'Full resume enhanced with software development focus'
//       });
      
//       res.json({
//         success: true,
//         data: enhancedResult
//       });
      
//     } catch (error) {
//       // ERROR LOGGING
//       console.log('❌ ===== FULL RESUME ENHANCEMENT ERROR =====');
//       console.log('🚨 ERROR Details:', {
//         error: error.message,
//         stack: error.stack,
//         templateName: req.body.templateName,
//         timestamp: new Date().toISOString()
//       });
      
//       logger.error('Template-aware full resume enhancement error:', error);
      
//       if (error.message.includes('rate limit')) {
//         return res.status(429).json({
//           success: false,
//           error: error.message
//         });
//       }
      
//       if (error.message.includes('not found') || error.message.includes('Unsupported template')) {
//         return res.status(400).json({
//           success: false,
//           error: error.message
//         });
//       }
      
//       res.status(500).json({
//         success: false,
//         error: 'Failed to enhance full resume'
//       });
//     }
//   }

//   async enhanceSectionWithTemplate(req, res) {
//     try {
//       // Check for validation errors
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({
//           success: false,
//           error: 'Validation failed',
//           details: errors.array()
//         });
//       }

//       const { templateName, sectionData, sectionType, jobDescription } = req.body;
      
//       // BEFORE ENHANCEMENT - Console logging
//       console.log('🚀 ===== TEMPLATE-SPECIFIC SECTION ENHANCEMENT START =====');
//       console.log('📋 BEFORE ENHANCEMENT - Input Data:', {
//         templateName,
//         sectionType,
//         sectionData: JSON.stringify(sectionData, null, 2),
//         jobDescription: jobDescription ? `"${jobDescription.substring(0, 100)}..."` : 'not provided',
//         timestamp: new Date().toISOString()
//       });
      
//       logger.info(`Enhancing ${sectionType} section with template: ${templateName}`);
//       console.log(`🎯 TEMPLATE-SPECIFIC: Using "${templateName}" template for ${sectionType} section`);
      
//       console.log('🔄 CALLING aiServiceCoordinator.enhanceSectionWithTemplate...');
//       const enhancedResult = await aiServiceCoordinator.enhanceSectionWithTemplate(
//         templateName, 
//         sectionData, 
//         sectionType, 
//         jobDescription || ''
//       );
      
//       // AFTER ENHANCEMENT - Console logging
//       console.log('✅ ===== TEMPLATE-SPECIFIC SECTION ENHANCEMENT COMPLETE =====');
//       console.log('📝 AFTER ENHANCEMENT - Result Data:', {
//         enhanced: typeof enhancedResult.enhanced === 'string' 
//           ? enhancedResult.enhanced.substring(0, 300) + '...' 
//           : enhancedResult.enhanced,
//         templateUsed: enhancedResult.templateUsed,
//         sectionType,
//         promptUsed: enhancedResult.promptUsed ? 'Yes' : 'No',
//         timestamp: new Date().toISOString()
//       });
      
//       console.log('🎉 TEMPLATE-SPECIFIC ENHANCEMENT SUMMARY:', {
//         status: 'SUCCESS',
//         template: enhancedResult.templateUsed,
//         section: sectionType,
//         improvement: 'Content enhanced with template-specific software development focus'
//       });
      
//       res.json({
//         success: true,
//         data: enhancedResult
//       });
      
//     } catch (error) {
//       // ERROR LOGGING
//       console.log('❌ ===== TEMPLATE-SPECIFIC SECTION ENHANCEMENT ERROR =====');
//       console.log('🚨 ERROR Details:', {
//         error: error.message,
//         stack: error.stack,
//         templateName: req.body.templateName,
//         sectionType: req.body.sectionType,
//         timestamp: new Date().toISOString()
//       });
      
//       logger.error('Template-aware section enhancement error:', error);
      
//       if (error.message.includes('rate limit')) {
//         return res.status(429).json({
//           success: false,
//           error: error.message
//         });
//       }
      
//       if (error.message.includes('not found') || error.message.includes('Unsupported')) {
//         return res.status(400).json({
//           success: false,
//           error: error.message
//         });
//       }
      
//       res.status(500).json({
//         success: false,
//         error: 'Failed to enhance section with template'
//       });
//     }
//   }

//   async getTemplateRecommendation(req, res) {
//     try {
//       // Check for validation errors
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({
//           success: false,
//           error: 'Validation failed',
//           details: errors.array()
//         });
//       }

//       const { resumeData, jobDescription } = req.body;
      
//       // BEFORE RECOMMENDATION - Console logging
//       console.log('🚀 ===== TEMPLATE RECOMMENDATION START =====');
//       console.log('📋 ANALYZING Resume Data:', {
//         sections: Object.keys(resumeData || {}),
//         jobDescription: jobDescription ? `"${jobDescription.substring(0, 100)}..."` : 'not provided',
//         timestamp: new Date().toISOString()
//       });
      
//       logger.info('Getting template recommendation');
      
//       const recommendation = await aiServiceCoordinator.getTemplateRecommendation(
//         resumeData, 
//         jobDescription || ''
//       );
      
//       // AFTER RECOMMENDATION - Console logging
//       console.log('✅ ===== TEMPLATE RECOMMENDATION COMPLETE =====');
//       console.log('📝 RECOMMENDATION Result:', {
//         recommendedTemplate: recommendation.recommendedTemplate,
//         confidence: recommendation.confidence,
//         reasons: recommendation.reasons,
//         timestamp: new Date().toISOString()
//       });
      
//       res.json({
//         success: true,
//         data: recommendation
//       });
      
//     } catch (error) {
//       console.log('❌ ===== TEMPLATE RECOMMENDATION ERROR =====');
//       console.log('🚨 ERROR Details:', {
//         error: error.message,
//         timestamp: new Date().toISOString()
//       });
      
//       logger.error('Template recommendation error:', error);
      
//       if (error.message.includes('rate limit')) {
//         return res.status(429).json({
//           success: false,
//           error: error.message
//         });
//       }
      
//       res.status(500).json({
//         success: false,
//         error: 'Failed to get template recommendation'
//       });
//     }
//   }

//   async getTemplateCapabilities(req, res) {
//     try {
//       const { templateName } = req.params;
      
//       console.log('🚀 ===== TEMPLATE CAPABILITIES REQUEST =====');
//       console.log('📋 Template:', templateName || 'all templates');
      
//       logger.info(`Getting capabilities for template: ${templateName || 'all'}`);
      
//       const capabilities = await aiServiceCoordinator.getTemplateCapabilities(templateName);
      
//       console.log('✅ ===== TEMPLATE CAPABILITIES RESULT =====');
//       console.log('📝 Capabilities:', capabilities);
      
//       res.json({
//         success: true,
//         data: capabilities
//       });
      
//     } catch (error) {
//       console.log('❌ ===== TEMPLATE CAPABILITIES ERROR =====');
//       console.log('🚨 ERROR Details:', error.message);
      
//       logger.error('Template capabilities error:', error);
      
//       if (error.message.includes('not found') || error.message.includes('Unsupported template')) {
//         return res.status(400).json({
//           success: false,
//           error: error.message
//         });
//       }
      
//       res.status(500).json({
//         success: false,
//         error: 'Failed to get template capabilities'
//       });
//     }
//   }

//   async getAvailableTemplates(req, res) {
//     try {
//       console.log('🚀 ===== AVAILABLE TEMPLATES REQUEST =====');
      
//       logger.info('Getting available templates');
      
//       const templates = aiServiceCoordinator.getAvailableTemplates();
      
//       console.log('✅ ===== AVAILABLE TEMPLATES RESULT =====');
//       console.log('📝 Templates:', templates);
//       console.log('📊 Count:', templates.length);
      
//       res.json({
//         success: true,
//         data: {
//           templates,
//           count: templates.length
//         }
//       });
      
//     } catch (error) {
//       console.log('❌ ===== AVAILABLE TEMPLATES ERROR =====');
//       console.log('🚨 ERROR Details:', error.message);
      
//       logger.error('Available templates error:', error);
      
//       res.status(500).json({
//         success: false,
//         error: 'Failed to get available templates'
//       });
//     }
//   }

//   async getEnhancedStatus(req, res) {
//     try {
//       console.log('🚀 ===== ENHANCED STATUS CHECK =====');
      
//       const status = await aiServiceCoordinator.getEnhancedServiceStatus();
      
//       console.log('✅ ===== ENHANCED STATUS RESULT =====');
//       console.log('📝 Status:', status);
      
//       res.json({
//         success: true,
//         data: status
//       });
      
//     } catch (error) {
//       console.log('❌ ===== ENHANCED STATUS ERROR =====');
//       console.log('🚨 ERROR Details:', error.message);
      
//       logger.error('Error checking enhanced AI service status:', error);
//       res.status(500).json({
//         success: false,
//         error: 'Failed to check enhanced AI service status'
//       });
//     }
//   }
// }

// module.exports = new AIController();
const aiService = require('../services/aiService');
const aiServiceCoordinator = require('../services/ai');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Enhanced logging utility
class EnhancedLogger {
  constructor() {
    this.logDir = './logs';
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatTimestamp() {
    return new Date().toISOString();
  }

  createLogEntry(type, operation, data) {
    return {
      timestamp: this.formatTimestamp(),
      type: type.toUpperCase(),
      operation,
      ...data
    };
  }

  consoleLog(emoji, title, data, color = '\x1b[36m') {
    const reset = '\x1b[0m';
    const bright = '\x1b[1m';
    
    console.log(`\n${color}${bright}${emoji} ===== ${title} =====${reset}`);
    
    if (typeof data === 'object') {
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'string' && value.length > 500) {
          console.log(`${color}📝 ${key}:${reset} ${value.substring(0, 500)}...`);
        } else if (typeof value === 'object') {
          console.log(`${color}📝 ${key}:${reset} ${JSON.stringify(value, null, 2)}`);
        } else {
          console.log(`${color}📝 ${key}:${reset} ${value}`);
        }
      });
    } else {
      console.log(`${color}📝 Data:${reset} ${data}`);
    }
    
    console.log(`${color}${bright}===== END ${title} =====${reset}\n`);
  }

  async saveToFile(filename, logEntry) {
    try {
      const logPath = path.join(this.logDir, filename);
      const logLine = JSON.stringify(logEntry, null, 2) + '\n' + '='.repeat(80) + '\n';
      
      await fs.promises.appendFile(logPath, logLine);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  async logOperation(operation, type, data, filename) {
    const logEntry = this.createLogEntry(type, operation, data);
    
    // Console logging with colors
    const colors = {
      START: '\x1b[32m',    // Green
      SUCCESS: '\x1b[32m',  // Green
      ERROR: '\x1b[31m',    // Red
      INFO: '\x1b[36m'      // Cyan
    };
    
    const emojis = {
      START: '🚀',
      SUCCESS: '✅',
      ERROR: '❌',
      INFO: 'ℹ️'
    };
    
    this.consoleLog(
      emojis[type] || 'ℹ️',
      `${operation} - ${type}`,
      data,
      colors[type] || '\x1b[36m'
    );
    
    // Save to file
    if (filename) {
      await this.saveToFile(filename, logEntry);
    }
  }

  // Specific logging methods
  async logStart(operation, data, filename) {
    await this.logOperation(operation, 'START', data, filename);
  }

  async logSuccess(operation, data, filename) {
    await this.logOperation(operation, 'SUCCESS', data, filename);
  }

  async logError(operation, error, data, filename) {
    const errorData = {
      error: error.message,
      stack: error.stack,
      ...data
    };
    await this.logOperation(operation, 'ERROR', errorData, filename);
  }

  async logInfo(operation, data, filename) {
    await this.logOperation(operation, 'INFO', data, filename);
  }
}

const enhancedLogger = new EnhancedLogger();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

class AIController {
  constructor() {
    this.upload = upload;
    // Bind methods to preserve 'this' context when used as callbacks
    this.parseResume = this.parseResume.bind(this);
    this.convertPdfToImages = this.convertPdfToImages.bind(this);
    this.convertWithPdf2pic = this.convertWithPdf2pic.bind(this);
    this.convertWithPdfPoppler = this.convertWithPdfPoppler.bind(this);
    this.calculateATSScore = this.calculateATSScore.bind(this);
    this.enhanceSection = this.enhanceSection.bind(this);
    this.getStatus = this.getStatus.bind(this);
    this.parseResumeText = this.parseResumeText.bind(this);
    this.enhanceFullResume = this.enhanceFullResume.bind(this);
    this.enhanceSectionWithTemplate = this.enhanceSectionWithTemplate.bind(this);
    this.getTemplateRecommendation = this.getTemplateRecommendation.bind(this);
    this.getTemplateCapabilities = this.getTemplateCapabilities.bind(this);
    this.getAvailableTemplates = this.getAvailableTemplates.bind(this);
    this.getEnhancedStatus = this.getEnhancedStatus.bind(this);
  }

  async convertWithPdf2pic(pdfBuffer) {
    await enhancedLogger.logStart('PDF2PIC_CONVERSION', {
      bufferSize: pdfBuffer.length,
      method: 'pdf2pic'
    }, 'pdf_conversion.log');

    try {
      const pdf2pic = require('pdf2pic');
      
      const fs = require('fs');
      const path = require('path');
      
      // Ensure temp directory exists
      const tempDir = './temp';
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const outputPrefix = `resume_${Date.now()}`;
      
      // Configure pdf2pic options with more conservative settings
      const convertOptions = {
        density: 200,           // Lower DPI to reduce memory usage
        saveFilename: outputPrefix,
        savePath: tempDir,
        format: "png",
        width: 1600,           // Smaller size to reduce memory issues
        height: 2200,          
        quality: 90
      };
      
      await enhancedLogger.logInfo('PDF2PIC_CONFIG', {
        options: convertOptions,
        outputPrefix
      }, 'pdf_conversion.log');
      
      // Convert PDF to images using pdf2pic
      const convert = pdf2pic.fromBuffer(pdfBuffer, convertOptions);
      const results = await convert.bulk(-1, { responseType: "buffer" });
      
      if (!results || results.length === 0) {
        throw new Error('No images generated from PDF with pdf2pic');
      }
      
      const imageBuffers = [];
      for (const result of results) {
        if (result.buffer) {
          imageBuffers.push(result.buffer);
        }
        
        // Clean up any temporary files
        if (result.path && fs.existsSync(result.path)) {
          try {
            fs.unlinkSync(result.path);
          } catch (e) {
            logger.warn('Could not delete temp file:', e.message);
          }
        }
      }
      
      await enhancedLogger.logSuccess('PDF2PIC_CONVERSION', {
        pagesConverted: imageBuffers.length,
        totalBufferSize: imageBuffers.reduce((sum, buffer) => sum + buffer.length, 0),
        method: 'pdf2pic'
      }, 'pdf_conversion.log');
      
      return imageBuffers;
      
    } catch (error) {
      await enhancedLogger.logError('PDF2PIC_CONVERSION', error, {
        method: 'pdf2pic',
        bufferSize: pdfBuffer.length
      }, 'pdf_conversion.log');
      throw error;
    }
  }

  async convertWithPdfPoppler(pdfBuffer) {
    await enhancedLogger.logStart('PDFPOPPLER_CONVERSION', {
      bufferSize: pdfBuffer.length,
      method: 'pdf-poppler'
    }, 'pdf_conversion.log');

    try {
      const pdfPoppler = require('pdf-poppler');
      
      const fs = require('fs');
      const path = require('path');
      
      // Ensure temp directory exists
      const tempDir = './temp';
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Write buffer to temporary file
      const tempPdfPath = path.join(tempDir, `temp_${Date.now()}.pdf`);
      fs.writeFileSync(tempPdfPath, pdfBuffer);
      
      const options = {
        format: 'png',
        out_dir: tempDir,
        out_prefix: `resume_${Date.now()}`,
        page: null // Convert all pages
      };
      
      await enhancedLogger.logInfo('PDFPOPPLER_CONFIG', {
        options,
        tempPdfPath
      }, 'pdf_conversion.log');
      
      const results = await pdfPoppler.convert(tempPdfPath, options);
      
      const imageBuffers = [];
      for (const imagePath of results) {
        if (fs.existsSync(imagePath)) {
          const buffer = fs.readFileSync(imagePath);
          imageBuffers.push(buffer);
          
          // Clean up
          try {
            fs.unlinkSync(imagePath);
          } catch (e) {
            logger.warn('Could not delete temp image:', e.message);
          }
        }
      }
      
      // Clean up temp PDF
      if (fs.existsSync(tempPdfPath)) {
        try {
          fs.unlinkSync(tempPdfPath);
        } catch (e) {
          logger.warn('Could not delete temp PDF:', e.message);
        }
      }
      
      if (imageBuffers.length === 0) {
        throw new Error('No images generated from PDF with pdf-poppler');
      }
      
      await enhancedLogger.logSuccess('PDFPOPPLER_CONVERSION', {
        pagesConverted: imageBuffers.length,
        totalBufferSize: imageBuffers.reduce((sum, buffer) => sum + buffer.length, 0),
        method: 'pdf-poppler'
      }, 'pdf_conversion.log');
      
      return imageBuffers;
      
    } catch (error) {
      await enhancedLogger.logError('PDFPOPPLER_CONVERSION', error, {
        method: 'pdf-poppler',
        bufferSize: pdfBuffer.length
      }, 'pdf_conversion.log');
      throw error;
    }
  }

  async convertPdfToImages(pdfBuffer) {
    await enhancedLogger.logStart('PDF_TO_IMAGES_CONVERSION', {
      bufferSize: pdfBuffer.length,
      availableMethods: ['pdf2pic', 'pdf-poppler']
    }, 'pdf_conversion.log');

    const methods = [
      { name: 'pdf2pic', func: this.convertWithPdf2pic },
      { name: 'pdf-poppler', func: this.convertWithPdfPoppler }
    ];
    
    let lastError;
    
    for (const method of methods) {
      try {
        await enhancedLogger.logInfo('PDF_CONVERSION_METHOD_ATTEMPT', {
          method: method.name,
          attempt: methods.indexOf(method) + 1
        }, 'pdf_conversion.log');
        
        const imageBuffers = await method.func(pdfBuffer);
        
        if (imageBuffers && imageBuffers.length > 0) {
          await enhancedLogger.logInfo('PDF_OPTIMIZATION_START', {
            method: method.name,
            originalBuffersCount: imageBuffers.length
          }, 'pdf_conversion.log');

          // Optimize images with Sharp
          const optimizedBuffers = [];
          for (const buffer of imageBuffers) {
            try {
              const optimized = await sharp(buffer)
                .sharpen()
                .modulate({
                  brightness: 1.1,
                  contrast: 1.2
                })
                .png({ quality: 100 })
                .resize(2400, 3200, {
                  fit: 'inside',
                  withoutEnlargement: true
                })
                .toBuffer();
              
              optimizedBuffers.push(optimized);
            } catch (sharpError) {
              logger.warn('Sharp optimization failed, using original buffer:', sharpError.message);
              optimizedBuffers.push(buffer);
            }
          }
          
          await enhancedLogger.logSuccess('PDF_TO_IMAGES_CONVERSION', {
            method: method.name,
            pagesConverted: optimizedBuffers.length,
            originalSize: imageBuffers.reduce((sum, buffer) => sum + buffer.length, 0),
            optimizedSize: optimizedBuffers.reduce((sum, buffer) => sum + buffer.length, 0),
            compressionRatio: ((imageBuffers.reduce((sum, buffer) => sum + buffer.length, 0) - 
                               optimizedBuffers.reduce((sum, buffer) => sum + buffer.length, 0)) / 
                               imageBuffers.reduce((sum, buffer) => sum + buffer.length, 0) * 100).toFixed(2) + '%'
          }, 'pdf_conversion.log');
          
          return optimizedBuffers;
        }
      } catch (error) {
        await enhancedLogger.logError('PDF_CONVERSION_METHOD_FAILED', error, {
          method: method.name,
          attempt: methods.indexOf(method) + 1
        }, 'pdf_conversion.log');
        lastError = error;
        continue;
      }
    }
    
    // If all methods failed, throw the last error
    await enhancedLogger.logError('PDF_TO_IMAGES_CONVERSION', lastError, {
      allMethodsFailed: true,
      methodsAttempted: methods.map(m => m.name)
    }, 'pdf_conversion.log');
    
    throw new Error(`All PDF conversion methods failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  async parseResume(req, res) {
    const requestId = `parse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await enhancedLogger.logStart('RESUME_PARSING', {
      requestId,
      hasFile: !!req.file,
      fileName: req.file?.originalname,
      fileSize: req.file?.size,
      mimeType: req.file?.mimetype
    }, 'resume_parsing.log');

    try {
      if (!req.file) {
        await enhancedLogger.logError('RESUME_PARSING', new Error('No PDF file uploaded'), {
          requestId
        }, 'resume_parsing.log');
        
        return res.status(400).json({
          success: false,
          error: 'No PDF file uploaded'
        });
      }

      let parsedData;
      let processingMethod = 'vision-based';
      let pagesProcessed = 0;
      
      try {
        await enhancedLogger.logInfo('VISION_PARSING_ATTEMPT', {
          requestId,
          method: 'vision-based',
          fileName: req.file.originalname
        }, 'resume_parsing.log');

        // Try vision-based approach first
        const imageBuffers = await this.convertPdfToImages(req.file.buffer);
        
        if (imageBuffers && imageBuffers.length > 0) {
          await enhancedLogger.logInfo('AI_SERVICE_PARSING_START', {
            requestId,
            imagesCount: imageBuffers.length,
            totalImageSize: imageBuffers.reduce((sum, buffer) => sum + buffer.length, 0)
          }, 'resume_parsing.log');

          parsedData = await aiService.parseResumeFromImages(imageBuffers);
          pagesProcessed = imageBuffers.length;
          
          await enhancedLogger.logInfo('VISION_PARSING_SUCCESS', {
            requestId,
            pagesProcessed,
            parsedSections: Object.keys(parsedData || {})
          }, 'resume_parsing.log');
        } else {
          throw new Error('No images generated from PDF');
        }
      } catch (visionError) {
        await enhancedLogger.logError('VISION_PARSING_FAILED', visionError, {
          requestId,
          fallingBackToText: true
        }, 'resume_parsing.log');
        
        // Fallback to text-based parsing
        try {
          await enhancedLogger.logInfo('TEXT_PARSING_FALLBACK', {
            requestId,
            method: 'text-based-fallback'
          }, 'resume_parsing.log');

          const pdfData = await pdfParse(req.file.buffer);
          if (pdfData.text && pdfData.text.trim().length > 0) {
            parsedData = await aiService.parseResume(pdfData.text);
            processingMethod = 'text-based-fallback';
            pagesProcessed = pdfData.numpages || 1;
            
            await enhancedLogger.logInfo('TEXT_PARSING_SUCCESS', {
              requestId,
              textLength: pdfData.text.length,
              pagesProcessed,
              parsedSections: Object.keys(parsedData || {})
            }, 'resume_parsing.log');
          } else {
            throw new Error('No text content found in PDF');
          }
        } catch (textError) {
          await enhancedLogger.logError('TEXT_PARSING_FAILED', textError, {
            requestId,
            bothMethodsFailed: true
          }, 'resume_parsing.log');
          
          throw new Error('Unable to parse PDF: Both vision and text extraction failed');
        }
      }
      
      // Also try to extract text for debugging purposes
      let extractedText = '';
      try {
        const pdfData = await pdfParse(req.file.buffer);
        extractedText = pdfData.text;
        
        await enhancedLogger.logInfo('TEXT_EXTRACTION_DEBUG', {
          requestId,
          extractedTextLength: extractedText.length,
          textPreview: extractedText.substring(0, 200) + '...'
        }, 'resume_parsing.log');
      } catch (textError) {
        await enhancedLogger.logError('TEXT_EXTRACTION_DEBUG_FAILED', textError, {
          requestId
        }, 'resume_parsing.log');
      }
      
      const responseData = {
        parsed: parsedData,
        extractedText: extractedText,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        pagesProcessed: pagesProcessed,
        processingMethod: processingMethod
      };

      await enhancedLogger.logSuccess('RESUME_PARSING', {
        requestId,
        processingMethod,
        pagesProcessed,
        responseSize: JSON.stringify(responseData).length,
        parsedSections: Object.keys(parsedData || {}),
        extractedTextLength: extractedText.length
      }, 'resume_parsing.log');
      
      res.json({
        success: true,
        data: responseData
      });
      
    } catch (error) {
      await enhancedLogger.logError('RESUME_PARSING', error, {
        requestId,
        fileName: req.file?.originalname,
        fileSize: req.file?.size
      }, 'resume_parsing.log');
      
      if (error.message.includes('rate limit')) {
        return res.status(429).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.message.includes('authentication')) {
        return res.status(500).json({
          success: false,
          error: 'AI service configuration error'
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to parse resume'
      });
    }
  }

  async calculateATSScore(req, res) {
    const requestId = `ats_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await enhancedLogger.logStart('ATS_SCORE_CALCULATION', {
      requestId,
      hasResumeData: !!req.body.resumeData,
      hasJobDescription: !!req.body.jobDescription,
      jobDescriptionLength: req.body.jobDescription?.length || 0
    }, 'ats_scoring.log');

    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await enhancedLogger.logError('ATS_SCORE_CALCULATION', new Error('Validation failed'), {
          requestId,
          validationErrors: errors.array()
        }, 'ats_scoring.log');

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { resumeData, jobDescription } = req.body;
      
      await enhancedLogger.logInfo('ATS_ANALYSIS_START', {
        requestId,
        resumeSections: Object.keys(resumeData || {}),
        jobDescriptionPreview: jobDescription ? jobDescription.substring(0, 200) + '...' : 'not provided'
      }, 'ats_scoring.log');
      
      const atsAnalysis = await aiService.calculateATSScore(resumeData, jobDescription);
      
      await enhancedLogger.logSuccess('ATS_SCORE_CALCULATION', {
        requestId,
        score: atsAnalysis.score || 'not available',
        analysisComponents: Object.keys(atsAnalysis || {}),
        recommendations: atsAnalysis.recommendations?.length || 0
      }, 'ats_scoring.log');
      
      res.json({
        success: true,
        data: atsAnalysis
      });
      
    } catch (error) {
      await enhancedLogger.logError('ATS_SCORE_CALCULATION', error, {
        requestId
      }, 'ats_scoring.log');
      
      if (error.message.includes('rate limit')) {
        return res.status(429).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to calculate ATS score'
      });
    }
  }

  async enhanceSection(req, res) {
    const requestId = `enhance_section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await enhancedLogger.logStart('SECTION_ENHANCEMENT', {
      requestId,
      sectionType: req.body.sectionType,
      templateName: req.body.templateName || 'professional (default)',
      hasJobDescription: !!req.body.jobDescription,
      sectionDataSize: JSON.stringify(req.body.sectionData || {}).length,
      originalData: req.body.sectionData
    }, 'section_enhancement.log');

    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await enhancedLogger.logError('SECTION_ENHANCEMENT', new Error('Validation failed'), {
          requestId,
          validationErrors: errors.array()
        }, 'section_enhancement.log');

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { sectionData, sectionType, jobDescription, templateName } = req.body;
      
      // Use template-specific enhancement if templateName is provided, otherwise default to professional
      const templateToUse = templateName || 'professional';
      
      await enhancedLogger.logInfo('SECTION_ENHANCEMENT_CONFIG', {
        requestId,
        templateSelected: templateToUse,
        sectionType,
        jobDescriptionPreview: jobDescription ? jobDescription.substring(0, 200) + '...' : 'not provided'
      }, 'section_enhancement.log');
      
      // Use template-specific enhancement
      const enhancedResult = await aiServiceCoordinator.enhanceSectionWithTemplate(
        templateToUse, 
        sectionData, 
        sectionType, 
        jobDescription || ''
      );
      
      const responseData = {
        enhanced: enhancedResult.enhanced,
        templateUsed: enhancedResult.templateUsed,
        sectionType,
        original: sectionData
      };

      await enhancedLogger.logSuccess('SECTION_ENHANCEMENT', {
        requestId,
        templateUsed: enhancedResult.templateUsed,
        sectionType,
        originalLength: JSON.stringify(sectionData).length,
        enhancedLength: typeof enhancedResult.enhanced === 'string' 
          ? enhancedResult.enhanced.length 
          : JSON.stringify(enhancedResult.enhanced).length,
        enhancedData: enhancedResult.enhanced,
        improvementRatio: ((typeof enhancedResult.enhanced === 'string' 
          ? enhancedResult.enhanced.length 
          : JSON.stringify(enhancedResult.enhanced).length) / JSON.stringify(sectionData).length).toFixed(2)
      }, 'section_enhancement.log');
      
      res.json({
        success: true,
        data: responseData
      });
      
    } catch (error) {
      await enhancedLogger.logError('SECTION_ENHANCEMENT', error, {
        requestId,
        sectionType: req.body.sectionType,
        templateName: req.body.templateName
      }, 'section_enhancement.log');
      
      if (error.message.includes('rate limit')) {
        return res.status(429).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to enhance section'
      });
    }
  }

  async getStatus(req, res) {
    const requestId = `status_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await enhancedLogger.logStart('SERVICE_STATUS_CHECK', {
      requestId
    }, 'service_status.log');

    try {
      const status = await aiService.getServiceStatus();
      
      await enhancedLogger.logSuccess('SERVICE_STATUS_CHECK', {
        requestId,
        status: status
      }, 'service_status.log');
      
      res.json({
        success: true,
        data: status
      });
      
    } catch (error) {
      await enhancedLogger.logError('SERVICE_STATUS_CHECK', error, {
        requestId
      }, 'service_status.log');
      
      res.status(500).json({
        success: false,
        error: 'Failed to check AI service status'
      });
    }
  }

  async parseResumeText(req, res) {
    const requestId = `parse_text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await enhancedLogger.logStart('RESUME_TEXT_PARSING', {
      requestId,
      textLength: req.body.resumeText?.length || 0,
      textPreview: req.body.resumeText ? req.body.resumeText.substring(0, 200) + '...' : 'not provided'
    }, 'resume_text_parsing.log');

    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await enhancedLogger.logError('RESUME_TEXT_PARSING', new Error('Validation failed'), {
          requestId,
          validationErrors: errors.array()
        }, 'resume_text_parsing.log');

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { resumeText } = req.body;
      
      const parsedData = await aiService.parseResume(resumeText);
      
      const responseData = {
        parsed: parsedData,
        inputText: resumeText
      };

      await enhancedLogger.logSuccess('RESUME_TEXT_PARSING', {
        requestId,
        inputTextLength: resumeText.length,
        parsedSections: Object.keys(parsedData || {}),
        responseSize: JSON.stringify(responseData).length
      }, 'resume_text_parsing.log');
      
      res.json({
        success: true,
        data: responseData
      });
      
    } catch (error) {
      await enhancedLogger.logError('RESUME_TEXT_PARSING', error, {
        requestId,
        textLength: req.body.resumeText?.length || 0
      }, 'resume_text_parsing.log');
      
      if (error.message.includes('rate limit')) {
        return res.status(429).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to parse resume text'
      });
    }
  }

  // TEMPLATE-AWARE METHODS

  async enhanceFullResume(req, res) {
    const requestId = `enhance_full_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await enhancedLogger.logStart('FULL_RESUME_ENHANCEMENT', {
      requestId,
      templateName: req.body.templateName,
      enhancementType: req.body.enhancementType || 'general',
      resumeDataSections: Object.keys(req.body.resumeData || {}),
      hasJobDescription: !!req.body.jobDescription,
      jobDescriptionLength: req.body.jobDescription?.length || 0,
      originalResumeData: req.body.resumeData
    }, 'full_resume_enhancement.log');

    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await enhancedLogger.logError('FULL_RESUME_ENHANCEMENT', new Error('Validation failed'), {
          requestId,
          validationErrors: errors.array()
        }, 'full_resume_enhancement.log');

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { templateName, resumeData, jobDescription, enhancementType } = req.body;
      
      await enhancedLogger.logInfo('FULL_RESUME_ENHANCEMENT_CONFIG', {
        requestId,
        templateName,
        enhancementType: enhancementType || 'general',
        sectionsToEnhance: Object.keys(resumeData || {}),
        jobDescriptionPreview: jobDescription ? jobDescription.substring(0, 200) + '...' : 'not provided'
      }, 'full_resume_enhancement.log');
      
      const enhancedResult = await aiServiceCoordinator.enhanceFullResume(
        templateName, 
        resumeData, 
        jobDescription || '', 
        enhancementType || 'general'
      );
      
      await enhancedLogger.logSuccess('FULL_RESUME_ENHANCEMENT', {
        requestId,
        templateUsed: enhancedResult.templateUsed,
        sectionsEnhanced: Object.keys(enhancedResult.enhanced || {}),
        enhancementType: enhancedResult.enhancementType,
        originalSize: JSON.stringify(resumeData).length,
        enhancedSize: JSON.stringify(enhancedResult.enhanced).length,
        enhancedData: enhancedResult.enhanced,
        improvementRatio: (JSON.stringify(enhancedResult.enhanced).length / JSON.stringify(resumeData).length).toFixed(2)
      }, 'full_resume_enhancement.log');
      
      res.json({
        success: true,
        data: enhancedResult
      });
      
    } catch (error) {
      await enhancedLogger.logError('FULL_RESUME_ENHANCEMENT', error, {
        requestId,
        templateName: req.body.templateName,
        enhancementType: req.body.enhancementType
      }, 'full_resume_enhancement.log');
      
      if (error.message.includes('rate limit')) {
        return res.status(429).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.message.includes('not found') || error.message.includes('Unsupported template')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to enhance full resume'
      });
    }
  }

  async enhanceSectionWithTemplate(req, res) {
    const requestId = `enhance_template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await enhancedLogger.logStart('TEMPLATE_SECTION_ENHANCEMENT', {
      requestId,
      templateName: req.body.templateName,
      sectionType: req.body.sectionType,
      hasJobDescription: !!req.body.jobDescription,
      sectionDataSize: JSON.stringify(req.body.sectionData || {}).length,
      originalSectionData: req.body.sectionData
    }, 'template_section_enhancement.log');

    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await enhancedLogger.logError('TEMPLATE_SECTION_ENHANCEMENT', new Error('Validation failed'), {
          requestId,
          validationErrors: errors.array()
        }, 'template_section_enhancement.log');

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { templateName, sectionData, sectionType, jobDescription } = req.body;
      
      await enhancedLogger.logInfo('TEMPLATE_SECTION_ENHANCEMENT_CONFIG', {
        requestId,
        templateName,
        sectionType,
        jobDescriptionPreview: jobDescription ? jobDescription.substring(0, 200) + '...' : 'not provided'
      }, 'template_section_enhancement.log');
      
      const enhancedResult = await aiServiceCoordinator.enhanceSectionWithTemplate(
        templateName, 
        sectionData, 
        sectionType, 
        jobDescription || ''
      );
      
      await enhancedLogger.logSuccess('TEMPLATE_SECTION_ENHANCEMENT', {
        requestId,
        templateUsed: enhancedResult.templateUsed,
        sectionType,
        originalLength: JSON.stringify(sectionData).length,
        enhancedLength: typeof enhancedResult.enhanced === 'string' 
          ? enhancedResult.enhanced.length 
          : JSON.stringify(enhancedResult.enhanced).length,
        promptUsed: enhancedResult.promptUsed ? 'Yes' : 'No',
        enhancedData: enhancedResult.enhanced,
        improvementRatio: ((typeof enhancedResult.enhanced === 'string' 
          ? enhancedResult.enhanced.length 
          : JSON.stringify(enhancedResult.enhanced).length) / JSON.stringify(sectionData).length).toFixed(2)
      }, 'template_section_enhancement.log');
      
      res.json({
        success: true,
        data: enhancedResult
      });
      
    } catch (error) {
      await enhancedLogger.logError('TEMPLATE_SECTION_ENHANCEMENT', error, {
        requestId,
        templateName: req.body.templateName,
        sectionType: req.body.sectionType
      }, 'template_section_enhancement.log');
      
      if (error.message.includes('rate limit')) {
        return res.status(429).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.message.includes('not found') || error.message.includes('Unsupported')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to enhance section with template'
      });
    }
  }

  async getTemplateRecommendation(req, res) {
    const requestId = `template_rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await enhancedLogger.logStart('TEMPLATE_RECOMMENDATION', {
      requestId,
      resumeDataSections: Object.keys(req.body.resumeData || {}),
      hasJobDescription: !!req.body.jobDescription,
      jobDescriptionLength: req.body.jobDescription?.length || 0,
      resumeDataAnalysis: req.body.resumeData
    }, 'template_recommendation.log');

    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await enhancedLogger.logError('TEMPLATE_RECOMMENDATION', new Error('Validation failed'), {
          requestId,
          validationErrors: errors.array()
        }, 'template_recommendation.log');

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { resumeData, jobDescription } = req.body;
      
      await enhancedLogger.logInfo('TEMPLATE_RECOMMENDATION_ANALYSIS', {
        requestId,
        sectionsAnalyzed: Object.keys(resumeData || {}),
        jobDescriptionPreview: jobDescription ? jobDescription.substring(0, 200) + '...' : 'not provided'
      }, 'template_recommendation.log');
      
      const recommendation = await aiServiceCoordinator.getTemplateRecommendation(
        resumeData, 
        jobDescription || ''
      );
      
      await enhancedLogger.logSuccess('TEMPLATE_RECOMMENDATION', {
        requestId,
        recommendedTemplate: recommendation.recommendedTemplate,
        confidence: recommendation.confidence,
        reasons: recommendation.reasons,
        alternativeTemplates: recommendation.alternatives || [],
        analysisDetails: recommendation
      }, 'template_recommendation.log');
      
      res.json({
        success: true,
        data: recommendation
      });
      
    } catch (error) {
      await enhancedLogger.logError('TEMPLATE_RECOMMENDATION', error, {
        requestId,
        resumeDataSections: Object.keys(req.body.resumeData || {})
      }, 'template_recommendation.log');
      
      if (error.message.includes('rate limit')) {
        return res.status(429).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to get template recommendation'
      });
    }
  }

  async getTemplateCapabilities(req, res) {
    const requestId = `template_cap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await enhancedLogger.logStart('TEMPLATE_CAPABILITIES', {
      requestId,
      templateName: req.params.templateName || 'all templates'
    }, 'template_capabilities.log');

    try {
      const { templateName } = req.params;
      
      await enhancedLogger.logInfo('TEMPLATE_CAPABILITIES_QUERY', {
        requestId,
        templateRequested: templateName || 'all'
      }, 'template_capabilities.log');
      
      const capabilities = await aiServiceCoordinator.getTemplateCapabilities(templateName);
      
      await enhancedLogger.logSuccess('TEMPLATE_CAPABILITIES', {
        requestId,
        templateName: templateName || 'all',
        capabilitiesFound: Object.keys(capabilities || {}),
        capabilitiesData: capabilities
      }, 'template_capabilities.log');
      
      res.json({
        success: true,
        data: capabilities
      });
      
    } catch (error) {
      await enhancedLogger.logError('TEMPLATE_CAPABILITIES', error, {
        requestId,
        templateName: req.params.templateName
      }, 'template_capabilities.log');
      
      if (error.message.includes('not found') || error.message.includes('Unsupported template')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to get template capabilities'
      });
    }
  }

  async getAvailableTemplates(req, res) {
    const requestId = `available_templates_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await enhancedLogger.logStart('AVAILABLE_TEMPLATES', {
      requestId
    }, 'available_templates.log');

    try {
      const templates = aiServiceCoordinator.getAvailableTemplates();
      
      await enhancedLogger.logSuccess('AVAILABLE_TEMPLATES', {
        requestId,
        templatesCount: templates.length,
        templatesList: templates,
        templatesData: templates.map(template => ({
          name: template,
          type: typeof template
        }))
      }, 'available_templates.log');
      
      res.json({
        success: true,
        data: {
          templates,
          count: templates.length
        }
      });
      
    } catch (error) {
      await enhancedLogger.logError('AVAILABLE_TEMPLATES', error, {
        requestId
      }, 'available_templates.log');
      
      res.status(500).json({
        success: false,
        error: 'Failed to get available templates'
      });
    }
  }

  async getEnhancedStatus(req, res) {
    const requestId = `enhanced_status_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await enhancedLogger.logStart('ENHANCED_STATUS_CHECK', {
      requestId
    }, 'enhanced_status.log');

    try {
      const status = await aiServiceCoordinator.getEnhancedServiceStatus();
      
      await enhancedLogger.logSuccess('ENHANCED_STATUS_CHECK', {
        requestId,
        statusComponents: Object.keys(status || {}),
        statusData: status
      }, 'enhanced_status.log');
      
      res.json({
        success: true,
        data: status
      });
      
    } catch (error) {
      await enhancedLogger.logError('ENHANCED_STATUS_CHECK', error, {
        requestId
      }, 'enhanced_status.log');
      
      res.status(500).json({
        success: false,
        error: 'Failed to check enhanced AI service status'
      });
    }
  }
}

module.exports = new AIController();