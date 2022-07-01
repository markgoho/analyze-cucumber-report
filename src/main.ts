/* eslint-disable import/no-unresolved */
import { readFile, writeFile } from 'node:fs/promises';
import * as core from '@actions/core';
import {
  FileWithRuntime,
  SplitConfig,
  createSplitConfig,
  runtimeDetails,
} from 'split-config-generator';
import { CucumberFeature } from 'cucumber-report-analyzer';

import { concatReports } from './concat-cucumber-reports.js';
import { moveCucumberReports } from './move-cucumber-reports.js';
import { reportToRuntime } from './report-to-runtime.js';
import { temporaryFolder } from './folder-names.js';

async function run(): Promise<void> {
  const individualReportsFolder: string = core.getInput(
    'individual-reports-folder',
  );

  // Move the cucumber reports to a single folder
  try {
    await moveCucumberReports(individualReportsFolder);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(`Could not move the cucumber reports: ${error.message}`);
      return;
    }
  }

  // Concatenate the cucumber reports
  try {
    await concatReports();
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(
        `Could not concatenate the cucumber reports: ${error.message}`,
      );
      return;
    }
  }

  let cucumberReportString: string;

  try {
    cucumberReportString = await readFile(
      `${temporaryFolder}/local-cucumber-report.json`,
      'utf8',
    );
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(`Could not read report: ${error.message}`);
    }
    return;
  }

  const cucumberReport: CucumberFeature[] = JSON.parse(cucumberReportString);

  // Create list of files with runtime for analysis
  const files: FileWithRuntime[] = reportToRuntime(cucumberReport);

  // Run analysis on the files
  const details = runtimeDetails(files);

  const groupCountInput: string = core.getInput('group-count');

  const groupCount =
    groupCountInput.length === 0
      ? undefined
      : Number.parseInt(groupCountInput, 10);

  const splitConfig: SplitConfig = createSplitConfig(files, groupCount);
  // eslint-disable-next-line no-console
  console.log({
    ...details,
    groupCount: splitConfig.length,
  });

  const outputPath = core.getInput('output-report');
  try {
    await writeFile(outputPath, JSON.stringify(splitConfig));
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(
        `Setting report to ${outputPath} failed: ${error.message}`,
      );
    }
  }
}

await run();
