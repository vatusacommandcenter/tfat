import Organization from './Organization.js';
import { ZMA } from '../organizationData/ZMA.js';

export default class OrganizationCollection {
    constructor() {
        this._organizations = {};

        this._init();
    }

    _init() {
        // update me when adding new facilities!
        const organizationList = { ZMA };

        for (const organizationIdentifier in organizationList) {
            const organizationData = organizationList[organizationIdentifier];
            const organization = new Organization(organizationIdentifier, organizationData);
            this._organizations[organizationIdentifier] = organization;
        }
    }
}
