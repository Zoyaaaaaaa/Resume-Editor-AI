const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class FileUtils {
    static async createTempDir() {
        const tempBasePath = os.tmpdir();
        const tempDirName = `resume-editor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const tempDirPath = path.join(tempBasePath, tempDirName);
        
        try {
            await fs.mkdir(tempDirPath, { recursive: true });
            return tempDirPath;
        } catch (error) {
            throw new Error(`Failed to create temporary directory: ${error.message}`);
        }
    }

    static async cleanupTempFiles(dirPath) {
        try {
            const files = await fs.readdir(dirPath);
            
            // Delete all files in the directory
            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const stat = await fs.stat(filePath);
                
                if (stat.isDirectory()) {
                    await this.cleanupTempFiles(filePath); // Recursive cleanup
                    await fs.rmdir(filePath);
                } else {
                    await fs.unlink(filePath);
                }
            }
            
            // Delete the directory itself
            await fs.rmdir(dirPath);
        } catch (error) {
            console.warn(`Failed to cleanup temp files at ${dirPath}:`, error.message);
        }
    }

    static async ensureDirectoryExists(dirPath) {
        try {
            await fs.access(dirPath);
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.mkdir(dirPath, { recursive: true });
            } else {
                throw error;
            }
        }
    }

    static async getFileStats(filePath) {
        try {
            const stats = await fs.stat(filePath);
            return {
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime,
                isFile: stats.isFile(),
                isDirectory: stats.isDirectory()
            };
        } catch (error) {
            throw new Error(`Failed to get file stats: ${error.message}`);
        }
    }

    static async deleteFile(filePath) {
        try {
            await fs.unlink(filePath);
        } catch (error) {
            if (error.code !== 'ENOENT') { // Ignore "file not found" errors
                throw new Error(`Failed to delete file: ${error.message}`);
            }
        }
    }

    static async copyFile(sourcePath, destinationPath) {
        try {
            await fs.copyFile(sourcePath, destinationPath);
        } catch (error) {
            throw new Error(`Failed to copy file: ${error.message}`);
        }
    }

    static getFileExtension(filename) {
        return path.extname(filename).toLowerCase();
    }

    static generateUniqueFilename(originalName) {
        const ext = path.extname(originalName);
        const name = path.basename(originalName, ext);
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        
        return `${name}_${timestamp}_${random}${ext}`;
    }

    static validateFileType(filename, allowedTypes) {
        const ext = this.getFileExtension(filename);
        return allowedTypes.includes(ext);
    }

    static async getDirectorySize(dirPath) {
        let totalSize = 0;
        
        try {
            const files = await fs.readdir(dirPath);
            
            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const stats = await fs.stat(filePath);
                
                if (stats.isDirectory()) {
                    totalSize += await this.getDirectorySize(filePath);
                } else {
                    totalSize += stats.size;
                }
            }
        } catch (error) {
            console.warn(`Failed to calculate directory size for ${dirPath}:`, error.message);
        }
        
        return totalSize;
    }

    static formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    static async cleanupOldTempFiles(maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
        const tempBasePath = os.tmpdir();
        
        try {
            const entries = await fs.readdir(tempBasePath, { withFileTypes: true });
            const now = Date.now();
            
            for (const entry of entries) {
                if (entry.isDirectory() && entry.name.startsWith('resume-editor-')) {
                    const dirPath = path.join(tempBasePath, entry.name);
                    
                    try {
                        const stats = await fs.stat(dirPath);
                        const age = now - stats.birthtime.getTime();
                        
                        if (age > maxAge) {
                            await this.cleanupTempFiles(dirPath);
                            console.log(`Cleaned up old temp directory: ${entry.name}`);
                        }
                    } catch (error) {
                        console.warn(`Failed to check/cleanup temp directory ${entry.name}:`, error.message);
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to cleanup old temp files:', error.message);
        }
    }

    static async writeJsonFile(filePath, data) {
        try {
            const jsonString = JSON.stringify(data, null, 2);
            await fs.writeFile(filePath, jsonString, 'utf8');
        } catch (error) {
            throw new Error(`Failed to write JSON file: ${error.message}`);
        }
    }

    static async readJsonFile(filePath) {
        try {
            const jsonString = await fs.readFile(filePath, 'utf8');
            return JSON.parse(jsonString);
        } catch (error) {
            throw new Error(`Failed to read JSON file: ${error.message}`);
        }
    }

    static sanitizeFilename(filename) {
        // Remove or replace unsafe characters
        return filename
            .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace unsafe chars with underscore
            .replace(/_{2,}/g, '_') // Replace multiple underscores with single
            .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
            .substring(0, 255); // Limit length
    }

    static async isFileEmpty(filePath) {
        try {
            const stats = await fs.stat(filePath);
            return stats.size === 0;
        } catch (error) {
            throw new Error(`Failed to check if file is empty: ${error.message}`);
        }
    }

    static async moveFile(sourcePath, destinationPath) {
        try {
            await fs.rename(sourcePath, destinationPath);
        } catch (error) {
            // If rename fails (e.g., cross-device), try copy and delete
            try {
                await this.copyFile(sourcePath, destinationPath);
                await this.deleteFile(sourcePath);
            } catch (copyError) {
                throw new Error(`Failed to move file: ${copyError.message}`);
            }
        }
    }
}

// Export individual functions for backwards compatibility
module.exports = FileUtils;
module.exports.createTempDir = FileUtils.createTempDir;
module.exports.cleanupTempFiles = FileUtils.cleanupTempFiles;
module.exports.ensureDirectoryExists = FileUtils.ensureDirectoryExists;
module.exports.getFileStats = FileUtils.getFileStats;
module.exports.deleteFile = FileUtils.deleteFile;
module.exports.copyFile = FileUtils.copyFile;
module.exports.getFileExtension = FileUtils.getFileExtension;
module.exports.generateUniqueFilename = FileUtils.generateUniqueFilename;
module.exports.validateFileType = FileUtils.validateFileType;
module.exports.formatFileSize = FileUtils.formatFileSize;
module.exports.cleanupOldTempFiles = FileUtils.cleanupOldTempFiles;
module.exports.writeJsonFile = FileUtils.writeJsonFile;
module.exports.readJsonFile = FileUtils.readJsonFile;
module.exports.sanitizeFilename = FileUtils.sanitizeFilename;