import * as core from '@actions/core';
import {
  FileWithRuntime,
  SplitConfig,
  createSplitConfig,
  runtimeDetails,
} from 'split-config-generator';
import { CucumberFeature } from 'cucumber-report-analyzer';
import { concatReports } from './concat-cucumber-reports';
// eslint-disable-next-line unicorn/prefer-node-protocol
import { promises as fs } from 'fs';
import { moveCucumberReports } from './move-cucumber-reports';
import { reportToRuntime } from './report-to-runtime';
import { temporaryFolder } from './folder-names';

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
    cucumberReportString = await fs.readFile(
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
    await fs.writeFile(outputPath, JSON.stringify(splitConfig));
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(
        `Setting report to ${outputPath} failed: ${error.message}`,
      );
    }
  }
}

run();
