import { expect, test, describe, beforeAll, afterEach } from '@jest/globals';
import * as process from 'process';
import * as cp from 'child_process';
import * as path from 'path';
import { promises as fs } from 'fs';
import { FileGroup } from 'split-config-generator';

// shows how the runner will run a javascript action with env / stdout protocol
describe('Testing output of actions', () => {
  const reportFolder = 'individual-reports';
  const outputReport = 'cucumber-split-config.json';
  const np = process.execPath;
  const ip = path.join(__dirname, '..', 'lib', 'main.js');
  const options: cp.ExecFileSyncOptions = {
    env: process.env,
  };

  process.env['INPUT_INDIVIDUAL-REPORTS-FOLDER'] = reportFolder;
  process.env['INPUT_OUTPUT-REPORT'] = outputReport;

  beforeAll(async () => {
    // Remove testing output folders and files
    await fs.rm('cucumber-processing', { recursive: true, force: true });
    await fs.rm(outputReport, { force: true });
  });

  afterEach(async () => {
    // Remove testing output folders and files
    await fs.rm('cucumber-processing', { recursive: true, force: true });
    await fs.rm(outputReport, { force: true });
  });

  test('test default inputs', async () => {
    try {
      console.log(cp.execFileSync(np, [ip], options).toString());
    } catch (e) {
      console.error('Could not exec file sync', e);
    }

    const reportFile: FileGroup[] = JSON.parse(
      await fs.readFile(outputReport, 'utf8'),
    );

    expect(reportFile.length).toBe(4);
  });

  test('test default manual group count lower than suggested', async () => {
    process.env['INPUT_GROUP-COUNT'] = '2';
    try {
      console.log(cp.execFileSync(np, [ip], options).toString());
    } catch (e) {
      console.error('Could not exec file sync', e);
    }

    const reportFile: FileGroup[] = JSON.parse(
      await fs.readFile(outputReport, 'utf8'),
    );

    expect(reportFile.length).toBe(2);
  });

  test('test default manual group count higher than allowed', async () => {
    process.env['INPUT_GROUP-COUNT'] = '15';
    try {
      console.log(cp.execFileSync(np, [ip], options).toString());
    } catch (e) {
      console.error('Could not exec file sync', e);
    }

    const reportFile: FileGroup[] = JSON.parse(
      await fs.readFile(outputReport, 'utf8'),
    );

    expect(reportFile.length).toBe(4);
  });
});
