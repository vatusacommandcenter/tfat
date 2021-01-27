import { NAV_DATA } from './navigationData.js';
import { faaSectorData } from './NASR2SCT_Output/VRC/TestSectorFile.js';
import Fix from './Fix.js';
import Airport from './Airport.js';
import { DECIMAL_RADIX } from '../../globalConstants.js';
import { WAYPOINT_TYPES } from '../constants/routeConstants.js';

// NAVIGATION DATA SOURCES:
// Worldwide Data:
// Airports: airports.csv from... https://ourairports.com/data/
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
        this._airports = {}; // NAV_DATA.airports;
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

        // TODO: Is this a good way to do this? It will overwrite NDB-VOR duplicates, rather than including both!
        this._fixes = { ...ndbs, ...vors, ...fixes };
    }

    /**
     * Import Casey Dier's fixes
     *
     * @for NavigationLibrary
     * @method _initCaseyDierFixes
     * @returns undefined
     * @private
     */
    _initCaseyDierFixes() {
        const caseyDierFixList = {};

        for (const fixData of NAV_DATA.waypoints) {
            const fixName = fixData.id;

            // if another fix by this name already exists
            if (fixName in caseyDierFixList) {
                console.warn(`Multiple fixes named ${fixName}!`);

                // if multiple fixes by this name already exist, excluding this one
                if (Array.isArray(caseyDierFixList[fixName])) {
                    caseyDierFixList[fixName].push(new Fix(fixData));

                    continue;
                }

                caseyDierFixList[fixName] = [caseyDierFixList[fixName], new Fix(fixData)];

                continue;
            }

            caseyDierFixList[fixName] = new Fix(fixData);
        }

        this._fixes = caseyDierFixList;
    }

    _buildNavItems(faaSctData, waypointType) {
        const navItemList = {};

        const [id, lat, lon] = this._getElementsFromLineForWaypointType(line, waypointType);

        // FIXME: RESUME HERE

        const indices = {
            // for each type, point to: [ id, lat, lon ]
            FIX: [0, 1, 2],
            VOR: [0, 2, 3],
            NDB: [0, 2, 3]
        };

        for (let line of faaSctData) {
            line = line.split(';')[0].trim(); // remove comments and whitespace
            const elements = line.split(' ').filter(Boolean);

            if (elements.length < 3) {
                continue;
            }

            const navItemId = elements[indices[waypointType][0]];
            const latDms = elements[indices[waypointType][1]];
            const lonDms = elements[indices[waypointType][2]];
            const latDecimal = this._calculateDecimalLatOrLonFromSctDms(latDms);
            const lonDecimal = this._calculateDecimalLatOrLonFromSctDms(lonDms);
            const fixParams = {
                id: navItemId,
                position: { lat: latDecimal, lon: lonDecimal },
                type: waypointType
            };

            if (Number.isNaN(latDecimal) || Number.isNaN(lonDecimal)) {
                debugger;
                continue;
            }

            // if another fix by this name already exists
            if (navItemId in navItemList) {
                console.warn(`Multiple fixes named ${navItemId}!`);

                // if multiple fixes by this name already exist, excluding this one
                if (Array.isArray(navItemList[navItemId])) {
                    navItemList[navItemId].push(new Fix(fixParams));

                    continue;
                }

                navItemList[navItemId] = [navItemList[navItemId], new Fix(fixParams)];

                continue;
            }

            navItemList[navItemId] = new Fix(fixParams);
        }

        return navItemList;
    }

    getFixWithName(fixName) {
        if (!(fixName in this._fixes)) {
            return undefined;
        }

        const itemsUsingThatName = this._fixes[fixName];

        if (!Array.isArray(itemsUsingThatName)) {
            return this._fixes[fixName];
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
                    console.warn(`Attempted to get airport ${icao}, but there are no airport definitions` +
                        'and MULTIPLE listings of this identifier in the FIX list. Using the first one: ' +
                        `${JSON.stringify(this._fixes[icao][0])}`);

                    return this._fixes[icao][0];
                }

                console.warn(`Attempted to get airport ${icao}, but there are no airport definitions for ` +
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
