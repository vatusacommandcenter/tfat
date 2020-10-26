import _intersection from 'lodash/intersection.js';
import { lineString, point } from '@turf/helpers';
import greatCircle from '@turf/great-circle';
import lineToPolygon from '@turf/line-to-polygon';
import booleanCrosses from '@turf/boolean-crosses';
import lineIntersect from '@turf/line-intersect';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { distanceNm } from '../clientUtilities';
import distance from '@turf/distance';
import { entries } from 'lodash';

export default class Sector {
    constructor(facilityId, sectorId, data) {
        this._polygons = [];
        this._facilityId = facilityId;
        this._sectorId = sectorId;
        this.subSectors = [];
        this.timeTable = {};
        this.recursiveTimeTable = {};

        this._init(data);
    }

    get id() {
        return this._sectorId;
    }

    get facilityId() {
        return this._facilityId;
    }

    _init(data) {
        this._initPolygons(data);
    }

    _initPolygons(data) {
        for (const poly of data) {
            if (!('altitudes' in poly) || !Array.isArray(poly.altitudes)) {
                throw new TypeError('Expected altitudes in form of [bottomAlt, topAlt], but received ' +
                    `${JSON.stringify(poly.altitudes)}`);
            }

            if (!('coordinates' in poly) || !Array.isArray(poly.coordinates) || poly.coordinates.length < 3) {
                throw new TypeError('Expected sector coordinates to be an array including at least 3 points (ie ' +
                    `[[lat1, lon1], [lat2, lon2], [lat3, lon3]]), but received ${JSON.stringify(poly.coordinates)}`);
            }

            const pointsLonLat = poly.coordinates.map((coord) => [coord[1], coord[0]]);
            const turfLineString = lineString(pointsLonLat);

            // creating a circular dependency between `this` and `this.turfPoly`. I know, I know, this is bad! But
            // it seems to be the simplest solution at the moment. I can live with it for now.
            const turfPoly = lineToPolygon(turfLineString, { properties: { altitudes: poly.altitudes, sector: this, poly } });

            this._polygons.push(turfPoly);
        }
    }

    /**
     * Return data regarding the locations at which the specified line intersects each of this Sector's polygons
     *
     * @for Sector
     * @method getIntersectionsWithTurfLineString
     * @param {turf.lineString} turfLineString
     * @returns {array<object>} - [{ 'point': turf.point, 'poly': turf.polygon }, ...]
     */
    getIntersectionsWithTurfLineString(turfLineString) {
        const intersections = [];

        for (const poly of this._polygons) {
            const startTurfPoint = point(turfLineString.geometry.coordinates[0]);
            const endTurfPoint = point(turfLineString.geometry.coordinates[1]);
            const lineLength = distance(startTurfPoint, endTurfPoint); // in km

            // if (turfLineString.geometry.type !== 'LineString') debugger;

            // since `lineIntersect` does not use great circles. For long legs, add more nodes to increase accuracy
            if (lineLength > 150) { // km
                const numberOfNodes = 2 + Math.floor(lineLength / 150);
                const options = { npoints: numberOfNodes, offset: Number.EPSILON };
                turfLineString = greatCircle(...turfLineString.geometry.coordinates, options);
            }

            // if (turfLineString.geometry.type !== 'LineString') debugger;

            let intersectingPoints = lineIntersect(turfLineString, poly);
            const a = booleanCrosses(turfLineString, poly);
            const c = booleanCrosses(poly, turfLineString);

            if (intersectingPoints.features.length === 0) {
                continue;
            }

            // add polygon data to return value
            intersectingPoints = intersectingPoints.features.map((feature) => {
                return { point: feature, poly };
            });

            intersections.push(...intersectingPoints);
        }

        return intersections;
    }

    /**
     * Returns whether the specified sector and this sector share are combined to the same controller
     *
     * @for Sector
     * @method hasCommonParentWithSector
     * @param {Sector} sector
     * @returns {boolean}
     */
    hasCommonParentWithSector(sector) {
        if (this.subSectors.includes(sector)) { // specified sector is comined at THIS sector
            return true;
        }

        if (sector.subSectors.includes(this)) { // THIS sector is combined at the specified sector
            return true;
        }

        if (_intersection(this.subSectors, sector.subSectors).length > 0) { // both sectors are combined to the same parent sector
            return true;
        }

        return false;
    }

    /**
     * Returns whether this `Sector` has any subsectors combined to it
     *
     * @for Sector
     * @method hasSubSectors
     * @returns {boolean}
     */
    hasSubSectors() {
        return this.subSectors.length > 0;
    }

    /**
     * Return whether or not the specified Turf.js Point is located within any
     * of this sector's airspace polygons
     *
     * @for Sector
     * @method isTurfPointInAirspace
     * @param {turf.point} turfPoint
     * @returns {boolean}
     */
    isTurfPointInAirspace(turfPoint) {
        return this._polygons.some((poly) => booleanPointInPolygon(turfPoint.geometry.coordinates, poly));
    }
}

// garbagey pentagon around miami:
// 26.62, -81.10
// 26.85, -79.27
// 25.52, -78.84
// 24.53, -80.05
// 25.44, -81.31
