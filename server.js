const express = require('express');
const getPilotData = require('./getPilotData');

const app = express();
const port = process.env.PORT || 3003;
const assumedSourceDataUpdateRateMs = 60000;
const dataRequestIntervalMs = 15000; // should be 60 seconds!
const EMPTY_VATSIM_DATA = {
    updateTime: 0,
    totalConnections: 0,
    pilotConnections: 0,
    data: []
};
let latestPilotData = EMPTY_VATSIM_DATA;

app.get('/getUpdatedData', function(req, res) {
    getPilotData().then(function(data) {
        // res.sendFile(__dirname + '/public/index.html');
        // res.sendFile(__dirname + '/client.js');
        latestPilotData = data;
        res.send(latestPilotData);
    }).catch(function(error) {
        res.status(500, {error})
    });
    // res.send(data);
    // res.sendFile(__dirname + '/index.html');
});

// app.get('/getUpdatedData', function(req, res) {
//     console.log('Request received');
//     res.redirect('/');
// });

// serve index.html, css, images, scripts all in one instead of using app.get()
app.use(express.static('public'));

app.listen(port, function() {
    console.log(`Listening on port ${port}`);
});


/**
 * Ask VATSIM server for fresh traffic data and store in `latestPilotData`
 *
 * @function getFreshData
 * @returns {Promise} - promise from getPilotData()
 */
function getFreshData() {
    return getPilotData().then(function(data) {
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
                `Received data timestamp: ${data.updateTime}`
            );

            return;
        }

        latestPilotData = data;

        console.log(data.updateTime);

        return data;
    });// .catch(function(error) {
        // res.status(500, {error});
    // });
}


/**
 * Schedule the next request of the VATSIM data file for the time when we expect it to next be changed
 * Note: This function will also get fresh traffic data from VATSIM at this time
 *
 * @function scheduleFirstSynchronizedDataRequest
 * @returns undefined
 */
function scheduleFirstSynchronizedDataRequest() {
    console.log(`first data fetch time: ${new Date().toUTCString()}`);
    getFreshData().then(function (data) {
        const sourceDataUpdateTime = generateDateFromVatsimTimestamp(data.updateTime);
        const nextSourceDataUpdateTime = sourceDataUpdateTime + assumedSourceDataUpdateRateMs;
        const remainingTimeUntilSourceUpdate = nextSourceDataUpdateTime - Date.now();
        const minimumTimeToJoinThisCycleMs = 10000;
        const additionalWaitTimeMs = 10000; // don't request data with everyone else
        let timeOfNextDataPull = nextSourceDataUpdateTime + additionalWaitTimeMs;
        
        if (remainingTimeUntilSourceUpdate < minimumTimeToJoinThisCycleMs) {
            timeOfNextDataPull += assumedSourceDataUpdateRateMs;
        }

        console.log(`planning to fetch at: ${new Date(timeOfNextDataPull).toUTCString()}`);

        const msUntilNextDataPull = timeOfNextDataPull - Date.now();
        setTimeout(initializeDataRequestSchedule, msUntilNextDataPull);
    });
}

/**
 * Initialize a recurring schedule to request traffic data from VATSIM repeatedly
 *
 * @function initializeDataRequestSchedule
 * @returns undefined
 */
function initializeDataRequestSchedule() {
    setInterval(getFreshData, dataRequestIntervalMs);
    console.log(`first on-sync fetch at: ${new Date().toUTCString()}`);
    getFreshData(); // keep after setting interval to hit target update time accurately
}

/**
 * Return a `Date` object for the provided timestamp in VATSIM data file timestamp format
 *
 * Expected data shape: `20200725230458`, where:
 *     2020 - year
 *       07 - month
 *       25 - day of month
 *       23 - hour (24h format)
 *       04 - minute
 *       58 - second
 *
 * @function generateDateFromVatsimTimestamp
 * @param {number} timestamp - creation time specified in VATSIM data file
 * @returns {Date}
 */
function generateDateFromVatsimTimestamp(timestamp) {
    const vatsimTimeStamp = String(timestamp);
    const year = vatsimTimeStamp.substr(0, 4);
    const month = vatsimTimeStamp.substr(4, 2) - 1; // Date() uses month index (0-11)
    const day = vatsimTimeStamp.substr(6, 2);
    const hour = vatsimTimeStamp.substr(8, 2);
    const min = vatsimTimeStamp.substr(10, 2);
    const sec = vatsimTimeStamp.substr(12);
    const date = Date.UTC(year, month, day, hour, min, sec);

    return date;
}

scheduleFirstSynchronizedDataRequest();
// var retval = getFreshData();