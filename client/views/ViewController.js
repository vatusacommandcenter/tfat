import _without from 'lodash/without.js';
import AircraftTablePageView from './pages/AircraftTablePageView.js';
import SectorVolumePageView from './pages/SectorVolumePageView.js';

export default class ViewController {
    constructor(aircraftCollection, activeOrganization) {
        this.$mainContentElement = null;
        this.$navLinkAircraft = null;
        this.$navLinkFlow = null;
        this.$navLinkReleases = null;
        this.$navLinkSettings = null;
        this._activeView = null;
        this._aircraftTablePageView = null;
        this._sectorVolumePageView = null;

        this._init(aircraftCollection, activeOrganization);
    }

    _init(aircraftCollection, activeOrganization) {
        // this.$mainContentElement = document.getElementById('main-content');
        this.$navLinkAircraft = document.getElementById('nav-link-aircraft');
        this.$navLinkFlow = document.getElementById('nav-link-flow');
        this.$navLinkReleases = document.getElementById('nav-link-releases');
        this.$navLinkSettings = document.getElementById('nav-link-settings');
        this._aircraftTablePageView = new AircraftTablePageView(aircraftCollection);
        this._sectorVolumePageView = new SectorVolumePageView(activeOrganization);
        this._activeView = this._aircraftTablePageView;

        this.showSectorVolumePageView();

        this.enable();
    }

    enable() {
        this.$navLinkAircraft.addEventListener('click', this.showAircraftTablePageView.bind(this));
        this.$navLinkFlow.addEventListener('click', this.showSectorVolumePageView.bind(this));
        // this.$navLinkReleases.addEventListener('click', null);
        // this.$navLinkSettings.addEventListener('click', null);
    }

    disable() {
        this.$navLinkAircraft.removeEventListener('click', this.showAircraftTablePageView.bind(this));
        this.$navLinkFlow.removeEventListener('click', this.showSectorVolumePageView.bind(this));
        // this.$navLinkReleases.removeEventListener('click', null);
        // this.$navLinkSettings.removeEventListener('click', null);
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
        this._sectorVolumePageView.updateCenterSectorsTable();
        this._sectorVolumePageView.updateKeyAirportsTable();
    }

    _showIdAsActiveInNavbar(elementId) {
        const otherIds = _without(['nav-link-aircraft', 'nav-link-flow', 'nav-link-releases', 'nav-link-settings'], elementId);

        document.getElementById(elementId).classList.add('active');
        otherIds.forEach((id) => document.getElementById(id).classList.remove('active'));
    }
}
