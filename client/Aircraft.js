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
}
