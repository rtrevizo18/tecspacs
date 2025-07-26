export const SCHEMAS = [
  `
    CREATE TABLE IF NOT EXISTS snippets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      language TEXT NOT NULL,
      category TEXT,
      file_path TEXT NOT NULL,
      usage_count INTEGER DEFAULT 0
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      version TEXT NOT NULL,
      description TEXT,
      author TEXT,
      language TEXT NOT NULL,
      category TEXT,
      usage_count INTEGER DEFAULT 0,
      package_path TEXT NOT NULL, -- Path to package directory
      manifest_path TEXT NOT NULL, -- Path to package.json/manifest
    )
  `,
  `CREATE INDEX IF NOT EXISTS idx_snippets_name ON snippets(name);`,
  `CREATE INDEX IF NOT EXISTS idx_snippets_language ON snippets(language)`,
  `CREATE INDEX IF NOT EXISTS idx_snippets_category ON snippets(category)`,
  `CREATE INDEX IF NOT EXISTS idx_packages_name ON packages(name);`,
  `CREATE INDEX IF NOT EXISTS idx_packages_language ON packages(language)`,
  `CREATE INDEX IF NOT EXISTS idx_packages_category ON packages(category)`,
];
