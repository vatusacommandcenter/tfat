import { NAV_DATA } from './navigationData.js';
import Fix from './Fix.js';
import Airport from './Airport.js';

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
        const nextFixList = {};

        for (const fixData of NAV_DATA.waypoints) {
            const fixName = fixData.id;

            // if another fix by this name already exists
            if (fixName in nextFixList) {
                console.warn(`Multiple fixes named ${fixName}!`);

                // if multiple fixes by this name already exist, excluding this one
                if (Array.isArray(nextFixList[fixName])) {
                    nextFixList[fixName].push(new Fix(fixData));

                    continue;
                }

                nextFixList[fixName] = [nextFixList[fixName], new Fix(fixData)];

                continue;
            }

            nextFixList[fixName] = new Fix(fixData);
        }

        this._fixes = nextFixList;
        this.getFixWithName('XXXXX');
        this.getFixWithName('HEDLY');
        this.getFixWithName('MOS');
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
}

export default new NavigationLibrary();
