import { db } from '../db/db-manager.js';
import { FileManager } from './file-manager.js';
import { FileSystemError } from '../models/error.js';
import path from 'path';
import envPaths from 'env-paths';

export class StorageManager {
  static getFileExtension(language) {
    const extensions = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      csharp: 'cs',
      cpp: 'cpp',
      c: 'c',
      html: 'html',
      css: 'css',
      json: 'json',
      yaml: 'yml',
      markdown: 'md',
      sql: 'sql',
      bash: 'sh',
      powershell: 'ps1',
    };
    return extensions[language.toLowerCase()] || 'txt';
  }

  static async rollback(rollbackTasks) {
    // Execute rollback tasks in reverse order
    for (let i = rollbackTasks.length - 1; i >= 0; i--) {
      try {
        await rollbackTasks[i]();
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError.message);
      }
    }
  }

  static async storeTec(tec) {
    const { name, description, language, category, content } = tec;
    const rollbackTasks = [];

    const paths = envPaths('tcspcs');
    const snippetsDir = path.join(paths.data, 'snippets');

    try {
      await FileManager.ensureDirectory(snippetsDir);
      const tecId = db.createSnippet(name, description, language, category, '');
      rollbackTasks.push(() => db.deleteSnippet(name));

      const extension = StorageManager.getFileExtension(language);
      const fileName = `${tecId}.${extension}`;
      const fullFilePath = path.join(snippetsDir, fileName);

      // Save the file content
      await FileManager.saveFile(fullFilePath, content);
      rollbackTasks.push(() => FileManager.deleteFile(fullFilePath));

      // Update the database entry with the correct file path
      const updateResult = db.updateSnippet(name, { file_path: fullFilePath });
      if (!updateResult) {
        throw new Error('Failed to update snippet with file path');
      }

      return {
        id: tecId,
        name,
        filePath: fullFilePath,
      };
    } catch (err) {
      // Execute rollback
      await StorageManager.rollback(rollbackTasks);

      // Then throw the original error with context
      if (err instanceof FileSystemError) {
        throw err;
      }

      throw new FileSystemError(
        `Failed to store tec "${name}": ${err.message}`,
        snippetsDir
      );
    }
  }

  static async updateTec(name, updates) {
    const rollbackTasks = [];
    let originalSnippet = null;

    try {
      // Get current snippet data for rollback
      originalSnippet = db.getSnippet(name);
      if (!originalSnippet) {
        throw new Error(`Snippet "${name}" not found`);
      }

      // Update database first
      const updateResult = db.updateSnippet(name, updates);
      if (!updateResult) {
        throw new Error('Failed to update snippet in database');
      }

      rollbackTasks.push(() => {
        db.updateSnippet(name, {
          description: originalSnippet.description,
          language: originalSnippet.language,
          category: originalSnippet.category,
          file_path: originalSnippet.file_path,
        });
      });

      // If content is being updated, update the file
      if (updates.content) {
        const originalContent = await FileManager.readFile(
          originalSnippet.file_path
        );
        rollbackTasks.push(() =>
          FileManager.saveFile(originalSnippet.file_path, originalContent)
        );

        await FileManager.saveFile(originalSnippet.file_path, updates.content);
      }

      return db.getSnippet(name);
    } catch (err) {
      await StorageManager.rollback(rollbackTasks);

      if (err instanceof FileSystemError) {
        throw err;
      }

      throw new FileSystemError(
        `Failed to update tec "${name}": ${err.message}`,
        originalSnippet?.file_path || 'unknown'
      );
    }
  }

  static async deleteTec(name) {
    const rollbackTasks = [];

    try {
      // Get snippet data before deletion
      const snippet = db.getSnippet(name);
      if (!snippet) {
        throw new Error(`Snippet "${name}" not found`);
      }

      // Read file content for potential rollback
      const fileContent = await FileManager.readFile(snippet.file_path);

      // Delete from database first
      const deleteResult = db.deleteSnippet(name);
      if (!deleteResult) {
        throw new Error('Failed to delete snippet from database');
      }

      rollbackTasks.push(() => {
        const newId = db.createSnippet(
          snippet.name,
          snippet.description,
          snippet.language,
          snippet.category,
          snippet.file_path
        );
        // Note: This won't preserve the original ID, but will restore the data
      });

      // Delete file
      await FileManager.deleteFile(snippet.file_path);
      rollbackTasks.push(() =>
        FileManager.saveFile(snippet.file_path, fileContent)
      );

      return true;
    } catch (err) {
      await StorageManager.rollback(rollbackTasks);

      if (err instanceof FileSystemError) {
        throw err;
      }

      throw new FileSystemError(
        `Failed to delete tec "${name}": ${err.message}`,
        'unknown'
      );
    }
  }

  static async getTec(name) {
    try {
      const snippet = db.getSnippet(name); // Keep this
      if (!snippet) {
        return null;
      }

      const content = await FileManager.readFile(snippet.file_path);

      return {
        ...snippet,
        content,
      };
    } catch (err) {
      if (err instanceof FileSystemError) {
        throw err;
      }

      throw new FileSystemError(
        `Failed to get tec "${name}": ${err.message}`,
        'unknown' // Change this since snippet won't be accessible
      );
    }
  }

  static async storePac(pac) {
    const {
      name,
      version,
      description,
      author,
      language,
      category,
      sourcePath, // Path to folder/file to copy
    } = pac;
    const rollbackTasks = [];

    const paths = envPaths('tcspcs');
    const packagesDir = path.join(paths.data, 'packages');

    try {
      await FileManager.ensureDirectory(packagesDir);

      // Create package directory
      const packageDir = path.join(packagesDir, name);
      await FileManager.ensureDirectory(packageDir);
      rollbackTasks.push(() => FileManager.deleteDirectory(packageDir));

      // Copy source files/folders recursively if sourcePath is provided
      if (sourcePath) {
        // Check if source path exists
        if (!(await FileManager.exists(sourcePath))) {
          throw new Error(`Source path does not exist: ${sourcePath}`);
        }

        const sourceStats = await FileManager.getStats(sourcePath);

        if (sourceStats.isDirectory()) {
          // Copy entire directory structure to a 'content' subdirectory
          const contentDir = path.join(packageDir, 'content');
          await FileManager.copyDirectory(sourcePath, contentDir);
        } else if (sourceStats.isFile()) {
          // Copy single file to package directory
          const fileName = path.basename(sourcePath);
          const destinationPath = path.join(packageDir, fileName);
          await FileManager.copyFile(sourcePath, destinationPath);
        } else {
          throw new Error(
            `Source path is neither a file nor directory: ${sourcePath}`
          );
        }
      }

      const manifestPath = path.join(packageDir, 'package.json');
      const manifest = {
        name,
        version,
        description,
        author,
        language,
        category,
        created_at: new Date().toISOString(),
        source_path: sourcePath || null,
        has_content: sourcePath ? true : false,
      };

      await FileManager.saveJSON(manifestPath, manifest);

      // Create database entry
      const pacId = db.createPackage(
        name,
        version,
        description,
        author,
        language,
        category,
        packageDir,
        manifestPath
      );
      rollbackTasks.push(() => db.deletePackage(name));

      return {
        id: pacId,
        name,
        packagePath: packageDir,
        manifestPath,
        sourcesCopied: sourcePath ? true : false,
      };
    } catch (err) {
      await StorageManager.rollback(rollbackTasks);

      if (err instanceof FileSystemError) {
        throw err;
      }

      throw new FileSystemError(
        `Failed to store package "${name}": ${err.message}`,
        packagesDir
      );
    }
  }

  static async updatePac(name, updates) {
    const rollbackTasks = [];
    let originalPackage = null;

    try {
      originalPackage = db.getPackage(name);
      if (!originalPackage) {
        throw new Error(`Package "${name}" not found`);
      }

      // Update database
      const updateResult = db.updatePackage(name, updates);
      if (!updateResult) {
        throw new Error('Failed to update package in database');
      }

      rollbackTasks.push(() => {
        db.updatePackage(name, {
          version: originalPackage.version,
          description: originalPackage.description,
          author: originalPackage.author,
          language: originalPackage.language,
          category: originalPackage.category,
        });
      });

      // Update manifest file if needed
      if (updates.version || updates.description || updates.author) {
        const originalManifest = await FileManager.readJSON(
          originalPackage.manifest_path
        );
        rollbackTasks.push(() =>
          FileManager.saveJSON(originalPackage.manifest_path, originalManifest)
        );

        const updatedManifest = {
          ...originalManifest,
          ...updates,
        };

        await FileManager.saveJSON(
          originalPackage.manifest_path,
          updatedManifest
        );
      }

      // Handle source path updates (re-copy files)
      if (updates.sourcePath) {
        // Clear existing content first
        const packageContentDir = path.join(
          originalPackage.package_path,
          'content'
        );

        // Backup existing content if it exists
        if (await FileManager.exists(packageContentDir)) {
          await FileManager.deleteDirectory(packageContentDir);
        }

        // Copy new source
        const sourceStats = await FileManager.getStats(updates.sourcePath);

        if (sourceStats.isDirectory()) {
          await FileManager.copyDirectory(
            updates.sourcePath,
            packageContentDir
          );
        } else if (sourceStats.isFile()) {
          await FileManager.ensureDirectory(packageContentDir);
          const fileName = path.basename(updates.sourcePath);
          const destinationPath = path.join(packageContentDir, fileName);
          await FileManager.copyFile(updates.sourcePath, destinationPath);
        }

        // Update manifest to reflect new source
        const manifest = await FileManager.readJSON(
          originalPackage.manifest_path
        );
        manifest.source_path = updates.sourcePath;
        manifest.has_content = true;
        manifest.updated_at = new Date().toISOString();
        await FileManager.saveJSON(originalPackage.manifest_path, manifest);
      }

      return db.getPackage(name);
    } catch (err) {
      await StorageManager.rollback(rollbackTasks);

      if (err instanceof FileSystemError) {
        throw err;
      }

      throw new FileSystemError(
        `Failed to update package "${name}": ${err.message}`,
        originalPackage?.package_path || 'unknown'
      );
    }
  }

  static async deletePac(name) {
    const rollbackTasks = [];
    let pkg = null;

    try {
      pkg = db.getPackage(name);
      if (!pkg) {
        throw new Error(`Package "${name}" not found`);
      }

      // Read manifest for rollback
      const manifest = await FileManager.readJSON(pkg.manifest_path);

      // Delete from database
      const deleteResult = db.deletePackage(name);
      if (!deleteResult) {
        throw new Error('Failed to delete package from database');
      }

      rollbackTasks.push(() => {
        db.createPackage(
          pkg.name,
          pkg.version,
          pkg.description,
          pkg.author,
          pkg.language,
          pkg.category,
          pkg.package_path,
          pkg.manifest_path
        );
      });

      // Delete package directory
      await FileManager.deleteDirectory(pkg.package_path);
      rollbackTasks.push(() => {
        FileManager.ensureDirectory(pkg.package_path);
        FileManager.saveJSON(pkg.manifest_path, manifest);
      });

      return true;
    } catch (err) {
      await StorageManager.rollback(rollbackTasks);

      if (err instanceof FileSystemError) {
        throw err;
      }

      throw new FileSystemError(
        `Failed to delete package "${name}": ${err.message}`,
        'unknown'
      );
    }
  }

  static async getPac(name) {
    let pkg = null;
    try {
      pkg = db.getPackage(name);
      if (!pkg) {
        return null;
      }

      const manifest = await FileManager.readJSON(pkg.manifest_path);

      return {
        ...pkg,
        manifest,
      };
    } catch (err) {
      if (err instanceof FileSystemError) {
        throw err;
      }

      throw new FileSystemError(
        `Failed to get package "${name}": ${err.message}`,
        pkg?.package_path || 'unknown'
      );
    }
  }
}
