import { StorageManager } from '../util/storage-manager.js';
import { ErrorHandler } from '../util/error-handler.js';
import { FileManager } from '../util/file-manager.js';
import { db } from '../db/db-manager.js';

const getPacAction = async (name, options) => {
  try {
    if (!name || name.trim() === '') {
      throw new Error('Package name is required');
    }

    const pac = await StorageManager.getPac(name.trim());

    if (!pac) {
      console.log(`Package "${name}" not found`);
      return;
    }

    // Load manifest content
    let manifest = {};
    try {
      manifest = await FileManager.readJSON(pac.manifest_path);
    } catch (error) {
      console.log('Warning: Could not read manifest file');
      manifest = { error: 'Unable to load manifest' };
    }

    // Display package information
    console.log(`\nPackage: ${pac.name}`);
    console.log(`Version: ${pac.version}`);
    console.log(`Language: ${pac.language}`);
    console.log(`Category: ${pac.category || 'None'}`);

    if (pac.description) {
      console.log(`Description: ${pac.description}`);
    }

    if (pac.author) {
      console.log(`Author: ${pac.author}`);
    }

    console.log(`Usage Count: ${pac.usage_count}`);
    console.log(`Package Path: ${pac.package_path}`);
    console.log(`Manifest Path: ${pac.manifest_path}`);

    // Display manifest content
    console.log('\n--- Manifest ---');
    console.log(JSON.stringify(manifest, null, 2));
    console.log('--- End ---\n');

    // Increment usage count
    db.incrementPackageUsage(name);

    console.log(`Retrieved package "${name}"`);
  } catch (error) {
    ErrorHandler.handle(error, 'Get Package');
  }
};

const createPacAction = async (name, options) => {
  try {
    // Validate input
    if (!name || name.trim() === '') {
      throw new Error('Package name is required');
    }

    const { version, description, author, language, category, sourcePath } =
      options;

    // Validate required fields
    if (!version) {
      throw new Error('Version is required');
    }

    if (!language) {
      throw new Error('Language is required');
    }

    const existingPac = await StorageManager.getPac(name.trim());
    if (existingPac) {
      throw new Error(`Package "${name}" already exists`);
    }

    // Create the package
    const result = await StorageManager.storePac({
      name: name.trim(),
      version,
      description: description || '',
      author: author || '',
      language: language.toLowerCase(),
      category: category || 'general',
      sourcePath: sourcePath || null,
    });

    console.log(`\nCreated package "${name}"`);
    console.log(`   ID: ${result.id}`);
    console.log(`   Version: ${version}`);
    console.log(`   Language: ${language}`);
    console.log(`   Category: ${category || 'general'}`);
    console.log(`   Package Path: ${result.packagePath}`);
    console.log(`   Manifest Path: ${result.manifestPath}`);

    if (sourcePath) {
      console.log(
        `   Source Files: ${result.sourcesCopied ? 'Copied' : 'Failed to copy'}`
      );
      console.log(`   Source Path: ${sourcePath}`);
    } else {
      console.log(`   Source Files: None (empty package)`);
    }

    if (description) {
      console.log(`   Description: ${description}`);
    }

    if (author) {
      console.log(`   Author: ${author}`);
    }
  } catch (error) {
    ErrorHandler.handle(error, 'Create Package');
  }
};

const updatePacAction = async (name, options) => {
  try {
    // Validate input
    if (!name || name.trim() === '') {
      throw new Error('Package name is required');
    }

    // Check if package exists
    const existingPac = await StorageManager.getPac(name.trim());
    if (!existingPac) {
      throw new Error(`Package "${name}" not found`);
    }

    // Build updates object
    const updates = {};
    const { version, description, author, language, category, sourcePath } =
      options;

    if (version !== undefined) {
      updates.version = version;
    }

    if (description !== undefined) {
      updates.description = description;
    }

    if (author !== undefined) {
      updates.author = author;
    }

    if (language !== undefined) {
      updates.language = language.toLowerCase();
    }

    if (category !== undefined) {
      updates.category = category;
    }

    if (sourcePath !== undefined) {
      updates.sourcePath = sourcePath;
    }

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      console.log(`No updates provided for package "${name}"`);
      return;
    }

    // Update the package
    const updatedPac = await StorageManager.updatePac(name.trim(), updates);

    console.log(`\nUpdated package "${name}"`);
    console.log(`   Version: ${updatedPac.version}`);
    console.log(`   Language: ${updatedPac.language}`);
    console.log(`   Category: ${updatedPac.category || 'None'}`);

    if (updatedPac.description) {
      console.log(`   Description: ${updatedPac.description}`);
    }

    if (updatedPac.author) {
      console.log(`   Author: ${updatedPac.author}`);
    }

    // Show what was updated
    const updatedFields = Object.keys(updates);
    console.log(`   Updated fields: ${updatedFields.join(', ')}`);

    if (sourcePath) {
      console.log(`   Source files re-copied from: ${sourcePath}`);
    }
  } catch (error) {
    ErrorHandler.handle(error, 'Update Package');
  }
};

const deletePacAction = async (name, options) => {
  try {
    // Validate input
    if (!name || name.trim() === '') {
      throw new Error('Package name is required');
    }

    // Check if package exists
    const existingPac = await StorageManager.getPac(name.trim());
    if (!existingPac) {
      throw new Error(`Package "${name}" not found`);
    }

    // Show confirmation unless force flag is used
    if (!options.force) {
      console.log(`\nAre you sure you want to delete package "${name}"?`);
      console.log(`   Version: ${existingPac.version}`);
      console.log(`   Language: ${existingPac.language}`);
      console.log(`   Category: ${existingPac.category || 'None'}`);
      console.log(`   Package Path: ${existingPac.package_path}`);

      if (existingPac.description) {
        console.log(`   Description: ${existingPac.description}`);
      }

      if (existingPac.author) {
        console.log(`   Author: ${existingPac.author}`);
      }

      console.log(`\nUse --force flag to skip this confirmation.`);
      return;
    }

    // Delete the package
    const result = await StorageManager.deletePac(name.trim());

    if (result) {
      console.log(`\nDeleted package "${name}"`);
      console.log(`   Removed from database and filesystem`);
    } else {
      throw new Error(`Failed to delete package "${name}"`);
    }
  } catch (error) {
    ErrorHandler.handle(error, 'Delete Package');
  }
};

export { getPacAction, createPacAction, updatePacAction, deletePacAction };
