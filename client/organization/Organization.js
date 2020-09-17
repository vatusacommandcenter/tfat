import Facility from '../facility/Facility.js';

export default class Organization {
    constructor(id, data) {
        this._identifier = id;
        this._organizationName = data.organizationName;

        this._keyAirportIcaos = [];
        this.keyAirportArrivals = [];
        this.airportGroupIcaos = {};
        this.facilities = {}; // { this._identifier: new Facility() , F11: new Facility(), ...}

        this._init(data);
    }

    /**
     * `Facility` instance representing the en route facility of this `Organization`
     *
     * @for Organization
     * @property centerFacility
     * @type {Facility}
     */
    get centerFacility() {
        return this.facilities[this._identifier];
    }

    get nonCenterFacilities() {
        const facilities = {};
        const allFacilityIds = Object.keys(this.facilities);

        for (const id of allFacilityIds) {
            if (id !== this._identifier) {
                facilities[id] = this.facilities[id];
            }
        }

        return facilities;
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
            throw new TypeError(`Expected a 'center' property in ${this._identifier}'s ` +
                'organization data, but none exists!');
        }

        const centerFacility = new Facility(this._identifier, data.center);

        this.facilities[this._identifier] = (centerFacility);
    }

    _initNonCenterFacilities(data) {
        if (Object.keys(data).length < 2) { // if no non-center facilities are defined for this organization
            return;
        }

        for (const [facilityId, facilityData] of Object.entries(data)) {
            if (facilityId === 'center' || facilityId === this._identifier) {
                continue;
            }

            // const facilityData = data[facilityId];
            const facility = new Facility(facilityId, facilityData);

            if (facilityId in this.facilities) {
                throw new TypeError(`Multiple facilities within ${this._organizationName} (${this._identifier}) ` +
                    `exist with a facility identifier of ${facilityId}; these IDs must be unique!`);
            }

            this.facilities[facilityId] = facility;
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
        const sectors = [];

        for (const facilityId in this.facilities) {
            sectors.push(...this.facilities[facilityId].getSectorsFromTurfPoint(turfPoint));
        }

        return sectors;
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
        for (const facilityId in this.facilities) {
            this.facilities[facilityId].updateSectorTimeTables(aircraftCollection);
        }
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
