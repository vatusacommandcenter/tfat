import {
    EMPTY_VATSIM_DATA,
    SERVER_PORT
} from './serverConstants';
import {
    initializeVatsimDataRequestSchedule
} from './serverUtilities';

const express = require('express');

const app = express();
// TODO: This will be mutated by initializeVatsimDataRequestSchedule()
// There are better and clearer ways to do this!
let latestPilotData = EMPTY_VATSIM_DATA; // eslint-disable-line prefer-const

app.get('/getUpdatedData', (req, res) => {
    res.send(latestPilotData === EMPTY_VATSIM_DATA);
});

// serve index.html, css, images, scripts all in one instead of using app.get()
app.use(express.static('public'));
app.listen(SERVER_PORT, () => {
    console.log(`Listening on port ${SERVER_PORT}`);
});

initializeVatsimDataRequestSchedule(latestPilotData);
