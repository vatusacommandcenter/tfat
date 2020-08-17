/**
 * Different types of `Waypoint`s an aircraft can have.
 *
 * Not all Waypoints come from navData-- some are interpolated.
 *
 * @enum WAYPOINT_TYPES
 * @type object
 */
export const WAYPOINT_TYPES = {
    /**
     * Waypoints must only be labeled as `AIRPORT` type when they are from an airport definition, and
     * not from airport-labeled positions defined as fixes in the source data. A proper airport definition
     * includes more than just the airport's position, and therefore we should label those as only a `FIX`
     * type, and reserve the `AIRPORT` type to indicate that additional airport details (like name, rwys,
     * etc) should be available.
     *
     * @memberof WAYPOINT_TYPES
     * @property AIRPORT
     * @type ${string}
     */
    AIRPORT: 'AIRPORT',

    /**
     * Waypoints must only be labeled as `AIRPORT` type when they are from an airport definition, and
     * not from airport-labeled positions defined as fixes in the source data. A proper airport definition
     * includes more than just the airport's position, and therefore we should label those as only a `FIX`
     * type, and reserve the `AIRPORT` type to indicate that additional airport details (like name, rwys,
     * etc) should be available.
     *
     * @memberof WAYPOINT_TYPES
     * @property AIRPORT
     * @type ${string}
     */
    AIRPORT_FIX: 'AIRPORT_FIX',

    /**
     * Any named position which is NOT A NAVAID OR AIRPORT.
     *
     * @memberof WAYPOINT_TYPES
     * @property FIX
     * @type ${string}
     */
    FIX: 'FIX',

    /**
     * A position which IS NOT NAMED.
     *
     * @memberof WAYPOINT_TYPES
     * @property GPS
     * @type ${string}
     */
    GPS: 'GPS',

    /**
     * Any non-directional beacon (NDB)
     *
     * @memberof WAYPOINT_TYPES
     * @property NDB
     * @type ${string}
     */
    NDB: 'NDB',

    /**
     * Any VHF omnidirectional range (VOR)
     *
     * @memberof WAYPOINT_TYPES
     * @property VOR
     * @type ${string}
     */
    VOR: 'VOR'
};

/**
 * What each "Waypoint" in the myfsim source data can have as it's "Type"
 *
 * @enum SOURCE_DATA_WAYPOINT_TYPES
 * @type object
 */
export const SOURCE_DATA_WAYPOINT_TYPES = {
    /**
     * These are not true airport definitions, but rather the position of an airport saved
     * as a fix. Therefore, "Waypoints" from source data of "Airport" type should be interpreted
     * as being simple fixes, and not interpreted as being airport data, since the usual information
     * expected from an airport definition will not be present.
     *
     * @memberof SOURCE_DATA_WAYPOINT_TYPES
     * @property AIRPORT
     * @type {string}
     */
    AIRPORT_FIX: 'Airport',

    /**
     * This includes all non-NAVAID named locations (fixes, intersections, RNAV waypoints, etc)
     *
     * @memberof SOURCE_DATA_WAYPOINT_TYPES
     * @property INTERSECTION
     * @type {string}
     */
    INTERSECTION: 'Intersection',

    /**
     * Non-directional beacons (NDBs)
     *
     * @memberof SOURCE_DATA_WAYPOINT_TYPES
     * @property NDB
     * @type {string}
     */
    NDB: 'NDB',

    /**
     * VHF omnidirectional ranges (VOR)
     *
     * @memberof SOURCE_DATA_WAYPOINT_TYPES
     * @property VOR
     * @type {string}
     */
    VOR: 'VOR'
};

/**
 * The maximum angle of turn from course inbound to fix to still draw the aircraft's
 * trajectory as direct to the fix. If in excess of this angle, the trajectory will
 * assume that this fix is being skipped.
 *
 * @enum MAX_TURN_ANGLE_BEFORE_SKIPPING_FIX_DEG
 * @type {number} - angle in degrees
 */
export const MAX_TURN_ANGLE_BEFORE_SKIPPING_FIX_DEG = 100;
