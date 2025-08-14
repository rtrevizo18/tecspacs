export const SCHEMAS = [
  `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      auth_email TEXT,
      online_id TEXT,
      logged_in_last INTEGER NOT NULL DEFAULT 0
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS snippets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      language TEXT,
      category TEXT,
      content TEXT NOT NULL,
      usage_count INTEGER DEFAULT 0,
      online_id TEXT,
      user_id INTEGER REFERENCES users(id)
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      version TEXT NOT NULL,
      description TEXT,
      author TEXT,
      language TEXT,
      category TEXT,
      usage_count INTEGER DEFAULT 0,
      online_id TEXT,
      package_path TEXT NOT NULL,
      manifest_path TEXT NOT NULL,
      user_id INTEGER REFERENCES users(id)
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS snippet_tags (
      snippet_id INTEGER PRIMARY KEY,
      tag TEXT NOT NULL,
      FOREIGN KEY (snippet_id) REFERENCES snippets (id) ON DELETE CASCADE
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS package_tags (
      snippet_id INTEGER PRIMARY KEY,
      tag TEXT NOT NULL,
      FOREIGN KEY (snippet_id) REFERENCES packages (id) ON DELETE CASCADE
    );
  `,
  `CREATE INDEX IF NOT EXISTS idx_snippets_name ON snippets(name);`,
  `CREATE INDEX IF NOT EXISTS idx_snippets_language ON snippets(language);`,
  `CREATE INDEX IF NOT EXISTS idx_snippets_category ON snippets(category);`,
  `CREATE INDEX IF NOT EXISTS idx_packages_name ON packages(name);`,
  `CREATE INDEX IF NOT EXISTS idx_packages_language ON packages(language);`,
  `CREATE INDEX IF NOT EXISTS idx_packages_category ON packages(category);`,
];
