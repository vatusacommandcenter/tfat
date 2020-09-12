import _flatten from 'lodash/flatten.js';
import _last from 'lodash/last.js';
import _without from 'lodash/without.js';
import Sector from './Sector.js';
import Waypoint from '../aircraft/Waypoint.js';

export default class SectorCollection {
    constructor(sectorsData) {
        this._sectors = [];

        this._init(sectorsData);
    }

    _init(sectorsData) {
        for (const sectorId in sectorsData) {
            const sectorData = sectorsData[sectorId];
            const sector = new Sector(sectorId, sectorData);

            this._sectors.push(sector);
        }
    }

    get sectors() {
        return this._sectors;
    }

    /**
     * Empty all sector time tables so they may be regenerated
     *
     * @for SectorCollection
     * @method _clearAllSectorTimeTables
     * @returns undefined
     * @private
     */
    _clearAllSectorTimeTables() {
        for (const sector of this._sectors) {
            sector.timeTable = {};
        }
    }

    /**
     * Return an array of `Sector`s who own the airspace the provided Turf.js Point is within
     *
     * @for SectorCollection
     * @method getSectorsFromTurfPoint
     * @param {turf.Point} turfPoint
     * @returns {array<Sector>}
     */
    getSectorsFromTurfPoint(turfPoint) {
        return this._sectors.filter((sector) => sector.isTurfPointInAirspace(turfPoint));
    }

    /**
     * Return a `Sector` instance within the collection who has the spcified sector id
     *
     * @for SectorCollection
     * @method getSectorWithId
     * @param {string} sectorId
     * @return {Sector}
     */
    getSectorWithId(sectorId) {
        const sectorList = this._sectors.find((sector) => sector.id === sectorId);

        if (sectorList.length === 0) {
            return;
        } else if (sectorList.length > 1) {
            console.error(`Multiple sectors exist with identifier of ${this._id}! Using the first one.`);
        }

        return sectorList[0];
    }

    /**
     * Return an array of `Waypoint`s for each position where the provided
     * Turf.js LineString intersects any polygon of any sector in the collection
     *
     * @for SectorCollection
     * @method getIntersectionsWithTurfLineString
     * @param {turf.lineString} turfLineString
     * @returns {array<Waypoint>}
     */
    getIntersectionsWithTurfLineString(turfLineString) {
        const intersections = _flatten(this._sectors.map((sector) => sector.getIntersectionsWithTurfLineString(turfLineString)));

        if (intersections.length === 0) {
            return [];
        }

        const waypoints = intersections.map((intersection) => {
            const coordinatesLonLat = intersection.point.geometry.coordinates;
            const coordinates = { lat: coordinatesLonLat[1], lon: coordinatesLonLat[0] };
            const waypointData = { ...coordinates, poly: intersection.poly };
            const waypoint = new Waypoint(waypointData);

            return waypoint;
        });

        return waypoints;
    }

    /**
     * Update the timetables for all `Sector`s
     *
     * @for SectorCollection
     * @method updateSectorTimeTables
     * @param aircraftCollection {AircraftCollection}
     * @returns undefined
     */
    updateSectorTimeTables(aircraftCollection) {
        const sectorChanges = aircraftCollection.getSectorChanges(); // [ { aircraft, waypoint } ]
        const sortedSectorChanges = sectorChanges.sort((a, b) => a.waypoint.time - b.waypoint.time);

        this._clearAllSectorTimeTables();

        for (const { aircraft, waypoint } of sortedSectorChanges) {
            const { enter, exit } = waypoint.sectorChange;
            const timeInteger = waypoint.time.getTime();

            // ignore non-airborne aircraft by assuming slow a/c are on the
            if (aircraft.groundSpeed < 51) {
                continue;
            }

            // check for exits first, so any overwrites favor KEEPING the a/c in the count
            if (exit.length > 0) { // if exiting sector(s)
                for (const sector of exit) { // for each sector being exited
                    if (enter.includes(sector)) { // if exiting one shelf and entering another of the same sector
                        continue;
                    }

                    const previousTime = _last(Object.keys(sector.timeTable));
                    const previousAircraftList = sector.timeTable[previousTime];
                    const nextAircraftList = _without(previousAircraftList, aircraft);
                    sector.timeTable[timeInteger] = nextAircraftList;
                }
            }

            if (enter.length > 0) { // if entering new sector(s)
                for (const sector of enter) { // for each sector being entered
                    if (exit.includes(sector)) { // if exiting one shelf and entering another of the same sector
                        continue;
                    }

                    let previousAircraftList = [];
                    const previousTime = _last(Object.keys(sector.timeTable));

                    if (typeof previousTime !== 'undefined') {
                        previousAircraftList = sector.timeTable[previousTime];
                    }

                    // this will also work when two aircraft enter the sector at the exact same time.
                    // since we're processing them in chronological order, we'll just overwrite the same
                    // time table entry, adding all of the aircraft through each iteration
                    const nextAircraftList = [...previousAircraftList, aircraft];
                    sector.timeTable[timeInteger] = nextAircraftList;
                }
            }
        }
    }
}

// const sectorCollection = {
//     20: new Sector(centerSectors[20]),
//     23: new Sector(centerSectors[23]),
//     46: new Sector(centerSectors[46])
// };
