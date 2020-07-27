// import { vatsimDataMock } from './mockdata.js';
import { DESTINATION_GROUP } from './clientConstants.js';
import { EMPTY_VATSIM_DATA } from '../globalConstants.js';

const $aircraftListElement = document.getElementById('aircraft-list');
const $updateTimeElement = document.getElementById('updateTime');
// const $trafficDataTimestamp = document.getElementById('aircraft-list-timestamp');
// const clockUpdateInterval = 15000;
// const dataUpdateInterval = 500;
// const dataCatchupInterval =
let lastUpdateTime = 0;
let latestData = EMPTY_VATSIM_DATA;
const dataUpdateInterval = 500000000;

// function updateClock() {
//     const date = new Date();
//     const hr = date.getUTCHours().toString().padStart(2, '0');
//     const min = date.getUTCMinutes().toString().padStart(2, '0');
//     const sec = date.getUTCSeconds().toString().padStart(2, '0');
//     const currentTime = `Current Time: ${hr}:${min}:${sec}z`;
//     $aircraftListElement.textContent = currentTime;
// }

function filterPilotsByDestinationGroup(destinationGroupName) {
    if (!(destinationGroupName in DESTINATION_GROUP)) {
        console.warn(`Invalid filter group specified: "${destinationGroupName}"`);

        return latestData.data;
    }

    const airportList = DESTINATION_GROUP[destinationGroupName];
    const aircraftList = latestData.data.filter((ac) => airportList.includes(ac.destination));

    return aircraftList.map((ac) => `${ac.destination}-${ac.callsign}`);
}

function filterPilotsByDestination(destination) {
    const aircraftList = latestData.data.filter((ac) => ac.destination === destination);

    return aircraftList.map((ac) => `${ac.destination}-${ac.callsign}`);
}

function getAircraftToShow() {
    // return JSON.stringify(latestData);
    // return JSON.stringify(filterPilotsByDestination('KMIA'));
    // return JSON.stringify(filterPilotsByDestinationGroup('MIA'));

    const mia = `MIA:   ${JSON.stringify(filterPilotsByDestinationGroup('MIA'))}`;
    const tpa = `TPA:   ${JSON.stringify(filterPilotsByDestinationGroup('TPA'))}`;
    const pbi = `PBI:   ${JSON.stringify(filterPilotsByDestinationGroup('PBI'))}`;
    const rsw = `RSW:   ${JSON.stringify(filterPilotsByDestinationGroup('RSW'))}`;
    const nqx = `NQX:   ${JSON.stringify(filterPilotsByDestinationGroup('NQX'))}`;
    const f11 = `F11:   ${JSON.stringify(filterPilotsByDestinationGroup('F11'))}`;
    const jax = `JAX:   ${JSON.stringify(filterPilotsByDestinationGroup('JAX'))}`;
    const dab = `DAB:   ${JSON.stringify(filterPilotsByDestinationGroup('DAB'))}`;
    const mygf = `MYGF:   ${JSON.stringify(filterPilotsByDestinationGroup('MYGF'))}`;
    const mynn = `MYNN:   ${JSON.stringify(filterPilotsByDestinationGroup('MYNN'))}`;
    const mbpv = `MBPV:   ${JSON.stringify(filterPilotsByDestinationGroup('MBPV'))}`;
    const aircraftToShow = `${mia}\n\n${tpa}\n\n${pbi}\n\n${rsw}\n\n${nqx}\n\n` +
        `${f11}\n\n${jax}\n\n${dab}\n\n${mygf}\n\n${mynn}\n\n${mbpv}`;

    return aircraftToShow;
}

function renderVatsimData() {
    const date = String(latestData.updateTime);
    $aircraftListElement.innerHTML = getAircraftToShow();
    $updateTimeElement.innerText = `Last updated: ${date.substr(8, 2)}:${date.substr(10, 2)}z`;
}

function processVatsimData(httpResponse) {
    const timeOfData = httpResponse.updateTime;

    if (timeOfData === lastUpdateTime) {
        console.log(`Attempted to fetch new data, but "${lastUpdateTime}" is the latest data available.`);

        return;
    }

    lastUpdateTime = timeOfData;
    latestData = httpResponse;

    renderVatsimData();
    window.data = httpResponse;
    console.log(`----------------------------------New data rendered at ${new Date()}`);
}

function getUpdatedData() {
    // ask server for fresh traffic data
    // console.log('Requesting new data');

    const xmlHttp = new XMLHttpRequest();

    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
            const vatsimData = JSON.parse(xmlHttp.response);

            processVatsimData(vatsimData);
        }
    };

    xmlHttp.open('GET', '/getUpdatedData', true);
    xmlHttp.send();
}

// setInterval(updateClock, clockUpdateInterval);
getUpdatedData();
setInterval(getUpdatedData, dataUpdateInterval);
