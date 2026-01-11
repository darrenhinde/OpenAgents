import { getRandomStarSign } from './core.js';
import { success, getRandomInt } from '../shared/utils.js';

/**
 * Star Sign API Handler.
 * @returns {Object}
 */
export const getStarSignHandler = () => {
  const starSign = getRandomStarSign(getRandomInt);
  return success({ starSign });
};
