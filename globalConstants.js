/**
 * Radix used by `parseInt()` to indicate a decimal number in the base-10 number system
 *
 * @enum DECIMAL_RADIX
 * @type {number}
 */
export const DECIMAL_RADIX = 10;

/**
 * Template of VATSIM data structure with no content.
 * To be used when valid data has not yet been received, or is received but somehow invalid.
 *
 * @enum EMPTY_VATSIM_DATA
 * @type {object}
 */
export const EMPTY_VATSIM_DATA = {
    data: [],
    metaData: {
        updateTime: 0,
        totalConnections: 0,
        pilotConnections: 0
    }
};

/**
 * Commonly used time conversion rates
 *
 * @enum TIME
 * @type {object}
 */
export const TIME = {
    ONE_HOUR_IN_SECONDS: 3600,
    ONE_HOUR_IN_MINUTES: 60,
    ONE_HOUR_IN_MILLISECONDS: 3600000,
    ONE_MINUTE_IN_HOURS: 1 / 60,
    ONE_MINUTE_IN_SECONDS: 60,
    ONE_MINUTE_IN_MILLISECONDS: 60000,
    ONE_SECOND_IN_HOURS: 1 / 3600,
    ONE_SECOND_IN_MINUTES: 1 / 60,
    ONE_SECOND_IN_MILLISECONDS: 1000,
    ONE_MILLISECOND_IN_HOURS: 1 / 3600000,
    ONE_MILLISECOND_IN_MINUTES: 1 / 60000,
    ONE_MILLISECOND_IN_SECONDS: 1 / 1000
};
