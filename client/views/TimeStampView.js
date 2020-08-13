import { CLOCK_UPDATE_INTERVAL } from './clientConstants.js';
import { generateDateFromVatsimTimestamp } from '../server/serverUtilities.js';

export default class TimeStampView {
    constructor() {
        this.$timeStampElement = null;
        this._timeout = null;
        this._vatsimDate = 0;
        this._timeStampText = '';
        this._ageOfData = '';

        this._init();
    }

    _init() {
        this.$timeStampElement = document.getElementById('vatsim-data-time-stamp');
    }

    enable() {
        this.updateTimeStampAge();

        this._timeout = setInterval(() => this.updateTimeStampAge(), CLOCK_UPDATE_INTERVAL);
    }

    disable() {
        this._timeout.clearTimeout();

        this.$timeStampElement.innerText = 'Last updated: XX:XXz (XX min old)';
    }

    /**
     * Sets the data time stamp element to show the specified date and time
     *
     * @for TimeStampView
     * @method updateTimeStampFromVatsimDate
     * @param {number} vatsimDate - date/time, as provided in VATSIM data file
     */
    updateTimeStampFromVatsimDate(vatsimDate) {
        if (typeof vatsimDate !== 'number' || vatsimDate < 20200731013152) {
            throw new TypeError(`Expected valid timestamp, but received: ${vatsimDate}`);
        }

        this._vatsimDate = vatsimDate;
        this._ageOfData = this._calculateAgeOfData();
        const date = String(vatsimDate);
        const formattedTime = `${date.substr(8, 2)}:${date.substr(10, 2)}`;
        const nextTimeStampText = `Last updated: ${formattedTime}z`;
        const totalTextToDisplay = `${nextTimeStampText}${this._ageOfData}`;

        this._timeStampText = nextTimeStampText;
        this.$timeStampElement.innerText = totalTextToDisplay;
    }

    updateTimeStampAge() {
        this._ageOfData = this._calculateAgeOfData();
        this.$timeStampElement.innerText = `${this._timeStampText}${this._ageOfData}`;
    }

    _calculateAgeOfData() {
        const dataDate = generateDateFromVatsimTimestamp(this._vatsimDate);
        const ageOfDataInMinutes = (Date.now() - dataDate) / 60000;
        let ageText = ' (<1 min old)';

        if (ageOfDataInMinutes >= 1) {
            const roundedAge = Math.round(ageOfDataInMinutes);
            ageText = ` (${roundedAge} min old)`;
        }

        return ageText;
    }
}
