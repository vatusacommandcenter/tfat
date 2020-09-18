import { DATA_UPDATE_INTERVAL } from './constants/clientConstants.js';
import AircraftCollection from './aircraft/AircraftCollection.js';
import ClockView from './views/ClockView.js';
import TimeStampView from './views/TimeStampView.js';
import OrganizationCollection from './organization/OrganizationCollection.js';
import ViewController from './views/ViewController.js';

const initialOrganizationId = 'DCC';
let latestHttpResponse = null;
const organizationCollection = new OrganizationCollection(initialOrganizationId);
const aircraftCollection = new AircraftCollection(organizationCollection);
const viewController = new ViewController(aircraftCollection, organizationCollection);
const timeStampView = new TimeStampView();
const clockView = new ClockView();

function getAircraftToShow() {
    return aircraftCollection.filterByDestinationGroup(organizationCollection.activeOrganization.id);
}

function renderVatsimData() {
    const filteredAircraftCollection = getAircraftToShow();

    viewController.updateAircraftTable(filteredAircraftCollection);
    timeStampView.updateTimeStampFromVatsimDate(filteredAircraftCollection.updateTime);
    viewController.updateSectorVolumePageTables();

    console.log(`----------------------------------New data rendered at ${new Date()}`);
}

function processNewVatsimData(httpResponse) {
    if (httpResponse) {
        latestHttpResponse = httpResponse;
    }

    const timeOfData = latestHttpResponse.metaData.updateTime;
    const lastUpdateTime = aircraftCollection.updateTime;

    if (timeOfData === lastUpdateTime && httpResponse) {
        console.log(`Attempted to fetch new data, but "${lastUpdateTime}" is the latest data available.`);

        return;
    }

    aircraftCollection.updateCollection(latestHttpResponse);
    organizationCollection.activeOrganization.updateSectorTimeTables(aircraftCollection);
    organizationCollection.activeOrganization.updateKeyAirportArrivals(aircraftCollection);
    renderVatsimData();
}

// TODO: This is SO ICKY! Find another way.
viewController._processNewVatsimData = processNewVatsimData;

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
