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
 * MAX 2,147,483,647 (32-bit signed int) - use 60000 * 10,000
 *
 * @enum dataRequestIntervalMs
 * @type {number}
 * @default 60000
 */
export const dataRequestIntervalMs = 60000 * 10; // should be the same as the source's update rate
