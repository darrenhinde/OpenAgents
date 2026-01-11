import { dashboardController } from './ui/index.js';

/**
 * Main entry point for the Dashboard project.
 */
const main = () => {
  console.log('Initializing Dashboard...');
  const output = dashboardController();
  console.log(output);
};

main();
