import { getCurrentTimeISO } from './core.js';
import { success } from '../shared/utils.js';

/**
 * Time API Handler.
 * @returns {Object}
 */
export const getTimeHandler = () => {
  const time = getCurrentTimeISO();
  return success({ time });
};
