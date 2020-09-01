import SectorCollection from '../sector/SectorCollection.js';

export default class Facility {
    constructor(id, data) {
        /**
         * An array of strings of facilities considered to own airspace which is
         * substracted from the airspace of this facility.
         *
         * For example, a center should have its boundaries defined ignoring approach
         * control airspace, and then simply say that the center `Facility` exludes
         * each approach control. The airspace polygons will be manipulated accordingly
         * for the center to exclude all specified approach control airspaces.
         *
         * @for Facility
         * @property _airspaceExlusionFacilities
         * @type {array<string>} - array of facility identifiers (case sensitive!)
         * @private
         */
        this._airspaceExlusionFacilities = [];

        /**
         * Written name of the facility (ie 'Miami Center')
         *
         * @for Facility
         * @property _facilityName
         * @type {string}
         */
        this._facilityName = '';

        /**
         * Identifier for the facility, must be unique (ie 'ZMA')
         *
         * @for Facility
         * @property _facilityIdentifier
         * @type {string}
         */
        this._facilityIdentifier = id;

        /**
         * Collection of `Sector`s this facility includes
         *
         * @for Facility
         * @property _sectorCollection
         * @type {SectorCollection}
         */
        this._sectorCollection = null;

        this._init(data);
    }

    _init(data) {
        if (!('sectors' in data)) {
            throw new TypeError(`Expected ${data.facilityName} (${this._facilityIdentifier}) ` +
                'to have a "sectors" property, but none exists!');
        }

        this._airspaceExlusionFacilities = data.airspaceExclusionFacilities;
        this._facilityName = data.facilityName;
        this._sectorCollection = new SectorCollection(data.sectors);
    }

    /**
     * Return an array of `Waypoint`s for each position where the provided
     * Turf.js LineString intersects any polygon of any sector of this facility
     *
     * @for Facility
     * @method getIntersectionsWithTurfLineString
     * @param {turf.lineString} turfLineString
     * @returns {array<Waypoint>}
     */
    getIntersectionsWithTurfLineString(turfLineString) {
        return this._sectorCollection.getIntersectionsWithTurfLineString(turfLineString);
    }
}