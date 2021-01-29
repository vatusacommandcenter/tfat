import { faaSectorData } from './NASR2SCT_Output/VRC/TestSectorFile.js';
import { worldwideAirports } from './worldwide/airports.js';
import Airport from './Airport.js';
import Fix from './Fix.js';
import { NAV_DATA } from './navigationData.js';
import { WAYPOINT_TYPES } from '../constants/routeConstants.js';
import { DECIMAL_RADIX } from '../../globalConstants.js';

// NAVIGATION DATA SOURCES:
// Worldwide Data:
// Airports: airports.csv from... https://ourairports.com/data/
//     --> First, run: csv-parser client/navdata/worldwide/airports.csv > client/navdata/worldwide/airports.js
//     --> then add commas to end of line and encapsulate in "const raw = [];"
//     --> then run `babel-node client/navdata/worldwide/airports2.js`
//
// FAA NASR Data (full coverage):
// Generated from NASR2SCT, MIT Licensed, available at https://github.com/Nikolai558/NASR2SCT
// Editing 'VRC/TestSectorFile.sct2' to export as a string (*.js file), we pull data for:
//  *  --> Airports (position only)
//     --> Fixes, VORs & NDBs
//  *  --> Airways (high & low combined)
//  *  --> Runways (owning airport, runway end coordinates, runway heading)
//  * indicates planned but not yet implemented
//
// Note: NASR2SCT also generates SID/STAR data, but does not differentiate between transitions.
// Should probably parse NASR ourselves to get the additional information to differentiate between
// route branches based on different destination airports, runways, etc.

/**
 * Class holding all known navigation data
 *
 * @class NavigationLibrary
 */
class NavigationLibrary {
    constructor() {
        this._airportInfo = NAV_DATA.airportInfo;
        this._airports = {};
        // this._airways = [];
        // this._sids = [];
        // this._stars = [];
        this._fixInfo = NAV_DATA.waypointInfo;
        this._fixes = {};

        this._init();
    }

    _init() {
        this._initAirports();
        this._initFixes();
    }

    // NOTE: New implementation, using airports.js (from airports.csv)
    _buildAirportFixes(airportData) {
        const airportList = {};

        for (const airport of airportData) {
            const [id, lat, lon] = airport;
            const position = { lat, lon };
            const fixParams = { id, position, waypointType: WAYPOINT_TYPES.AIRPORT_FIX };
            const airportFix = new Fix(fixParams);

            if (id in airportList) {
                console.warn(`Airport ${id} listed in worldwide/airports.js multiple times!`);
            }

            airportList[id] = airportFix;
        }

        return airportList;
    }

    // // NOTE: Old implementation, using NAV_DATA.airportInfo!
    _initAirports() {
        const nextAirportList = {};

        for (const icao in NAV_DATA.airports) {
            const airportData = NAV_DATA.airports[icao];
            nextAirportList[icao] = new Airport(icao, airportData);
        }

        this._airports = nextAirportList;
    }

    /**
     * Change fix collection to be key-value object instead of an array
     * of objects for easier data access without filtering
     *
     * @for NavigationLibrary
     * @method _initFixes
     * @returns undefined
     */
    _initFixes() {
        // this._initCaseyDierFixes();

        const ndbData = faaSectorData.split('[NDB]')[1].split(/\[.*\].*/)[0].split('\n');
        const vorData = faaSectorData.split('[VOR]')[1].split(/\[.*\].*/)[0].split('\n');
        const fixData = faaSectorData.split('[FIXES]')[1].split(/\[.*\].*/)[0].split('\n');

        const ndbs = this._buildNavItems(ndbData, WAYPOINT_TYPES.NDB);
        const vors = this._buildNavItems(vorData, WAYPOINT_TYPES.VOR);
        const fixes = this._buildNavItems(fixData, WAYPOINT_TYPES.FIX);
        const airportFixes = this._buildAirportFixes(worldwideAirports);

        // TODO: Is this a good way to do this? It will overwrite NDB-VOR duplicates, rather than including both!
        this._fixes = {
            ...ndbs,
            ...vors,
            ...fixes,
            ...airportFixes
        };
    }

    // /**
    //  * Import Casey Dier's fixes
    //  *
    //  * @for NavigationLibrary
    //  * @method _initCaseyDierFixes
    //  * @returns undefined
    //  * @private
    //  */
    // _initCaseyDierFixes() {
    //     const caseyDierFixList = {};

    //     for (const fixData of NAV_DATA.waypoints) {
    //         const fixName = fixData.id;

    //         // if another fix by this name already exists
    //         if (fixName in caseyDierFixList) {
    //             // if multiple fixes by this name already exist, excluding this one
    //             if (Array.isArray(caseyDierFixList[fixName])) {
    //                 caseyDierFixList[fixName].push(new Fix(fixData));

    //                 continue;
    //             }

    //             caseyDierFixList[fixName] = [caseyDierFixList[fixName], new Fix(fixData)];

    //             continue;
    //         }

    //         caseyDierFixList[fixName] = new Fix(fixData);
    //     }

    //     this._fixes = caseyDierFixList;
    // }

    _buildNavItems(faaSctData, waypointType) {
        const navItemList = {};

        for (const line of faaSctData) {
            if (line.split(';')[0].trim().split(' ').filter(Boolean).length < 3) { // not enough data in line
                continue;
            }

            const fixParams = this._getFixParametersFromLineForWaypointType(line, waypointType);
            const { id, position } = fixParams;

            // `id` and `lat` will always have content if `lon` does, so just check for lon content
            if (typeof position.lon === 'undefined') {
                console.warn(`Bad data format for ${waypointType} "${id}" from line "${line}"!`);

                continue;
            }

            // if another fix by this name already exists
            if (id in navItemList) {
                // if multiple fixes by this name already exist, excluding this one
                if (Array.isArray(navItemList[id])) {
                    navItemList[id].push(new Fix(fixParams));

                    continue;
                }

                navItemList[id] = [navItemList[id], new Fix(fixParams)];

                continue;
            }

            navItemList[id] = new Fix(fixParams);
        }

        return navItemList;
    }

    _getFixParametersFromLineForWaypointType(line, waypointType) {
        switch (waypointType) {
            case WAYPOINT_TYPES.FIX:
                return this._getFixParametersFromLineForFix(line);

            case WAYPOINT_TYPES.NDB:
                return this._getFixParametersFromLineForNdb(line);

            case WAYPOINT_TYPES.VOR:
                return this._getFixParametersFromLineForVor(line);

            default:
                throw new TypeError(`Expected waypoint type of FIX / NDB / VOR, but received type ${waypointType}!`);
        }
    }

    _getFixParametersFromLineForAirport(line) {
        const elements = line.replaceAll(', ', ' | ').split(','); // handle quote-enclosed commas (some airport names have commas)
        const id = elements[1].trim().replaceAll('"', '');
        const lat = parseFloat(elements[4].trim().replaceAll('"', ''));
        const lon = parseFloat(elements[5].trim().replaceAll('"', ''));

        if (Number.isNaN(lat) || Number.isNaN(lon)) {
            debugger;
        }

        return { id, position: { lat, lon }, waypointType: WAYPOINT_TYPES.AIRPORT_FIX };
    }

    _getFixParametersFromLineForFix(line) {
        line = line.trim();
        const id = line.substr(0, 5).trim();
        const [latDms, lonDms] = line.substr(6).split(' ').filter(Boolean);
        const latDecimal = this._calculateDecimalLatOrLonFromSctDms(latDms.trim());
        const lonDecimal = this._calculateDecimalLatOrLonFromSctDms(lonDms.trim());

        return { id, position: { lat: latDecimal, lon: lonDecimal }, waypointType: WAYPOINT_TYPES.FIX };
    }

    _getFixParametersFromLineForNdb(line) {
        line = line.trim();
        const id = line.substr(0, 3).trim();
        const [latDms, lonDms] = line.substr(12).split(' ').filter(Boolean);
        const latDecimal = this._calculateDecimalLatOrLonFromSctDms(latDms.trim());
        const lonDecimal = this._calculateDecimalLatOrLonFromSctDms(lonDms.trim());

        return { id, position: { lat: latDecimal, lon: lonDecimal }, waypointType: WAYPOINT_TYPES.NDB };
    }

    _getFixParametersFromLineForVor(line) {
        line = line.trim();
        const id = line.substr(0, 3).trim();
        const [latDms, lonDms] = line.substr(12).split(' ').filter(Boolean);
        const latDecimal = this._calculateDecimalLatOrLonFromSctDms(latDms.trim());
        const lonDecimal = this._calculateDecimalLatOrLonFromSctDms(lonDms.trim());

        return { id, position: { lat: latDecimal, lon: lonDecimal }, waypointType: WAYPOINT_TYPES.VOR };
    }

    getFixWithName(fixName) {
        if (!(fixName in this._fixes)) {
            return undefined;
        }

        const itemsUsingThatName = this._fixes[fixName];

        if (!Array.isArray(itemsUsingThatName)) {
            return this._fixes[fixName];
        }

        if (itemsUsingThatName.some((item) => !(item instanceof Fix))) {
            console.log(fixName);
            console.log(this._fixes[fixName]);
            debugger;
        }

        // choose the appropriate type by priorities
        const vors = itemsUsingThatName.filter((item) => item.isVor());
        const ndbs = itemsUsingThatName.filter((item) => item.isNdb());
        const fixes = itemsUsingThatName.filter((item) => item.isFix());
        const airports = itemsUsingThatName.filter((item) => item.isAirportFix());
        const fixRetrievalPriorityOrder = [vors, ndbs, fixes, airports];
        const listOfPriorityTypedItems = fixRetrievalPriorityOrder.find((list) => list.length > 0);

        // if results are found but none are of any expected type
        if (typeof listOfPriorityTypedItems === 'undefined') {
            throw new TypeError(`Expected ${fixName} to be of type "VOR", "NDB",` +
                '"Intersection", or "Airport", but it is none of these!');
        }

        // if multiple instances of the highest priority type were found
        if (listOfPriorityTypedItems.length > 1) {
            console.warn(`Position for ${fixName} requested, but multiple ${listOfPriorityTypedItems[0]._type}s ` +
                `are defined for that name. Using: ${JSON.stringify(listOfPriorityTypedItems[0])}`);
        }

        return listOfPriorityTypedItems[0];
    }

    getAirportWithIcao(icao) {
        if (icao === '') {
            return undefined;
        }

        if (!(icao in this._airports)) {
            if (icao in this._fixes) {
                if (Array.isArray(this._fixes[icao])) {
                    console.info(`Attempted to get airport ${icao}, but there are no airport definitions` +
                        'and MULTIPLE listings of this identifier in the FIX list. Using the first one: ' +
                        `${JSON.stringify(this._fixes[icao][0])}`);

                    return this._fixes[icao][0];
                }

                console.info(`Attempted to get airport ${icao}, but there are no airport definitions for ` +
                    'it. Using the position defined for this airport found in the fix list: ' +
                    `${JSON.stringify(this._fixes[icao])}`);

                return this._fixes[icao];
            }

            console.warn(`Unable to find airport ${icao}`);

            return undefined;
        }

        return this._airports[icao];
    }

    /**
     * Calculate a decimal latitude (or longitude) value from the provided *.sct2 formatted value
     *
     * @for NavigationLibrary
     * @method _calculateDecimalLatOrLonFromSctDms
     * @param latOrLonDms {string} Degree-Minutes-Seconds-DecimalSeconds formatted latitude (or longitude), in *.sct2 format
     * @returns {number} latitude (or longitude), in decimal degrees
     * @private
     */
    _calculateDecimalLatOrLonFromSctDms(latOrLonDms) {
        const negativeCharacters = ['S', 'W'];
        const sign = negativeCharacters.some((char) => latOrLonDms.includes(char)) ? -1 : 1;
        const elements = latOrLonDms.replace(/[NnSsWwEe]/g, '').split('.');
        const deg = parseInt(elements[0], DECIMAL_RADIX);
        const min = parseInt(elements[1], DECIMAL_RADIX);
        const sec = parseFloat(`${elements[2]}.${elements[3]}`);
        const decimalDegrees = (deg + (min / 60) + (sec / 60 / 60)) * sign;

        return decimalDegrees;
    }
}

export default new NavigationLibrary();
