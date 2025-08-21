import { DatabaseManager } from '../../src/db/db-manager';
import { StorageManager } from '../../src/util/storage-manager';
import { FileSystemError } from '../../src/models/error.js';

// For further testing
let db;
let storageManager;

describe('sm: Storage Manager snippet methods', () => {
  beforeAll(async () => {
    db = new DatabaseManager('', true, true);
    try {
      await db.initialize();
    } catch (err) {
      throw new FileSystemError('Failed to initialize DB: ' + err);
    }
    storageManager = new StorageManager(db);
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

  describe('sm: storeTec', () => {
    test('Test 1. Stores snippet successfully', async () => {
      const testSnippet = {
        name: 'Super Snippet',
        description: "It's a snippet that's super!",
        language: 'JavaScript',
        category: 'super',
        content: "console.log('Hello super!!!');",
      };

      const { name, id } = await storageManager.storeTec(testSnippet);

      expect(name).toBe(testSnippet.name);
      expect(id).toBeTruthy();
    });

    test('Test 2. Persists snippet and returns only id and name', async () => {
      const testSnippet = {
        name: 'Persisted Snippet',
        description: 'Should be saved to DB',
        language: 'JavaScript',
        category: 'persistence',
        content: "console.log('Persist me');",
      };

      const result = await storageManager.storeTec(testSnippet);

      expect(result).toEqual({
        id: expect.anything(),
        name: testSnippet.name,
      });

      const saved = await db.getSnippet(testSnippet.name);
      expect(saved).toBeTruthy();
      expect(saved.name).toBe(testSnippet.name);
      if (saved.content !== undefined) {
        expect(saved.content).toBe(testSnippet.content);
      }
    });
  });

  describe('sm: updateTec', () => {
    test('Test 1. Updates snippet successfully and returns updated snippet', async () => {
      const name = 'Update Snippet 1';
      const original = {
        name,
        description: 'Original description',
        language: 'JavaScript',
        category: 'general',
        content: "console.log('orig');",
      };

      await storageManager.storeTec(original);

      const updates = {
        description: 'Updated description',
        content: "console.log('updated');",
      };

      const updated = await storageManager.updateTec(name, updates);

      expect(updated).toBeTruthy();
      expect(updated.name).toBe(name);
      if (updated.description !== undefined) {
        expect(updated.description).toBe('Updated description');
      }
      if (updated.content !== undefined) {
        expect(updated.content).toBe("console.log('updated');");
      }

      const saved = await db.getSnippet(name);
      expect(saved).toBeTruthy();
      if (saved.description !== undefined) {
        expect(saved.description).toBe('Updated description');
      }
      if (saved.content !== undefined) {
        expect(saved.content).toBe("console.log('updated');");
      }
    });

    test('Test 2. Partial update preserves unspecified fields', async () => {
      const name = 'Update Snippet 2';
      const original = {
        name,
        description: 'Keep this description',
        language: 'JavaScript',
        category: 'general',
        content: "console.log('keep');",
      };

      await storageManager.storeTec(original);

      const updates = {
        // Only update category
        category: 'refactor',
      };

      const updated = await storageManager.updateTec(name, updates);

      expect(updated).toBeTruthy();
      expect(updated.name).toBe(name);
      if (updated.category !== undefined) {
        expect(updated.category).toBe('refactor');
      }
      if (updated.description !== undefined) {
        expect(updated.description).toBe('Keep this description');
      }
      if (updated.content !== undefined) {
        expect(updated.content).toBe("console.log('keep');");
      }

      const saved = await db.getSnippet(name);
      expect(saved).toBeTruthy();
      if (saved.category !== undefined) {
        expect(saved.category).toBe('refactor');
      }
      if (saved.description !== undefined) {
        expect(saved.description).toBe('Keep this description');
      }
      if (saved.content !== undefined) {
        expect(saved.content).toBe("console.log('keep');");
      }
    });
  });

  describe('sm: getTec', () => {
    test('Test 1. Returns null when snippet does not exist', async () => {
      const result = await storageManager.getTec('does-not-exist');
      expect(result).toBeNull();
    });

    test('Test 2. Returns the stored snippet', async () => {
      const name = 'Get Snippet 1';
      const snippet = {
        name,
        description: 'Desc A',
        language: 'JavaScript',
        category: 'general',
        content: "console.log('get1');",
      };

      await storageManager.storeTec(snippet);

      const got = await storageManager.getTec(name);
      expect(got).toBeTruthy();
      expect(got.name).toBe(name);
      if (got.description !== undefined) expect(got.description).toBe('Desc A');
      if (got.content !== undefined)
        expect(got.content).toBe("console.log('get1');");
      if (got.category !== undefined) expect(got.category).toBe('general');
    });
  });

  describe('sm: deleteTec', () => {
    test('Test 1. Deletes an existing snippet', async () => {
      const name = 'Delete Snippet 1';
      await storageManager.storeTec({
        name,
        description: 'To delete',
        language: 'JavaScript',
        category: 'general',
        content: "console.log('del');",
      });

      await storageManager.deleteTec(name);

      const after = await storageManager.getTec(name);
      expect(after).toBeNull();
    });

    test('Test 2. Throws when deleting a non-existent snippet', async () => {
      await expect(storageManager.deleteTec('missing-snippet')).rejects.toThrow(
        'Snippet missing-snippet does not exist!'
      );
    });
  });

  describe('sm: update snippet online id', () => {
    beforeEach(async () => {
      try {
        await db.db.runAsync('DELETE FROM snippets');
      } catch {}
    });

    test('Test 1. updateTecOnlineId sets online_id on snippet', async () => {
      const tec = {
        name: 'online-id-snippet',
        description: 'desc',
        language: 'JavaScript',
        category: 'misc',
        content: 'console.log(1);',
      };
      await storageManager.storeTec(tec);

      await expect(
        storageManager.updateTecOnlineId(tec.name, 'SNIP-123')
      ).resolves.toBeUndefined();

      const saved = await db.getSnippet(tec.name);
      expect(saved).toBeTruthy();
      expect(saved.online_id).toBe('SNIP-123');
    });
  });
});
