import {
    DATA_UPDATE_INTERVAL
} from './clientConstants.js';
import AircraftCollection from './AircraftCollection.js';
import AircraftTableView from './AircraftTableView.js';
import TimeStampView from './TimeStampView.js';
import ClockView from './ClockView.js';
import NavigationLibrary from './navData/NavigationLibrary.js';

const aircraftCollection = new AircraftCollection();
const aircraftTableView = new AircraftTableView(aircraftCollection);
const timeStampView = new TimeStampView();
const clockView = new ClockView();
const navigationLibrary = new NavigationLibrary();

function getAircraftToShow() {
    // return JSON.stringify(latestDownload);
    // return JSON.stringify(filterPilotsByDestination('KMIA'));
    // return JSON.stringify(filterPilotsByDestinationGroup('MIA'));

    const mia = aircraftCollection.filterByDestinationGroup('MIA');
    // const tpa = `TPA:   ${JSON.stringify(filterPilotsByDestinationGroup('TPA'))}`;
    // const pbi = `PBI:   ${JSON.stringify(filterPilotsByDestinationGroup('PBI'))}`;
    // const rsw = `RSW:   ${JSON.stringify(filterPilotsByDestinationGroup('RSW'))}`;
    // const nqx = `NQX:   ${JSON.stringify(filterPilotsByDestinationGroup('NQX'))}`;
    // const f11 = `F11:   ${JSON.stringify(filterPilotsByDestinationGroup('F11'))}`;
    // const jax = `JAX:   ${JSON.stringify(filterPilotsByDestinationGroup('JAX'))}`;
    // const dab = `DAB:   ${JSON.stringify(filterPilotsByDestinationGroup('DAB'))}`;
    // const mygf = `MYGF:   ${JSON.stringify(filterPilotsByDestinationGroup('MYGF'))}`;
    // const mynn = `MYNN:   ${JSON.stringify(filterPilotsByDestinationGroup('MYNN'))}`;
    // const mbpv = `MBPV:   ${JSON.stringify(filterPilotsByDestinationGroup('MBPV'))}`;
    // const aircraftToShow = `${mia}\n\n${tpa}\n\n${pbi}\n\n${rsw}\n\n${nqx}\n\n` +
    //     `${f11}\n\n${jax}\n\n${dab}\n\n${mygf}\n\n${mynn}\n\n${mbpv}`;

    return mia;
}

function renderVatsimData() {
    const filteredAircraftCollection = getAircraftToShow();
    aircraftTableView.showAircraft(filteredAircraftCollection);
    timeStampView.updateTimeStampFromVatsimDate(filteredAircraftCollection.updateTime);
    // aircraftTableView.showAllAircraft();

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
    renderVatsimData();
}

function getUpdatedData() {
    // ask server for fresh traffic data
    // console.log('Requesting new data');

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

// setInterval(updateClock, clockUpdateInterval);
getUpdatedData();
setInterval(getUpdatedData, DATA_UPDATE_INTERVAL);
clockView.enable();
timeStampView.enable();
