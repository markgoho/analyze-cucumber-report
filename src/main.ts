import * as core from '@actions/core';
import {
  FileWithRuntime,
  SplitConfig,
  createSplitConfig,
  runtimeDetails,
} from 'split-config-generator';
import { CucumberFeature } from 'cucumber-report-analyzer';
import { concatReports } from './concat-cucumber-reports';
import { promises as fs } from 'fs';
import { moveCucumberReports } from './move-cucumber-reports';
import { reportToRuntime } from './report-to-runtime';
import { tempFolder } from './folder-names';

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
      `${tempFolder}/local-cucumber-report.json`,
      'utf-8',
    );
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(`Could not read report: ${error.message}`);
    }
    return;
  }

  const cucumberReport: CucumberFeature[] = JSON.parse(cucumberReportString);

  const files: FileWithRuntime[] = reportToRuntime(cucumberReport);
  const splitConfig: SplitConfig = createSplitConfig(files);
  const details = runtimeDetails(files);
  // eslint-disable-next-line no-console
  console.log(details);

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
