import { FileManager } from './file-manager.js';
import { FileSystemError, ProgramError } from '../models/error.js';
import path from 'path';
import envPaths from 'env-paths';

export class StorageManager {
  constructor(db) {
    this.db = db;
  }

  async rollback(rollbackTasks) {
    // Execute rollback tasks in reverse order
    for (let i = rollbackTasks.length - 1; i >= 0; i--) {
      try {
        await rollbackTasks[i]();
      } catch (error) {
        console.error('Rollback error:', error.message);
      }
    }
  }

  async storeTec(tec) {
    const { name } = tec;
    const rollbackTasks = [];

    try {
      const tecId = await this.db.createSnippet(tec);
      // Only rollbacks if completed creating snippet
      rollbackTasks.push(async () => await this.db.deleteSnippet(name));

      return {
        id: tecId,
        name,
      };
    } catch (error) {
      // Execute rollback
      await this.rollback(rollbackTasks);

      throw error;
    }
  }

  async updateTec(name, updatedSnippet) {
    const rollbackTasks = [];
    let originalSnippet = null;

    try {
      // Get current snippet data for rollback
      originalSnippet = await this.db.getSnippet(name);

      await this.db.updateSnippet(name, updatedSnippet);

      rollbackTasks.push(async () => {
        await this.db.updateSnippet(name, originalSnippet);
      });

      return await this.db.getSnippet(name);
    } catch (error) {
      await this.rollback(rollbackTasks);
      throw error;
    }
  }

  async deleteTec(name) {
    // Shouldn't need rollbackTasks, but just to keep things consistent
    const rollbackTasks = [];

    try {
      // Get snippet data before deletion
      const snippet = await this.db.getSnippet(name);

      if (!snippet) {
        throw new Error(`Snippet ${name} does not exist!`);
      }

      // Delete from database first
      await this.db.deleteSnippet(name);

      rollbackTasks.push(async () => {
        await this.db.createSnippet(snippet);
      });
    } catch (error) {
      await this.rollback(rollbackTasks);
      throw error;
    }
  }

  async getTec(name) {
    try {
      const snippet = await this.db.getSnippet(name);
      if (!snippet) {
        return null;
      }
      return snippet;
    } catch (error) {
      throw error;
    }
  }

  // FIXME: NEED TO LOOK AT PACS FURTHER

  // Package methods
  // async createPackage({
  //   name,
  //   version,
  //   description,
  //   language,
  //   category,
  //   package_path,
  //   manifest_path,
  //   author = null,
  // }) {
  //   const stmt = `
  //     INSERT INTO packages (name, version, description, author, language, category, package_path, manifest_path)
  //     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  //   `;

  // Going to change b/c a package_path should be mandatory!!!
  async storePac(pac) {
    const {
      name,
      version,
      description,
      author = null,
      language,
      category,
      package_path,
    } = pac;
    const rollbackTasks = [];

    const paths = envPaths('tcspcs');
    const packagesDir = path.join(paths.data, 'packages');

    try {
      await FileManager.ensureDirectory(packagesDir);

      // Create package directory
      const packageDir = path.join(packagesDir, name);
      await FileManager.ensureDirectory(packageDir);
      rollbackTasks.push(
        async () => await FileManager.deleteDirectory(packageDir)
      );

      // Copy source files/folders recursively
      if (!(await FileManager.exists(package_path))) {
        throw new Error(`Source path does not exist: ${package_path}`);
      }

      const sourceStats = await FileManager.getStats(package_path);
      if (sourceStats.isDirectory()) {
        await FileManager.copyDirectory(package_path, packageDir);
      } else if (sourceStats.isFile()) {
        // Copy single file to package directory
        const fileName = path.basename(package_path);
        const destinationPath = path.join(packageDir, fileName);
        await FileManager.copyFile(package_path, destinationPath);
      } else {
        throw new Error(
          `Source path is neither a file nor directory: ${package_path}`
        );
      }

      const manifest_path = path.join(packageDir, 'pacs.json');
      const manifest = {
        name,
        version,
        description,
        author,
        language,
        category,
        created_at: new Date().toISOString(),
        package_path,
      };

      await FileManager.saveJSON(manifest_path, manifest);

      // Create database entry
      const pacId = await this.db.createPackage({
        name,
        version,
        description,
        author,
        language,
        category,
        package_path: packageDir,
        manifest_path,
      });
      // Again, probably not needed but for consistency sake
      rollbackTasks.push(async () => await this.db.deletePackage(name));

      return {
        id: pacId,
        name,
        package_path: packageDir,
        manifest_path: manifest_path,
      };
    } catch (error) {
      await this.rollback(rollbackTasks);
      throw error;
    }
  }

  // Helper manifest file contents, helper for updatePac
  async updateManifest(originalPackage, updatedPackage, originalManifest) {
    // Only add properties from updatedPackage if they're manifest properties
    // Which we can check by getting the keys from originalManifest
    const updatedManifest = { ...originalManifest };
    for (const key of Object.keys(updatedPackage)) {
      if (key in originalManifest) {
        updatedManifest[key] = updatedPackage[key];
      }
    }

    await FileManager.ensureDirectory(
      path.dirname(originalPackage.manifest_path)
    );

    // Save time last modified
    updatedManifest.modified_at = new Date().toISOString();

    await FileManager.saveJSON(originalPackage.manifest_path, updatedManifest);
  }

  // Update file contents of package, helper for updatePac
  async updateContents(originalPackage, updatedPackage) {
    // Clear existing content first
    const packageContentDir = originalPackage.package_path;

    if (await FileManager.exists(packageContentDir)) {
      await FileManager.deleteDirectory(packageContentDir);
    }

    await FileManager.ensureDirectory(packageContentDir);

    // Copy new source
    const sourceStats = await FileManager.getStats(updatedPackage.package_path);

    if (sourceStats.isDirectory()) {
      await FileManager.copyDirectory(
        updatedPackage.package_path,
        packageContentDir
      );
    } else if (sourceStats.isFile()) {
      const fileName = path.basename(updatedPackage.package_path);
      const destinationPath = path.join(packageContentDir, fileName);
      await FileManager.copyFile(updatedPackage.package_path, destinationPath);
    } else {
      throw new ProgramError(
        'Package path is neither a file nor directory: ' +
          updatedPackage.package_path
      );
    }
  }

  async updatePac(name, updatedPackage) {
    const rollbackTasks = [];
    let originalPackage = null;

    try {
      originalPackage = await this.db.getPackage(name);

      const originalManifest = await FileManager.readJSON(
        originalPackage.manifest_path
      );
      rollbackTasks.push(
        async () =>
          await FileManager.saveJSON(
            originalPackage.manifest_path,
            originalManifest
          )
      );

      // Handle source path updates (re-copy files)
      if (updatedPackage.package_path) {
        await this.updateContents(originalPackage, updatedPackage);
      }

      // Update manifest to reflect changes
      await this.updateManifest(
        originalPackage,
        updatedPackage,
        originalManifest
      );

      return this.db.getPackage(name);
    } catch (error) {
      await this.rollback(rollbackTasks);
      throw error;
    }
  }

  async deletePac(name) {
    const rollbackTasks = [];
    let pkg = null;

    try {
      pkg = await this.db.getPackage(name);

      // Read manifest for rollback
      const manifest = await FileManager.readJSON(pkg.manifest_path);

      // Delete from database
      await this.db.deletePackage(name);

      rollbackTasks.push(async () => {
        await this.db.createPackage(pkg);
      });

      // Delete package directory
      await FileManager.deleteDirectory(pkg.package_path);
      // FIXME: Create temp directory copy
      rollbackTasks.push(async () => {
        await FileManager.ensureDirectory(pkg.package_path);
        await FileManager.saveJSON(pkg.manifest_path, manifest);
      });
    } catch (error) {
      await this.rollback(rollbackTasks);
      throw error;
    }
  }

  async getPac(name) {
    let pkg = null;
    try {
      pkg = await this.db.getPackage(name);
      if (!pkg) {
        return null;
      }

      const manifest = await FileManager.readJSON(pkg.manifest_path);

      return {
        ...pkg,
        manifest,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateTecOnlineId(name, onlineId) {
    try {
      await this.db.updateSnippet(name, {
        online_id: onlineId,
      });
    } catch (error) {
      throw error;
    }
  }

  async updatePacOnlineId(name, onlineId) {
    try {
      await this.db.updatePackage(name, {
        online_id: onlineId,
      });
    } catch (error) {
      throw error;
    }
  }
}
