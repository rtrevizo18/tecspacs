import { DatabaseManager } from '../../src/db/db-manager';
import { StorageManager } from '../../src/util/storage-manager';
import { FileSystemError } from '../../src/models/error.js';
import { jest } from '@jest/globals';
import { FileManager } from '../../src/util/file-manager.js';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import envPaths from 'env-paths';

let db;
let storageManager;

describe('sm: Storage Manager package methods', () => {
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

  describe('sm: storePac', () => {
    beforeEach(async () => {
      jest.restoreAllMocks();
      try {
        await db.db.runAsync('DELETE FROM packages');
      } catch {}
    });

    test('Test 1. Copies directory when package_path is a directory', async () => {
      const name = 'pkg-dir-source';
      const package_path = '/tmp/fake-src-dir';

      const ensureDirSpy = jest
        .spyOn(FileManager, 'ensureDirectory')
        .mockResolvedValue();
      const saveJSONSpy = jest
        .spyOn(FileManager, 'saveJSON')
        .mockResolvedValue();
      jest.spyOn(FileManager, 'exists').mockResolvedValue(true);
      jest.spyOn(FileManager, 'getStats').mockResolvedValue({
        isDirectory: () => true,
        isFile: () => false,
      });
      const copyDirSpy = jest
        .spyOn(FileManager, 'copyDirectory')
        .mockResolvedValue();
      const copyFileSpy = jest
        .spyOn(FileManager, 'copyFile')
        .mockResolvedValue();

      const createPkgSpy = jest.spyOn(db, 'createPackage').mockReturnValue(202);

      const pathsObj = envPaths('tcspcs');
      const packagesDir = path.join(pathsObj.data, 'packages');
      const expectedPackageDir = path.join(packagesDir, name);
      const expectedManifestPath = path.join(expectedPackageDir, 'pacs.json');

      const res = await storageManager.storePac({
        name,
        version: '0.1.0',
        description: 'Dir source',
        author: 'me',
        language: 'JavaScript',
        category: 'utils',
        package_path,
      });

      expect(res).toEqual({
        id: 202,
        name,
        package_path: expectedPackageDir,
        manifest_path: expectedManifestPath,
      });

      expect(ensureDirSpy).toHaveBeenCalledWith(packagesDir);
      expect(ensureDirSpy).toHaveBeenCalledWith(expectedPackageDir);
      expect(copyFileSpy).not.toHaveBeenCalled();
      expect(saveJSONSpy).toHaveBeenCalledWith(
        expectedManifestPath,
        expect.objectContaining({
          name,
          version: '0.1.0',
          description: 'Dir source',
          author: 'me',
          language: 'JavaScript',
          category: 'utils',
          package_path,
          created_at: expect.any(String),
        })
      );
      expect(createPkgSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name,
          version: '0.1.0',
          description: 'Dir source',
          author: 'me',
          language: 'JavaScript',
          category: 'utils',
          package_path: expectedPackageDir,
          manifest_path: expectedManifestPath,
        })
      );
    });

    test('Test 2. Copies single file when package_path is a file', async () => {
      const name = 'pkg-file-source';
      const package_path = '/tmp/fake-src.js';

      jest.spyOn(FileManager, 'ensureDirectory').mockResolvedValue();
      jest.spyOn(FileManager, 'saveJSON').mockResolvedValue();
      jest.spyOn(FileManager, 'exists').mockResolvedValue(true);
      jest.spyOn(FileManager, 'getStats').mockResolvedValue({
        isDirectory: () => false,
        isFile: () => true,
      });
      const copyDirSpy = jest
        .spyOn(FileManager, 'copyDirectory')
        .mockResolvedValue();
      const copyFileSpy = jest
        .spyOn(FileManager, 'copyFile')
        .mockResolvedValue();

      jest.spyOn(db, 'createPackage').mockReturnValue(303);

      const pathsObj = envPaths('tcspcs');
      const packagesDir = path.join(pathsObj.data, 'packages');
      const expectedPackageDir = path.join(packagesDir, name);

      const res = await storageManager.storePac({
        name,
        version: '0.2.0',
        description: 'File source',
        language: 'JavaScript',
        category: 'utils',
        package_path,
      });

      expect(res.id).toBe(303);
      expect(copyDirSpy).not.toHaveBeenCalled();
      expect(copyFileSpy).toHaveBeenCalledWith(
        package_path,
        path.join(expectedPackageDir, path.basename(package_path))
      );
    });

    test('Test 3. Throws if package_path does not exist', async () => {
      const name = 'pkg-missing-source';
      const package_path = '/tmp/does-not-exist';

      jest.spyOn(FileManager, 'ensureDirectory').mockResolvedValue();
      jest.spyOn(FileManager, 'exists').mockResolvedValue(false);
      jest.spyOn(FileManager, 'getStats').mockResolvedValue(null);
      jest.spyOn(db, 'createPackage').mockReturnValue(404);

      await expect(
        storageManager.storePac({
          name,
          version: '1.0.1',
          description: 'Missing source',
          language: 'JavaScript',
          category: 'utils',
          package_path,
        })
      ).rejects.toThrow(`Source path does not exist: ${package_path}`);
    });
  });

  // Integration tests that actually copy files
  describe('sm: storePac (fs copy integration)', () => {
    const cleanup = async p => {
      try {
        await fs.rm(p, { recursive: true, force: true });
      } catch {
        // ignore
      }
    };

    beforeEach(() => {
      jest.restoreAllMocks();
    });

    test('Test 4. Directory source is copied recursively and manifest is written', async () => {
      const srcRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'tecspacs-src-'));
      const nestedDir = path.join(srcRoot, 'nested');
      const fileA = path.join(srcRoot, 'fileA.txt');
      const fileB = path.join(nestedDir, 'code.js');

      await fs.mkdir(nestedDir, { recursive: true });
      await fs.writeFile(fileA, 'hello world', 'utf8');
      await fs.writeFile(fileB, "console.log('nested');", 'utf8');

      jest.spyOn(db, 'createPackage').mockReturnValue(901);

      const name = `pkg-dir-int-${Date.now()}`;
      const res = await storageManager.storePac({
        name,
        version: '1.2.3',
        description: 'Integration dir copy',
        author: 'tester',
        language: 'JavaScript',
        category: 'integration',
        package_path: srcRoot,
      });

      const pathsObj = envPaths('tcspcs');
      const packagesDir = path.join(pathsObj.data, 'packages');
      const pkgDir = path.join(packagesDir, name);
      const manifest_path = path.join(pkgDir, 'pacs.json');

      expect(res).toEqual({
        id: 901,
        name,
        package_path: pkgDir,
        manifest_path,
      });

      const copiedFileA = path.join(pkgDir, 'fileA.txt');
      const copiedFileB = path.join(pkgDir, 'nested', 'code.js');

      await expect(fs.readFile(copiedFileA, 'utf8')).resolves.toBe(
        'hello world'
      );
      await expect(fs.readFile(copiedFileB, 'utf8')).resolves.toBe(
        "console.log('nested');"
      );

      const manifestRaw = await fs.readFile(manifest_path, 'utf8');
      const manifest = JSON.parse(manifestRaw);
      expect(manifest).toEqual(
        expect.objectContaining({
          name,
          version: '1.2.3',
          description: 'Integration dir copy',
          author: 'tester',
          language: 'JavaScript',
          category: 'integration',
          package_path: srcRoot,
          created_at: expect.any(String),
        })
      );

      await cleanup(srcRoot);
      await cleanup(pkgDir);
    });

    test('Test 5. Single file source is copied and manifest is written', async () => {
      const srcRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'tecspacs-src-'));
      const srcFile = path.join(srcRoot, 'single.js');
      await fs.writeFile(srcFile, 'export const x = 42;', 'utf8');

      jest.spyOn(db, 'createPackage').mockReturnValue(902);

      const name = `pkg-file-int-${Date.now()}`;
      const res = await storageManager.storePac({
        name,
        version: '0.0.9',
        description: 'Integration file copy',
        language: 'JavaScript',
        category: 'integration',
        package_path: srcFile,
      });

      const pathsObj = envPaths('tcspcs');
      const packagesDir = path.join(pathsObj.data, 'packages');
      const pkgDir = path.join(packagesDir, name);
      const manifest_path = path.join(pkgDir, 'pacs.json');

      expect(res).toEqual({
        id: 902,
        name,
        package_path: pkgDir,
        manifest_path,
      });

      const copiedFile = path.join(pkgDir, path.basename(srcFile));
      await expect(fs.readFile(copiedFile, 'utf8')).resolves.toBe(
        'export const x = 42;'
      );

      const manifestRaw = await fs.readFile(manifest_path, 'utf8');
      const manifest = JSON.parse(manifestRaw);
      expect(manifest).toEqual(
        expect.objectContaining({
          name,
          version: '0.0.9',
          description: 'Integration file copy',
          language: 'JavaScript',
          category: 'integration',
          package_path: srcFile,
          created_at: expect.any(String),
        })
      );

      await fs.rm(srcRoot, { recursive: true, force: true });
      await fs.rm(pkgDir, { recursive: true, force: true });
    });
  });

  describe('sm: updatePac (unit)', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });

    test('Test 1. Updates manifest fields only (version/description/author)', async () => {
      const name = 'pkg-update-unit-manifest';
      const pkg = {
        name,
        package_path: '/tmp/pkg-update-unit-manifest',
        manifest_path: '/tmp/pkg-update-unit-manifest/pacs.json',
      };

      const originalManifest = {
        name,
        version: '1.0.0',
        description: 'Old',
        author: 'old-author',
        language: 'JavaScript',
        category: 'utils',
        package_path: '/some/src',
        created_at: new Date().toISOString(),
      };

      jest.spyOn(db, 'getPackage').mockReturnValue(pkg);
      const readSpy = jest
        .spyOn(FileManager, 'readJSON')
        .mockResolvedValue(originalManifest);
      const saveSpy = jest.spyOn(FileManager, 'saveJSON').mockResolvedValue();

      const delDirSpy = jest
        .spyOn(FileManager, 'deleteDirectory')
        .mockResolvedValue();
      const existsSpy = jest
        .spyOn(FileManager, 'exists')
        .mockResolvedValue(true);
      const copyDirSpy = jest
        .spyOn(FileManager, 'copyDirectory')
        .mockResolvedValue();
      const copyFileSpy = jest
        .spyOn(FileManager, 'copyFile')
        .mockResolvedValue();
      const ensureDirSpy = jest
        .spyOn(FileManager, 'ensureDirectory')
        .mockResolvedValue();

      await expect(
        storageManager.updatePac(name, {
          version: '2.0.0',
          description: 'New',
          author: 'alice',
        })
      ).resolves.toBeDefined();

      expect(readSpy).toHaveBeenCalledWith(pkg.manifest_path);
      expect(saveSpy).toHaveBeenCalledWith(
        pkg.manifest_path,
        expect.objectContaining({
          version: '2.0.0',
          description: 'New',
          author: 'alice',
        })
      );

      expect(existsSpy).not.toHaveBeenCalled();
      expect(delDirSpy).not.toHaveBeenCalled();
      expect(copyDirSpy).not.toHaveBeenCalled();
      expect(copyFileSpy).not.toHaveBeenCalled();
    });

    test('Test 2. Replaces content when package_path is a directory', async () => {
      const name = 'pkg-update-unit-dir';
      const pkg = {
        name,
        package_path: '/tmp/pkg-update-unit-dir',
        manifest_path: '/tmp/pkg-update-unit-dir/pacs.json',
      };

      jest.spyOn(db, 'getPackage').mockReturnValue(pkg);
      jest.spyOn(FileManager, 'exists').mockResolvedValue(true);
      const delDirSpy = jest
        .spyOn(FileManager, 'deleteDirectory')
        .mockResolvedValue();
      jest
        .spyOn(FileManager, 'getStats')
        .mockResolvedValue({ isDirectory: () => true, isFile: () => false });
      const copyDirSpy = jest
        .spyOn(FileManager, 'copyDirectory')
        .mockResolvedValue();
      const readSpy = jest.spyOn(FileManager, 'readJSON').mockResolvedValue({
        name,
        version: '1.0.0',
      });
      const saveSpy = jest.spyOn(FileManager, 'saveJSON').mockResolvedValue();
      const ensureDirSpy = jest
        .spyOn(FileManager, 'ensureDirectory')
        .mockResolvedValue();
      const copyFileSpy = jest
        .spyOn(FileManager, 'copyFile')
        .mockResolvedValue();

      const newSrc = '/tmp/new-src-dir';
      await expect(
        storageManager.updatePac(name, { package_path: newSrc })
      ).resolves.toBeDefined();

      expect(delDirSpy).toHaveBeenCalledWith(pkg.package_path);
      expect(copyDirSpy).toHaveBeenCalledWith(newSrc, pkg.package_path);
      expect(readSpy).toHaveBeenCalledWith(pkg.manifest_path);
      expect(saveSpy).toHaveBeenCalledWith(
        pkg.manifest_path,
        expect.objectContaining({
          name,
          version: '1.0.0',
          modified_at: expect.any(String),
        })
      );
      expect(copyFileSpy).not.toHaveBeenCalled();
    });

    test('Test 3. Replaces content when package_path is a file', async () => {
      const name = 'pkg-update-unit-file';
      const pkg = {
        name,
        package_path: '/tmp/pkg-update-unit-file',
        manifest_path: '/tmp/pkg-update-unit-file/pacs.json',
      };

      jest.spyOn(db, 'getPackage').mockReturnValue(pkg);
      jest.spyOn(FileManager, 'exists').mockResolvedValue(true);
      const delDirSpy = jest
        .spyOn(FileManager, 'deleteDirectory')
        .mockResolvedValue();
      jest
        .spyOn(FileManager, 'getStats')
        .mockResolvedValue({ isDirectory: () => false, isFile: () => true });
      const ensureDirSpy = jest
        .spyOn(FileManager, 'ensureDirectory')
        .mockResolvedValue();
      const copyFileSpy = jest
        .spyOn(FileManager, 'copyFile')
        .mockResolvedValue();
      const readSpy = jest.spyOn(FileManager, 'readJSON').mockResolvedValue({
        name,
        version: '1.0.0',
      });
      const saveSpy = jest.spyOn(FileManager, 'saveJSON').mockResolvedValue();

      const newFile = '/tmp/new-file.js';
      await expect(
        storageManager.updatePac(name, { package_path: newFile })
      ).resolves.toBeDefined();

      expect(delDirSpy).toHaveBeenCalledWith(pkg.package_path);
      expect(ensureDirSpy).toHaveBeenCalledWith(pkg.package_path);
      expect(copyFileSpy).toHaveBeenCalledWith(
        newFile,
        path.join(pkg.package_path, path.basename(newFile))
      );
      expect(readSpy).toHaveBeenCalledWith(pkg.manifest_path);
      expect(saveSpy).toHaveBeenCalledWith(
        pkg.manifest_path,
        expect.objectContaining({
          name,
          modified_at: expect.any(String),
          version: '1.0.0',
        })
      );
    });
  });

  describe('sm: updatePac (integration)', () => {
    const cleanup = async p => {
      try {
        await fs.rm(p, { recursive: true, force: true });
      } catch {}
    };

    beforeAll(() => {
      global.db = db;
    });

    afterAll(() => {
      delete global.db;
    });

    beforeEach(async () => {
      jest.restoreAllMocks();
      try {
        await db.db.runAsync('DELETE FROM packages');
      } catch {}
    });

    test('Test 4. Manifest-only update persists to pacs.json and keeps files', async () => {
      const srcRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'tecspacs-src-'));
      const origFile = path.join(srcRoot, 'orig.txt');
      await fs.writeFile(origFile, 'original', 'utf8');

      const name = `pkg-update-int-manifest-test4`;
      await storageManager.storePac({
        name,
        version: '1.0.0',
        description: 'Old',
        author: 'old-author',
        language: 'JavaScript',
        category: 'integration',
        package_path: srcRoot,
      });

      const pathsObj = envPaths('tcspcs');
      const packagesDir = path.join(pathsObj.data, 'packages');
      const pkgDir = path.join(packagesDir, name);
      const manifest_path = path.join(pkgDir, 'pacs.json');

      await expect(
        storageManager.updatePac(name, {
          version: '1.1.0',
          description: 'New desc',
          author: 'alice',
        })
      ).resolves.toBeDefined();

      await expect(
        fs.readFile(path.join(pkgDir, 'orig.txt'), 'utf8')
      ).resolves.toBe('original');

      const manifest = JSON.parse(await fs.readFile(manifest_path, 'utf8'));
      expect(manifest.version).toBe('1.1.0');
      expect(manifest.description).toBe('New desc');
      expect(manifest.author).toBe('alice');
      expect(manifest.package_path).toBe(srcRoot);

      await cleanup(srcRoot);
      await cleanup(pkgDir);
    });

    test('Test 5. Replaces content when package_path is a directory (integration)', async () => {
      const srcOld = await fs.mkdtemp(
        path.join(os.tmpdir(), 'tecspacs-src-old-')
      );
      const oldNested = path.join(srcOld, 'old');
      const oldFile = path.join(oldNested, 'old.txt');
      await fs.mkdir(oldNested, { recursive: true });
      await fs.writeFile(oldFile, 'old-content', 'utf8');

      const name = `pkg-update-int-dir-${Date.now()}`;
      await storageManager.storePac({
        name,
        version: '1.0.0',
        description: 'Old desc',
        author: 'old-author',
        language: 'JavaScript',
        category: 'integration',
        package_path: srcOld,
      });

      const srcNew = await fs.mkdtemp(
        path.join(os.tmpdir(), 'tecspacs-src-new-')
      );
      const newNested = path.join(srcNew, 'nested');
      const newFile = path.join(newNested, 'new.js');
      await fs.mkdir(newNested, { recursive: true });
      await fs.writeFile(newFile, "console.log('new');", 'utf8');

      await expect(
        storageManager.updatePac(name, {
          package_path: srcNew,
          description: 'New desc',
        })
      ).resolves.toBeDefined();

      const pathsObj = envPaths('tcspcs');
      const packagesDir = path.join(pathsObj.data, 'packages');
      const pkgDir = path.join(packagesDir, name);
      const manifest_path = path.join(pkgDir, 'pacs.json');

      await expect(
        fs.readFile(path.join(pkgDir, 'old', 'old.txt'), 'utf8')
      ).rejects.toBeTruthy();

      await expect(
        fs.readFile(path.join(pkgDir, 'nested', 'new.js'), 'utf8')
      ).resolves.toBe("console.log('new');");

      const manifest = JSON.parse(await fs.readFile(manifest_path, 'utf8'));
      expect(manifest).toEqual(
        expect.objectContaining({
          name,
          description: 'New desc',
          package_path: srcNew,
          modified_at: expect.any(String),
        })
      );

      await cleanup(srcOld);
      await cleanup(srcNew);
      await cleanup(pkgDir);
    });

    test('Test 6. Replaces content when package_path is a single file (integration)', async () => {
      const srcOld = await fs.mkdtemp(
        path.join(os.tmpdir(), 'tecspacs-src-old-file-')
      );
      const oldFile = path.join(srcOld, 'to-be-replaced.txt');
      await fs.writeFile(oldFile, 'old-file', 'utf8');

      const name = `pkg-update-int-file-test6`;
      await storageManager.storePac({
        name,
        version: '1.0.0',
        description: 'Old',
        language: 'JavaScript',
        category: 'integration',
        package_path: srcOld,
      });

      const newSrcRoot = await fs.mkdtemp(
        path.join(os.tmpdir(), 'tecspacs-new-file-')
      );
      const newFile = path.join(newSrcRoot, 'single.js');
      await fs.writeFile(newFile, 'export const updated = true;', 'utf8');

      await expect(
        storageManager.updatePac(name, {
          package_path: newFile,
          version: '2.0.0',
        })
      ).resolves.toBeDefined();

      const pathsObj = envPaths('tcspcs');
      const packagesDir = path.join(pathsObj.data, 'packages');
      const pkgDir = path.join(packagesDir, name);
      const manifest_path = path.join(pkgDir, 'pacs.json');

      await expect(
        fs.readFile(path.join(pkgDir, 'to-be-replaced.txt'), 'utf8')
      ).rejects.toBeTruthy();

      const copiedNewFile = path.join(pkgDir, path.basename(newFile));
      await expect(fs.readFile(copiedNewFile, 'utf8')).resolves.toBe(
        'export const updated = true;'
      );

      const manifest = JSON.parse(await fs.readFile(manifest_path, 'utf8'));
      expect(manifest).toEqual(
        expect.objectContaining({
          name,
          version: '2.0.0',
          package_path: newFile,
          modified_at: expect.any(String),
        })
      );

      await cleanup(srcOld);
      await cleanup(newSrcRoot);
      await cleanup(pkgDir);
    });
  });

  describe('sm: getPac (integration)', () => {
    const exists = async p => {
      try {
        await fs.access(p);
        return true;
      } catch {
        return false;
      }
    };

    beforeEach(async () => {
      try {
        await db.db.runAsync('DELETE FROM packages');
      } catch {}
    });

    test('Test 1. Returns null when package does not exist', async () => {
      const res = await storageManager.getPac('missing-pkg');
      expect(res).toBeNull();
    });

    test('Test 2. Returns stored package with manifest', async () => {
      const src = await fs.mkdtemp(path.join(os.tmpdir(), 'tecspacs-getpac-'));
      const f = path.join(src, 'index.js');
      await fs.writeFile(f, "console.log('hello');", 'utf8');

      const name = `pkg-getpac-${Date.now()}`;
      await storageManager.storePac({
        name,
        version: '1.0.0',
        description: 'desc',
        language: 'JavaScript',
        category: 'integration',
        package_path: src,
      });

      const pkg = await storageManager.getPac(name);
      expect(pkg).toBeTruthy();
      expect(pkg).toEqual(
        expect.objectContaining({
          name,
          manifest_path: expect.any(String),
          package_path: expect.any(String),
        })
      );
      expect(pkg.manifest).toEqual(
        expect.objectContaining({
          name,
          version: '1.0.0',
          description: 'desc',
          package_path: src,
        })
      );

      await fs.rm(pkg.package_path, { recursive: true, force: true });
      await fs.rm(src, { recursive: true, force: true });
    });
  });

  describe('sm: deletePac (integration)', () => {
    const exists = async p => {
      try {
        await fs.access(p);
        return true;
      } catch {
        return false;
      }
    };

    beforeEach(async () => {
      try {
        await db.db.runAsync('DELETE FROM packages');
      } catch {}
    });

    test('Test 1. Deletes an existing package (fs and db)', async () => {
      const src = await fs.mkdtemp(path.join(os.tmpdir(), 'tecspacs-delpac-'));
      const f = path.join(src, 'file.txt');
      await fs.writeFile(f, 'data', 'utf8');

      const name = `pkg-delpac-${Date.now()}`;
      const { package_path } = await storageManager.storePac({
        name,
        version: '0.1.0',
        description: 'to delete',
        language: 'JavaScript',
        category: 'test',
        package_path: src,
      });

      expect(await exists(package_path)).toBe(true);
      expect(await db.getPackage(name)).toBeTruthy();

      await expect(storageManager.deletePac(name)).resolves.toBeUndefined();

      expect(await exists(package_path)).toBe(false);
      const row = await db.getPackage(name);
      expect(row).toBeFalsy();

      await fs.rm(src, { recursive: true, force: true });
    });

    test('Test 2. Throws when deleting a non-existent package', async () => {
      await expect(
        storageManager.deletePac('no-such-pkg')
      ).rejects.toBeTruthy();
    });
  });

  describe('sm: update online id (packages only)', () => {
    beforeEach(async () => {
      try {
        await db.db.runAsync('DELETE FROM packages');
      } catch {}
    });

    test('Test 1. updatePacOnlineId sets online_id on package', async () => {
      const src = await fs.mkdtemp(path.join(os.tmpdir(), 'tecspacs-online-'));
      const f = path.join(src, 'index.js');
      await fs.writeFile(f, 'export default 1;', 'utf8');

      const name = `pkg-online-mime`;
      const { package_path } = await storageManager.storePac({
        name,
        version: '1.2.3',
        description: 'desc',
        language: 'JavaScript',
        category: 'misc',
        package_path: src,
      });

      await expect(
        storageManager.updatePacOnlineId(name, 'PAC-987')
      ).resolves.toBeUndefined();

      const pkg = await db.getPackage(name);
      expect(pkg).toBeTruthy();
      expect(pkg.online_id).toBe('PAC-987');

      await fs.rm(package_path, { recursive: true, force: true });
      await fs.rm(src, { recursive: true, force: true });
    });
  });
});
