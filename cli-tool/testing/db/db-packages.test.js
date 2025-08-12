import { DatabaseManager } from '../../src/db/db-manager.js';
import { FileSystemError } from '../../src/models/error.js';

let db;

describe('db: Database Manager package methods', () => {
  beforeAll(async () => {
    db = new DatabaseManager('', true, true);
    try {
      await db.initialize();
    } catch (err) {
      throw new FileSystemError('Failed to initialize DB: ' + err);
    }
  });

  afterAll(() => {
    db.db.close();
  });

  // Clear DB before each test
  beforeEach(async () => {
    try {
      await db.db.runAsync('DELETE FROM packages');
    } catch (err) {
      throw new FileSystemError('Failed to initialize DB: ' + err);
    }
  });

  describe('db: createPackage', () => {
    test('1. Should create full package', async () => {
      const testObj = {
        name: 'supertec',
        description: 'A really cool tec!',
        version: '1.0.0',
        language: 'javascript',
        category: 'utilities',
        package_path: './src',
        manifest_path: './pacs.json',
      };

      await db.createPackage(testObj);

      const result = await db.db.getAsync(
        'SELECT * FROM packages WHERE name = ?',
        testObj.name
      );

      expect(result).toBeDefined();
      expect(result.name).toBe(testObj.name);
      expect(result.description).toBe(testObj.description);
      expect(result.language).toBe(testObj.language);
      expect(result.category).toBe(testObj.category);
      expect(result.author).toBe('N/A');
      expect(result.package_path).toBe(testObj.package_path);
      expect(result.manifest_path).toBe(testObj.manifest_path);
      expect(result.usage_count).toBe(0);
    });

    test('2. Should create package with minimal required fields', async () => {
      const testObj = {
        name: 'minimal-package',
        language: 'python',
        package_path: './src',
        manifest_path: './manifest.json',
      };

      await db.createPackage(testObj);

      const result = await db.db.getAsync(
        'SELECT * FROM packages WHERE name = ?',
        testObj.name
      );

      expect(result).toBeDefined();
      expect(result.name).toBe(testObj.name);
      expect(result.language).toBe(testObj.language);
      expect(result.package_path).toBe(testObj.package_path);
      expect(result.manifest_path).toBe(testObj.manifest_path);
      expect(result.version).toBe('1.0.0'); // Default version
      expect(result.author).toBe('N/A'); // Default author
      expect(result.description).toBeNull();
      expect(result.category).toBeNull();
      expect(result.usage_count).toBe(0);
    });

    test('3. Should create package with custom author', async () => {
      const testObj = {
        name: 'authored-package',
        version: '2.1.0',
        description: 'Package with custom author',
        author: 'John Doe',
        language: 'typescript',
        category: 'frameworks',
        package_path: './dist',
        manifest_path: './package.json',
      };

      await db.createPackage(testObj);

      const result = await db.db.getAsync(
        'SELECT * FROM packages WHERE name = ?',
        testObj.name
      );

      expect(result).toBeDefined();
      expect(result.name).toBe(testObj.name);
      expect(result.version).toBe(testObj.version);
      expect(result.description).toBe(testObj.description);
      expect(result.author).toBe(testObj.author); // Should be custom author, not 'N/A'
      expect(result.language).toBe(testObj.language);
      expect(result.category).toBe(testObj.category);
    });

    test('4. Should throw error for duplicate package name', async () => {
      const testObj = {
        name: 'duplicate-package',
        language: 'java',
        package_path: './src',
        manifest_path: './pom.xml',
      };

      // Create first package
      await db.createPackage(testObj);

      // Attempt to create duplicate should throw error
      await expect(db.createPackage(testObj)).rejects.toThrow(
        'Package duplicate-package already exists'
      );
    });

    test('5. Should handle special characters in paths and descriptions', async () => {
      const testObj = {
        name: 'special-chars-package',
        version: '1.0.0-beta.1',
        description: 'Contains "quotes" and \'apostrophes\' & symbols',
        author: "Jane O'Connor",
        language: 'bash',
        category: 'scripts',
        package_path: './src/special-folder_123',
        manifest_path: './configs/manifest-v2.json',
      };

      await db.createPackage(testObj);

      const result = await db.db.getAsync(
        'SELECT * FROM packages WHERE name = ?',
        testObj.name
      );

      expect(result).toBeDefined();
      expect(result.description).toBe(testObj.description);
      expect(result.author).toBe(testObj.author);
      expect(result.package_path).toBe(testObj.package_path);
      expect(result.manifest_path).toBe(testObj.manifest_path);
    });

    test('6. Should auto-increment package ID correctly', async () => {
      const package1 = {
        name: 'auto-id-package-1',
        language: 'cpp',
        package_path: './src1',
        manifest_path: './manifest1.json',
      };

      const package2 = {
        name: 'auto-id-package-2',
        language: 'cpp',
        package_path: './src2',
        manifest_path: './manifest2.json',
      };

      await db.createPackage(package1);
      await db.createPackage(package2);

      const result1 = await db.db.getAsync(
        'SELECT * FROM packages WHERE name = ?',
        package1.name
      );

      const result2 = await db.db.getAsync(
        'SELECT * FROM packages WHERE name = ?',
        package2.name
      );

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1.id).toBeDefined();
      expect(result2.id).toBeDefined();
      expect(result2.id).toBeGreaterThan(result1.id);
    });

    test('7. Should handle null values for optional fields correctly', async () => {
      const testObj = {
        name: 'null-fields-package',
        version: null, // Should use default
        description: null,
        author: null, // Should use default
        language: 'rust',
        category: null,
        package_path: './target',
        manifest_path: './Cargo.toml',
      };

      await db.createPackage(testObj);

      const result = await db.db.getAsync(
        'SELECT * FROM packages WHERE name = ?',
        testObj.name
      );

      expect(result).toBeDefined();
      expect(result.version).toBe('1.0.0'); // Default applied
      expect(result.author).toBe('N/A'); // Default applied
      expect(result.description).toBeNull();
      expect(result.category).toBeNull();
      expect(result.language).toBe(testObj.language);
    });
  });

  describe('db: getPackage', () => {
    test('1. Should retrieve existing package by name', async () => {
      const testObj = {
        name: 'test-package',
        version: '1.2.3',
        description: 'Test package for retrieval',
        author: 'Test Author',
        language: 'javascript',
        category: 'testing',
        package_path: './src',
        manifest_path: './package.json',
      };

      await db.createPackage(testObj);
      const result = await db.getPackage(testObj.name);

      expect(result).toBeDefined();
      expect(result.name).toBe(testObj.name);
      expect(result.version).toBe(testObj.version);
      expect(result.description).toBe(testObj.description);
      expect(result.author).toBe(testObj.author);
      expect(result.language).toBe(testObj.language);
      expect(result.category).toBe(testObj.category);
      expect(result.package_path).toBe(testObj.package_path);
      expect(result.manifest_path).toBe(testObj.manifest_path);
      expect(result.usage_count).toBe(0);
      expect(result.id).toBeDefined();
    });

    test('2. Should throw UserError for non-existent package', async () => {
      await expect(db.getPackage('non-existent-package')).rejects.toThrow(
        'Package non-existent-package does not exist!'
      );
    });

    test('3. Should retrieve package with default values', async () => {
      const testObj = {
        name: 'minimal-package',
        language: 'python',
        package_path: './src',
        manifest_path: './setup.py',
      };

      await db.createPackage(testObj);
      const result = await db.getPackage(testObj.name);

      expect(result).toBeDefined();
      expect(result.name).toBe(testObj.name);
      expect(result.version).toBe('1.0.0'); // Default version
      expect(result.author).toBe('N/A'); // Default author
      expect(result.description).toBeNull();
      expect(result.category).toBeNull();
      expect(result.language).toBe(testObj.language);
    });

    test('4. Should retrieve package with special characters', async () => {
      const testObj = {
        name: 'special-chars-pkg',
        version: '2.0.0-beta.1',
        description: 'Contains "quotes" and \'apostrophes\'',
        author: "O'Connor & Co.",
        language: 'typescript',
        category: 'utilities',
        package_path: './dist/special_folder',
        manifest_path: './configs/manifest-v2.json',
      };

      await db.createPackage(testObj);
      const result = await db.getPackage(testObj.name);

      expect(result).toBeDefined();
      expect(result.description).toBe(testObj.description);
      expect(result.author).toBe(testObj.author);
      expect(result.package_path).toBe(testObj.package_path);
      expect(result.manifest_path).toBe(testObj.manifest_path);
    });
  });

  describe('db: getAllPackages', () => {
    test('1. Should return empty array when no packages exist', async () => {
      const result = await db.getAllPackages();
      expect(result).toEqual([]);
    });

    test('2. Should return all packages ordered by usage_count DESC, name ASC', async () => {
      const packages = [
        {
          name: 'alpha-package',
          language: 'javascript',
          package_path: './src',
          manifest_path: './package.json',
        },
        {
          name: 'beta-package',
          language: 'python',
          package_path: './src',
          manifest_path: './setup.py',
        },
        {
          name: 'charlie-package',
          language: 'java',
          package_path: './src',
          manifest_path: './pom.xml',
        },
      ];

      // Create packages
      for (const pkg of packages) {
        await db.createPackage(pkg);
      }

      // Increment usage count for beta (should appear first)
      await db.incrementPackageUsage('beta-package');
      await db.incrementPackageUsage('beta-package');

      // Increment usage count for charlie once (should appear second)
      await db.incrementPackageUsage('charlie-package');

      const result = await db.getAllPackages();

      expect(result).toHaveLength(3);

      // Should be ordered by usage_count DESC, then name ASC
      expect(result[0].name).toBe('beta-package');
      expect(result[0].usage_count).toBe(2);

      expect(result[1].name).toBe('charlie-package');
      expect(result[1].usage_count).toBe(1);

      expect(result[2].name).toBe('alpha-package');
      expect(result[2].usage_count).toBe(0);
    });

    test('3. Should return packages with same usage_count ordered alphabetically', async () => {
      const packages = [
        {
          name: 'zebra-package',
          language: 'rust',
          package_path: './target',
          manifest_path: './Cargo.toml',
        },
        {
          name: 'alpha-package',
          language: 'go',
          package_path: './build',
          manifest_path: './go.mod',
        },
        {
          name: 'beta-package',
          language: 'cpp',
          package_path: './build',
          manifest_path: './CMakeLists.txt',
        },
      ];

      // Create packages (all will have usage_count = 0)
      for (const pkg of packages) {
        await db.createPackage(pkg);
      }

      const result = await db.getAllPackages();

      expect(result).toHaveLength(3);

      // All have same usage_count (0), so should be alphabetical
      expect(result[0].name).toBe('alpha-package');
      expect(result[1].name).toBe('beta-package');
      expect(result[2].name).toBe('zebra-package');
    });

    test('4. Should return single package correctly', async () => {
      const testObj = {
        name: 'single-package',
        version: '3.0.0',
        description: 'The only package',
        author: 'Solo Developer',
        language: 'ruby',
        category: 'gems',
        package_path: './lib',
        manifest_path: './gemspec',
      };

      await db.createPackage(testObj);
      const result = await db.getAllPackages();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe(testObj.name);
      expect(result[0].version).toBe(testObj.version);
      expect(result[0].description).toBe(testObj.description);
      expect(result[0].author).toBe(testObj.author);
      expect(result[0].language).toBe(testObj.language);
      expect(result[0].category).toBe(testObj.category);
      expect(result[0].usage_count).toBe(0);
    });

    test('5. Should include all package fields in results', async () => {
      const testObj = {
        name: 'full-fields-package',
        version: '1.5.0',
        description: 'Package with all fields',
        author: 'Full Stack Dev',
        language: 'php',
        category: 'frameworks',
        package_path: './vendor',
        manifest_path: './composer.json',
      };

      await db.createPackage(testObj);
      const result = await db.getAllPackages();

      expect(result).toHaveLength(1);
      const pkg = result[0];

      expect(pkg).toHaveProperty('id');
      expect(pkg).toHaveProperty('name');
      expect(pkg).toHaveProperty('version');
      expect(pkg).toHaveProperty('description');
      expect(pkg).toHaveProperty('author');
      expect(pkg).toHaveProperty('language');
      expect(pkg).toHaveProperty('category');
      expect(pkg).toHaveProperty('package_path');
      expect(pkg).toHaveProperty('manifest_path');
      expect(pkg).toHaveProperty('usage_count');
    });

    test('6. Should handle mixed usage counts correctly', async () => {
      const packages = [
        {
          name: 'high-usage',
          language: 'javascript',
          package_path: './src',
          manifest_path: './package.json',
        },
        {
          name: 'medium-usage',
          language: 'python',
          package_path: './src',
          manifest_path: './setup.py',
        },
        {
          name: 'no-usage',
          language: 'java',
          package_path: './src',
          manifest_path: './pom.xml',
        },
        {
          name: 'also-high-usage',
          language: 'typescript',
          package_path: './dist',
          manifest_path: './package.json',
        },
      ];

      // Create packages
      for (const pkg of packages) {
        await db.createPackage(pkg);
      }

      // Set different usage counts
      await db.incrementPackageUsage('high-usage');
      await db.incrementPackageUsage('high-usage');
      await db.incrementPackageUsage('high-usage'); // usage_count = 3

      await db.incrementPackageUsage('medium-usage'); // usage_count = 1

      await db.incrementPackageUsage('also-high-usage');
      await db.incrementPackageUsage('also-high-usage');
      await db.incrementPackageUsage('also-high-usage'); // usage_count = 3

      const result = await db.getAllPackages();

      expect(result).toHaveLength(4);

      // First two should have usage_count = 3, ordered alphabetically
      expect(result[0].usage_count).toBe(3);
      expect(result[1].usage_count).toBe(3);
      expect(result[0].name).toBe('also-high-usage'); // alphabetically first
      expect(result[1].name).toBe('high-usage');

      // Third should have usage_count = 1
      expect(result[2].name).toBe('medium-usage');
      expect(result[2].usage_count).toBe(1);

      // Last should have usage_count = 0
      expect(result[3].name).toBe('no-usage');
      expect(result[3].usage_count).toBe(0);
    });
  });

  describe('db: updatePackage', () => {
    test('1. Should update all package fields successfully', async () => {
      const originalPackage = {
        name: 'original-package',
        version: '1.0.0',
        description: 'Original description',
        author: 'Original Author',
        language: 'javascript',
        category: 'utilities',
        package_path: './src',
        manifest_path: './package.json',
      };

      const updatedData = {
        name: 'updated-package',
        version: '2.0.0',
        description: 'Updated description',
        language: 'typescript',
        category: 'frameworks',
      };

      await db.createPackage(originalPackage);
      await db.updatePackage(originalPackage.name, updatedData);

      const result = await db.getPackage(updatedData.name);

      expect(result.name).toBe(updatedData.name);
      expect(result.version).toBe(updatedData.version);
      expect(result.description).toBe(updatedData.description);
      expect(result.language).toBe(updatedData.language);
      expect(result.category).toBe(updatedData.category);
      // Unchanged fields should remain
      expect(result.author).toBe(originalPackage.author);
      expect(result.package_path).toBe(originalPackage.package_path);
    });

    test('2. Should update only specified fields, keeping others unchanged', async () => {
      const originalPackage = {
        name: 'partial-update-package',
        version: '1.5.0',
        description: 'Original description',
        language: 'python',
        category: 'data-science',
        package_path: './src',
        manifest_path: './setup.py',
      };

      await db.createPackage(originalPackage);
      await db.updatePackage(originalPackage.name, { version: '2.0.0' });

      const result = await db.getPackage(originalPackage.name);

      expect(result.version).toBe('2.0.0');
      expect(result.name).toBe(originalPackage.name);
      expect(result.description).toBe(originalPackage.description);
      expect(result.language).toBe(originalPackage.language);
    });

    test('3. Should handle null values by preserving original values', async () => {
      const originalPackage = {
        name: 'null-update-package',
        version: '1.0.0',
        description: 'Keep this description',
        language: 'java',
        package_path: './src',
        manifest_path: './pom.xml',
      };

      await db.createPackage(originalPackage);
      await db.updatePackage(originalPackage.name, {
        version: '2.0.0',
        description: null,
        language: null,
      });

      const result = await db.getPackage(originalPackage.name);

      expect(result.version).toBe('2.0.0');
      expect(result.description).toBe(originalPackage.description);
      expect(result.language).toBe(originalPackage.language);
    });

    test('4. Should throw error when updating to existing package name', async () => {
      const package1 = {
        name: 'package-one',
        language: 'javascript',
        package_path: './src1',
        manifest_path: './package1.json',
      };
      const package2 = {
        name: 'package-two',
        language: 'typescript',
        package_path: './src2',
        manifest_path: './package2.json',
      };

      await db.createPackage(package1);
      await db.createPackage(package2);

      await expect(
        db.updatePackage(package2.name, { name: package1.name })
      ).rejects.toThrow(`Package with name ${package1.name} already exists!`);
    });

    test('5. Should throw error for non-existent package', async () => {
      await expect(
        db.updatePackage('non-existent-package', { version: '2.0.0' })
      ).rejects.toThrow('Package non-existent-package does not exist!');
    });

    test('6. Should throw error when name or version is empty string', async () => {
      const originalPackage = {
        name: 'validation-test',
        language: 'python',
        package_path: './src',
        manifest_path: './setup.py',
      };

      await db.createPackage(originalPackage);

      await expect(
        db.updatePackage(originalPackage.name, { name: '' })
      ).rejects.toThrow('Package name or version cannot be empty!');

      await expect(
        db.updatePackage(originalPackage.name, { version: '' })
      ).rejects.toThrow('Package name or version cannot be empty!');
    });

    test('7. Should preserve usage_count and id during update', async () => {
      const originalPackage = {
        name: 'usage-count-test',
        version: '1.0.0',
        language: 'php',
        package_path: './src',
        manifest_path: './composer.json',
      };

      await db.createPackage(originalPackage);
      await db.incrementPackageUsage(originalPackage.name);
      await db.incrementPackageUsage(originalPackage.name);

      const beforeUpdate = await db.getPackage(originalPackage.name);

      await db.updatePackage(originalPackage.name, { version: '2.0.0' });

      const afterUpdate = await db.getPackage(originalPackage.name);

      expect(afterUpdate.id).toBe(beforeUpdate.id);
      expect(afterUpdate.usage_count).toBe(2);
      expect(afterUpdate.version).toBe('2.0.0');
    });
  });

  describe('db: deletePackage', () => {
    test('1. Should delete existing package successfully', async () => {
      const testObj = {
        name: 'delete-test-package',
        version: '1.0.0',
        language: 'javascript',
        package_path: './src',
        manifest_path: './package.json',
      };

      await db.createPackage(testObj);
      await db.deletePackage(testObj.name);

      // Package should no longer exist
      await expect(db.getPackage(testObj.name)).rejects.toThrow(
        `Package ${testObj.name} does not exist!`
      );
    });

    test('2. Should throw error when deleting non-existent package', async () => {
      await expect(db.deletePackage('non-existent-package')).rejects.toThrow(
        'Package non-existent-package does not exist!'
      );
    });

    test('3. Should not affect other packages when deleting one', async () => {
      const package1 = {
        name: 'package-1',
        language: 'python',
        package_path: './src1',
        manifest_path: './setup.py',
      };
      const package2 = {
        name: 'package-2',
        language: 'java',
        package_path: './src2',
        manifest_path: './pom.xml',
      };

      await db.createPackage(package1);
      await db.createPackage(package2);

      await db.deletePackage(package1.name);

      // package2 should still exist
      const remaining = await db.getPackage(package2.name);
      expect(remaining.name).toBe(package2.name);

      // package1 should be gone
      await expect(db.getPackage(package1.name)).rejects.toThrow();
    });
  });

  describe('db: searchPackages', () => {
    test('1. Should search by name pattern', async () => {
      const packages = [
        {
          name: 'react-components',
          description: 'UI components for React',
          category: 'frontend',
          language: 'javascript',
          package_path: './src',
          manifest_path: './package.json',
        },
        {
          name: 'vue-utilities',
          description: 'Utility functions for Vue.js',
          category: 'frontend',
          language: 'javascript',
          package_path: './src',
          manifest_path: './package.json',
        },
        {
          name: 'backend-helpers',
          description: 'Helper functions for backend',
          category: 'backend',
          language: 'python',
          package_path: './src',
          manifest_path: './setup.py',
        },
      ];

      for (const pkg of packages) {
        await db.createPackage(pkg);
      }

      const result = await db.searchPackages('name', 'react');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('react-components');
    });

    test('2. Should search by description pattern', async () => {
      const packages = [
        {
          name: 'react-components',
          description: 'UI components for React',
          category: 'frontend',
          language: 'javascript',
          package_path: './src',
          manifest_path: './package.json',
        },
        {
          name: 'vue-utilities',
          description: 'Utility functions for Vue.js',
          category: 'frontend',
          language: 'javascript',
          package_path: './src',
          manifest_path: './package.json',
        },
        {
          name: 'data-processor',
          description: 'Process CSV and JSON data',
          category: 'data',
          language: 'python',
          package_path: './src',
          manifest_path: './setup.py',
        },
      ];

      for (const pkg of packages) {
        await db.createPackage(pkg);
      }

      const result = await db.searchPackages('description', 'Vue.js');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('vue-utilities');
    });

    test('3. Should search by category pattern', async () => {
      const packages = [
        {
          name: 'react-components',
          description: 'UI components for React',
          category: 'frontend',
          language: 'javascript',
          package_path: './src',
          manifest_path: './package.json',
        },
        {
          name: 'vue-utilities',
          description: 'Utility functions for Vue.js',
          category: 'frontend',
          language: 'javascript',
          package_path: './src',
          manifest_path: './package.json',
        },
        {
          name: 'backend-helpers',
          description: 'Helper functions for backend',
          category: 'backend',
          language: 'python',
          package_path: './src',
          manifest_path: './setup.py',
        },
      ];

      for (const pkg of packages) {
        await db.createPackage(pkg);
      }

      const result = await db.searchPackages('category', 'frontend');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('react-components');
      expect(result[1].name).toBe('vue-utilities');
    });

    test('4. Should return results ordered by usage_count DESC, name ASC', async () => {
      const packages = [
        {
          name: 'vue-utilities',
          description: 'Utility functions for Vue.js',
          category: 'frontend',
          language: 'javascript',
          package_path: './src',
          manifest_path: './package.json',
        },
        {
          name: 'backend-helpers',
          description: 'Helper functions for backend',
          category: 'backend',
          language: 'python',
          package_path: './src',
          manifest_path: './setup.py',
        },
        {
          name: 'react-components',
          description: 'UI components for React',
          category: 'frontend',
          language: 'javascript',
          package_path: './src',
          manifest_path: './package.json',
        },
      ];

      for (const pkg of packages) {
        await db.createPackage(pkg);
      }

      // Increment usage for some packages
      await db.incrementPackageUsage('vue-utilities');
      await db.incrementPackageUsage('vue-utilities');
      await db.incrementPackageUsage('backend-helpers');

      const result = await db.searchPackages('description', 'for');

      expect(result[0].name).toBe('vue-utilities');
      expect(result[0].usage_count).toBe(2);
      expect(result[1].name).toBe('backend-helpers');
      expect(result[1].usage_count).toBe(1);
    });

    test('5. Should return empty array when no matches found', async () => {
      const packages = [
        {
          name: 'react-components',
          description: 'UI components for React',
          category: 'frontend',
          language: 'javascript',
          package_path: './src',
          manifest_path: './package.json',
        },
      ];

      for (const pkg of packages) {
        await db.createPackage(pkg);
      }

      const result = await db.searchPackages('name', 'non-existent');

      expect(result).toEqual([]);
    });
  });

  describe('db: incrementPackageUsage', () => {
    test('1. Should increment usage count for existing package', async () => {
      const testObj = {
        name: 'usage-increment-test',
        language: 'rust',
        package_path: './target',
        manifest_path: './Cargo.toml',
      };

      await db.createPackage(testObj);

      // Initial usage should be 0
      let result = await db.getPackage(testObj.name);
      expect(result.usage_count).toBe(0);

      // Increment usage
      await db.incrementPackageUsage(testObj.name);

      // Usage should now be 1
      result = await db.getPackage(testObj.name);
      expect(result.usage_count).toBe(1);
    });

    test('2. Should increment usage count multiple times', async () => {
      const testObj = {
        name: 'multiple-increment-test',
        language: 'go',
        package_path: './cmd',
        manifest_path: './go.mod',
      };

      await db.createPackage(testObj);

      // Increment multiple times
      for (let i = 0; i < 5; i++) {
        await db.incrementPackageUsage(testObj.name);
      }

      const result = await db.getPackage(testObj.name);
      expect(result.usage_count).toBe(5);
    });

    test('3. Should handle incrementing non-existent package gracefully', async () => {
      // This should not throw an error, just silently do nothing
      await expect(
        db.incrementPackageUsage('non-existent-package')
      ).resolves.not.toThrow();
    });

    test('4. Should not affect other packages when incrementing one', async () => {
      const package1 = {
        name: 'increment-1',
        language: 'c++',
        package_path: './src1',
        manifest_path: './makefile',
      };
      const package2 = {
        name: 'increment-2',
        language: 'c++',
        package_path: './src2',
        manifest_path: './makefile',
      };

      await db.createPackage(package1);
      await db.createPackage(package2);

      // Increment only package1
      await db.incrementPackageUsage(package1.name);
      await db.incrementPackageUsage(package1.name);

      const result1 = await db.getPackage(package1.name);
      const result2 = await db.getPackage(package2.name);

      expect(result1.usage_count).toBe(2);
      expect(result2.usage_count).toBe(0);
    });
  });
});
