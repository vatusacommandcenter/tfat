import nodeFetch from 'node-fetch';
import { DECIMAL_RADIX } from '../globalConstants.js';

// let vatsimRawConnectionData = '';
// let vatsimParsedPilotConnectionData = [];
// const vatsimDataUrl = 'http://vatsim-data.hardern.net/vatsim-data.txt'
const vatsimDataUrl = 'http://cluster.data.vatsim.net/vatsim-data.txt';

/**
 * Fetch and download raw data for all active connections to the VATSIM network
 * This data is saved to `vatsimRawConnectionData`, which must be accessible
 *
 * @function fetchVatsimConnections
 * @returns Promise
 */
function fetchVatsimConnections() {
    return nodeFetch(vatsimDataUrl)
        .then((response) => response.text());
    // .then(data => vatsimRawConnectionData = data);
    // .then(() => console.log(vatsimRawConnectionData));
}

/**
 * Parse the raw VATSIM data, pushing pilot connections to an array and ignoring the rest
 * This data is saved to `vatsimParsedPilotConnectionData`, which must be accessible
 *
 * @function parsePilotConnections
 * @returns array<object> An array of pilot objects, where the object properties are their connection details
 */
function parsePilotConnections(rawData) {
    const lines = rawData.split('\n');
    const vatsimParsedPilotConnectionData = [];
    let updateTime = 0;
    let totalConnections = 0;
    let pilotConnections = 0;

    for (const line of lines) {
        if (line.includes('UPDATE = ')) {
            updateTime = parseInt(line.substr(9), DECIMAL_RADIX);

            continue;
        }

        if (line.includes('CONNECTED CLIENTS = ')) {
            totalConnections = parseInt(line.substr(20), DECIMAL_RADIX);

            continue;
        }

        if (!line.includes(':PILOT:')) {
            continue;
        }

        // assemble pilot data
        const fields = line.split(':');
        const pilotInfo = {
            /* eslint-disable no-multi-spaces */
            callsign: fields[0],    // callsign
            cid: fields[1],         // VATSIM CID
            name: fields[2],        // name used when connecting
            clientType: fields[3],  // either "PILOT" or "ATC"
            frequency: fields[4],   // controller connections only, shows "prim" freq
            latitude: fields[5],    // decimal degrees N
            longitude: fields[6],   // decimal degrees E
            altitude: fields[7],    // feet above MSL
            groundSpeed: fields[8], // groundspeed in knots
            fpAircraft: fields[9],  // aircraft type ICAO identifier
            cruiseTas: fields[10],  // filed true airspeed at cruise
            fpOrigin: fields[11],   // origin airport ICAO identifier
            fpCruiseAltitude: fields[12],   // cruise altitude in flight plan
            destination: fields[13],    // destination airport ICAO identifier
            server: fields[14],         // which VATSIM server they're using
            protrevision: fields[15],   // useless, everybody has the same value
            rating: fields[16],         // rating
            currentSquawk: fields[17],  // transponder code they're currently on
            facilityType: fields[18],   // controller connections only, shows DEL/GND/TWR/etc
            visualRange: fields[19],    // controller connections only, shows vis range
            fpRevision: fields[20],     // revision number of flight plan
            fpFlightRules: fields[21],  // flight rules selected in flight plan (IFR or VFR)
            fpDepartureTimeScheduled: fields[22],   // time in FP to depart origin airport (z)
            fpDepartureTimeActual: fields[23],      // does not appear for most aircraft (why?)
            fpEnRouteTime: fields[24],  // time in FP from origin to destination
            fpMinEnroute: fields[25],   // seems like mins enroute, but values are all ~0-50 (why?)
            fpHoursFuel: fields[26],    // hours fuel on board, in addition to fpMinsFuel
            fpMinsFuel: fields[27],     // minutes of fuel on board, in addition to fpHoursFuel
            fpAlternateDestination: fields[28],   // alternate landing airport
            fpRemarks: fields[29],      // flight plan remarks
            fpRoute: fields[30],        // flight plan route
            originLat: fields[31],      // latitude of the FP origin airport
            originLon: fields[32],      // longitude of the FP origin airport
            destinationLat: fields[33], // latitude of the FP destination airport
            destinationLon: fields[34], // longitude of the FP destination airport
            atisMessage: fields[35],    // controller connections only
            timeLastAtisReceived: fields[36],   // not used by pilot connections
            logonTime: fields[37],  // time this user connected to the network (z)
            heading: fields[38],    // current heading (actual heading or ground track?)
            inHg: fields[39],       // current altimeter setting, inches of mercury
            hPa: fields[40]         // current altimeter setting, hPa (milibars)
        };

        vatsimParsedPilotConnectionData.push(pilotInfo);
    }

    pilotConnections = vatsimParsedPilotConnectionData.length;
    const response = {
        data: vatsimParsedPilotConnectionData,
        metaData: {
            updateTime,
            totalConnections,
            pilotConnections
        }
    };

    return response;
}

/**
 * Fetches, filters, and formats pilot connection data from the VATSIM network
 * Note: I am asynchronous and can't be console.log-ed or used without a .then() where you import me!
 *
 * @function getParsedVatsimPilotConnectionData
 * @returns Promise
 */
export default function getParsedVatsimPilotConnectionData() {
    return fetchVatsimConnections()
        .then((rawData) => parsePilotConnections(rawData));
    // .then(() => vatsimParsedPilotConnectionData);
    // .then(() => console.log(vatsimParsedPilotConnectionData));
}
