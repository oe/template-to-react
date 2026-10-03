import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const consumer = mkdtempSync(join(tmpdir(), 'template-to-react-package-'));
try {
  const packed = JSON.parse(execFileSync('pnpm', ['pack', '--json', '--pack-destination', consumer], { encoding: 'utf8' }));
  for (const path of ['dist/index.js', 'dist/index.umd.cjs', 'dist/index.d.ts', 'dist/index.d.cts', 'LICENSE', 'readme.md']) {
    assert(packed.files.some(file => file.path === path), `Package is missing ${path}`);
  }
  writeFileSync(join(consumer, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { 'template-to-react': `file:./${basename(packed.filename)}` } }));
  execFileSync('pnpm', ['install', '--ignore-scripts'], { cwd: consumer, stdio: 'pipe' });
  const require = createRequire(join(consumer, 'package.json'));
  const cjs = require('template-to-react');
  assert.equal(require('template-to-react/package.json').name, 'template-to-react');
  assert.equal(require('template-to-react/dist/index.umd.cjs').compileTemplateToReact, cjs.compileTemplateToReact);
  const deepEsm = await import(pathToFileURL(join(consumer, 'node_modules/template-to-react/dist/index.js')));
  assert.equal(typeof deepEsm.compileTemplateToReact, 'function');
  const esm = await import(pathToFileURL(join(consumer, 'node_modules/template-to-react/dist/index.js')));
  for (const { compileTemplateToReact, parser } of [esm, cjs]) {
    assert.equal(typeof parser.parse, 'function');
    assert.match(compileTemplateToReact('<div\n class="{className}">{name}</div>'), /props\.name/);
    assert.match(compileTemplateToReact('<input/>', { jsx: true }), /jsxs\("input",null\)/);
  }
  // Exercise the actual ESM package export in the isolated consumer.
  execFileSync(process.execPath, ['--input-type=module', '-e', "import { compileTemplateToReact } from 'template-to-react'; import { compileTemplateToReact as deep } from 'template-to-react/dist/index.js'; if (compileTemplateToReact !== deep) process.exit(1)"], { cwd: consumer });
  const typeFiles = ['consumer.mts', 'consumer.cts'].map(name => {
    const path = join(consumer, name);
    writeFileSync(path, "import { compileTemplateToReact, type IJsxOptions } from 'template-to-react'; const jsx: IJsxOptions = true; const code: string = compileTemplateToReact('<div/>', { jsx });");
    return path;
  });
  const program = ts.createProgram(typeFiles, {
    noEmit: true, strict: true, types: [], skipLibCheck: true,
    target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
  });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  assert.equal(diagnostics.length, 0, ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: path => path, getCurrentDirectory: () => consumer, getNewLine: () => '\n',
  }));
  console.log(`Verified packed ESM and CommonJS entry points: ${packed.filename}`);
} finally {
  rmSync(consumer, { recursive: true, force: true });
}
