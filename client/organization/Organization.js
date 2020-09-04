import Facility from '../facility/Facility.js';

export default class Organization {
    constructor(id, data) {
        this._identifier = id;
        this._organizationName = data.organizationName;

        // TODO: Change this to replace _centerFacility with simply:
        // this._facilities = { this._identifier: new Facility() , F11: new Facility(), ...}
        this._centerFacility = null;
        this._nonCenterFacilities = {};

        this._init(data);
    }

    _init(data) {
        if (!('facilities' in data)) {
            throw new TypeError(`Expected organization ${this._identifier} to have a "facilities" ` +
                'property containing facility data, but no such property exists!');
        }

        this._initCenterFacility(data.facilities);
        this._initNonCenterFacilities(data.facilities);
    }

    _initCenterFacility(data) {
        if (!('center' in data)) {
            throw new TypeError(`Expected a 'center' property in ${this.id}'s organization data, but none exists!`);
        }

        this._centerFacility = new Facility(this._identifier, data.center);
    }

    _initNonCenterFacilities(data) {
        if (Object.keys(data).length < 2) { // if no non-center facilities are defined for this organization
            return;
        }

        for (const facilityId of data) {
            if (facilityId === 'center' || facilityId === 'organizationName') {
                continue;
            }

            const facilityData = data[facilityId];
            const facility = new Facility(facilityId, facilityData);

            this._nonCenterFacilities[facilityId] = facility;
        }
    }

    /**
     * Return an array of `Waypoint`s for each position where the provided
     * Turf.js LineString intersects any polygon of any center sector
     *
     * @for Organization
     * @method getCenterSectorBoundaryCrossingWaypoints
     * @param {turf.lineString} turfLineString
     * @returns {array<Waypoint>}
     */
    getCenterSectorBoundaryCrossingWaypoints(turfLineString) {
        return this._centerFacility.getIntersectionsWithTurfLineString(turfLineString);
    }

    /**
     * Return an array of `Sector`s who own the airspace the provided Turf.js Point is within
     *
     * @for Organization
     * @method getSectorsFromTurfPoint
     * @param {turf.Point} turfPoint
     * @returns {array<Sector>}
     */
    getSectorsFromTurfPoint(turfPoint) {
        return this._centerFacility.getSectorsFromTurfPoint(turfPoint);
    }

    /**
     * Update the timetables for all `Sector`s
     *
     * @for Organization
     * @method updateSectorTimeTables
     * @param aircraftCollection {AircraftCollection}
     * @returns undefined
     */
    updateSectorTimeTables(aircraftCollection) {
        this._centerFacility.updateSectorTimeTables(aircraftCollection);
    }
}
