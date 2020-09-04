import Route from './Route.js';

export default class Aircraft {
    /**
     * @for Aircraft
     * @constructor
     * @param {object} aircraftData
     */
    constructor(aircraftData, updateTime, organizationCollection) {
        for (const key in aircraftData) {
            this[key] = aircraftData[key];
        }

        this.route = null;

        this._init(updateTime, organizationCollection);
    }

    get eta() {
        return this.route.eta;
    }

    _init(updateTime, organizationCollection) {
        this.route = new Route({
            aircraftPosition: this.position,
            destination: this.destination,
            groundSpeed: this.groundSpeed,
            organizationCollection,
            origin: this.fpOrigin,
            routeString: this.fpRoute,
            updateTime
        });
    }

    /**
     * Position of this aircraft, specified in `[lon, lat]` format
     * For the position in `{lat: 41.7, lon: -80.2}` format, use `.position`
     *
     * The order is important-- [lon, lat] is the GeoJSON-specified order used by Turf.js for maths
     *
     * @for Aircraft
     * @property coordinatesLonLat
     * @type {array} - [lon, lat]
     */
    get coordinatesLonLat() {
        if (this._navDataRef === null) {
            return [this._position.lat, this._position.lon];
        }

        return this._navDataRef.coordinatesLonLat;
    }

    /**
     * Position of this aircraft, specified in `{lat: 41.7, lon: -80.2}` format
     * For the position in `[lon, lat]` format, use `.coordinatesLonLat`
     *
     * @for Aircraft
     * @property position
     * @type {object} - {lat: 41.7, lon: -80.2}
     */
    get position() {
        return { lat: this.latitude, lon: this.longitude };
    }

    /**
     * Return html table row data for the entry for `this` Aircraft
     *
     * @for Aircraft
     * @method getTableRowHtml
     * @return {string} - can be directly used with .innerHtml() to create a table row
     */
    getTableRowHtml() {
        // https://skyvector.com/?ll=30,-80&chart=302&zoom=14&fpl=%20KMIA%20HEDLY2%20HEDLY%20PHK%20ORL%20LAIRI%20LARZZ%20KATL
        const currentLatLon = `${this.latitude},${this.longitude}`;
        const url = `https://skyvector.com/?ll=${currentLatLon}&chart=304&zoom=10&fpl=%20` +
            `${this.route._waypoints.map((wp) => wp.icao).join('%20')}`;
        const text = `${this.route.getFullRouteLength()} nm | ETA: ${this.eta.toUTCString()}`;
        const ahref = `<a href="${url}" target="_blank">${text}</a>`;

        const html = `<tr><td>${this.callsign}</td><td>${this.fpAircraft}</td><td>${this.fpOrigin}</td>` +
            // `<td>${this.destination}</td><td>${this.altitude}</td><td>${this.groundSpeed}</td></tr>`;
            `<td>${this.destination}</td><td>${this.altitude}</td><td>${ahref}</td></tr>`;

        return html;
    }
}
