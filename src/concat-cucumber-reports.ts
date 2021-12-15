/* eslint-disable @typescript-eslint/prefer-for-of */
import { CucumberFeature } from 'cucumber-report-analyzer';
import { promises as fs } from 'fs';
import { tempFolder } from './folder-names';

/**
 * Concatenates all the cucumber reports in the given folder.
 */
export const concatReports = async (): Promise<void> => {
  const allFiles: string[] = await fs.readdir(tempFolder);

  // Primarily for safety in case something unexpected is added to the folder
  const cucumberReports = allFiles.filter(file => file.endsWith('.json'));

  const singleReport: CucumberFeature[] = [];

  for (let index = 0; index < cucumberReports.length; index++) {
    const path = `${tempFolder}/${cucumberReports[index]}`;

    const report: string = await fs.readFile(path, 'utf8');

    singleReport.push(JSON.parse(report));
  }

  const jsonList: string = JSON.stringify(singleReport.flat());

  await fs.writeFile(`${tempFolder}/local-cucumber-report.json`, jsonList);
};
