import { build } from 'esbuild';
import { mkdir, copyFile, rm } from 'node:fs/promises';
import path from 'node:path';

const watch = process.argv.includes('--watch');
const root = process.cwd();
const srcDir = path.join(root, 'src');
const outDir = path.join(root, 'dist');

async function ensureOutDir() {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
}

async function copyStatic() {
  const files = [
    ['manifest.json', 'manifest.json'],
    ['src/popup.html', 'popup.html'],
    ['src/options.html', 'options.html'],
  ];

  for (const [from, to] of files) {
    await copyFile(path.join(root, from), path.join(outDir, to));
  }
}

async function doBuild() {
  await ensureOutDir();
  await copyStatic();

  const common = {
    bundle: true,
    sourcemap: true,
    target: 'es2022',
    outdir: outDir,
    format: 'iife',
  };

  await build({
    ...common,
    entryPoints: [
      path.join(srcDir, 'background.ts'),
      path.join(srcDir, 'content.ts'),
      path.join(srcDir, 'popup.ts'),
      path.join(srcDir, 'options.ts'),
    ],
  });
}

if (watch) {
  await ensureOutDir();
  await copyStatic();
  await build({
    bundle: true,
    sourcemap: true,
    target: 'es2022',
    outdir: outDir,
    format: 'iife',
    entryPoints: [
      path.join(srcDir, 'background.ts'),
      path.join(srcDir, 'content.ts'),
      path.join(srcDir, 'popup.ts'),
      path.join(srcDir, 'options.ts'),
    ],
    watch: {
      onRebuild(error) {
        if (error) {
          console.error('Build failed:', error);
        } else {
          copyStatic().catch((e) => console.error(e));
          console.log('Rebuilt');
        }
      },
    },
  });
} else {
  await doBuild();
}
