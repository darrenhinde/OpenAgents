/**
 * Core logic for the Star Sign component.
 */

export const STAR_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

/**
 * Returns a random star sign from the list.
 * @param {Function} getRandomInt - Dependency injection for randomness.
 * @returns {string}
 */
export const getRandomStarSign = (getRandomInt) => {
  const index = getRandomInt(0, STAR_SIGNS.length - 1);
  return STAR_SIGNS[index];
};
