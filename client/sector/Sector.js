import { lineString } from '@turf/helpers';
import lineToPolygon from '@turf/line-to-polygon';

export default class Sector {
    constructor(id, data) {
        this._polygons = [];
        this._sectorIdentifier = id;

        this._init(data);
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
            const turfPoly = lineToPolygon(turfLineString, { properties: { altitudes: poly.altitudes } });

            this._polygons.push(turfPoly);
        }
    }
}

// garbagey pentagon around miami:
// 26.62, -81.10
// 26.85, -79.27
// 25.52, -78.84
// 24.53, -80.05
// 25.44, -81.31
