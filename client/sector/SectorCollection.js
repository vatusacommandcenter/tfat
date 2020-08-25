import _flatten from 'lodash/flatten.js';
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
}

// const sectorCollection = {
//     20: new Sector(centerSectors[20]),
//     23: new Sector(centerSectors[23]),
//     46: new Sector(centerSectors[46])
// };
