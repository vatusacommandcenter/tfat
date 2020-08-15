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
        this._icao = null;
        this._position = { lat: 0, lon: 0 };
        this._type = WAYPOINT_TYPES.FIX;

        this._init(data);
    }

    /**
     * Position of this waypoint, specified in `[lat, lon]` format
     * For the position in `{lat: 41.7, lon: -80.2}` format, use `.position`
     *
     * @for Fix
     * @property coordinates
     * @type {array} - [lat, lon]
     */
    get coordinates() {
        return [this._position.lat, this._position.lon];
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
     * For the position in `[lat, lon]` format, use `.coordinates`
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
        this._initType(data.type);
    }

    _initType(fixType) {
        if (fixType === SOURCE_DATA_WAYPOINT_TYPES.AIRPORT_FIX) {
            this._type = WAYPOINT_TYPES.AIRPORT_FIX;

            return;
        }

        if (fixType === SOURCE_DATA_WAYPOINT_TYPES.NDB) {
            this._type = WAYPOINT_TYPES.NDB;

            return;
        }

        if (fixType === SOURCE_DATA_WAYPOINT_TYPES.VOR) {
            this._type = WAYPOINT_TYPES.VOR;

            return;
        }

        if (fixType === SOURCE_DATA_WAYPOINT_TYPES.INTERSECTION) {
            this._type = WAYPOINT_TYPES.FIX;

            return;
        }

        console.error(`Fix ${this._icao} is of unknown type ${fixType}`);
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
