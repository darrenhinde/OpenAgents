import { renderDashboard } from './core.js';
import { getTimeHandler } from '../time/index.js';
import { getPeriodsHandler } from '../period/index.js';
import { getStarSignHandler } from '../star-sign/index.js';

/**
 * Dashboard UI Controller.
 * Orchestrates data fetching and rendering.
 * @returns {string}
 */
export const dashboardController = () => {
  const timeData = getTimeHandler();
  const periodData = getPeriodsHandler();
  const starSignData = getStarSignHandler();

  const state = {
    time: timeData.success ? timeData.data.time : 'Error',
    periods: periodData.success ? periodData.data.periods : [],
    starSign: starSignData.success ? starSignData.data.starSign : 'Error'
  };

  return renderDashboard(state);
};
