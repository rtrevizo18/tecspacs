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
   * Save object as JSON file
   * @param {string} filePath - Path to save JSON file
   * @param {Object} data - Data to save
   * @param {Object} options - Save options
   * @returns {Promise<void>}
   */
  static async saveJSON(filePath, data, options = {}) {
    const { indent = 2, ...saveOptions } = options;

    try {
      const jsonString = JSON.stringify(data, null, indent);
      await this.saveFile(filePath, jsonString, saveOptions);
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
   * Read JSON file
   * @param {string} filePath - Path to JSON file
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
   * Delete a directory and all its contents
   * @param {string} dirPath - Path to the directory to delete
   * @returns {Promise<void>}
   */
  static async deleteDirectory(dirPath) {
    try {
      await fs.rm(dirPath, { recursive: true, force: true });
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new FileSystemError(`Directory not found`, dirPath);
      }
      throw new FileSystemError(
        `Failed to delete directory: ${error.message}`,
        dirPath
      );
    }
  }

  /**
   * Get file/directory stats
   * @param {string} filePath - Path to check
   * @returns {Promise<fs.Stats>} - Node.js fs.Stats object
   */
  static async getStats(filePath) {
    try {
      return await fs.stat(filePath);
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

  /**
   * Copy directory recursively
   * @param {string} source - Source directory path
   * @param {string} destination - Destination directory path
   * @param {Object} options - Copy options
   * @returns {Promise<void>}
   */
  static async copyDirectory(source, destination, options = {}) {
    const { overwrite = true } = options;

    try {
      // Check if source exists and is a directory
      if (!(await this.exists(source))) {
        throw new FileSystemError(`Source directory does not exist`, source);
      }

      const sourceStats = await this.getStats(source);
      if (!sourceStats.isDirectory()) {
        throw new FileSystemError(`Source is not a directory`, source);
      }

      // Create destination directory
      await this.ensureDirectory(destination);

      // Read source directory contents
      const entries = await fs.readdir(source, { withFileTypes: true });

      // Copy each entry
      for (const entry of entries) {
        const sourcePath = path.join(source, entry.name);
        const destPath = path.join(destination, entry.name);

        if (entry.isDirectory()) {
          // Recursively copy subdirectory
          await this.copyDirectory(sourcePath, destPath, options);
        } else {
          // Copy file
          await this.copyFile(sourcePath, destPath, { overwrite });
        }
      }
    } catch (error) {
      if (error instanceof FileSystemError) {
        throw error;
      }
      throw new FileSystemError(
        `Failed to copy directory: ${error.message}`,
        `${source} -> ${destination}`
      );
    }
  }
}
