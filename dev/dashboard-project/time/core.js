/**
 * Core logic for the Time component.
 * Pure functions only.
 */

/**
 * Returns the current time in ISO format.
 * @param {Date} [date=new Date()] - Optional date for testing.
 * @returns {string}
 */
export const getCurrentTimeISO = (date = new Date()) => date.toISOString();

/**
 * Formats a date to a human-readable string.
 * @param {Date} date 
 * @returns {string}
 */
export const formatHumanReadable = (date) => date.toLocaleString();
