import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const cwd = mkdtempSync(join(tmpdir(), 'aho-consumer-'));
try {
  execFileSync('npm', ['pack', '--pack-destination', cwd], { stdio: 'inherit' });
  const [tarball] = readdirSync(cwd);
  writeFileSync(join(cwd, 'package.json'), '{"private":true}');
  execFileSync('npm', ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', `./${tarball}`], { cwd, stdio: 'inherit' });
  writeFileSync(join(cwd, 'consumer.ts'), `
    import { Trie, type Match } from '@jimtkelly/aho-corasick';
    const matches: Match[] = new Trie(['he']).getMatches('she');
    if (matches.length !== 1 || matches[0].keyword !== 'he' || matches[0].start !== 1 || matches[0].end !== 2)
      throw new Error('Unexpected package result');
  `);
  execFileSync('tsc', ['--strict', '--target', 'es2020', '--module', 'node16', 'consumer.ts'], { cwd, stdio: 'inherit' });
  execFileSync(process.execPath, ['consumer.js'], { cwd, stdio: 'inherit' });
} finally {
  rmSync(cwd, { recursive: true, force: true });
}
