import sqlite3 from 'sqlite3';
import envPaths from 'env-paths';
import path from 'path';
import { userProvider } from '../util/user-context.js';
import { SCHEMAS } from './models/schema.js';
import { FileManager } from '../util/file-manager.js';
import {
  ConfigurationError,
  FileSystemError,
  ProgramError,
  UserError,
} from '../models/error.js';

// For single obj
// db.run(“SELECT * FROM table WHERE id = ?”, 2)

// For multi obis
// db.run(“SELECT * FROM table WHERE id = $id AND LIKE $name”, { $id: 42, $name: `%${name}%`)

// Pulled from https://stackoverflow.com/questions/53299322/transactions-in-node-sqlite3
// Simplified single-statement logic with promises
sqlite3.Database.prototype.runAsync = function (sql, params) {
  return new Promise((resolve, reject) => {
    this.run(sql, params, function (err) {
      if (err) {
        reject(
          new FileSystemError(`Error in statement ${sql}: ${err.message}`, '')
        );
        return;
      }
      resolve(this);
    });
  });
};
// Simple change from runAsync for getting back DB statement results
sqlite3.Database.prototype.getAsync = function (sql, ...params) {
  return new Promise((resolve, reject) => {
    this.get(sql, params, function (err, row) {
      if (err) {
        reject(
          new FileSystemError(`Error in statement ${sql}: ${err.message}`, '')
        );
        return;
      }
      resolve(row);
    });
  });
};

// Simple change from getAsync for getting back multiple rows
sqlite3.Database.prototype.allAsync = function (sql, ...params) {
  return new Promise((resolve, reject) => {
    this.all(sql, params, function (err, rows) {
      if (err) {
        reject(
          new FileSystemError(`Error in statement ${sql}: ${err.message}`, '')
        );
        return;
      }
      resolve(rows);
    });
  });
};

// Pulled from https://stackoverflow.com/questions/53299322/transactions-in-node-sqlite3
// Async transaction behavior
sqlite3.Database.prototype.runBatchAsync = function (statements) {
  var results = [];
  var batch = ['BEGIN', ...statements, 'COMMIT'];
  return batch
    .reduce(
      (chain, statement) =>
        chain.then(result => {
          results.push(result);
          return this.runAsync(...[].concat(statement));
        }),
      Promise.resolve()
    )
    .catch(err =>
      this.runAsync('ROLLBACK').then(() =>
        Promise.reject(
          new FileSystemError(
            `Transaction failed at statement # ${results.length}: ${err.message}`,
            ''
          )
        )
      )
    )
    .then(() => results.slice(2));
};

export class DatabaseManager {
  constructor(dirName, dev = false, test = false) {
    this.db = null;
    this.dirName = dirName;
    this.dev = dev;
    this.test = test;
  }

  async initialize() {
    // If test is true, then db will be in memory for testing
    let dbPath = null;
    if (!this.test) {
      const paths = this.dev
        ? path.join(process.argv[1], '..', '..') // Root project directory for testing
        : envPaths(this.dirName); // User's Config directory
      const dbDirectory = path.join(paths.data, 'db'); // Root/db
      dbPath = path.join(dbDirectory, this.dirName + '.db'); // Root/db/dirName.db
    }

    try {
      // Ensure data directory exists
      if (!this.test) {
        await FileManager.ensureDirectory(dbDirectory);
      }

      // Create database connection
      this.db = new sqlite3.Database(this.test ? ':memory:' : dbPath);

      // Create tables
      await this.createTables();
    } catch (error) {
      throw new FileSystemError(
        `Failed to initialize database: ${error.message}`,
        dbPath
      );
    }
  }

  async createTables() {
    try {
      await this.db.runBatchAsync(SCHEMAS);
    } catch (err) {
      // Error created by runBatchAsync
      throw err;
    }
  }

  // Project methods
  async createSnippet({ name, description, language, category, content }) {
    const stmt = `
      INSERT INTO snippets (name, description, language, category, content)
      VALUES (?, ?, ?, ?, ?)
    `;

    try {
      // Check if snippet already exists
      const result = await this.db.getAsync(
        'SELECT * FROM snippets WHERE name = ?',
        name
      );
      if (result) {
        throw new FileSystemError(`Snippet "${name}" already exists`);
      }

      await this.db.runAsync(stmt, [
        name,
        description,
        language,
        category,
        content,
      ]);

      // Return the ID of created snippet
      return await this.db.getAsync(
        'SELECT id FROM snippets WHERE name = ?',
        name
      ).id;
    } catch (error) {
      if (error instanceof FileSystemError) {
        throw error;
      }
      // Error belongs to ID getter, so delete the created object and move on.
      this.db
        .runAsync('DELETE FROM snippets WHERE name = ?', name)
        .then(result => {
          throw new FileSystemError(`Failed to create snippet ${name}` + err);
        })
        .catch(() => {
          //Give up lol
          throw err;
        });
    }
  }

  // Still not implemented

  async getSnippet(name) {
    try {
      if (!name) {
        throw new UserError(
          'Empty name provided, Please provide a valid snippet name!'
        );
      }
      const stmt = 'SELECT * FROM snippets WHERE name = ?';
      const result = await this.db.getAsync(stmt, name);

      // If result is empty
      if (!result) {
        return null;
      }

      return result;
    } catch (err) {
      throw err;
    }
  }

  async getAllSnippets(limit = 20) {
    const stmt =
      'SELECT * FROM snippets ORDER BY usage_count DESC, name ASC LIMIT ?';
    try {
      if (limit <= 0) {
        throw new ProgramError('Invalid limit value.');
      }

      const results = await this.db.allAsync(stmt, limit);

      if (!results) {
        return null;
      }

      return results;
    } catch (error) {
      throw err;
    }
  }
  // If name or content are null, reject
  // If name is '' or content is  '', reject
  // if any property is null, then it shouldn't be changed, i.e. keep it the same
  // For processing inputs, for null vs. undefined expressions
  async updateSnippetValidator(name, snippet) {
    // If property isn't available, just make it null and it'll be skipped over
    const KEYS = [
      'name',
      'description',
      'language',
      'category',
      'content',
      'online_id',
    ];
    KEYS.forEach(val => {
      if (!(val in snippet)) {
        snippet[val] = null;
      }
    });

    if (snippet.name === '' || snippet.content === '') {
      throw new UserError('Snippet name or content cannot be empty!');
    }

    const originalSnippet = await this.db.getAsync(
      'SELECT * FROM snippets WHERE name = ?',
      name
    );

    if (!originalSnippet) {
      throw new UserError(`Snippet "${name}" does not exist!`);
    }
    // We gotta check if new name is already in DB!
    if (snippet.name !== null && snippet.name !== name) {
      const result = await this.db.getAsync(
        'SELECT * FROM snippets WHERE name = ?',
        snippet.name
      );
      // Naming conflict
      if (result) {
        throw new UserError(
          `Snippet with name ${snippet.name} already exists!`
        );
      }
    }

    return [snippet, originalSnippet];
  }

  async updateSnippet(name, snippet) {
    const stmt = `UPDATE snippets SET name = ?, description = ?, language = ?, category = ?, content = ?, online_id = ? WHERE name = ?`;

    try {
      const [validatedSnippet, originalSnippet] =
        await this.updateSnippetValidator(name, snippet);

      await this.db.runAsync(stmt, [
        validatedSnippet.name === null
          ? originalSnippet.name
          : validatedSnippet.name,
        validatedSnippet.description === null
          ? originalSnippet.description
          : validatedSnippet.description,
        validatedSnippet.language === null
          ? originalSnippet.language
          : validatedSnippet.language,
        validatedSnippet.category === null
          ? originalSnippet.category
          : validatedSnippet.category,
        validatedSnippet.content === null
          ? originalSnippet.content
          : validatedSnippet.content,
        validatedSnippet.online_id === null
          ? originalSnippet.online_id
          : validatedSnippet.online_id,
        name, // For WHERE clause
      ]);
    } catch (error) {
      throw error;
    }
  }

  async deleteSnippet(name) {
    const stmt = `DELETE FROM snippets WHERE name = ?`;

    try {
      const result = await this.db.getAsync(
        'SELECT name FROM snippets WHERE name = ?',
        name
      );

      if (!result) {
        throw new UserError(`Snippet ${name} does not exist!`);
      }
      await this.db.runAsync(stmt, name);
    } catch (error) {
      throw error;
    }
  }

  async searchSnippets({ name, description, category }) {
    const stmt = `
    SELECT * FROM snippets 
    WHERE name LIKE ? OR description LIKE ? OR category LIKE ?
    ORDER BY usage_count DESC, name ASC`;

    try {
      const results = await this.db.allAsync(stmt, [
        name,
        description,
        category,
      ]);

      return results;
    } catch (error) {
      throw new FileSystemError('Failed to retrieve snippet results');
    }
  }

  async incrementSnippetUsage(name) {
    const stmt = `UPDATE snippets SET usage_count = usage_count + 1 WHERE name = ?`;
    try {
      await this.db.runAsync(stmt, name);
    } catch (error) {
      throw error;
    }
  }

  // Package methods
  async createPackage({
    name,
    version,
    description,
    language,
    category,
    package_path,
    manifest_path,
    author = null,
  }) {
    const stmt = `
      INSERT INTO packages (name, version, description, author, language, category, package_path, manifest_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
      // Check if package already exists
      const existing = await this.db.getAsync(
        'SELECT * FROM packages WHERE name = ?',
        name
      );
      if (existing) {
        throw new FileSystemError(`Package ${name} already exists`);
      }

      await this.db.runAsync(stmt, [
        name,
        version || '1.0.0',
        description,
        author || 'N/A',
        language,
        category,
        package_path,
        manifest_path,
      ]);

      // Get back an id

      const result = await this.db.getAsync(
        'SELECT id FROM packages where name = ?',
        name
      );

      return result.id;
    } catch (error) {
      if (error instanceof FileSystemError) {
        throw error;
      }
      // Error belongs to ID getter, so delete the created object and move on.
      this.db
        .runAsync('DELETE FROM packages WHERE name = ?', name)
        .then(result => {
          throw new FileSystemError(`Failed to create package ${name}` + err);
        })
        .catch(() => {
          //Give up lol
          throw err;
        });
    }
  }

  async getPackage(name) {
    const stmt = 'SELECT * FROM packages WHERE name = ?';

    try {
      const result = await this.db.getAsync(stmt, name);

      if (!result) {
        throw new UserError(`Package ${name} does not exist!`);
      }

      return result;
    } catch (error) {
      if (error instanceof UserError) {
        throw error;
      }
      throw new FileSystemError("Couldn't retrieve package information");
    }
  }

  async getAllPackages() {
    const stmt = 'SELECT * FROM packages ORDER BY usage_count DESC, name ASC';

    try {
      const results = await this.db.allAsync(stmt);

      return results;
    } catch (error) {
      throw new FileSystemError("Couldn't retrieve package information");
    }
  }

  // FIXME: Implement general getPackagesByCriteria

  async updatePackageValidator(name, pkg) {
    // If property isn't available, just make it null and it'll be skipped over
    const KEYS = [
      'name',
      'description',
      'language',
      'category',
      'version',
      'package_path',
      'manifest_path',
      'online_id',
    ];
    KEYS.forEach(val => {
      if (!(val in pkg)) {
        pkg[val] = null;
      }
    });

    if (pkg.name === '' || pkg.version === '') {
      throw new UserError('Package name or version cannot be empty!');
    }

    const originalPackage = await this.db.getAsync(
      'SELECT * FROM packages WHERE name = ?',
      name
    );

    if (!originalPackage) {
      throw new UserError(`Package ${name} does not exist!`);
    }
    // We gotta check if new name is already in DB!
    if (pkg.name !== null && pkg.name !== name) {
      const result = await this.db.getAsync(
        'SELECT * FROM packages WHERE name = ?',
        pkg.name
      );
      // Naming conflict
      if (result) {
        throw new UserError(`Package with name ${pkg.name} already exists!`);
      }
    }

    return [pkg, originalPackage];
  }

  async updatePackage(name, pkg) {
    const stmt = `UPDATE packages SET name = ?, description = ?, language = ?, category = ?, version = ?, package_path = ?, manifest_path = ?, online_id = ? WHERE name = ?`;

    try {
      const [validatedPackage, originalPackage] =
        await this.updatePackageValidator(name, pkg);

      await this.db.runAsync(stmt, [
        validatedPackage.name === null
          ? originalPackage.name
          : validatedPackage.name,
        validatedPackage.description === null
          ? originalPackage.description
          : validatedPackage.description,
        validatedPackage.language === null
          ? originalPackage.language
          : validatedPackage.language,
        validatedPackage.category === null
          ? originalPackage.category
          : validatedPackage.category,
        validatedPackage.version === null
          ? originalPackage.version
          : validatedPackage.version,
        validatedPackage.package_path === null
          ? originalPackage.package_path
          : validatedPackage.package_path,
        validatedPackage.manifest_path === null
          ? originalPackage.manifest_path
          : validatedPackage.manifest_path,
        validatedPackage.online_id === null
          ? originalPackage.online_id
          : validatedPackage.online_id,
        name, // For WHERE clause
      ]);
    } catch (error) {
      throw error;
    }
  }

  async deletePackage(name) {
    const stmt = `DELETE FROM packages WHERE name = ?`;

    try {
      const result = await this.db.getAsync(
        'SELECT name FROM packages WHERE name = ?',
        name
      );

      if (!result) {
        throw new UserError(`Package ${name} does not exist!`);
      }
      await this.db.runAsync(stmt, name);
    } catch (error) {
      throw error;
    }
  }

  async searchPackages(searchBy, query) {
    try {
      switch (searchBy) {
        case 'name':
        case 'description':
        case 'category':
          break;
        default:
          throw new ConfigurationError(
            'Can only search using name, description, or category'
          );
      }
      const stmt = `
    SELECT * FROM packages
    WHERE ${searchBy} LIKE '%${query}%'
    ORDER BY usage_count DESC, name ASC`;

      const results = await this.db.allAsync(stmt);

      return results;
    } catch (error) {
      throw new FileSystemError('Failed to retrieve package results' + error);
    }
  }

  // Just throw the error
  async incrementPackageUsage(name) {
    const stmt = `UPDATE packages SET usage_count = usage_count + 1 WHERE name = ?`;
    try {
      await this.db.runAsync(stmt, name);
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const db = new DatabaseManager();
