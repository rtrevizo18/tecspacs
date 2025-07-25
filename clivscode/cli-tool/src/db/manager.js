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

    try {
      const paths = envPaths('tcspcs');
      const dbPath = path.join(paths.data, 'tcspcs.db');

      // Ensure data directory exists
      await FileManager.ensureDirectory(paths.data);

      // Create database connection
      this.db = new Database(dbPath);

      // Configure database
      this.configurePragmas();

      // Create tables
      await this.createTables();

      this.isInitialized = true;
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
  createProject(name, projectPath, template) {
    const stmt = this.db.prepare(`
      INSERT INTO projects (name, path, template)
      VALUES (?, ?, ?)
    `);

    try {
      const result = stmt.run(name, projectPath, template);
      return result.lastInsertRowid;
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new FileSystemError(
          `Project "${name}" already exists`,
          projectPath
        );
      }
      throw error;
    }
  }

  getProject(name) {
    const stmt = this.db.prepare('SELECT * FROM projects WHERE name = ?');
    return stmt.get(name);
  }

  getAllProjects() {
    const stmt = this.db.prepare(
      'SELECT * FROM projects ORDER BY created_at DESC'
    );
    return stmt.all();
  }

  deleteProject(name) {
    const stmt = this.db.prepare('DELETE FROM projects WHERE name = ?');
    const result = stmt.run(name);
    return result.changes > 0;
  }

  // Config methods
  setConfig(projectId, key, value) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO configs (project_id, key, value)
      VALUES (?, ?, ?)
    `);
    return stmt.run(projectId, key, value);
  }

  getConfig(projectId, key) {
    const stmt = this.db.prepare(`
      SELECT value FROM configs 
      WHERE project_id = ? AND key = ?
    `);
    const result = stmt.get(projectId, key);
    return result?.value;
  }

  getProjectConfigs(projectId) {
    const stmt = this.db.prepare(`
      SELECT key, value FROM configs 
      WHERE project_id = ?
    `);
    const configs = stmt.all(projectId);
    return configs.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});
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
