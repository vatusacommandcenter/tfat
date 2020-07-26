const $aircraftListElement = document.getElementById('aircraft-list');
const $updateTimeElement = document.getElementById('updateTime');
// const $trafficDataTimestamp = document.getElementById('aircraft-list-timestamp');
// const clockUpdateInterval = 15000;
// const dataUpdateInterval = 500;
// const dataCatchupInterval =
let lastUpdateTime = 0;
const dataUpdateInterval = 15000;

// function updateClock() {
//     const date = new Date();
//     const hr = date.getUTCHours().toString().padStart(2, '0');
//     const min = date.getUTCMinutes().toString().padStart(2, '0');
//     const sec = date.getUTCSeconds().toString().padStart(2, '0');
//     const currentTime = `Current Time: ${hr}:${min}:${sec}z`;
//     $aircraftListElement.textContent = currentTime;
// }

function renderVatsimData(data) {
    const date = String(data.updateTime);
    $aircraftListElement.innerHTML = JSON.stringify(data);
    $updateTimeElement.innerText = `Last updated: ${date.substr(8, 2)}:${date.substr(10, 2)}z`
}

function processVatsimData(httpResponse) {
    const timeOfData = httpResponse.updateTime;

    if (timeOfData === lastUpdateTime) {
        console.log(`Attempted to fetch new data, but "${lastUpdateTime}" is the latest data available.`);

        return;
    }

    lastUpdateTime = timeOfData;

    renderVatsimData(httpResponse);
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
