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
