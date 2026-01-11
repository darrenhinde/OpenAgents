import { getAvailablePeriods } from './core.js';
import { success } from '../shared/utils.js';

/**
 * Period API Handler.
 * @returns {Object}
 */
export const getPeriodsHandler = () => {
  const periods = getAvailablePeriods();
  return success({ periods });
};
