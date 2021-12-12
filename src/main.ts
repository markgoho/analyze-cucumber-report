import * as core from '@actions/core';
import {
  FileWithRuntime,
  SplitConfig,
  createSplitConfig,
} from 'split-config-generator';
import { CucumberFeature } from 'cucumber-report-analyzer';
import { promises as fs } from 'fs';

import { reportToRuntime } from './report-to-runtime';
import { runtimeDetails } from './runtime-details';

async function run(): Promise<void> {
  const cucumberReportPath = core.getInput('local-report');
  let cucumberReportString: string;

  try {
    cucumberReportString = await fs.readFile(cucumberReportPath, 'utf-8');
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
  // const ms: string = core.getInput('milliseconds')
  // core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

  // core.debug(new Date().toTimeString())
  // await wait(parseInt(ms, 10))
  // core.debug(new Date().toTimeString())

  // core.setOutput('time', new Date().toTimeString())
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
