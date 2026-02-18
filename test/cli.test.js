import { describe, it, before, after } from 'node:test';
import { strict as assert } from 'node:assert';
import { execFile } from 'node:child_process';
import { readFileSync, rmSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const CLI = join(__dirname, '..', 'cli.js');
const EXAMPLES = join(__dirname, '..', 'examples');
const TMP = join(__dirname, '..', 'test-output-cli');

function run(args, options = {}) {
  return execFileAsync(process.execPath, [CLI, ...args], {
    timeout: 15000,
    ...options,
  });
}

function runExpectFail(args) {
  return run(args).then(
    () => { throw new Error('Expected process to exit with error'); },
    (err) => err,
  );
}

describe('CLI: vin render', () => {
  before(() => {
    mkdirSync(TMP, { recursive: true });
  });

  after(() => {
    rmSync(TMP, { recursive: true, force: true });
  });

  it('--help prints usage and exits 0', async () => {
    const { stdout } = await run(['--help']);
    assert.ok(stdout.includes('Usage:'), 'should print usage');
    assert.ok(stdout.includes('--output'), 'should mention --output');
    assert.ok(stdout.includes('--format'), 'should mention --format');
  });

  it('--version prints version and exits 0', async () => {
    const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));
    const { stdout } = await run(['--version']);
    assert.equal(stdout.trim(), pkg.version);
  });

  it('renders single file SVG to stdout', async () => {
    const { stdout } = await run(['render', join(EXAMPLES, 'login.vin')]);
    assert.ok(stdout.startsWith('<svg'), 'should output SVG');
    assert.ok(stdout.includes('</svg>'), 'should contain closing svg tag');
  });

  it('renders single file SVG to file with -o', async () => {
    const outFile = join(TMP, 'login.svg');
    await run(['render', join(EXAMPLES, 'login.vin'), '-o', outFile]);
    const content = readFileSync(outFile, 'utf-8');
    assert.ok(content.startsWith('<svg'), 'file should contain SVG');
  });

  it('batch renders with --outdir', async () => {
    const outDir = join(TMP, 'batch');
    await run([
      'render',
      join(EXAMPLES, 'login.vin'),
      join(EXAMPLES, 'signup.vin'),
      '--outdir', outDir,
    ]);
    assert.ok(existsSync(join(outDir, 'login.svg')), 'login.svg should exist');
    assert.ok(existsSync(join(outDir, 'signup.svg')), 'signup.svg should exist');
  });

  it('infers PNG format from -o extension', async () => {
    // This test is conditional on @resvg/resvg-js being installed
    let hasResvg = false;
    try {
      await import('@resvg/resvg-js');
      hasResvg = true;
    } catch { /* not installed */ }

    if (!hasResvg) {
      // Verify the error message is correct when resvg is missing
      const err = await runExpectFail([
        'render', join(EXAMPLES, 'login.vin'), '-o', join(TMP, 'login.png'),
      ]);
      assert.ok(
        err.stderr.includes('resvg'),
        'should mention resvg in error',
      );
      return;
    }

    const outFile = join(TMP, 'login.png');
    await run(['render', join(EXAMPLES, 'login.vin'), '-o', outFile]);
    const buf = readFileSync(outFile);
    // PNG magic bytes
    assert.equal(buf[0], 0x89, 'PNG magic byte 0');
    assert.equal(buf[1], 0x50, 'PNG magic byte 1 (P)');
    assert.equal(buf[2], 0x4E, 'PNG magic byte 2 (N)');
    assert.equal(buf[3], 0x47, 'PNG magic byte 3 (G)');
  });

  it('errors on nonexistent file', async () => {
    const err = await runExpectFail(['render', 'nonexistent.vin']);
    assert.ok(err.stderr.includes('Cannot read file'), 'should report file error');
  });

  it('errors when -o used with multiple files', async () => {
    const err = await runExpectFail([
      'render',
      join(EXAMPLES, 'login.vin'),
      join(EXAMPLES, 'signup.vin'),
      '-o', 'out.svg',
    ]);
    assert.ok(err.stderr.includes('Cannot use -o'), 'should reject -o with multiple files');
  });

  it('errors on unknown format', async () => {
    const err = await runExpectFail([
      'render', join(EXAMPLES, 'login.vin'), '-f', 'bmp',
    ]);
    assert.ok(err.stderr.includes('Unknown format'), 'should reject unknown format');
  });

  it('errors with no input files', async () => {
    const err = await runExpectFail(['render']);
    assert.ok(err.stderr.includes('No input files'), 'should report missing files');
  });

  it('--quiet suppresses non-error output', async () => {
    const outFile = join(TMP, 'quiet.svg');
    const { stderr } = await run([
      'render', join(EXAMPLES, 'login.vin'), '-o', outFile, '--quiet',
    ]);
    assert.equal(stderr, '', 'stderr should be empty in quiet mode');
    assert.ok(existsSync(outFile), 'output file should still be created');
  });
});
