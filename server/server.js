import express from 'express';
import { SERVER_PORT } from './serverConstants.js';
import { EMPTY_VATSIM_DATA } from '../globalConstants.js';
import getPilotData from './getPilotData.js';

const app = express();
let latestPilotData = EMPTY_VATSIM_DATA; // eslint-disable-line prefer-const

app.get('/getUpdatedData', (req, res) => {
    res.send(latestPilotData);
});

// serve index.html, css, images, scripts all in one instead of using app.get()
app.use(express.static('public'));
app.listen(SERVER_PORT, () => {
    console.log(`Listening on port ${SERVER_PORT}`);
});

/**
 * Ask VATSIM server for fresh traffic data and store in `latestPilotData`
 *
 * @function updateLocalData
 * @returns {Promise} - promise from getPilotData()
 */
export function updateLocalData() {
    return getPilotData().then((data) => {
        if (!data || !data.updateTime) {
            console.warn(`Received invalid pilot data from VATSIM: \n${data}`);

            return;
        }

        if (data.updateTime === latestPilotData.updateTime) {
            console.log(`${data.updateTime} (no change-- discarded)`);

            return;
        } else if (data.updateTime < latestPilotData.updateTime) {
            console.warn('Data hiccup from VATSIM! Fresh data is timestamped OLDER than data we already had! ' +
                `Stored data timestamp: ${latestPilotData.updateTime}` +
                `Received data timestamp: ${data.updateTime}`);

            return;
        }

        latestPilotData = data;

        console.log(latestPilotData.updateTime);

        return data;
    }).catch((error) => {
        console.error(error);
    });
}

// startVatsimDataUpdates(updateLocalData, dataRequestIntervalMs, assumedSourceDataUpdateRateMs);
updateLocalData();
