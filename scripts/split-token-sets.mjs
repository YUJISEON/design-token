// Splits the single Tokens Studio export (tokens-studio.json) into one JSON
// file per token set under tokens/, so Style Dictionary can consume each set
// as its own source file (required by @tokens-studio/sd-transforms' theme
// permutation, which resolves $themes.selectedTokenSets by file name).
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const sourceFile = path.join(rootDir, 'tokens-studio.json');
const outDir = path.join(rootDir, 'tokens');

export function setNameToFileName(setName) {
  return setName.replace(/\s*\/\s*/g, '-').replace(/\s+/g, '-').toLowerCase();
}

export function splitTokenSets() {
  const data = JSON.parse(readFileSync(sourceFile, 'utf-8'));
  const setNames = data.$metadata?.tokenSetOrder ?? Object.keys(data).filter((key) => !key.startsWith('$'));

  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const manifest = {};
  for (const setName of setNames) {
    const fileName = `${setNameToFileName(setName)}.json`;
    manifest[setName] = fileName;
    writeFileSync(path.join(outDir, fileName), JSON.stringify(data[setName] ?? {}, null, 2));
  }

  writeFileSync(path.join(outDir, '_manifest.json'), JSON.stringify(manifest, null, 2));
  return { $themes: data.$themes ?? [], manifest };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { $themes, manifest } = splitTokenSets();
  console.log(`Split ${Object.keys(manifest).length} token sets into ${outDir}`);
  console.log(`Found ${$themes.length} theme(s) in $themes.`);
}
