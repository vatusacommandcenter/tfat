export default class AircraftTablePageView {
    constructor(aircraftCollection) {
        this.$element = document.getElementById('aircraft-table-page-content');
        this.$aircraftTableElement = document.getElementById('atp-aircraft-table');

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
        this._columnLabels = ['callsign', 'type', 'origin', 'dest', 'altitude', 'speed', 'rte dist', 'eta'];

        this._tableHead = '';

        this._init();
    }

    _init() {
        this._initTableHead();
        this.addAllAircraftToTable();
    }

    _initTableHead() {
        const columns = this._columnLabels.map((column) => `<th scope="col">${column}</th>`);
        const columnHtml = columns.join('');
        const tableHead = `<thead class="thead-dark"><tr>${columnHtml}</tr></thead>`;

        this._tableHead = tableHead;
    }

    addAllAircraftToTable() {
        const tableBody = `<tbody>${this._aircraftCollection.getTableBodyHTML()}</tbody>`;
        const nextTableHtml = this._tableHead + tableBody;

        this.$aircraftTableElement.innerHTML = nextTableHtml;
    }

    /**
     * Update the table to show all aircraft in the provided `AircraftCollection`
     *
     * @for AircraftTableView
     * @method addSpecificAircraftToTable
     * @param {AircraftCollection} aircraftCollection - instance of `AircraftCollection`
     *      which contains the lsit of all aircraft to show in the table
     * @returns {undefined}
     */
    addSpecificAircraftToTable(aircraftCollection) {
        const tableBody = `<tbody>${aircraftCollection.getTableBodyHTML()}</tbody>`;
        const nextTableHtml = this._tableHead + tableBody;

        this.$aircraftTableElement.innerHTML = nextTableHtml;
    }

    hide() {
        this.$element.classList.add('d-none');
    }

    show() {
        this.$element.classList.remove('d-none');
    }
}
