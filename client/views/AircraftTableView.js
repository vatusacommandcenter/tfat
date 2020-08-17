export default class AircraftTableView {
    constructor(aircraftCollection) {
        this.$aircraftTableElement = null;

        /**
         * Local reference to the `AircraftCollection`
         *
         * @for AircraftTableView
         * @property _aircraftCollection
         * @type {AircraftCollection}
         * @private
         */
        this._aircraftCollection = aircraftCollection;

        /**
         * Labels of each column in the aircraft table
         *
         * @for AircraftTableView
         * @property _columnLabels
         * @type {number}
         * @private
         */
        this._columnLabels = ['callsign', 'type', 'origin', 'dest', 'altitude', 'route length'];

        this._tableHead = '';

        this._init();
    }

    _init() {
        this.$aircraftTableElement = document.getElementById('aircraft-table');

        this._initTableHead();
    }

    _initTableHead() {
        const columns = this._columnLabels.map((column) => `<th scope="col">${column}</th>`);
        const columnHtml = columns.join('');
        const tableHead = `<thead class="thead-dark"><tr>${columnHtml}</tr></thead>`;

        this._tableHead = tableHead;
    }

    showAllAircraft() {
        const tableHead = this._tableHead;
        const tableBody = `<tbody>${this._aircraftCollection.getTableBodyHTML()}</tbody>`;
        const nextTableContent = tableHead + tableBody;

        this.$aircraftTableElement.innerHTML = nextTableContent;
    }

    /**
     * Update the table to show all aircraft in the provided `AircraftCollection`
     *
     * @for AircraftTableView
     * @param {AircraftCollection} aircraftCollection - instance of `AircraftCollection`
     *      which contains the lsit of all aircraft to show in the table
     * @returns {undefined}
     */
    showAircraft(aircraftCollection) {
        const tableHead = this._tableHead;
        const tableBody = `<tbody>${aircraftCollection.getTableBodyHTML()}</tbody>`;
        const nextTableContent = tableHead + tableBody;

        this.$aircraftTableElement.innerHTML = nextTableContent;
    }
}
