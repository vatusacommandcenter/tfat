import { DATA_UPDATE_INTERVAL } from './constants/clientConstants.js';
import AircraftCollection from './aircraft/AircraftCollection.js';
import ClockView from './views/ClockView.js';
import TimeStampView from './views/TimeStampView.js';
import OrganizationCollection from './organization/OrganizationCollection.js';
import ViewController from './views/ViewController.js';

const initialOrganizationId = 'ZMA';
const organizationCollection = new OrganizationCollection(initialOrganizationId);
const aircraftCollection = new AircraftCollection(organizationCollection);
const viewController = new ViewController(aircraftCollection, organizationCollection.activeOrganization);
const timeStampView = new TimeStampView();
const clockView = new ClockView();

function getAircraftToShow() {
    return aircraftCollection.filterByDestinationGroup('ZMA');
}

function renderVatsimData() {
    const filteredAircraftCollection = getAircraftToShow();

    viewController.updateAircraftTable(filteredAircraftCollection);
    timeStampView.updateTimeStampFromVatsimDate(filteredAircraftCollection.updateTime);
    viewController.updateSectorVolumePageTables();

    console.log(`----------------------------------New data rendered at ${new Date()}`);
}

function processNewVatsimData(httpResponse) {
    const timeOfData = httpResponse.metaData.updateTime;
    const lastUpdateTime = aircraftCollection.updateTime;

    if (timeOfData === lastUpdateTime) {
        console.log(`Attempted to fetch new data, but "${lastUpdateTime}" is the latest data available.`);

        return;
    }

    aircraftCollection.updateCollection(httpResponse);
    organizationCollection.activeOrganization.updateSectorTimeTables(aircraftCollection);
    organizationCollection.activeOrganization.updateKeyAirportArrivals(aircraftCollection);
    renderVatsimData();
}

function getUpdatedData() {
    // ask server for fresh traffic data
    const xmlHttp = new XMLHttpRequest();

    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
            const vatsimData = JSON.parse(xmlHttp.response);

            processNewVatsimData(vatsimData);
        }
    };

    xmlHttp.open('GET', '/getUpdatedData', true);
    xmlHttp.send();
}

// MAIN
getUpdatedData();
setInterval(getUpdatedData, DATA_UPDATE_INTERVAL);
clockView.enable();
timeStampView.enable();
