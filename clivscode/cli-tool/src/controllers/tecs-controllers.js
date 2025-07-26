import { StorageManager } from '../util/storage-manager.js';
import { ErrorHandler } from '../util/error-handler.js';
import { db } from '../db/db-manager.js';
import clipboard from 'clipboardy';

const getTecAction = async name => {
  try {
    // Validate input
    if (!name || name.trim() === '') {
      throw new Error('Snippet name is required');
    }

    // Get the snippet
    const tec = await StorageManager.getTec(name.trim());

    if (!tec) {
      console.log(`Snippet "${name}" not found`);
      return;
    }

    // Display snippet information
    console.log(`\nSnippet: ${tec.name}`);
    console.log(`Language: ${tec.language}`);
    console.log(`Category: ${tec.category || 'None'}`);

    if (tec.description) {
      console.log(`Description: ${tec.description}`);
    }

    console.log(`Usage Count: ${tec.usage_count}`);
    console.log(`File Path: ${tec.file_path}`);

    // Display content
    console.log('\n--- Content ---');
    console.log(tec.content);
    console.log('--- End ---\n');
    await clipboard.write(tec.content);
    console.log('Copied to clipboard!');

    db.incrementSnippetUsage(name);

    console.log(`Retrieved snippet "${name}"`);
  } catch (error) {
    ErrorHandler.handle(error, 'Get Snippet');
  }
};

const createTecAction = async (name, options) => {
  try {
    // Validate input
    if (!name || name.trim() === '') {
      throw new Error('Snippet name is required');
    }

    const { description, language, category, content } = options;

    // Validate required fields
    if (!language) {
      throw new Error('Language is required');
    }

    if (!content) {
      throw new Error('Content is required');
    }

    // Check if snippet already exists
    const existingTec = await StorageManager.getTec(name.trim());
    if (existingTec) {
      throw new Error(`Snippet "${name}" already exists`);
    }

    // Create the snippet
    const result = await StorageManager.storeTec({
      name: name.trim(),
      description: description || '',
      language: language.toLowerCase(),
      category: category || 'general',
      content,
    });

    console.log(`\nCreated snippet "${name}"`);
    console.log(`   ID: ${result.id}`);
    console.log(`   Language: ${language}`);
    console.log(`   Category: ${category || 'general'}`);
    console.log(`   File Path: ${result.filePath}`);

    if (description) {
      console.log(`   Description: ${description}`);
    }
  } catch (error) {
    ErrorHandler.handle(error, 'Create Snippet');
  }
};

const updateTecAction = async (name, options) => {
  try {
    // Validate input
    if (!name || name.trim() === '') {
      throw new Error('Snippet name is required');
    }

    // Check if snippet exists
    const existingTec = await StorageManager.getTec(name.trim());
    if (!existingTec) {
      throw new Error(`Snippet "${name}" not found`);
    }

    // Build updates object
    const updates = {};
    const { description, language, category, content } = options;

    if (description !== undefined) {
      updates.description = description;
    }

    if (language !== undefined) {
      updates.language = language.toLowerCase();
    }

    if (category !== undefined) {
      updates.category = category;
    }

    if (content !== undefined) {
      updates.content = content;
    }

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      console.log(`No updates provided for snippet "${name}"`);
      return;
    }

    // Update the snippet
    const updatedTec = await StorageManager.updateTec(name.trim(), updates);

    console.log(`\nUpdated snippet "${name}"`);
    console.log(`   Language: ${updatedTec.language}`);
    console.log(`   Category: ${updatedTec.category || 'None'}`);

    if (updatedTec.description) {
      console.log(`   Description: ${updatedTec.description}`);
    }

    // Show what was updated
    const updatedFields = Object.keys(updates);
    console.log(`   Updated fields: ${updatedFields.join(', ')}`);
  } catch (error) {
    ErrorHandler.handle(error, 'Update Snippet');
  }
};

const deleteTecAction = async (name, options) => {
  try {
    // Validate input
    if (!name || name.trim() === '') {
      throw new Error('Snippet name is required');
    }

    // Check if snippet exists
    const existingTec = await StorageManager.getTec(name.trim());
    if (!existingTec) {
      throw new Error(`Snippet "${name}" not found`);
    }

    // Delete the snippet
    const result = await StorageManager.deleteTec(name.trim());

    if (result) {
      console.log(`\nDeleted snippet "${name}"`);
      console.log(`   Removed from database and filesystem`);
    } else {
      throw new Error(`Failed to delete snippet "${name}"`);
    }
  } catch (error) {
    ErrorHandler.handle(error, 'Delete Snippet');
  }
};

export { getTecAction, createTecAction, updateTecAction, deleteTecAction };
