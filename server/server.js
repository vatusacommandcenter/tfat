import {
    assumedSourceDataUpdateRateMs,
    dataRequestIntervalMs,
    EMPTY_VATSIM_DATA,
    SERVER_PORT
} from './serverConstants';
import {
    initializeVatsimDataRequestSchedule
} from './serverUtilities';

const express = require('express');
const app = express();
let latestPilotData = EMPTY_VATSIM_DATA;

app.get('/getUpdatedData', function(req, res) {
    res.send(latestPilotData);
});

// serve index.html, css, images, scripts all in one instead of using app.get()
app.use(express.static('public'));

app.listen(SERVER_PORT, function() {
    console.log(`Listening on port ${SERVER_PORT}`);
});

initializeVatsimDataRequestSchedule();
