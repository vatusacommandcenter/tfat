import _without from 'lodash/without.js';
import AircraftTablePageView from './pages/AircraftTablePageView.js';
import SectorVolumePageView from './pages/SectorVolumePageView.js';
import { CLOCK_UPDATE_INTERVAL } from '../constants/clientConstants.js';

export default class ViewController {
    constructor(aircraftCollection, organizationCollection) {
        this.$mainContentElement = null;
        this.$navDropDownItems = null;
        this.$navLinkAircraft = null;
        this.$navLinkFlow = null;
        this.$navLinkReleases = null;
        this.$navLinkSettings = null;
        this._activeView = null;
        this._aircraftTablePageView = null;
        this._sectorVolumePageView = null;
        this._timeout = null;
        this._organizationCollection = organizationCollection;
        this._processNewVatsimData = null;

        this._init(aircraftCollection, organizationCollection);
    }

    _init(aircraftCollection) {
        // this.$mainContentElement = document.getElementById('main-content');
        this.$navDropDownItems = document.getElementById('nav-dropdown-items');
        this.$navLinkAircraft = document.getElementById('nav-link-aircraft');
        this.$navLinkFlow = document.getElementById('nav-link-flow');
        this.$navLinkReleases = document.getElementById('nav-link-releases');
        this.$navLinkSettings = document.getElementById('nav-link-settings');
        this._aircraftTablePageView = new AircraftTablePageView(aircraftCollection);
        this._sectorVolumePageView = new SectorVolumePageView(this._organizationCollection.activeOrganization);
        this._activeView = this._aircraftTablePageView;

        this._initFacilityDropDown();
        this.showSectorVolumePageView();

        this.enable();
    }

    _initFacilityDropDown() {
        const endHtml = '<div class="dropdown-divider"></div><a class="dropdown-item disabled" ' +
            'id="nav-link-request-new-facility" href="#">Request new facility (coming soon!)</a>';
        const organizations = this._organizationCollection.getAllOrganizationIdsAndNames();
        const links = organizations.map((org) => {
            return `<a class="dropdown-item" id="nav-link-facility-${org.id}" href="#">${org.id} (${org.name})</a>`;
        });
        const html = `${links.join('')}${endHtml}`;

        this.$navDropDownItems.innerHTML = html;
        const activeOrgId = this._organizationCollection.activeOrganization.id;
        this.$navDropDownItems.querySelector(`#nav-link-facility-${activeOrgId}`).classList.add('active');
    }

    /**
     * Set up the on-click event handlers so clicking on facilities in the dropdown will find and load them
     *
     * @for ViewController
     * @method _initFacilityDropDownLinks
     * @returns {undefined}
     */
    _initFacilityDropDownLinks() {
        const elements = this._getAllNavLinkElements();

        for (const element of elements) {
            element.addEventListener('click', this._loadFacilityFromMouseEvent.bind(this));
        }
    }

    _resetFacilityDropDownLinks() {
        const elements = this._getAllNavLinkElements();

        for (const element of elements) {
            element.removeEventListener('click', this._loadFacilityFromMouseEvent.bind(this));
        }
    }

    _loadFacilityFromMouseEvent(event) {
        const facilityId = event.target.id.replace('nav-link-facility-', '');

        this._organizationCollection.setActiveOrganization(facilityId);
        this._markAllNavLinkElementsInactive();
        event.target.classList.add('active');

        this._resetFacilityDropDownLinks();
        // TODO: NOT ALLOWED TO DO THIS SORT OF SHIT!
        this._init(this._aircraftTablePageView._aircraftCollection);
        this._processNewVatsimData();
    }

    _getAllNavLinkElements() {
        return this.$navDropDownItems.querySelectorAll('[id^="nav-link-facility-"]');
    }

    _markAllNavLinkElementsInactive() {
        const elements = this._getAllNavLinkElements();

        for (const element of elements) {
            element.classList.remove('active');
        }
    }

    enable() {
        this.$navLinkAircraft.addEventListener('click', this.showAircraftTablePageView.bind(this));
        this.$navLinkFlow.addEventListener('click', this.showSectorVolumePageView.bind(this));
        // this.$navLinkReleases.addEventListener('click', null);
        // this.$navLinkSettings.addEventListener('click', null);

        this._initFacilityDropDownLinks();

        this._timeoutHandler = this._sectorVolumePageView.incrementCurrentInterval.bind(this._sectorVolumePageView);
        this._timeout = setInterval(this._timeoutHandler.bind(this), CLOCK_UPDATE_INTERVAL);
    }

    disable() {
        this.$navLinkAircraft.removeEventListener('click', this.showAircraftTablePageView.bind(this));
        this.$navLinkFlow.removeEventListener('click', this.showSectorVolumePageView.bind(this));
        // this.$navLinkReleases.removeEventListener('click', null);
        // this.$navLinkSettings.removeEventListener('click', null);

        this._resetFacilityDropDownLinks();

        this._timeout.clearTimeout();
    }

    showAircraftTablePageView() {
        if (this._activeView === this._aircraftTablePageView) {
            return;
        }

        this._aircraftTablePageView.show();
        this._activeView.hide();
        this._activeView = this._aircraftTablePageView;

        this._showIdAsActiveInNavbar('nav-link-aircraft');
    }

    showSectorVolumePageView() {
        if (this._activeView === this._sectorVolumePageView) {
            return;
        }

        this._sectorVolumePageView.show();
        this._activeView.hide();
        this._activeView = this._sectorVolumePageView;

        this._showIdAsActiveInNavbar('nav-link-flow');
    }

    updateAircraftTable(filteredAircraftCollection) {
        this._aircraftTablePageView.addSpecificAircraftToTable(filteredAircraftCollection);
    }

    updateSectorVolumePageTables() {
        this._sectorVolumePageView.updateAllTables();
    }

    _showIdAsActiveInNavbar(elementId) {
        const otherIds = _without(['nav-link-aircraft', 'nav-link-flow', 'nav-link-releases', 'nav-link-settings'], elementId);

        document.getElementById(elementId).classList.add('active');
        otherIds.forEach((id) => document.getElementById(id).classList.remove('active'));
    }
}
