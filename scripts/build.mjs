// Copies only the app files into dist/ so the static host never serves tests, scripts or docs.
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { clientConfig } from './config.mjs';
const files = ['index.html', 'styles.css', 'app.js', 'lib/simulation.js', 'lib/venues.js', 'lib/providers.js', 'lib/sync.js'];
await rm('dist', { recursive: true, force: true });
await mkdir('dist/lib', { recursive: true });
for (const file of files) await cp(file, `dist/${file}`);
const config = clientConfig();
await writeFile('dist/config.js', config);
console.log(`dist/: ${files.length + 1} files · Supabase ${config.includes('null') ? 'not configured' : 'configured'}`);
