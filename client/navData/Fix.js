import { WAYPOINT_TYPES, SOURCE_DATA_WAYPOINT_TYPES } from '../constants/routeConstants.js';

/**
 * Representation of a NAMED location (of any type) known to the `NavigationLibrary`
 *
 * Available types include those specified in `WAYPOINT_TYPES`
 *
 * @class Fix
 */
export default class Fix {
    constructor(data) {
        this._icao = '';
        this._position = { lat: 0, lon: 0 };
        this._type = '';

        this._init(data);
    }

    /**
     * Position of this waypoint, specified in `[lon, lat]` format
     * For the position in `{lat: 41.7, lon: -80.2}` format, use `.position`
     *
     * The order is important-- [lon, lat] is the GeoJSON-specified order used by Turf.js for maths
     *
     * @for Fix
     * @property coordinatesLonLat
     * @type {array} - [lon, lat]
     */
    get coordinatesLonLat() {
        return [this._position.lon, this._position.lat];
    }

    /**
     * Name of the fix/airport/navaid, if this is in fact a fix/airport/navaid
     * If this is just a point (ie from an interpolated position, name will be `null`)
     *
     * @for Fix
     * @property icao
     * @type {string}
     */
    get icao() {
        return this._icao;
    }

    /**
     * Position of this fix, specified in `{lat: 41.7, lon: -80.2}` format
     * For the position in `[lon, lat]` format, use `.coordinatesLonLat`
     *
     * @for Fix
     * @property position
     * @type {object} - {lat: 41.7, lon: -80.2}
     */
    get position() {
        return this._position;
    }

    _init(data) {
        this._icao = data.id;
        this._position = data.position;
        this._type = data.type;
    }

    _initType(fixType) {
        // if (fixType === SOURCE_DATA_WAYPOINT_TYPES.AIRPORT_FIX) {
        //     this._type = WAYPOINT_TYPES.AIRPORT_FIX;

        //     return;
        // }

        // if (fixType === SOURCE_DATA_WAYPOINT_TYPES.NDB) {
        //     this._type = WAYPOINT_TYPES.NDB;

        //     return;
        // }

        // if (fixType === SOURCE_DATA_WAYPOINT_TYPES.VOR) {
        //     this._type = WAYPOINT_TYPES.VOR;

        //     return;
        // }

        // if (fixType === SOURCE_DATA_WAYPOINT_TYPES.INTERSECTION) {
        //     this._type = WAYPOINT_TYPES.FIX;

        //     return;
        // }

        // console.error(`Fix ${this._icao} is of unknown type ${fixType}`);
    }

    isAirportFix() {
        return this._type === WAYPOINT_TYPES.AIRPORT_FIX;
    }

    isFix() {
        return this._type === WAYPOINT_TYPES.FIX;
    }

    isNdb() {
        return this._type === WAYPOINT_TYPES.NDB;
    }

    isVor() {
        return this._type === WAYPOINT_TYPES.VOR;
    }
}
