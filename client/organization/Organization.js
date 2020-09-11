import Facility from '../facility/Facility.js';

export default class Organization {
    constructor(id, data) {
        this._identifier = id;
        this._organizationName = data.organizationName;

        this._keyAirportIcaos = [];
        this.keyAirportArrivals = [];
        this.airportGroupIcaos = {};
        // TODO: Change this to replace centerFacility with simply:
        // this._facilities = { this._identifier: new Facility() , F11: new Facility(), ...}
        this.centerFacility = null;
        this.nonCenterFacilities = {};

        this._init(data);
    }

    _init(data) {
        if (!('keyAirports' in data)) {
            throw new TypeError(`Expected organization ${this._identifier} to have a "keyAirports" ` +
                'property containing a list of airport ICAO identifiers, but no such property exists!');
        }

        this._keyAirportIcaos = data.keyAirports;

        if (!('airportGroups' in data)) {
            throw new TypeError(`Expected organization ${this._identifier} to have a "airportGroups" ` +
                'property containing airport group data, but no such property exists!');
        }

        this.airportGroupIcaos = data.airportGroups;

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

        this.centerFacility = new Facility(this._identifier, data.center);
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

            this.nonCenterFacilities[facilityId] = facility;
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
        return this.centerFacility.getIntersectionsWithTurfLineString(turfLineString);
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
        return this.centerFacility.getSectorsFromTurfPoint(turfPoint);
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
        this.centerFacility.updateSectorTimeTables(aircraftCollection);
    }

    /**
     * Update the list of `Aircraft` who will arrive at each key airport, sorted by ETA
     *
     * @for Organization
     * @method updateKeyAirportArrivals
     * @param {AircraftCollection} aircraftCollection
     * @returns undefined
     */
    updateKeyAirportArrivals(aircraftCollection) {
        const airportArrivals = {};

        for (const destinationIcao of this._keyAirportIcaos) {
            const arrivalAircraftCollection = aircraftCollection.filterByDestination(destinationIcao);
            const sortedAircraftCollection = arrivalAircraftCollection.sortByEta();

            if (destinationIcao in airportArrivals) {
                throw new TypeError(`The same airport (${destinationIcao}) is listed multiple times as a key airport!`);
            }

            airportArrivals[destinationIcao] = sortedAircraftCollection;
        }

        this.keyAirportArrivals = airportArrivals;
    }
}
