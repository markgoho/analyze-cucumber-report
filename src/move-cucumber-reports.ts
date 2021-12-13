/* eslint-disable @typescript-eslint/prefer-for-of */
import { promises as fs } from 'fs';

import { tempFolder } from './folder-names';

/**
 * When downloaded, each cucumber report appears in a folder named after the
 * cucumber report. They each need to be moved to a single folder for the next
 * step in the process
 * @param groupFolderPath the path to the folder containing the cucumber reports
 */
export const moveCucumberReports = async (
  groupFolderPath: string,
): Promise<void> => {
  const reportNames: string[] = await fs.readdir(groupFolderPath);

  for (let i = 0; i < reportNames.length; i++) {
    // Get the folder name, e.g. admin, cover_all, etc.
    const reportName = reportNames[i];

    // Create the full json report path
    const originalReportPath = `${groupFolderPath}/${reportName}/${reportName}-cucumber-report.json`;

    // Make a temporary directory
    await fs.mkdir('cucumber-processing');

    // Copy the json report to the new location
    await fs.copyFile(
      originalReportPath,
      `${tempFolder}/${reportName}-cucumber-report.json`,
    );
  }
};
