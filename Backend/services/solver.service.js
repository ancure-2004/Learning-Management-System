const axios = require('axios');
const config = require('../config');
const ApiError = require('../utils/ApiError');

/**
 * Thin client for the Python OR-Tools solver service.
 * Centralizes the URL, timeout, and error mapping so routes/services don't
 * each re-implement the HTTP call.
 */
async function generate(payload) {
  try {
    const { data } = await axios.post(`${config.solverUrl}/generate`, payload, {
      timeout: config.solverTimeoutMs,
    });
    return data;
  } catch (error) {
    if (error.response) {
      // Solver responded with an error body — surface it
      throw new ApiError(error.response.status || 502, 'Solver error', error.response.data);
    }
    if (error.code === 'ECONNREFUSED') {
      throw new ApiError(503, 'Solver service is not running. Start it at ' + config.solverUrl);
    }
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      throw new ApiError(504, 'Timetable generation timed out. Try reducing constraints.');
    }
    throw new ApiError(502, 'Unexpected error contacting the solver service.', error.message);
  }
}

module.exports = { generate };
