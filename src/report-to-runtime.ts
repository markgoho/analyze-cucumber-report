import { CucumberFeature } from 'cucumber-report-analyzer';
import { FileWithRuntime } from 'split-config-generator';

import { createFileWithRuntime } from './create-file-with-runtime';

export const reportToRuntime = (
  report: CucumberFeature[],
): FileWithRuntime[] => {
  return report
    .map(createFileWithRuntime)
    .sort((a, b) => (a.runtime < b.runtime ? -1 : 1));
};
