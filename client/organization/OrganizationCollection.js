import Organization from './Organization.js';
import { ZMA } from '../organizationData/ZMA.js';

export default class OrganizationCollection {
    constructor(initialOrganizationId) {
        // TODO: This should not be hardcoded! Add a way for users to change organizations!
        /**
         * The organization whose view should be displayed
         *
         * @for OrganizationCollection
         * @property _activeOrganizationId
         * @type {string}
         * @private
         */
        this._activeOrganizationId = 'ZMA';

        /**
         * Object containing all organizations included in `OrganizationCollection.init()` for load
         *
         * @for OrganizationCollection
         * @property _organizations
         * @type {object}
         * @private
         */
        this._organizations = {};

        this._init(initialOrganizationId);
    }

    /**
     * The `Organization` instance currently marked as active within the `OrganizationCollection`
     *
     * @for OrganizationCollection
     * @property activeOrganization
     * @type {Organization}
     */
    get activeOrganization() {
        return this._organizations[this._activeOrganizationId];
    }

    _init(initialOrganizationId) {
        // update me when adding new facilities!
        const organizationList = { ZMA };

        for (const organizationIdentifier in organizationList) {
            const organizationData = organizationList[organizationIdentifier];
            const organization = new Organization(organizationIdentifier, organizationData);
            this._organizations[organizationIdentifier] = organization;
        }

        this.setActiveOrganization(initialOrganizationId);
    }

    /**
     * Return an array of `Waypoint`s for each position where the provided Turf.js LineString
     * intersects any polygon of any sector of any facility in the active organization
     *
     * @for OrganizationCollection
     * @method getSectorBoundaryCrossingWaypoints
     * @param {turf.LineString} turfLineString
     * @returns {array<Waypoint>}
     */
    getSectorBoundaryCrossingWaypoints(turfLineString) {
        return this.activeOrganization.getSectorBoundaryCrossingWaypoints(turfLineString);
    }

    /**
     * Return an array of `Sector`s who own the airspace the provided Turf.js Point is within
     *
     * @for OrganizationCollection
     * @method getSectorsFromTurfPoint
     * @param {turf.Point} turfPoint
     * @returns {array<Sector>}
     */
    getSectorsFromTurfPoint(turfPoint) {
        return this.activeOrganization.getSectorsFromTurfPoint(turfPoint);
    }

    setActiveOrganization(organizationId) {
        if (!(organizationId in this._organizations)) {
            console.warn(`Attempted to change to organization called ${organizationId}, ` +
                'but could not find one by that name!');

            return;
        }

        this._activeOrganizationId = organizationId;
    }
}
