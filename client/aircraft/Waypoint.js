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
    constructor(data, isAircraftPosition = false) {
        this.distanceFromPreviousWaypoint = 0; // set by the `Route`
        this.headingToNextWaypoint = null; // set by the `Route`
        this.time = null; // set by the `Route`
        this._isAircraftPosition = isAircraftPosition;
        this._navDataRef = null;
        this._position = { lat: 0, lon: 0 };

        /**
         * Array of `Sector`s whose boundaries are at this waypoint's location
         *
         * @for Waypoint
         * @property sectorBoundaryPolygons
         * @type {array<turf.Polygon>}
         */
        this.sectorBoundaryPolygons = [];

        /**
         * Data representing which sector we are entering/exiting upon passing over this waypoint
         *
         * @for Waypoint
         * @property sectorChange
         * @type {object}
         */
        this.sectorChange = { enter: [], exit: [] };
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
            if (this._turfPoint.properties.icao === '[GPS]') {
                return this._turfPoint.properties.latLon;
            }

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

    /**
     * Initialize this `Waypoint` instance as an airport-based waypoint
     *
     * @for Waypoint
     * @method _initAsAirport
     * @param {Airport} airport
     * @returns undefined
     */
    _initAsAirport(airport) {
        this._navDataRef = airport;
        this._position = airport.position;
        this._type = WAYPOINT_TYPES.AIRPORT;
        this._turfPoint = point(this._navDataRef.coordinatesLonLat, { icao: this._navDataRef.icao });
    }

    /**
     * Initialize this `Waypoint` instance as a fix-based waypoint
     *
     * @for Waypoint
     * @method _initAsFix
     * @param {Fix} fix
     * @returns undefined
     */
    _initAsFix(fix) {
        this._navDataRef = fix;
        this._position = fix.position;
        this._type = WAYPOINT_TYPES.FIX;
        this._turfPoint = point(this._navDataRef.coordinatesLonLat, { icao: this._navDataRef.icao });
    }

    /**
     * Initialize this `Waypoint` instance as a GPS waypoint, not based on a Fix/Airport
     *
     * @for Waypoint
     * @method _initAsGps
     * @param {*} data - {lat, lon, (poly) }, where `poly` is optional
     * @returns undefined
     */
    _initAsGps(data) {
        this._navDataRef = null;
        this._position = { lat: data.lat, lon: data.lon };
        this._type = WAYPOINT_TYPES.GPS;
        this._turfPoint = point(
            [this._position.lon, this._position.lat],
            { icao: '[GPS]', latLon: `${this._position.lat}/${this._position.lon}` }
        );

        if ('poly' in data) {
            this.sectorBoundaryPolygons.push(data.poly);
        }
    }

    /**
     * Boolean value representing whether or not `this` waypoint is the one created at the Aircraft's current position
     *
     * @for Waypoint
     * @method isAircraftPosition
     * @returns {boolean}
     */
    isAircraftPosition() {
        return this._isAircraftPosition;
    }

    isAirport() {
        return this._type === WAYPOINT_TYPES.AIRPORT;
    }

    isFix() {
        return this._type === WAYPOINT_TYPES.FIX;
    }

    isGps() {
        return this._type === WAYPOINT_TYPES.GPS;
    }

    /**
     * Returns whether the provided waypoint has the same lat/lon position as this `Waypoint`
     *
     * @for Waypoint
     * @method isCollocatedWithWaypoint
     * @param {Waypoint} otherWaypoint
     * @returns {boolean}
     */
    isCollocatedWithWaypoint(otherWaypoint) {
        return otherWaypoint.position.lat === this._position.lat && otherWaypoint.position.lon === this._position.lon;
    }

    // headingToWaypoint() {
    //     //
    // }

    // distanceToWaypoint() {
    //     //
    // }
}
