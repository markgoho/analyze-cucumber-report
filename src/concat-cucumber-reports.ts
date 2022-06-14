import { CucumberFeature } from 'cucumber-report-analyzer';
import { promises as fs } from 'node:fs';

// eslint-disable-next-line import/no-unresolved
import { temporaryFolder } from './folder-names.js';

/**
 * Concatenates all the cucumber reports in the given folder.
 */
export const concatReports = async (): Promise<void> => {
  const allFiles: string[] = await fs.readdir(temporaryFolder);

  // Primarily for safety in case something unexpected is added to the folder
  const cucumberReports = allFiles.filter(file => file.endsWith('.json'));

  const singleReport: CucumberFeature[] = [];

  for (const cucumberReport of cucumberReports) {
    const path = `${temporaryFolder}/${cucumberReport}`;

    const report: string = await fs.readFile(path, 'utf8');

    singleReport.push(JSON.parse(report));
  }

  const jsonList: string = JSON.stringify(singleReport.flat());

  await fs.writeFile(`${temporaryFolder}/local-cucumber-report.json`, jsonList);
};
