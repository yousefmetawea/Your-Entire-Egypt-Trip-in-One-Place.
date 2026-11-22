import { describe, expect, it } from 'vitest';
import { seedPlaces } from '../services/mock/seed';
import { DEV_PLACE_FIXTURE_SLUG } from './placeFixture';
import { DEV_PERF_TRIP_ID } from './tripFixture';
import fs from 'node:fs';
import path from 'node:path';

describe('Dev fixtures isolation test', () => {
  it('confirms dev fixtures never appear in the real seed places or trips', () => {
    // Confirm DEV_PLACE_FIXTURE_SLUG is not in real seed
    expect(seedPlaces.some((p) => p.slug === DEV_PLACE_FIXTURE_SLUG)).toBe(false);
    expect(seedPlaces.some((p) => p.id === 'place_layout_fixture')).toBe(false);

    // Confirm synthetic performance trip is not in real seed
    expect(DEV_PERF_TRIP_ID).toBe('trip_dev_perf_6x8');
  });

  it('confirms dev fixtures are not statically imported by production code paths', () => {
    const srcDir = path.resolve(__dirname, '..');

    function scanDir(dir: string, fileList: string[] = []): string[] {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          // Skip dev directory itself
          if (file !== 'dev') {
            scanDir(fullPath, fileList);
          }
        } else if (
          (file.endsWith('.ts') || file.endsWith('.tsx')) &&
          !file.endsWith('.test.ts') &&
          !file.endsWith('.test.tsx')
        ) {
          fileList.push(fullPath);
        }
      }
      return fileList;
    }

    const prodSourceFiles = scanDir(srcDir);

    for (const filePath of prodSourceFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');

      // Static import checks: no top-level import statement from dev/
      const staticImportRegex = /^import\s+.*from\s+['"][^'"]*\/dev\/[^'"]*['"]/m;
      expect(
        staticImportRegex.test(content),
        `Production source file ${path.relative(srcDir, filePath)} must NOT statically import from dev/`,
      ).toBe(false);

      // If dynamic import exists, it MUST be wrapped inside if (import.meta.env.DEV)
      if (content.includes('../dev/') || content.includes('./dev/')) {
        expect(
          content.includes('import.meta.env.DEV'),
          `Dynamic import of dev fixture in ${path.relative(srcDir, filePath)} must be gated behind import.meta.env.DEV`,
        ).toBe(true);
      }
    }
  });
});
