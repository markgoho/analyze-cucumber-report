// eslint-disable-next-line unicorn/prefer-node-protocol
import { promises as fs } from 'fs';

// eslint-disable-next-line import/no-unresolved
import { temporaryFolder } from './folder-names.js';

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

  for (const reportName of reportNames) {
    // Get the folder name, e.g. admin, cover_all, etc.

    // Create the full json report path
    const originalReportPath = `${groupFolderPath}/${reportName}/${reportName}-cucumber-report.json`;

    // Make a temporary directory
    await fs.mkdir(temporaryFolder, { recursive: true });

    // Copy the json report to the new location
    await fs.copyFile(
      originalReportPath,
      `${temporaryFolder}/${reportName}-cucumber-report.json`,
    );
  }
};
