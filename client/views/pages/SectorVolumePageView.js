import _fill from 'lodash/fill.js';
import { TIME } from '../../../globalConstants.js';

export default class SectorVolumePageView {
    constructor(data) {
        this.$element = document.getElementById('sector-volume-page-content');
        this.$centerSectorsElement = document.getElementById('svp-center-sectors');
        this.$airportGroupsElement = document.getElementById('svp-airport-groups');
        this.$airportsElement = document.getElementById('svp-airports');

        this._organization = null;
        this._tableIntervalMinutes = 10;
        this._tableTotalIntervals = 9;
        this._intervals = [];
        this._centerTimeTable = [];

        this._init(data);
    }

    get html() {
        return this._html;
    }

    _init(data) {
        this._organization = data;
        this._intervals = this._generateIntervals();

        this._initCenterTimeTable();

        // eslint-disable-next-line max-len
        // const basicStructureTemplate = '<div class="row"><div class="col"><div>Center Sectors<table class="table table-striped table-hover table-sm" id="svp-center-sectors"><tbody><tr><td>Data Loading...</td></tr></tbody></table></div><div>Airport Groups<table class="table table-striped table-hover table-sm" id="svp-center-sectors"><tbody><tr><td>Data Loading...</td></tr></tbody></table></div><div>Airports<table class="table table-striped table-hover table-sm" id="svp-center-sectors"><tbody><tr><td>Data Loading...</td></tr></tbody></table></div><div>Notes<br><textarea class="form-control" style="margin-top: 0px; margin-bottom: 0px; height: 180px;"></textarea></div></div><div class="col">right</div></div>';

        // this._html = this._createTemplate();
    }

    _initCenterTimeTable() { // traffic data WILL NOT BE AVAILABLE YET, so build a template only
        const sectors = this._organization.centerFacility.getAllSectors();

        for (const sector of sectors) {
            this._centerTimeTable.push([sector.id, ..._fill(Array(this._tableTotalIntervals), '-')]);
        }

        this._updateCenterTableElementFromCenterTimeTable();
    }

    // _createTemplate() {
    //     const openingDiv = '<div class="row">';

    //     // left side
    //     const centerSectors = '<div>Center Sectors<table class="table table-striped table-hover table-sm" ' +
    //         'id="svp-center-sectors"><tbody><tr><td>Data Loading...</td></tr></tbody></table></div>';
    //     const airportGroups = '<div>Airport Groups<table class="table table-striped table-hover table-sm" ' +
    //         'id="svp-center-sectors"><tbody><tr><td>Data Loading...</td></tr></tbody></table></div>';
    //     const airports = '<div>Airports<table class="table table-striped table-hover table-sm" ' +
    //         'id="svp-center-sectors"><tbody><tr><td>Data Loading...</td></tr></tbody></table></div>';
    //     const notes = '<div>Notes<br><textarea class="form-control"></textarea></div>';
    //     const leftColumn = `<div class="col">${centerSectors}${airportGroups}${airports}${notes}</div>`;

    //     // right side
    //     const tmiReceiving = '<div class="col">TMI Receiving<br><textarea class="form-control"></textarea></div>';
    //     const tmiProviding = '<div class="col">TMI Providing<br><textarea class="form-control"></textarea></div>';
    //     const tmiRow = `<div class="row">${tmiReceiving}${tmiProviding}</div>`;
    //     const situationDisplayRow = '<div class="row">Situation Display</div>';
    //     const badRouteRow = '<div class="row">Bad Route Detection</div>';
    //     const rightColumn = `<div class="col">${tmiRow}${situationDisplayRow}${badRouteRow}</div>`;

    //     // all together now!
    //     const html = `${openingDiv}${leftColumn}${rightColumn}`;

    //     return html;
    // }

    hide() {
        this.$element.classList.add('d-none');
    }

    show() {
        this.$element.classList.remove('d-none');
    }

    updateCenterSectorsTable() {
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

        this._updateCenterTableElementFromCenterTimeTable();
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

    _updateCenterTableElementFromCenterTimeTable() {
        const intervalsHtml = `<tr><td></td>${this._intervals.map((interval) => {
            const intervalTime = new Date(interval[0]);
            const hrs = intervalTime.getUTCHours().toString().padStart(2, '0');
            const min = intervalTime.getUTCMinutes().toString().padStart(2, '0');

            return `<td>${hrs}${min}</td>`;
        }).join('')}</tr>`;
        const rowsHtml = this._centerTimeTable.map((sector) => `<tr><td>${sector.join('</td><td>')}</td></tr>`);
        this.$centerSectorsElement.innerHTML = intervalsHtml + rowsHtml.join('');
    }
}
