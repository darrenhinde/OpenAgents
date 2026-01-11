/**
 * Shared utility functions for the Dashboard project.
 */

/**
 * Wraps a value in a success object.
 * @param {*} data 
 * @returns {Object}
 */
export const success = (data) => ({ success: true, data });

/**
 * Wraps an error message in a failure object.
 * @param {string} error 
 * @returns {Object}
 */
export const failure = (error) => ({ success: false, error });

/**
 * Generates a random integer between min and max (inclusive).
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
export const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
