import _fill from 'lodash/fill.js';
import _findLast from 'lodash/findLast.js';
import _union from 'lodash/union.js';
import { TIME } from '../../../globalConstants.js';

export default class SectorVolumePageView {
    constructor(data) {
        this.$element = document.getElementById('sector-volume-page-content');
        this.$navBarBrandElement = document.getElementById('nav-brand-text');
        this.$centerSectorsElement = document.getElementById('svp-center-table');
        this.$centerSectorsTitleElement = document.getElementById('svp-center-title');
        this.$airportGroupsElement = document.getElementById('svp-other-facilities-table');
        this.$airportGroupsContent = document.getElementById('svp-other-facilities-content');
        this.$keyAirportsElement = document.getElementById('svp-key-airports-table');

        this._organization = null;
        this._tableIntervalMinutes = 10;
        this._tableTotalIntervals = 9;
        this._intervals = [];
        this._airportGroupsTimeTable = [];
        this._centerTimeTable = [];
        this._keyAirportsTimeTable = [];

        this._init(data);
    }

    get html() {
        return this._html;
    }

    _init(data) {
        this._organization = data;

        this._initTitles();
        this._regenerateIntervals();
        this._initCenterTimeTable();
        this._initAirportGroupsTimeTable();
        this._initKeyAirportsTimeTable();
    }

    _initAirportGroupsTimeTable() {
        const groups = this._organization.airportGroupIcaos;

        for (const groupName in groups) {
            this._airportGroupsTimeTable.push([groupName, ..._fill(Array(this._tableTotalIntervals), '-')]);
        }

        this._updateAirportGroupsTableElementFromAirportGroupsTimeTable();
    }

    _initCenterTimeTable() { // traffic data WILL NOT BE AVAILABLE YET, so build a template only
        const sectors = this._organization.centerFacility.getAllSectors();

        for (const sector of sectors) {
            this._centerTimeTable.push([sector.id, ..._fill(Array(this._tableTotalIntervals), '-')]);
        }

        this._updateCenterTableElementFromCenterTimeTable();
    }

    _initKeyAirportsTimeTable() { // traffic data WILL NOT BE AVAILABLE YET, so build a template only
        const icaoList = this._organization._keyAirportIcaos; // ILLEGAL!

        for (const icao of icaoList) {
            this._keyAirportsTimeTable.push([icao, ..._fill(Array(this._tableTotalIntervals), '-')]);
        }

        this._updateKeyAirportsTableElementFromKeyAirportTimeTable();
    }

    _initTitles() {
        this.$navBarBrandElement.innerHTML = this._organization.id;
        this.$centerSectorsTitleElement.innerHTML = this._organization.centerFacility.name;
    }

    hide() {
        this.$element.classList.add('d-none');
    }

    /**
     * Returns whether or not we should move the tables to the next interval because time
     * has passed such that the current time is no longer within the displayed first interval
     *
     * @for SectorVolumePageView
     * @method incrementCurrentInterval
     * @returns {boolean}
     */
    incrementCurrentInterval() {
        if (this._intervals.length === 0) { // while waiting for data, the intervals will be empty
            return;
        }

        const currentTime = new Date().getTime();
        const currentIntervalEndTime = this._intervals[0][1];

        if (currentTime > currentIntervalEndTime) {
            this._regenerateIntervals();
            this.updateAllTables();
        }
    }

    show() {
        this.$element.classList.remove('d-none');
    }

    updateAllTables() {
        this.updateCenterSectorsTable();
        this.updateAirportGroupsTable();
        this.updateKeyAirportsTable();
    }

    updateAirportGroupsTable() {
        this._updateAirportGroupsTimeTable();
        this._updateAirportGroupsTableElementFromAirportGroupsTimeTable();
    }

    updateCenterSectorsTable() {
        this._updateCenterTimeTable();
        this._updateCenterTableElementFromCenterTimeTable();
    }

    updateKeyAirportsTable() {
        this._updateKeyAirportsTimeTable();
        this._updateKeyAirportsTableElementFromKeyAirportTimeTable();
    }

    /**
     * Create a nested array of JS.Date time integers, aligned to the next n:00:00 hour, separated
     * by `_tableIntervalMinutes`, and store it in `this._intervals`
     *
     * [ [start, end], [start, end], ... ]
     *
     * @for SectorVolumePageView
     * @method _regenerateIntervals
     * @returns {undefined}
     */
    _regenerateIntervals() {
        let nextHour = new Date();

        nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);

        nextHour = nextHour.getTime();
        const currentTime = new Date().getTime();
        const timeBetweenCurrentAndNextHour = nextHour - currentTime;
        const intervalMs = this._tableIntervalMinutes * TIME.ONE_MINUTE_IN_MILLISECONDS;
        const intervalsBeforeNextHour = Math.ceil(timeBetweenCurrentAndNextHour / intervalMs);
        const firstIntervalStartMs = nextHour - (intervalsBeforeNextHour * intervalMs);
        const intervalStartTimes = [];

        for (let i = 0; i < this._tableTotalIntervals; i++) {
            const intervalStart = firstIntervalStartMs + (i * intervalMs);
            const intervalEnd = intervalStart + intervalMs;

            intervalStartTimes.push([intervalStart, intervalEnd]);
        }

        this._intervals = intervalStartTimes;
    }

    _getIntervalRowHtml() {
        const intervalsHtml = `<thead><tr><th scope="col"></th>${this._intervals.map((interval) => {
            const intervalTime = new Date(interval[0]);
            const hrs = intervalTime.getUTCHours().toString().padStart(2, '0');
            const min = intervalTime.getUTCMinutes().toString().padStart(2, '0');

            return `<th>${hrs}${min}</th>`;
        }).join('')}</tr></thead>`;

        return intervalsHtml;
    }

    _updateAirportGroupsTableElementFromAirportGroupsTimeTable() {
        if (this._airportGroupsTimeTable.length === 0) {
            this.$airportGroupsContent.classList.add('d-none');
        } else {
            this.$airportGroupsContent.classList.remove('d-none');
        }

        const intervalsHtml = this._getIntervalRowHtml();
        const rowsHtml = this._airportGroupsTimeTable.map((group) => `<tr><td>${group.join('</td><td>')}</td></tr>`);
        this.$airportGroupsElement.innerHTML = intervalsHtml + rowsHtml.join('');
    }

    _updateAirportGroupsTimeTable() {
        const airportGroupsTimeTable = [];

        for (const facilityId in this._organization.nonCenterFacilities) { // for each facility
            const sectors = this._organization.nonCenterFacilities[facilityId].getAllSectors();
            const timeTables = sectors.map((sector) => this._getTimeTableForSector(sector));
            airportGroupsTimeTable.push(...timeTables);
        }

        this._airportGroupsTimeTable = airportGroupsTimeTable;
    }

    _updateCenterTableElementFromCenterTimeTable() {
        const intervalsHtml = this._getIntervalRowHtml();
        const rowsHtml = this._centerTimeTable.map((sector) => `<tr><td>${sector.join('</td><td>')}</td></tr>`);
        this.$centerSectorsElement.innerHTML = intervalsHtml + rowsHtml.join('');
    }

    _updateCenterTimeTable() {
        const sectors = this._organization.centerFacility.getAllSectors();
        const timeTables = sectors.map((sector) => this._getTimeTableForSector(sector));
        this._centerTimeTable = timeTables;
    }

    _getTimeTableForSector(sector) {
        const rowCounts = [];
        const cellsInRow = [];

        for (const [intervalStart, intervalEnd] of this._intervals) {
            const sectorTimes = Object.keys(sector.timeTable);
            let timesWithinThisInterval = sectorTimes.filter((t) => t >= intervalStart && t <= intervalEnd);

            if (timesWithinThisInterval.length === 0) { // if no volume changes during this interval
                const previousSectorState = _findLast(sectorTimes, (t) => t < intervalStart);

                if (typeof previousSectorState === 'undefined') {
                    rowCounts.push('-');

                    continue;
                }

                timesWithinThisInterval = [previousSectorState]; // use the previous sector state
            }

            const maxSimultaneousCount = timesWithinThisInterval.reduce((highestCount, time) => {
                const trafficCountThisInterval = sector.timeTable[time].length;

                return Math.max(highestCount, trafficCountThisInterval);
            }, 0);
            const listsInThisInterval = timesWithinThisInterval.map((t) => sector.timeTable[t]);
            const aircraftList = _union(listsInThisInterval)[0].map((ac) => ac.callsign);
            cellsInRow.push(aircraftList);

            const displayedTrafficCount = maxSimultaneousCount === 0 ? '-' : maxSimultaneousCount;

            rowCounts.push(displayedTrafficCount);
            // rowCounts.push(`<td>${maxSimultaneousCount}</td>`);
        }

        console.log([sector.id, ...cellsInRow]);

        return [sector.id, ...rowCounts];
    }

    _updateKeyAirportsTableElementFromKeyAirportTimeTable() {
        const intervalsHtml = this._getIntervalRowHtml();
        const rowsHtml = this._keyAirportsTimeTable.map((airport) => `<tr><td>${airport.join('</td><td>')}</td></tr>`);
        this.$keyAirportsElement.innerHTML = intervalsHtml + rowsHtml.join('');
    }

    _updateKeyAirportsTimeTable() {
        const airportArrivalLists = this._organization.keyAirportArrivals;
        const arrivalRatesForAllAirports = [];

        for (const [icao, aircraftList] of Object.entries(airportArrivalLists)) {
            const allArrivalRatesForThisAirport = [];

            for (const [intervalStart, intervalEnd] of this._intervals) {
                const arrivalsDuringThisInterval = aircraftList.list.filter((aircraft) => {
                    return aircraft.eta >= intervalStart && aircraft.eta <= intervalEnd;
                });

                const trafficCount = arrivalsDuringThisInterval.length;
                const hourlyTrafficCount = trafficCount / this._tableIntervalMinutes * 60;
                const roundedHourlyTrafficCount = Math.round((hourlyTrafficCount + Number.EPSILON) * 100) / 100;
                const displayedHourlyTrafficCount = roundedHourlyTrafficCount === 0 ? '-' : roundedHourlyTrafficCount;

                allArrivalRatesForThisAirport.push(displayedHourlyTrafficCount);
            }

            arrivalRatesForAllAirports.push([icao, ...allArrivalRatesForThisAirport]);
        }

        this._keyAirportsTimeTable = arrivalRatesForAllAirports;
    }
}
