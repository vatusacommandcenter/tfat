/**
 * Return a time-representative integer for use by JS's `Date` object for the
 * provided timestamp in VATSIM data file timestamp format
 *
 * Expected input data shape: `20200725230458`, where:
 *     2020 - year
 *       07 - month
 *       25 - day of month
 *       23 - hour (24h format)
 *       04 - minute
 *       58 - second
 *
 * @function generateDateFromVatsimTimestamp
 * @param {number} timestamp - creation time specified in VATSIM data file
 * @returns {number} - milliseconds since 1/1/1970 00:00z (used by JS's `Date`)
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
export function initializeDataRequestSchedule(updateLocalDataFunc, dataRequestIntervalMs) {
    setInterval(updateLocalDataFunc, dataRequestIntervalMs);
    console.log(`first on-sync fetch at: ${new Date().toUTCString()}`);
    updateLocalDataFunc(); // keep after setting interval to hit target update time accurately
}

/**
 * Schedule the next request of the VATSIM data file for the time when we expect it to next be changed
 * Note: This function will also get fresh traffic data from VATSIM at this time
 *
 * @function startVatsimDataUpdates
 * @returns undefined
 */
export function startVatsimDataUpdates(updateLocalDataFunc, dataRequestIntervalMs, assumedSourceDataUpdateRateMs) {
    console.log(`first data fetch time: ${new Date().toUTCString()}`);
    return updateLocalDataFunc().then((data) => {
        const sourceDataUpdateTime = generateDateFromVatsimTimestamp(data.metaData.updateTime);
        const nextSourceDataUpdateTime = sourceDataUpdateTime + assumedSourceDataUpdateRateMs;
        const remainingTimeUntilSourceUpdate = nextSourceDataUpdateTime - Date.now();
        const minimumTimeToJoinThisCycleMs = 10000;
        const additionalWaitTimeMs = 14000; // don't request data with everyone else
        let timeOfNextDataPull = nextSourceDataUpdateTime + additionalWaitTimeMs;

        if (remainingTimeUntilSourceUpdate < minimumTimeToJoinThisCycleMs) {
            timeOfNextDataPull += assumedSourceDataUpdateRateMs;
        }

        console.log(`planning to fetch at: ${new Date(timeOfNextDataPull).toUTCString()}`);

        const msUntilNextDataPull = timeOfNextDataPull - Date.now();
        setTimeout(initializeDataRequestSchedule, msUntilNextDataPull, updateLocalDataFunc, dataRequestIntervalMs);

        return data;
    });
}
