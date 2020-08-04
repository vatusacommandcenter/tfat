// navigation data source: http://www.myfsim.com/sectorfilecreation/vSTARSDump.php

// for regular browser javascript
// import waypointData from '../client/navData/waypoints.json';
// import airportData from '../client/navData/airports.json';

// for node
import fs from 'fs';
import path from 'path';
import { DECIMAL_RADIX } from '../globalConstants.js';

const navRelativePath = path.join(path.resolve(), 'client/navData');
const waypointDataFilePath = path.join(navRelativePath, 'waypoints.json');
const airportDataFilePath = path.join(navRelativePath, 'airports.json');
const waypointData = JSON.parse(fs.readFileSync(waypointDataFilePath, 'utf-8'));
const airportData = JSON.parse(fs.readFileSync(airportDataFilePath, 'utf-8'));
const outputFilePath = path.join(navRelativePath, 'navigationData.js');

/**
 * Parse waypoint data to the desired structure
 *
 * @function parseWaypointData
 * @returns {object}
 */
function parseWaypointData() {
    const waypointDataInfo = waypointData.Waypoints.File_Info;
    const waypointList = waypointData.Waypoints.Waypoint;
    const parsedWaypointList = [];

    for (const wp of waypointList) {
        const id = wp._attributes.ID;
        const type = wp._attributes.Type;
        const position = {
            lat: parseFloat(wp.Location._attributes.Lat),
            lon: parseFloat(wp.Location._attributes.Lon)
        };

        if (!type || !id || !position) {
            console.warn(`Unable to parse a nav data item, type ${type}, id ${id}, pos ${position}`);

            continue;
        }

        parsedWaypointList.push({ id, type, position });
    }

    return { waypointDataInfo, parsedWaypointList };
}

/**
 * Parse airport data to the desired structure
 *
 * @function parseAirportData
 * @returns {object}
 */
function parseAirportData() {
    const airportDataInfo = airportData.Airports.File_Info;
    const airportList = airportData.Airports.Airport;
    const parsedAirports = {};

    for (const airport of airportList) {
        // also available from source data are `Frequency` and `MagVar`
        // we do not need this and don't parse it to minimize download size
        const id = airport._attributes.ID;
        const name = airport._attributes.Name;
        const elevation = parseInt(airport._attributes.Elevation, DECIMAL_RADIX);
        const position = {
            lat: parseFloat(airport.Location._attributes.Lat),
            lon: parseFloat(airport.Location._attributes.Lon)
        };
        const runways = {};

        if ('Runway' in airport.Runways) {
            for (const runway of airport.Runways.Runway) {
                // also available from source data are `Heading`, `Length` and `Width`
                // we do not need this and don't parse it to minimize download size
                const runwayId = runway._attributes.ID;
                const runwayPosition = {
                    lat: parseFloat(runway.StartLoc._attributes.Lat),
                    lon: parseFloat(runway.StartLoc._attributes.Lon)
                };
                const runwayOtherEndPosition = {
                    lat: parseFloat(runway.EndLoc._attributes.Lat),
                    lon: parseFloat(runway.EndLoc._attributes.Lon)
                };

                if (!runwayId || !runwayPosition || !runwayOtherEndPosition) {
                    console.warn(`Unable to parse a runway item, airport ${id}, Runway ${runwayId}`);

                    continue;
                }

                runways[runwayId] = {
                    position: runwayPosition,
                    otherEndPosition: runwayOtherEndPosition
                };
            }
        }

        if (!id || !position || !elevation) {
            console.warn('Unable to parse an airport due to missing data: ' +
                `id ${id}, pos ${position}, elevation ${elevation}`);

            continue;
        }

        if (id in parsedAirports) {
            console.warn(`Multiple airports found for id ${id}-- using the first one only.`);

            continue;
        }

        parsedAirports[id] = {
            name, elevation, position, runways
        };
    }

    return { airportDataInfo, parsedAirports };
}

/**
 * Assembles and returns the individually parsed navigation data sections
 *
 * @function parseNavigationData
 * @returns {object}
 */
function parseNavigationData() {
    const parsedAirports = parseAirportData();
    const parsedWaypoints = parseWaypointData();

    return {
        airports: parsedAirports.parsedAirports,
        airportInfo: parsedAirports.airportDataInfo,
        waypoints: parsedWaypoints.parsedWaypointList,
        waypointInfo: parsedWaypoints.waypointDataInfo
    };
}

// build the file
const startFileWith = 'export const navData = ';
const mainContent = JSON.stringify(parseNavigationData());
const endFileWith = ';\n';
const textToWriteToFile = `${startFileWith}${mainContent}${endFileWith}`;

// write the file
fs.writeFile(outputFilePath, textToWriteToFile, (err) => {
    if (err) {
        return console.err(err);
    }

    console.log(`Navigation data parsed and saved to ${outputFilePath}`);
});
