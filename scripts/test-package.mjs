import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const cwd = mkdtempSync(join(tmpdir(), 'aho-consumer-'));
try {
  const version = process.argv[2];
  let installArgs;
  if (version) {
    installArgs = ['--prefer-online', '--registry=https://registry.npmjs.org', `@jimtkelly/aho-corasick@${version}`];
  } else {
    execFileSync('npm', ['pack', '--pack-destination', cwd], { stdio: 'inherit' });
    const [tarball] = readdirSync(cwd);
    installArgs = ['--offline', `./${tarball}`];
  }
  writeFileSync(join(cwd, 'package.json'), '{"private":true}');
  for (let attempt = 1; ; attempt++) {
    try {
      execFileSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', ...installArgs], { cwd, stdio: ['inherit', 'inherit', 'pipe'], encoding: 'utf8' });
      break;
    } catch (error) {
      if (!version || attempt >= 7 || !/^npm error code ETARGET$/m.test(error.stderr)) throw error;
      console.warn(`Version ${version} is not visible on npm yet; retrying in 15s (${attempt}/6).`);
      await delay(15_000);
    }
  }
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
