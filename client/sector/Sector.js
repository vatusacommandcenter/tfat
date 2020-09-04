import { lineString } from '@turf/helpers';
import lineToPolygon from '@turf/line-to-polygon';
import lineIntersect from '@turf/line-intersect';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

export default class Sector {
    constructor(id, data) {
        this._polygons = [];
        this._id = id;
        this.timeTable = {};

        this._init(data);
    }

    get id() {
        return this._id;
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
     * @returns {array<object>} - [{ 'point': turf.Point, 'poly': turf.Polygon }, ...]
     */
    getIntersectionsWithTurfLineString(turfLineString) {
        const intersections = [];

        for (const poly of this._polygons) {
            let intersectingPoints = lineIntersect(turfLineString, poly);

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
     * Return whether or not the specified Turf.js Point is located within any
     * of this sector's airspace polygons
     *
     * @for Sector
     * @method isTurfPointInAirspace
     * @param {turf.Point} turfPoint
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
