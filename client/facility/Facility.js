import _without from 'lodash/without.js';
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

        // TODO: Change me to _defaultSectorConfiguration, where we can combine ZMA-->46 and ZMO-->62
        this._defaultSectorId = null;

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

    get id() {
        return this._facilityIdentifier;
    }

    _init(data) {
        if (!('sectors' in data)) {
            throw new TypeError(`Expected ${data.facilityName} (${this._facilityIdentifier}) ` +
                'to have a "sectors" property, but none exists!');
        }

        this._airspaceExlusionFacilities = data.airspaceExclusionFacilities;
        this._defaultSectorId = String(data.defaultSectorId);
        this._facilityName = data.facilityName;
        this._sectorCollection = new SectorCollection(this._facilityIdentifier, data.sectors);

        this.combineAllSectorsToDefault();
    }

    /**
     * Combine all `Sector`s in the `Facility`'s `SectorCollection` to the default sector
     *
     * @for Facility
     * @method combineAllSectorsToDefault
     * @returns undefined
     */
    combineAllSectorsToDefault() {
        const allSectors = this._sectorCollection.sectors;
        const defaultSector = this._sectorCollection.getSectorWithId(this._defaultSectorId);

        this.combineSectorsTo(allSectors, defaultSector);
    }

    /**
     * Mark a sector as being combined at another sector, rather than being open on its own
     *
     * @for Facility
     * @method combineSectorTo
     * @param {Sector} sectorBeingAbsorbed
     * @param {Sector} absorbingSector
     * @returns undefined
     */
    combineSectorTo(sectorBeingAbsorbed, absorbingSector) {
        this.decombineSector(sectorBeingAbsorbed);

        if (sectorBeingAbsorbed.id === absorbingSector.id) {
            return;
        }

        absorbingSector.subSectors.push(sectorBeingAbsorbed);
    }

    /**
     * Combine multiple sectors to a single sector at the same time
     *
     * @for Facility
     * @method combineSectorsTo
     * @param {array<Sector>} sectorsBeingAbsorbed
     * @param {Sector} absorbingSector
     * @return undefined
     */
    combineSectorsTo(sectorsBeingAbsorbed, absorbingSector) {
        for (const sector of sectorsBeingAbsorbed) {
            this.combineSectorTo(sector, absorbingSector);
        }
    }

    /**
     * Remove the specified sector from ALL sectors' `Sector.subSectors` arrays
     *
     * @for Facility
     * @method decombineSector
     * @param {Sector} sector
     * @returns undefined
     */
    decombineSector(sector) {
        for (const otherSector of this._sectorCollection.sectors) {
            otherSector.subSectors = _without(otherSector.subSectors, sector);
        }
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

    /**
     * Return an array of `Sector`s who own the airspace the provided Turf.js Point is within
     *
     * @for Facility
     * @method getSectorsFromTurfPoint
     * @param {turf.Point} turfPoint
     * @returns {array<Sector>}
     */
    getSectorsFromTurfPoint(turfPoint) {
        return this._sectorCollection.getSectorsFromTurfPoint(turfPoint);
    }

    getAllSectors() {
        return this._sectorCollection.sectors;
    }

    /**
     * Update the timetables for all `Sector`s
     *
     * @for Facility
     * @method updateSectorTimeTables
     * @param aircraftCollection {AircraftCollection}
     * @returns undefined
     */
    updateSectorTimeTables(aircraftCollection) {
        this._sectorCollection.updateSectorTimeTables(aircraftCollection);
    }
}
