import _fill from 'lodash/fill.js';
import { TIME } from '../../../globalConstants.js';

export default class SectorVolumePageView {
    constructor(data) {
        this.$element = document.getElementById('sector-volume-page-content');
        this.$centerSectorsElement = document.getElementById('svp-center-sectors');
        this.$airportGroupsElement = document.getElementById('svp-airport-groups');
        this.$keyAirportsElement = document.getElementById('svp-key-airports');

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
        this._intervals = this._generateIntervals();

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

    hide() {
        this.$element.classList.add('d-none');
    }

    show() {
        this.$element.classList.remove('d-none');
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
     * Return a nested array of JS.Date time integers, aligned to the next n:00:00 hour, separated by `_tableIntervalMinutes`
     *
     * @for SectorVolumePageView
     * @method _generateIntervals
     * @returns {array<array<number>>} [ [start, end], [start, end], ... ]
     */
    _generateIntervals() {
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

        return intervalStartTimes;
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
        const intervalsHtml = this._getIntervalRowHtml();
        const rowsHtml = this._airportGroupsTimeTable.map((group) => `<tr><td>${group.join('</td><td>')}</td></tr>`);
        this.$airportGroupsElement.innerHTML = intervalsHtml + rowsHtml.join('');
    }

    _updateCenterTableElementFromCenterTimeTable() {
        const intervalsHtml = this._getIntervalRowHtml();
        const rowsHtml = this._centerTimeTable.map((sector) => `<tr><td>${sector.join('</td><td>')}</td></tr>`);
        this.$centerSectorsElement.innerHTML = intervalsHtml + rowsHtml.join('');
    }

    _updateCenterTimeTable() {
        const sectors = this._organization.centerFacility.getAllSectors();
        const rows = [];

        for (const sector of sectors) {
            const rowCounts = [];

            for (const [intervalStart, intervalEnd] of this._intervals) {
                const sectorTimes = Object.keys(sector.timeTable);
                const timesWithinThisInterval = sectorTimes.filter((t) => t >= intervalStart && t <= intervalEnd);
                const maxSimultaneousCount = timesWithinThisInterval.reduce((highestCount, time) => {
                    const trafficCountThisInterval = sector.timeTable[time].length;

                    return Math.max(highestCount, trafficCountThisInterval);
                }, 0);
                // const listsInThisInterval = timesWithinThisInterval.map((t) => sector.timeTable[t]);
                // const aircraftList = _union(listsInThisInterval);

                const displayedTrafficCount = maxSimultaneousCount === 0 ? '-' : maxSimultaneousCount;

                rowCounts.push(displayedTrafficCount);
                // rowCounts.push(`<td>${maxSimultaneousCount}</td>`);
            }

            rows.push([sector.id, ...rowCounts]);
            // rows.push(`<tr><td>${sector.id}</td>${rowCounts.join('')}</tr>`);
            // this._centerTimeTable.push([sector.id, ..._fill(Array(this._tableTotalIntervals), '-')]);
        }

        this._centerTimeTable = rows;
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
