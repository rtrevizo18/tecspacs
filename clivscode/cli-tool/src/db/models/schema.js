export const SCHEMAS = [
  `
        CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          path TEXT NOT NULL,
          template TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `,
  `
        CREATE TABLE IF NOT EXISTS configs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id INTEGER,
          key TEXT NOT NULL,
          value TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
        )
      `,
  `
        CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);
      `,
  `
        CREATE INDEX IF NOT EXISTS idx_configs_project_key ON configs(project_id, key);
      `,
];
