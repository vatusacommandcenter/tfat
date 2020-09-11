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

        this.enable();
    }

    enable() {
        this.$navLinkAircraft.onclick = this.showAircraftTablePageView.bind(this);
        this.$navLinkFlow.onclick = this.showSectorVolumePageView.bind(this);
        // this.$navLinkReleases.onclick = null;
        // this.$navLinkSettings.onclick = null;
    }

    disable() {
        this.$navLinkAircraft.onclick = null;
        this.$navLinkFlow.onclick = null;
        this.$navLinkReleases.onclick = null;
        this.$navLinkSettings.onclick = null;
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

    updateSectorTables() {
        this._sectorVolumePageView.updateCenterSectorsTable();
    }

    _showIdAsActiveInNavbar(elementId) {
        const otherIds = _without(['nav-link-aircraft', 'nav-link-flow', 'nav-link-releases', 'nav-link-settings'], elementId);

        document.getElementById(elementId).classList.add('active');
        otherIds.forEach((id) => document.getElementById(id).classList.remove('active'));
    }
}
