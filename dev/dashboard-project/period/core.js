/**
 * Core logic for the Period component.
 */

export const PERIODS = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year'
};

/**
 * Returns all available periods.
 * @returns {string[]}
 */
export const getAvailablePeriods = () => Object.values(PERIODS);

/**
 * Validates if a period is supported.
 * @param {string} period 
 * @returns {boolean}
 */
export const isValidPeriod = (period) => getAvailablePeriods().includes(period);
