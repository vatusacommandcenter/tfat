/**
 * Port used by the server
 *
 * Note: When run by heroku (for example), `process.env.PORT` will allow heroku to
 * specify the port to run on, which will likely be dynamic for different sessions
 *
 * Note: When `process.env.PORT` is undefined (like when running on localhost), we have
 * specified a port to use instead.
 *
 * @enum SERVER_PORT
 * @type {number}
 */
export const SERVER_PORT = process.env.PORT || 3003;

/**
 * The assumed frequency at which the source VATSIM data feed is updated, in milliseconds
 *
 * @enum assumedSourceDataUpdateRateMs
 * @type {number}
 */
export const assumedSourceDataUpdateRateMs = 60000;

/**
 * The frequency at which the server will request new data from the source VATSIM data feed
 *
 * @enum dataRequestIntervalMs
 * @type {number}
 */
export const dataRequestIntervalMs = 60000; // should be the same as the source's update rate

/**
 * Template of VATSIM data structure with no content.
 * To be used when valid data has not yet been received, or is received but somehow invalid.
 *
 * @enum EMPTY_VATSIM_DATA
 * @type {object}
 */
export const EMPTY_VATSIM_DATA = {
    updateTime: 0,
    totalConnections: 0,
    pilotConnections: 0,
    data: []
};
