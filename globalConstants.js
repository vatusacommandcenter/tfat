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
    updateTime: 0,
    totalConnections: 0,
    pilotConnections: 0,
    data: []
};
