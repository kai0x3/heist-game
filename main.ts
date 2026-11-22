// VAULTBREAK — the Meridian Job (Node 22, standard library only).
// Hands the game in: copies game/ and screenshots/ from beside this file into
// /output (or MAKEFUN_OUTPUT_DIR outside the grader) and writes the dossier the
// judge reads, built by the vendored make.fun library.
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const dest = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function handIn() {
  mkdirSync(dest, { recursive: true });
  cpSync(join(root, 'game'), join(dest, 'game'), { recursive: true });
  const shots = join(root, 'screenshots');
  mkdirSync(join(dest, 'screenshots'), { recursive: true });
  if (existsSync(shots)) cpSync(shots, join(dest, 'screenshots'), { recursive: true });
  const dossier = buildDossier(dest, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  });
  writeFileSync(join(dest, 'dossier.json'), dossier);
}

handIn();
