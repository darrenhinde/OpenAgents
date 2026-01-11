/**
 * Core logic for the Dashboard UI.
 * Pure functions for rendering/formatting.
 */

/**
 * Renders the dashboard state into a string (simulating a UI component).
 * @param {Object} state 
 * @returns {string}
 */
export const renderDashboard = (state) => {
  const { time, periods, starSign } = state;
  
  return `
=========================================
          DASHBOARD OVERVIEW
=========================================
Current Time: ${time || 'Loading...'}
-----------------------------------------
Available Periods:
${periods ? periods.map(p => `- ${p}`).join('\n') : 'Loading...'}
-----------------------------------------
Visitor Star Sign: ${starSign || 'Loading...'}
=========================================
  `;
};
