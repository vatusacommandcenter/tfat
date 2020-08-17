import { point } from '@turf/helpers';
import Airport from '../navData/Airport.js';
import Fix from '../navData/Fix.js';
import { WAYPOINT_TYPES } from '../constants/routeConstants.js';

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
        this.distanceFromPreviousWaypoint = 0; // set by the `Route`
        this.headingToNextWaypoint = null; // set by the `Route`
        this._navDataRef = null;
        this._position = { lat: 0, lon: 0 };
        this._turfPoint = null;
        this._type = WAYPOINT_TYPES.GPS;

        this._init(data);
    }

    /**
     * Position of this waypoint, specified in `[lon, lat]` format
     * For the position in `{lat: 41.7, lon: -80.2}` format, use `.position`
     *
     * The order is important-- [lon, lat] is the GeoJSON-specified order used by Turf.js for maths
     *
     * @for Waypoint
     * @property coordinatesLonLat
     * @type {array} - [lon, lat]
     */
    get coordinatesLonLat() {
        if (this._navDataRef === null) {
            return [this._position.lon, this._position.lat];
        }

        return this._navDataRef.coordinatesLonLat;
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
     * For the position in `[lon, lat]` format, use `.coordinatesLonLat`
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

    /**
     * The Turf.js `Point` instance associated with this waypoint's geographic location
     *
     * @for Waypoint
     * @property turfPoint
     * @type {Point}
     */
    get turfPoint() {
        return this._turfPoint;
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
        this._turfPoint = point(this._navDataRef.coordinatesLonLat, { icao: this._navDataRef.icao });
    }

    _initAsFix(fix) {
        this._navDataRef = fix;
        this._position = fix.position;
        this._type = WAYPOINT_TYPES.FIX;
        this._turfPoint = point(this._navDataRef.coordinatesLonLat, { icao: this._navDataRef.icao });
    }

    _initAsGps(coordinates) {
        this._navDataRef = null;
        this._position = coordinates;
        this._type = WAYPOINT_TYPES.GPS;
        this._turfPoint = point([this._position.lon, this._position.lat], { icao: '[PPOS]' });
        this._navDataRef = { icao: `${this._position.lat}/${this._position.lon}` }; // FIXME: delete me!!!!!
    }

    // headingToWaypoint() {
    //     //
    // }

    // distanceToWaypoint() {
    //     //
    // }
}
