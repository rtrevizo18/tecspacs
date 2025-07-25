import fs from 'fs/promises';
import path from 'path';
import { FileSystemError } from '../models/error.js';

export class FileManager {
  /**
   * Save content to a file
   * @param {string} filePath - Path to the file
   * @param {string|Buffer} content - Content to write
   * @param {Object} options - Write options
   * @returns {Promise<void>}
   */
  static async saveFile(filePath, content, options = {}) {
    const {
      encoding = 'utf8',
      createDirectories = true,
      overwrite = true,
    } = options;

    try {
      // Check if file exists and overwrite is false
      if (!overwrite && (await this.exists(filePath))) {
        throw new FileSystemError(
          `File already exists and overwrite is disabled`,
          filePath
        );
      }

      // Create directories if needed
      if (createDirectories) {
        await this.ensureDirectory(path.dirname(filePath));
      }

      // Write the file
      await fs.writeFile(filePath, content, { encoding });
    } catch (error) {
      if (error instanceof FileSystemError) {
        throw error;
      }
      throw new FileSystemError(
        `Failed to save file: ${error.message}`,
        filePath
      );
    }
  }

  /**
   * Read content from a file
   * @param {string} filePath - Path to the file
   * @param {Object} options - Read options
   * @returns {Promise<string|Buffer>}
   */
  static async readFile(filePath, options = {}) {
    const { encoding = 'utf8' } = options;

    try {
      return await fs.readFile(filePath, { encoding });
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new FileSystemError(`File not found`, filePath);
      }
      throw new FileSystemError(
        `Failed to read file: ${error.message}`,
        filePath
      );
    }
  }

  /**
   * Save JSON data to a file
   * @param {string} filePath - Path to the JSON file
   * @param {Object} data - Data to save as JSON
   * @param {Object} options - Save options
   * @returns {Promise<void>}
   */
  static async saveJSON(filePath, data, options = {}) {
    const { indent = 2, ...fileOptions } = options;

    try {
      const jsonContent = JSON.stringify(data, null, indent);
      await this.saveFile(filePath, jsonContent, fileOptions);
    } catch (error) {
      if (error instanceof FileSystemError) {
        throw error;
      }
      throw new FileSystemError(
        `Failed to save JSON file: ${error.message}`,
        filePath
      );
    }
  }

  /**
   * Read JSON data from a file
   * @param {string} filePath - Path to the JSON file
   * @returns {Promise<Object>}
   */
  static async readJSON(filePath) {
    try {
      const content = await this.readFile(filePath);
      return JSON.parse(content);
    } catch (error) {
      if (error instanceof FileSystemError) {
        throw error;
      }
      if (error instanceof SyntaxError) {
        throw new FileSystemError(
          `Invalid JSON format: ${error.message}`,
          filePath
        );
      }
      throw new FileSystemError(
        `Failed to read JSON file: ${error.message}`,
        filePath
      );
    }
  }

  /**
   * Check if a file or directory exists
   * @param {string} filePath - Path to check
   * @returns {Promise<boolean>}
   */
  static async exists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Ensure a directory exists, create it if it doesn't
   * @param {string} dirPath - Directory path
   * @returns {Promise<void>}
   */
  static async ensureDirectory(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      throw new FileSystemError(
        `Failed to create directory: ${error.message}`,
        dirPath
      );
    }
  }

  /**
   * Copy a file from source to destination
   * @param {string} sourcePath - Source file path
   * @param {string} destPath - Destination file path
   * @param {Object} options - Copy options
   * @returns {Promise<void>}
   */
  static async copyFile(sourcePath, destPath, options = {}) {
    const { createDirectories = true, overwrite = true } = options;

    try {
      // Check if source exists
      if (!(await this.exists(sourcePath))) {
        throw new FileSystemError(`Source file does not exist`, sourcePath);
      }

      // Check if destination exists and overwrite is false
      if (!overwrite && (await this.exists(destPath))) {
        throw new FileSystemError(
          `Destination file already exists and overwrite is disabled`,
          destPath
        );
      }

      // Create destination directory if needed
      if (createDirectories) {
        await this.ensureDirectory(path.dirname(destPath));
      }

      // Copy the file
      await fs.copyFile(sourcePath, destPath);
    } catch (error) {
      if (error instanceof FileSystemError) {
        throw error;
      }
      throw new FileSystemError(
        `Failed to copy file: ${error.message}`,
        `${sourcePath} -> ${destPath}`
      );
    }
  }

  /**
   * Delete a file
   * @param {string} filePath - Path to the file to delete
   * @returns {Promise<void>}
   */
  static async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new FileSystemError(`File not found`, filePath);
      }
      throw new FileSystemError(
        `Failed to delete file: ${error.message}`,
        filePath
      );
    }
  }

  /**
   * Get file stats
   * @param {string} filePath - Path to the file
   * @returns {Promise<Object>}
   */
  static async getStats(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        created: stats.birthtime,
        modified: stats.mtime,
        accessed: stats.atime,
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new FileSystemError(`File not found`, filePath);
      }
      throw new FileSystemError(
        `Failed to get file stats: ${error.message}`,
        filePath
      );
    }
  }
}
