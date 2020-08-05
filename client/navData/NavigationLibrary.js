import { NAV_DATA } from './navigationData.js';

export default class NavigationLibrary {
    constructor() {
        this._airportInfo = NAV_DATA.airportInfo;
        this._airports = NAV_DATA.airports;
        this._airways = [];
        this._sids = [];
        this._stars = [];
        this._waypointInfo = NAV_DATA.waypointInfo;
        this._fixes = NAV_DATA.waypoints;

        this._initFixes();
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

        for (const fix of this._fixes) {
            const fixName = fix.id;

            // if another fix by this name already exists
            if (fixName in nextFixList) {
                console.warn(`Multiple fixes named ${fixName}!`);

                // if multiple fixes by this name already exist, excluding this one
                if (Array.isArray(nextFixList[fixName])) {
                    nextFixList[fixName].push(fix);

                    continue;
                }

                nextFixList[fixName] = [nextFixList[fixName], fix];

                continue;
            }

            nextFixList[fixName] = fix;
        }

        this._fixes = nextFixList;
        this.getPositionOfFix('XXXXX');
        this.getPositionOfFix('HEDLY');
        this.getPositionOfFix('MOS');
    }

    getPositionOfFix(fixName) {
        if (!(fixName in this._fixes)) {
            return undefined;
        }

        const itemsUsingThatName = this._fixes[fixName];

        if (!Array.isArray(itemsUsingThatName)) {
            return this._fixes[fixName];
        }

        // choose the appropriate type by priorities
        const vors = itemsUsingThatName.filter((item) => item.type === 'VOR');
        const intersections = itemsUsingThatName.filter((item) => item.type === 'Intersection');
        const airports = itemsUsingThatName.filter((item) => item.type === 'Airport');
        const fixRetrievalPriorityOrder = [vors, intersections, airports];
        const listOfPriorityTypedItems = fixRetrievalPriorityOrder.find((list) => list.length > 0);

        // if results are found but none are of any expected type
        if (typeof listOfPriorityTypedItems === 'undefined') {
            throw new TypeError(`Expected ${fixName} to be of type "VOR", ` +
                '"Intersection", or "Airport", but it is none of these!');
        }

        // if multiple instances of the highest priority type were found
        if (listOfPriorityTypedItems.length > 1) {
            console.warn(`Position for ${fixName} requested, but multiple ${listOfPriorityTypedItems[0].type}s ` +
                `are defined for that name. Using: ${JSON.stringify(listOfPriorityTypedItems[0])}`);
        }

        return listOfPriorityTypedItems[0];
    }
}
