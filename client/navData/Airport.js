import { WAYPOINT_TYPES } from '../constants/routeConstants.js';

export default class Airport {
    constructor(icao, data) {
        this._elevation = -99999;
        this._icao = icao;
        this._name = 'AIRPORT';
        this._position = { lat: 0, lon: 0 };
        this._runways = {};
        this._type = WAYPOINT_TYPES.AIRPORT;

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
        if (!Number.isNaN(data.elevation)) {
            this._elevation = data.elevation;
        }

        if (typeof data.name === 'string' && data.name.length > 0) {
            this._name = data.name;
        }

        if (typeof data.position === 'object' && data.position !== null) {
            this._position = data.position;
        }

        if (typeof data.runways === 'object' && data.runways !== null) {
            this._runways = data.runways;
        }
    }
}
