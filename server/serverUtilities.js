import {
    assumedSourceDataUpdateRateMs,
    dataRequestIntervalMs
} from './serverConstants.js';
import getPilotData from './getPilotData.js';

/**
 * Ask VATSIM server for fresh traffic data and store in `latestPilotData`
 *
 * @function getFreshData
 * @returns {Promise} - promise from getPilotData()
 */
export function getFreshData(latestPilotData) {
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

        console.log(data.updateTime);

        return data;
    }).catch((error) => {
        console.error(error);
    });
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
export function generateDateFromVatsimTimestamp(timestamp) {
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

/**
 * Initialize a recurring schedule to request traffic data from VATSIM repeatedly
 *
 * @function initializeDataRequestSchedule
 * @returns undefined
 */
export function initializeDataRequestSchedule(latestPilotData) {
    setInterval(getFreshData, dataRequestIntervalMs, latestPilotData);
    console.log(`first on-sync fetch at: ${new Date().toUTCString()}`);
    getFreshData(latestPilotData); // keep after setting interval to hit target update time accurately
}

/**
 * Schedule the next request of the VATSIM data file for the time when we expect it to next be changed
 * Note: This function will also get fresh traffic data from VATSIM at this time
 *
 * @function initializeVatsimDataRequestSchedule
 * @returns undefined
 */
export function initializeVatsimDataRequestSchedule(latestPilotData) {
    console.log(`first data fetch time: ${new Date().toUTCString()}`);
    return getFreshData(latestPilotData).then((data) => {
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
        setTimeout(initializeDataRequestSchedule, msUntilNextDataPull, latestPilotData);

        return data;
    });
}
