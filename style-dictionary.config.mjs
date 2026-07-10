import StyleDictionary from 'style-dictionary';
import { register, permutateThemes } from '@tokens-studio/sd-transforms';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { splitTokenSets, setNameToFileName } from './scripts/split-token-sets.mjs';

register(StyleDictionary);

// theme name -> CSS selector the variables should be scoped under.
// Light is written to :root so it applies by default; Dark is scoped
// behind [data-theme="dark"] so the app can opt in.
const SELECTORS = {
  light: ':root',
  dark: '[data-theme="dark"]',
};

const { $themes, manifest } = splitTokenSets();
const themes = permutateThemes($themes);

for (const [themeName, tokenSets] of Object.entries(themes)) {
  const key = themeName.toLowerCase();
  const source = tokenSets.map((setName) => `tokens/${manifest[setName]}`);

  const sd = new StyleDictionary({
    source,
    preprocessors: ['tokens-studio'],
    platforms: {
      css: {
        transformGroup: 'tokens-studio',
        buildPath: 'dist/css/',
        files: [
          {
            destination: `${key}.css`,
            format: 'css/variables',
            options: {
              selector: SELECTORS[key] ?? ':root',
              outputReferences: true,
            },
          },
        ],
      },
    },
  });

  await sd.buildAllPlatforms();
}
