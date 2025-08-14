import { db } from '../db/db-manager.js';
import { FileManager } from './file-manager.js';
import { FileSystemError } from '../models/error.js';
import path from 'path';
import envPaths from 'env-paths';

export class StorageManager {
  // static getFileExtension(language) {
  //   const extensions = {
  //     javascript: 'js',
  //     typescript: 'ts',
  //     python: 'py',
  //     java: 'java',
  //     csharp: 'cs',
  //     cpp: 'cpp',
  //     c: 'c',
  //     html: 'html',
  //     css: 'css',
  //     json: 'json',
  //     yaml: 'yml',
  //     markdown: 'md',
  //     sql: 'sql',
  //     bash: 'sh',
  //     powershell: 'ps1',
  //   };
  //   return extensions[language.toLowerCase()] || 'txt';
  // }

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
    const { name } = tec;
    const rollbackTasks = [];

    try {
      const tecId = await db.createSnippet(tec);
      // Only rollbacks if completed creating snippet
      rollbackTasks.push(async () => await db.deleteSnippet(name));

      return {
        id: tecId,
        name,
      };
    } catch (err) {
      // Execute rollback
      await StorageManager.rollback(rollbackTasks);

      throw err;
    }
  }

  static async updateTec(name, updatedSnippet) {
    const rollbackTasks = [];
    let originalSnippet = null;

    try {
      // Get current snippet data for rollback
      originalSnippet = await db.getSnippet(name);

      await db.updateSnippet(name, updatedSnippet);

      rollbackTasks.push(async () => {
        await db.updateSnippet(name, originalSnippet);
      });

      // NOTE: Being stored in db now
      // If content is being updated, update the file
      // if (updates.content) {
      //   const originalContent = await FileManager.readFile(
      //     originalSnippet.file_path
      //   );
      //   rollbackTasks.push(() =>
      //     FileManager.saveFile(originalSnippet.file_path, originalContent)
      //   );

      //   await FileManager.saveFile(originalSnippet.file_path, updates.content);
      // }

      return await db.getSnippet(name);
    } catch (err) {
      await StorageManager.rollback(rollbackTasks);
      throw err;
    }
  }

  static async deleteTec(name) {
    // Shouldn't need rollbackTasks, but just to keep things consistent
    const rollbackTasks = [];

    try {
      // Get snippet data before deletion
      const snippet = db.getSnippet(name);

      if (!snippet) {
        throw new Error(`Snippet "${name}" not found`);
      }

      // Delete from database first
      await db.deleteSnippet(name);

      rollbackTasks.push(async () => {
        await db.createSnippet({ snippet });
      });
    } catch (err) {
      await StorageManager.rollback(rollbackTasks);
      throw err;
    }
  }

  static async getTec(name) {
    try {
      const snippet = await db.getSnippet(name);
      if (!snippet) {
        return null;
      }
      return snippet;
    } catch (err) {
      throw err;
    }
  }

  // FIXME: NEED TO LOOK AT PACS FURTHER

  static async storePac(pac) {
    const {
      name,
      version,
      description,
      author,
      language,
      category,
      sourcePath,
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
  // FIXME: CREATE DB METHODS FOR UPDATING ONLINE_ID
  /**
   * Update the online_id field for a tec in the local database
   * @param {string} name - The name of the tec
   * @param {string} onlineId - The online ID to store
   * @returns {Promise<void>}
   */
  static async updateTecOnlineId(name, onlineId) {
    try {
      const updateResult = db.updateSnippet(name, { online_id: onlineId });
      if (!updateResult) {
        throw new Error(`Failed to update online ID for snippet ${name}`);
      }
    } catch (error) {
      console.error(`Failed to update online ID for snippet ${name}:`, error);
      throw error;
    }
  }

  /**
   * Update the online_id field for a pac in the local database
   * @param {string} name - The name of the pac
   * @param {string} onlineId - The online ID to store
   * @returns {Promise<void>}
   */
  static async updatePacOnlineId(name, onlineId) {
    try {
      const updateResult = db.updatePackage(name, { online_id: onlineId });
      if (!updateResult) {
        throw new Error(`Failed to update online ID for package ${name}`);
      }
    } catch (error) {
      console.error(`Failed to update online ID for package ${name}:`, error);
      throw error;
    }
  }
}
