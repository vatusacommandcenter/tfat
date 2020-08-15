import NavigationLibrary from '../navData/NavigationLibrary.js';
import Waypoint from './Waypoint.js';

export default class Route {
    constructor({ origin, routeString, destination }) {
        this._origin = origin;
        this._destination = destination;
        this._routeString = routeString;
        this._waypoints = [];

        this._init();
    }

    _init() {
        this._initWaypoints();
    }

    _initWaypoints() {
        const originAirport = NavigationLibrary.getAirportWithIcao(this._origin);

        if (typeof originAirport !== 'undefined') {
            const originAirportWaypoint = new Waypoint(originAirport);

            this._waypoints.push(originAirportWaypoint);
        }

        const routeFixes = this._getFixesFromRouteString();

        if (typeof routeFixes !== 'undefined') {
            const routeFixWaypoints = routeFixes.map((fix) => new Waypoint(fix));

            this._waypoints.push(...routeFixWaypoints);
        }

        const destinationAirport = NavigationLibrary.getAirportWithIcao(this._destination);

        if (typeof destinationAirport !== 'undefined') {
            const destinationAirportWaypoint = new Waypoint(destinationAirport);

            this._waypoints.push(destinationAirportWaypoint);
        }
    }

    /**
     * Return an array of fixes in the flightplan for which we know has a defined location in nav data
     *
     * @for Route
     * @method _getFixesFromRouteString
     * @returns {array} - array of fixes
     * @private
     */
    _getFixesFromRouteString() {
        const routeElements = this._getElementsFromRouteString();
        const waypoints = [];

        for (const element of routeElements) {
            const position = NavigationLibrary.getFixWithName(element);

            if (typeof position === 'undefined') {
                continue;
            }

            waypoints.push(position);
        }

        return waypoints;
    }

    /**
     * Return an array of all space-separated elements of a flightplan, regardless of their type/content
     *
     * @for Route
     * @method _getElementsFromRouteString
     * @returns {array<string>} - array of strings; the strings will be fixes, airways, procedures, etc
     * @private
     */
    _getElementsFromRouteString() {
        const elements = this._routeString.split(' ');
        const trimmedElements = elements.filter((element) => element !== '');

        return trimmedElements;
    }
}
