import { DatabaseManager } from '../../src/db/db-manager.js';
import { FileSystemError } from '../../src/models/error.js';

let db;

describe('db: Database Manager snippet methods', () => {
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
      await db.db.runAsync('DELETE FROM snippets');
    } catch (err) {
      throw new FileSystemError('Failed to initialize DB: ' + err);
    }
  });

  describe('db: createSnippet', () => {
    test('Test 1. Should create snippet with all fields', async () => {
      const testObj = {
        name: 'supertec',
        description: 'A really cool tec!',
        language: 'javascript',
        category: 'utilities',
        content: 'console.log("Hello World");',
      };

      await db.createSnippet(testObj);

      const result = await db.db.getAsync(
        'SELECT * FROM snippets WHERE name = ?',
        testObj.name
      );

      expect(result).toBeDefined();
      expect(result.name).toBe(testObj.name);
      expect(result.description).toBe(testObj.description);
      expect(result.language).toBe(testObj.language);
      expect(result.category).toBe(testObj.category);
      expect(result.content).toBe(testObj.content);
      expect(result.usage_count).toBe(0);
    });

    test('Test 2. Should create snippet with minimal required fields', async () => {
      const testObj = {
        name: 'minimal-tec',
        language: 'python',
        content: 'print("Hello")',
      };

      await db.createSnippet(testObj);

      const result = await db.db.getAsync(
        'SELECT * FROM snippets WHERE name = ?',
        testObj.name
      );

      expect(result).toBeDefined();
      expect(result.name).toBe(testObj.name);
      expect(result.language).toBe(testObj.language);
      expect(result.content).toBe(testObj.content);
      expect(result.description).toBeNull();
      expect(result.category).toBeNull();
      expect(result.usage_count).toBe(0);
    });

    test('Test 3. Should handle special characters and multiline content', async () => {
      const testObj = {
        name: 'special-chars-tec',
        description: 'Contains "quotes" and \'apostrophes\' & symbols',
        language: 'sql',
        category: 'database',
        content: `SELECT * FROM users 
                WHERE name = 'John O\'Connor' 
                AND email LIKE '%@example.com'
                ORDER BY created_at DESC;`,
      };

      await db.createSnippet(testObj);

      const result = await db.db.getAsync(
        'SELECT * FROM snippets WHERE name = ?',
        testObj.name
      );

      expect(result).toBeDefined();
      expect(result.name).toBe(testObj.name);
      expect(result.description).toBe(testObj.description);
      expect(result.content).toBe(testObj.content);
    });

    test('Test 4. Should throw error for duplicate name', async () => {
      const testObj = {
        name: 'duplicate-tec',
        language: 'java',
        content: 'System.out.println("Hello");',
      };

      // Create first snippet
      await db.createSnippet(testObj);

      // Attempt to create duplicate should throw error
      await expect(db.createSnippet(testObj)).rejects.toThrow(
        'Snippet "duplicate-tec" already exists'
      );
    });

    test('Test 5. Should auto-increment ID correctly', async () => {
      const testObj1 = {
        name: 'auto-id-tec-1',
        language: 'bash',
        content: 'echo "First script"',
      };

      const testObj2 = {
        name: 'auto-id-tec-2',
        language: 'bash',
        content: 'echo "Second script"',
      };

      await db.createSnippet(testObj1);
      await db.createSnippet(testObj2);

      const result1 = await db.db.getAsync(
        'SELECT * FROM snippets WHERE name = ?',
        testObj1.name
      );

      const result2 = await db.db.getAsync(
        'SELECT * FROM snippets WHERE name = ?',
        testObj2.name
      );

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1.id).toBeDefined();
      expect(result2.id).toBeDefined();
      expect(result2.id).toBeGreaterThan(result1.id);
    });
  });

  //getSnippet Test Suite

  describe('db: getSnippet', () => {
    test('Test 1. Should get snippet with all fields', async () => {
      const testObj = {
        name: 'super-dope-tec',
        description: 'Contains "quotes" and \'apostrophes\' & symbols',
        language: 'sql',
        category: 'database',
        content: `SELECT * FROM users
                WHERE name = 'John O\'Connor' 
                AND email LIKE '%@example.com'
                ORDER BY created_at DESC;`,
      };

      await db.createSnippet(testObj);

      const result = await db.getSnippet(testObj.name);

      expect(result).toBeDefined();
      expect(result.name).toBe(testObj.name);
      expect(result.description).toBe(testObj.description);
      expect(result.language).toBe(testObj.language);
      expect(result.category).toBe(testObj.category);
      expect(result.content).toBe(testObj.content);
    });

    test('Test 2. Should get snippet with minimal fields', async () => {
      const testObj = {
        name: 'minimal-get-tec',
        language: 'python',
        content: 'print("Minimal test")',
      };

      await db.createSnippet(testObj);

      const result = await db.getSnippet(testObj.name);

      expect(result).toBeDefined();
      expect(result.name).toBe(testObj.name);
      expect(result.language).toBe(testObj.language);
      expect(result.content).toBe(testObj.content);
      expect(result.description).toBeNull();
      expect(result.category).toBeNull();
      expect(result.usage_count).toBe(0);
    });

    test('Test 3. Should return null for non-existent snippet', async () => {
      const result = await db.getSnippet('non-existent-snippet');
      expect(result).toBeNull();
    });

    test('Test 4. Should handle case-sensitive snippet names', async () => {
      const testObj = {
        name: 'CaseSensitive-Tec',
        language: 'javascript',
        content: 'console.log("Case matters");',
      };

      await db.createSnippet(testObj);

      // Should find exact match
      const exactMatch = await db.getSnippet('CaseSensitive-Tec');
      expect(exactMatch).toBeDefined();
      expect(exactMatch.name).toBe(testObj.name);

      // Should not find different case
      const result = await db.getSnippet('casesensitive-tec');

      expect(result).toBeNull();
    });

    test('Test 5. Should get snippet with special characters in name', async () => {
      const testObj = {
        name: 'special-chars_123@tec',
        description: 'Testing special characters in name',
        language: 'bash',
        content: 'echo "Special characters work"',
      };

      await db.createSnippet(testObj);

      const result = await db.getSnippet(testObj.name);

      expect(result).toBeDefined();
      expect(result.name).toBe(testObj.name);
      expect(result.description).toBe(testObj.description);
      expect(result.content).toBe(testObj.content);
    });

    test('Test 6. Should handle empty string name gracefully', async () => {
      await expect(db.getSnippet('')).rejects.toThrow(
        'Empty name provided, Please provide a valid snippet name!'
      );
    });

    test('Test 7. Should verify all database fields are present', async () => {
      const testObj = {
        name: 'complete-fields-tec',
        description: 'Testing all fields are returned',
        language: 'typescript',
        category: 'testing',
        content: 'interface Test { name: string; }',
      };

      await db.createSnippet(testObj);

      const result = await db.getSnippet(testObj.name);

      // Verify all expected database columns are present
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('language');
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('usage_count');
      expect(result).toHaveProperty('online_id');

      // Verify types
      expect(typeof result.id).toBe('number');
      expect(typeof result.name).toBe('string');
      expect(typeof result.usage_count).toBe('number');
      expect(result.online_id).toBeNull(); // Should be null for new snippets
    });
  });

  describe('db: getAllSnippets', () => {
    test('Test 1. Should retrieve all created snippets', async () => {
      const testObj1 = {
        name: 'interesting-tec-1',
        language: 'bash',
        content: 'echo "First script"',
      };

      const testObj2 = {
        name: 'interesting-tec-2',
        language: 'bash',
        content: 'echo "Second script"',
      };

      await db.createSnippet(testObj1);
      await db.createSnippet(testObj2);

      const results = await db.getAllSnippets();

      const firstResult = results[0];
      const secondResult = results[1];

      expect(results).toBeDefined();
      expect(firstResult).toBeDefined();
      expect(secondResult).toBeDefined();
      expect(firstResult.name).toBe(testObj1.name);
      expect(firstResult.language).toBe(testObj1.language);
      expect(firstResult.content).toBe(testObj1.content);
      expect(secondResult.name).toBe(testObj2.name);
      expect(secondResult.language).toBe(testObj2.language);
      expect(secondResult.content).toBe(testObj2.content);
    });

    test('Test 2. Should return empty array when no snippets exist', async () => {
      const results = await db.getAllSnippets();

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    test('Test 3. Should return correct number of snippets', async () => {
      const snippets = [
        { name: 'snippet-1', language: 'js', content: 'console.log(1);' },
        { name: 'snippet-2', language: 'py', content: 'print(2)' },
        {
          name: 'snippet-3',
          language: 'java',
          content: 'System.out.println(3);',
        },
        { name: 'snippet-4', language: 'cpp', content: 'cout << 4;' },
        { name: 'snippet-5', language: 'go', content: 'fmt.Println(5)' },
      ];

      // Create all snippets
      for (const snippet of snippets) {
        await db.createSnippet(snippet);
      }

      const results = await db.getAllSnippets();

      expect(results).toBeDefined();
      expect(results.length).toBe(5);

      // Verify all snippets are present
      const names = results.map(r => r.name);
      expect(names).toContain('snippet-1');
      expect(names).toContain('snippet-2');
      expect(names).toContain('snippet-3');
      expect(names).toContain('snippet-4');
      expect(names).toContain('snippet-5');
    });

    test('Test 4. Should return snippets with all database fields', async () => {
      const testObj = {
        name: 'full-fields-tec',
        description: 'Testing all fields',
        language: 'typescript',
        category: 'testing',
        content: 'type Test = { id: number; };',
      };

      await db.createSnippet(testObj);

      const results = await db.getAllSnippets();

      expect(results.length).toBe(1);
      const snippet = results[0];

      // Verify all expected database columns are present
      expect(snippet).toHaveProperty('id');
      expect(snippet).toHaveProperty('name');
      expect(snippet).toHaveProperty('description');
      expect(snippet).toHaveProperty('language');
      expect(snippet).toHaveProperty('category');
      expect(snippet).toHaveProperty('content');
      expect(snippet).toHaveProperty('usage_count');
      expect(snippet).toHaveProperty('online_id');

      // Verify values
      expect(snippet.name).toBe(testObj.name);
      expect(snippet.description).toBe(testObj.description);
      expect(snippet.language).toBe(testObj.language);
      expect(snippet.category).toBe(testObj.category);
      expect(snippet.content).toBe(testObj.content);
    });

    test('Test 5. Should handle snippets with mixed field completeness', async () => {
      const fullSnippet = {
        name: 'full-snippet',
        description: 'Complete snippet',
        language: 'javascript',
        category: 'utilities',
        content: 'console.log("full");',
      };

      const minimalSnippet = {
        name: 'minimal-snippet',
        language: 'python',
        content: 'print("minimal")',
      };

      await db.createSnippet(fullSnippet);
      await db.createSnippet(minimalSnippet);

      const results = await db.getAllSnippets();

      expect(results.length).toBe(2);

      const full = results.find(r => r.name === 'full-snippet');
      const minimal = results.find(r => r.name === 'minimal-snippet');

      expect(full).toBeDefined();
      expect(minimal).toBeDefined();

      // Full snippet should have all fields
      expect(full.description).toBe('Complete snippet');
      expect(full.category).toBe('utilities');

      // Minimal snippet should have null for optional fields
      expect(minimal.description).toBeNull();
      expect(minimal.category).toBeNull();
    });

    test('Test 6. Should maintain insertion order or consistent ordering', async () => {
      const snippets = [
        {
          name: 'alpha-snippet',
          language: 'js',
          content: 'console.log("alpha");',
        },
        { name: 'beta-snippet', language: 'py', content: 'print("beta")' },
        {
          name: 'gamma-snippet',
          language: 'java',
          content: 'System.out.println("gamma");',
        },
      ];

      // Create snippets in specific order
      for (const snippet of snippets) {
        await db.createSnippet(snippet);
      }

      const results = await db.getAllSnippets();

      expect(results.length).toBe(3);

      // Verify consistent ordering (likely by ID which should reflect insertion order)
      const names = results.map(r => r.name);
      expect(names[0]).toBe('alpha-snippet');
      expect(names[1]).toBe('beta-snippet');
      expect(names[2]).toBe('gamma-snippet');
    });

    test('Test 7. Should handle large number of snippets efficiently', async () => {
      const SNIPPET_COUNT = 50;
      const snippets = [];

      // Create many snippets
      for (let i = 1; i <= SNIPPET_COUNT; i++) {
        const snippet = {
          name: `bulk-snippet-${i}`,
          language: 'javascript',
          content: `console.log("Snippet ${i}");`,
        };
        snippets.push(snippet);
        await db.createSnippet(snippet);
      }

      const startTime = Date.now();
      const results = await db.getAllSnippets(SNIPPET_COUNT);
      const endTime = Date.now();

      expect(results.length).toBe(SNIPPET_COUNT);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second

      // Verify first and last snippets
      const names = results.map(r => r.name);
      expect(names).toContain('bulk-snippet-1');
      expect(names).toContain(`bulk-snippet-${SNIPPET_COUNT}`);
    });
  });

  describe('db: updateSnippet', () => {
    test('Test 1. Should update snippet with all fields', async () => {
      // Create initial snippet
      const originalSnippet = {
        name: 'update-test-tec',
        description: 'Original description',
        language: 'javascript',
        category: 'utilities',
        content: 'console.log("original");',
      };

      await db.createSnippet(originalSnippet);

      // Update snippet
      const updates = {
        name: 'updated-test-tec',
        description: 'Updated description',
        language: 'typescript',
        category: 'frameworks',
        content: 'console.log("updated");',
      };

      await db.updateSnippet(originalSnippet.name, updates);

      // Verify original name no longer exists
      const originalResult = await db.getSnippet(originalSnippet.name);
      expect(originalResult).toBeNull();

      // Verify updated snippet exists with new values
      const updatedResult = await db.getSnippet(updates.name);
      expect(updatedResult).toBeDefined();
      expect(updatedResult.name).toBe(updates.name);
      expect(updatedResult.description).toBe(updates.description);
      expect(updatedResult.language).toBe(updates.language);
      expect(updatedResult.category).toBe(updates.category);
      expect(updatedResult.content).toBe(updates.content);
    });

    test('Test 2. Should update snippet without changing name', async () => {
      const originalSnippet = {
        name: 'same-name-tec',
        description: 'Original description',
        language: 'python',
        category: 'scripts',
        content: 'print("original")',
      };

      await db.createSnippet(originalSnippet);

      // Update without changing name
      const updates = {
        description: 'Updated description',
        language: 'python',
        category: 'automation',
        content: 'print("updated")',
      };

      await db.updateSnippet(originalSnippet.name, updates);

      const result = await db.getSnippet(originalSnippet.name);
      expect(result).toBeDefined();
      expect(result.name).toBe(originalSnippet.name); // Name unchanged
      expect(result.description).toBe(updates.description);
      expect(result.category).toBe(updates.category);
      expect(result.content).toBe(updates.content);
    });

    test('Test 3. Should update partial fields only', async () => {
      const originalSnippet = {
        name: 'partial-update-tec',
        description: 'Original description',
        language: 'java',
        category: 'backend',
        content: 'System.out.println("original");',
      };

      await db.createSnippet(originalSnippet);

      // Update only description and content
      const updates = {
        description: 'Only description updated',
        content: 'System.out.println("updated");',
      };

      await db.updateSnippet(originalSnippet.name, updates);

      const result = await db.getSnippet(originalSnippet.name);
      expect(result).toBeDefined();
      expect(result.description).toBe(updates.description);
      expect(result.content).toBe(updates.content);
      // These should remain unchanged
      expect(result.language).toBe(originalSnippet.language);
      expect(result.category).toBe(originalSnippet.category);
    });

    test('Test 4. Should throw error for non-existent snippet', async () => {
      const updates = {
        description: 'Updated description',
        content: 'console.log("test");',
      };

      await expect(
        db.updateSnippet('non-existent-snippet', updates)
      ).rejects.toThrow('Snippet "non-existent-snippet" does not exist!');
    });

    test('Test 5. Should throw error for duplicate name conflict', async () => {
      // Create two snippets
      const snippet1 = {
        name: 'conflict-tec-1',
        language: 'javascript',
        content: 'console.log("first");',
      };

      const snippet2 = {
        name: 'conflict-tec-2',
        language: 'javascript',
        content: 'console.log("second");',
      };

      await db.createSnippet(snippet1);
      await db.createSnippet(snippet2);

      // Try to rename snippet2 to snippet1's name
      const updates = {
        name: 'conflict-tec-1',
        content: 'console.log("updated");',
      };

      await expect(db.updateSnippet('conflict-tec-2', updates)).rejects.toThrow(
        'Snippet with name conflict-tec-1 already exists!'
      );
    });

    test('Test 6. Should throw error for empty content', async () => {
      const originalSnippet = {
        name: 'empty-content-tec',
        language: 'javascript',
        content: 'console.log("original");',
      };

      await db.createSnippet(originalSnippet);

      const updates = {
        content: '', // Empty content
      };

      await expect(
        db.updateSnippet(originalSnippet.name, updates)
      ).rejects.toThrow('Snippet name or content cannot be empty!');
    });

    test('Test 7. Should handle special characters in updated content', async () => {
      const originalSnippet = {
        name: 'special-chars-update-tec',
        language: 'sql',
        content: 'SELECT * FROM users;',
      };

      await db.createSnippet(originalSnippet);

      const updates = {
        description: 'Contains "quotes" and \'apostrophes\' & symbols',
        content: `SELECT * FROM users 
                WHERE name = 'John O\'Connor' 
                AND email LIKE '%@example.com'
                ORDER BY created_at DESC;`,
      };

      await db.updateSnippet(originalSnippet.name, updates);

      const result = await db.getSnippet(originalSnippet.name);
      expect(result).toBeDefined();
      expect(result.description).toBe(updates.description);
      expect(result.content).toBe(updates.content);
    });

    test('Test 8. Should preserve usage_count when updating', async () => {
      const originalSnippet = {
        name: 'usage-count-tec',
        language: 'javascript',
        content: 'console.log("original");',
      };

      await db.createSnippet(originalSnippet);

      // Simulate some usage by directly updating usage_count
      await db.db.runAsync(
        'UPDATE snippets SET usage_count = 5 WHERE name = ?',
        originalSnippet.name
      );

      const updates = {
        description: 'Updated description',
        content: 'console.log("updated");',
      };

      await db.updateSnippet(originalSnippet.name, updates);

      const result = await db.getSnippet(originalSnippet.name);
      expect(result).toBeDefined();
      expect(result.usage_count).toBe(5); // Should preserve usage count
      expect(result.description).toBe(updates.description);
      expect(result.content).toBe(updates.content);
    });

    test('Test 9. Should handle null values for optional fields', async () => {
      const originalSnippet = {
        name: 'null-fields-tec',
        description: 'Original description',
        language: 'javascript',
        category: 'utilities',
        content: 'console.log("original");',
      };

      await db.createSnippet(originalSnippet);

      // Update with null values for optional fields
      const updates = {
        description: '',
        category: '',
        content: 'console.log("updated");',
      };

      await db.updateSnippet(originalSnippet.name, updates);

      const result = await db.getSnippet(originalSnippet.name);
      expect(result).toBeDefined();
      expect(result.description).toBe('');
      expect(result.category).toBe('');
      expect(result.content).toBe(updates.content);
      expect(result.language).toBe(originalSnippet.language); // Should remain unchanged
    });
  });

  describe('db: incrementSnippetUsage', () => {
    test('Test 1. Should increment usage count from 0 to 1', async () => {
      const testObj = {
        name: 'usage-test-tec',
        language: 'javascript',
        content: 'console.log("usage test");',
      };

      await db.createSnippet(testObj);

      // Verify initial usage count is 0
      const initialResult = await db.getSnippet(testObj.name);
      expect(initialResult.usage_count).toBe(0);

      // Increment usage
      await db.incrementSnippetUsage(testObj.name);

      // Verify usage count increased
      const updatedResult = await db.getSnippet(testObj.name);
      expect(updatedResult.usage_count).toBe(1);
    });

    test('Test 2. Should increment usage count multiple times', async () => {
      const testObj = {
        name: 'multiple-usage-tec',
        language: 'python',
        content: 'print("multiple usage test")',
      };

      await db.createSnippet(testObj);

      // Increment usage 5 times
      for (let i = 0; i < 5; i++) {
        await db.incrementSnippetUsage(testObj.name);
      }

      const result = await db.getSnippet(testObj.name);
      expect(result.usage_count).toBe(5);
    });
  });

  describe('db: deleteSnippet', () => {
    test('Test 1. Should delete existing snippet', async () => {
      const testObj = {
        name: 'delete-test-tec',
        language: 'java',
        content: 'System.out.println("delete test");',
      };

      await db.createSnippet(testObj);

      // Verify snippet exists
      const beforeDelete = await db.getSnippet(testObj.name);
      expect(beforeDelete).toBeDefined();

      // Delete snippet
      await db.deleteSnippet(testObj.name);

      // Verify snippet no longer exists
      const afterDelete = await db.getSnippet(testObj.name);
      expect(afterDelete).toBeNull();
    });

    test('Test 2. Should handle deleting non-existent snippet', async () => {
      await expect(db.deleteSnippet('non-existent-snippet')).rejects.toThrow(
        `Snippet non-existent-snippet does not exist!`
      );
    });

    test('Test 3. Should delete correct snippet when multiple exist', async () => {
      const snippet1 = {
        name: 'keep-me-tec',
        language: 'javascript',
        content: 'console.log("keep me");',
      };

      const snippet2 = {
        name: 'delete-me-tec',
        language: 'javascript',
        content: 'console.log("delete me");',
      };

      await db.createSnippet(snippet1);
      await db.createSnippet(snippet2);

      // Delete only the second snippet
      await db.deleteSnippet(snippet2.name);

      // Verify first snippet still exists
      const keepResult = await db.getSnippet(snippet1.name);
      expect(keepResult).toBeDefined();
      expect(keepResult.name).toBe(snippet1.name);

      // Verify second snippet is gone
      const deleteResult = await db.getSnippet(snippet2.name);
      expect(deleteResult).toBeNull();
    });

    test('Test 4. Should verify snippet count decreases after deletion', async () => {
      const snippets = [
        { name: 'count-test-1', language: 'js', content: 'console.log(1);' },
        { name: 'count-test-2', language: 'js', content: 'console.log(2);' },
        { name: 'count-test-3', language: 'js', content: 'console.log(3);' },
      ];

      // Create all snippets
      for (const snippet of snippets) {
        await db.createSnippet(snippet);
      }

      // Verify initial count
      const initialResults = await db.getAllSnippets();
      const initialCount = initialResults.length;
      expect(initialCount).toBeGreaterThanOrEqual(3);

      // Delete one snippet
      await db.deleteSnippet('count-test-2');

      // Verify count decreased
      const finalResults = await db.getAllSnippets();
      const finalCount = finalResults.length;
      expect(finalCount).toBe(initialCount - 1);

      // Verify the correct snippet was deleted
      const names = finalResults.map(r => r.name);
      expect(names).toContain('count-test-1');
      expect(names).not.toContain('count-test-2');
      expect(names).toContain('count-test-3');
    });
  });
});
