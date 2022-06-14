import { CucumberFeature } from 'cucumber-report-analyzer';
import { FileWithRuntime } from 'split-config-generator';

// eslint-disable-next-line import/no-unresolved
import { createFileWithRuntime } from './create-file-with-runtime.js';

export const reportToRuntime = (
  report: CucumberFeature[],
): FileWithRuntime[] => {
  return report
    .map(feature => createFileWithRuntime(feature))
    .sort((a, b) => (a.runtime < b.runtime ? -1 : 1));
};
