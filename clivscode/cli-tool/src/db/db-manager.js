import Database from 'better-sqlite3';
import envPaths from 'env-paths';
import path from 'path';
import { SCHEMAS } from './models/schema.js';
import { FileManager } from '../util/file-manager.js';
import { FileSystemError } from '../models/error.js';

export class DatabaseManager {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    const paths = envPaths('tcspcs');
    const dbDirectory = path.join(paths.data, 'db');
    const dbPath = path.join(dbDirectory, 'tcspcs.db');

    try {
      // Ensure data directory exists
      await FileManager.ensureDirectory(dbDirectory);

      // Create database connection
      this.db = new Database(dbPath);

      // Configure database
      this.configurePragmas();

      // Create tables
      await this.createTables();

      this.isInitialized = true;
      console.log('Database connection successful!');
    } catch (error) {
      throw new FileSystemError(
        `Failed to initialize database: ${error.message}`,
        dbPath
      );
    }
  }

  configurePragmas() {
    // WAL mode for better concurrency
    this.db.pragma('journal_mode = WAL');

    // Balanced performance/safety
    this.db.pragma('synchronous = NORMAL');

    // Increase cache size
    this.db.pragma('cache_size = 1000');

    // Enable foreign key constraints
    this.db.pragma('foreign_keys = ON');

    // Set busy timeout
    this.db.pragma('busy_timeout = 5000');
  }

  async createTables() {
    const schemas = SCHEMAS;

    const createSchemas = this.db.transaction(() => {
      for (const schema of schemas) {
        this.db.exec(schema);
      }
    });

    createSchemas();
  }

  // Project methods
  createSnippet(name, description, language, category, filePath) {
    const stmt = this.db.prepare(`
      INSERT INTO snippets (name, description, language, category, file_path)
      VALUES (?, ?, ?, ?, ?)
    `);

    try {
      const result = stmt.run(name, description, language, category, filePath);
      return result.lastInsertRowid;
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new FileSystemError(`Snippet "${name}" already exists`, filePath);
      }
      throw error;
    }
  }

  getSnippet(name) {
    const stmt = this.db.prepare('SELECT * FROM snippets WHERE name = ?');
    return stmt.get(name);
  }

  getAllSnippets() {
    const stmt = this.db.prepare(`
    SELECT * FROM snippets 
    ORDER BY usage_count DESC, name ASC
  `);
    return stmt.all();
  }

  // Remove timestamp references from getSnippetsByLanguage
  getSnippetsByLanguage(language) {
    const stmt = this.db.prepare(`
    SELECT * FROM snippets 
    WHERE language = ? 
    ORDER BY usage_count DESC, name ASC
  `);
    return stmt.all(language);
  }

  // Remove timestamp references from getSnippetsByCategory
  getSnippetsByCategory(category) {
    const stmt = this.db.prepare(`
    SELECT * FROM snippets 
    WHERE category = ? 
    ORDER BY usage_count DESC, name ASC
  `);
    return stmt.all(category);
  }

  // Safer updateSnippet method
  updateSnippet(name, updates) {
    const validFields = ['description', 'language', 'category', 'file_path'];
    const updateFields = Object.keys(updates).filter(key =>
      validFields.includes(key)
    );

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    // Build parameterized query safely
    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => updates[field]);
    values.push(name); // Add name parameter at the end

    const stmt = this.db.prepare(`
    UPDATE snippets 
    SET ${setClause}
    WHERE name = ?
  `);

    const result = stmt.run(...values);
    return result.changes > 0;
  }

  // Add this method after incrementPackageUsage
  incrementSnippetUsage(name) {
    const stmt = this.db.prepare(`
    UPDATE snippets 
    SET usage_count = usage_count + 1 
    WHERE name = ?
  `);
    const result = stmt.run(name);
    return result.changes > 0;
  }

  incrementPackageUsage(name) {
    const stmt = this.db.prepare(`
    UPDATE packages 
    SET usage_count = usage_count + 1 
    WHERE name = ?
  `);
    const result = stmt.run(name);
    return result.changes > 0;
  }

  deleteSnippet(name) {
    const stmt = this.db.prepare('DELETE FROM snippets WHERE name = ?');
    const result = stmt.run(name);
    return result.changes > 0;
  }

  // Package methods
  createPackage(
    name,
    version,
    description,
    author,
    language,
    category,
    packagePath,
    manifestPath
  ) {
    const stmt = this.db.prepare(`
      INSERT INTO packages (name, version, description, author, language, category, package_path, manifest_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      const result = stmt.run(
        name,
        version,
        description,
        author,
        language,
        category,
        packagePath,
        manifestPath
      );
      return result.lastInsertRowid;
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new FileSystemError(
          `Package "${name}" already exists`,
          packagePath
        );
      }
      throw error;
    }
  }

  getPackage(name) {
    const stmt = this.db.prepare('SELECT * FROM packages WHERE name = ?');
    return stmt.get(name);
  }

  // Update getAllPackages to sort by usage
  getAllPackages() {
    const stmt = this.db.prepare(`
    SELECT * FROM packages 
    ORDER BY usage_count DESC, name ASC
  `);
    return stmt.all();
  }

  getPackagesByLanguage(language) {
    const stmt = this.db.prepare(`
    SELECT * FROM packages 
    WHERE language = ? 
    ORDER BY usage_count DESC, name ASC
  `);
    return stmt.all(language);
  }

  getPackagesByCategory(category) {
    const stmt = this.db.prepare(`
    SELECT * FROM packages 
    WHERE category = ? 
    ORDER BY usage_count DESC, name ASC
  `);
    return stmt.all(category);
  }

  updatePackage(name, updates) {
    const validFields = [
      'version',
      'description',
      'author',
      'language',
      'category',
      'usage_count',
      'package_path',
      'manifest_path',
    ];

    const updateFields = Object.keys(updates).filter(key =>
      validFields.includes(key)
    );

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => updates[field]);
    values.push(name);

    const stmt = this.db.prepare(`
    UPDATE packages 
    SET ${setClause}
    WHERE name = ?
  `);

    const result = stmt.run(...values);
    return result.changes > 0;
  }

  deletePackage(name) {
    const stmt = this.db.prepare('DELETE FROM packages WHERE name = ?');
    const result = stmt.run(name);
    return result.changes > 0;
  }

  // Remove timestamp references from searchSnippets
  searchSnippets(query) {
    const stmt = this.db.prepare(`
    SELECT * FROM snippets 
    WHERE name LIKE ? OR description LIKE ? OR category LIKE ?
    ORDER BY usage_count DESC, name ASC
  `);
    const searchTerm = `%${query}%`;
    return stmt.all(searchTerm, searchTerm, searchTerm);
  }

  searchPackages(query) {
    const stmt = this.db.prepare(`
    SELECT * FROM packages 
    WHERE name LIKE ? OR description LIKE ? OR category LIKE ? OR author LIKE ?
    ORDER BY usage_count DESC, name ASC
  `);
    const searchTerm = `%${query}%`;
    return stmt.all(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  // Transaction support
  transaction(fn) {
    return this.db.transaction(fn);
  }

  // Close database
  close() {
    if (this.db) {
      this.db.close();
      this.isInitialized = false;
    }
  }
}

// Export singleton instance
export const db = new DatabaseManager();
