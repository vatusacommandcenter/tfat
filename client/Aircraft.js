import NavigationLibrary from './navData/NavigationLibrary.js';

export default class Aircraft {
    /**
     * @for Aircraft
     * @constructor
     * @param {object} aircraftData
     */
    constructor(aircraftData) {
        for (const key in aircraftData) {
            this[key] = aircraftData[key];
        }

        this._fixes = [];

        this._init();
    }

    _init() {
        this._initFixes();
    }

    _initFixes() {
        this._fixes = this._getFixesOnRoute();
    }

    /**
     * Return html table row data for the entry for `this` Aircraft
     *
     * @for Aircraft
     * @method getTableRowHtml
     * @return {string} - can be directly used with .innerHtml() to create a table row
     */
    getTableRowHtml() {
        const html = `<tr><td>${this.callsign}</td><td>${this.fpAircraft}</td><td>${this.fpOrigin}</td>` +
            `<td>${this.destination}</td><td>${this.altitude}</td><td>${this.groundSpeed}</td></tr>`;

        return html;
    }

    // TODO: ADD THE `FixModel` AND UPDATE THIS TO USE IT!
    /**
     * Return an array of fixes in the flightplan for which we know has a defined location in nav data
     *
     * @for Aircraft
     * @method _getFixesOnRoute
     * @returns {array} - array of fixes
     * @private
     */
    _getFixesOnRoute() {
        const elements = this._getRouteElements();
        const fixList = [];

        for (const element of elements) {
            const position = NavigationLibrary.getPositionOfFix(element);

            if (typeof position === 'undefined') {
                continue;
            }

            fixList.push(position);
        }

        return fixList;
    }

    /**
     * Return an array of all space-separated elements of a flightplan, regardless of their type/content
     *
     * @for Aircraft
     * @method _getRouteElements
     * @returns {array<string>} - array of strings; the strings will be fixes, airways, procedures, etc
     * @private
     */
    _getRouteElements() {
        const elements = this.fpRoute.split(' ');
        const trimmedElements = elements.filter((element) => element !== '');

        return trimmedElements;
    }
}
