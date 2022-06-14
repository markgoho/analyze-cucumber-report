/* eslint-disable no-console */
import { expect, test, describe, beforeAll, afterEach } from '@jest/globals';
import * as process from 'node:process';
import { execFileSync, ExecFileSyncOptions } from 'node:child_process';
import { join } from 'node:path';
import { rm, readFile } from 'node:fs/promises';
import { FileGroup } from 'split-config-generator';

// shows how the runner will run a javascript action with env / stdout protocol
describe('Testing output of actions', () => {
  const reportFolder = 'individual-reports';
  const outputReport = 'cucumber-split-config.json';
  const np = process.execPath;
  // const __dirname = dirname(fileURLToPath(import.meta.url));
  // eslint-disable-next-line unicorn/prefer-module
  const ip = join(__dirname, '..', 'lib', 'main.js');
  const options: ExecFileSyncOptions = {
    env: process.env,
  };

  process.env['INPUT_INDIVIDUAL-REPORTS-FOLDER'] = reportFolder;
  process.env['INPUT_OUTPUT-REPORT'] = outputReport;

  beforeAll(async () => {
    // Remove testing output folders and files
    await rm('cucumber-processing', { recursive: true, force: true });
    await rm(outputReport, { force: true });
  });

  afterEach(async () => {
    // Remove testing output folders and files
    await rm('cucumber-processing', { recursive: true, force: true });
    await rm(outputReport, { force: true });
  });

  test('test default inputs', async () => {
    try {
      console.log(execFileSync(np, [ip], options).toString());
    } catch (error) {
      console.error('Could not exec file sync', error);
    }

    const reportFile: FileGroup[] = JSON.parse(
      await readFile(outputReport, 'utf8'),
    );

    expect(reportFile.length).toBe(4);
  });

  test('test default manual group count lower than suggested', async () => {
    process.env['INPUT_GROUP-COUNT'] = '2';
    try {
      console.log(execFileSync(np, [ip], options).toString());
    } catch (error) {
      console.error('Could not exec file sync', error);
    }

    const reportFile: FileGroup[] = JSON.parse(
      await readFile(outputReport, 'utf8'),
    );

    expect(reportFile.length).toBe(2);
  });

  test('test default manual group count higher than allowed', async () => {
    process.env['INPUT_GROUP-COUNT'] = '15';
    try {
      console.log(execFileSync(np, [ip], options).toString());
    } catch (error) {
      console.error('Could not exec file sync', error);
    }

    const reportFile: FileGroup[] = JSON.parse(
      await readFile(outputReport, 'utf8'),
    );

    expect(reportFile.length).toBe(4);
  });
});
