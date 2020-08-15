import { WAYPOINT_TYPES } from '../constants/routeConstants.js';
import Airport from '../navData/Airport.js';
import Fix from '../navData/Fix.js';

/**
 * Location along the aircraft's route
 *
 * This may represent an airport, fix, navaid, or interpolated point used to represent the position
 * where the aircraft enters/exits a certain area of airspace, etc
 *
 * @class Waypoint
 */
export default class Waypoint {
    constructor(data) {
        this._navDataRef = null;
        this._position = { lat: 0, lon: 0 };
        this._type = WAYPOINT_TYPES.GPS;

        this._init(data);
    }

    /**
     * Position of this waypoint, specified in `[lat, lon]` format
     * For the position in `{lat: 41.7, lon: -80.2}` format, use `.position`
     *
     * @for Waypoint
     * @property coordinates
     * @type {array} - [lat, lon]
     */
    get coordinates() {
        if (this._navDataRef === null) {
            return [this._position.lat, this._position.lon];
        }

        return this._navDataRef.coordinates;
    }

    /**
     * Identifier of the fix/airport/navaid, if this is in fact a fix/airport/navaid
     * If this is just a point (ie from an interpolated position, icao will be `null`)
     *
     * @for Waypoint
     * @property icao
     * @type {string}
     */
    get icao() {
        if (this._navDataRef === null) {
            return null;
        }

        return this._navDataRef.icao;
    }

    /**
     * Position of this waypoint, specified in `{lat: 41.7, lon: -80.2}` format
     * For the position in `[lat, lon]` format, use `.coordinates`
     *
     * @for Waypoint
     * @property position
     * @type {object} - {lat: 41.7, lon: -80.2}
     */
    get position() {
        if (this._navDataRef === null) {
            return this._position;
        }

        return this._navDataRef.position;
    }

    _init(data) {
        if (data instanceof Fix) {
            return this._initAsFix(data);
        }

        if (data instanceof Airport) {
            return this._initAsAirport(data);
        }

        this._initAsGps(data);
    }

    _initAsAirport(airport) {
        this._navDataRef = airport;
        this._position = airport.position;
        this._type = WAYPOINT_TYPES.AIRPORT;
    }

    _initAsFix(fix) {
        this._navDataRef = fix;
        this._position = fix.position;
        this._type = WAYPOINT_TYPES.FIX;
    }

    _initAsGps(coordinates) {
        this._navDataRef = null;
        this._position = coordinates;
        this._type = WAYPOINT_TYPES.GPS;
    }

    // headingToWaypoint() {
    //     //
    // }

    // distanceToWaypoint() {
    //     //
    // }
}
