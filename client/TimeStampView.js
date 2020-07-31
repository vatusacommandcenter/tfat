export default class TimeStampView {
    constructor() {
        this.$timeStampElement = null;

        this._init();
    }

    _init() {
        this.$timeStampElement = document.getElementById('vatsim-data-time-stamp');
    }

    /**
     * Sets the data time stamp element to show the specified date and time
     *
     * @for TimeStampView
     * @method setTimeStampFromVatsimDate
     * @param {number} vatsimDate - date/time, as provided in VATSIM data file
     */
    setTimeStampFromVatsimDate(vatsimDate) {
        if (typeof vatsimDate !== 'number' || vatsimDate < 20200731013152) {
            throw new TypeError(`Expected valid timestamp, but received: ${vatsimDate}`);
        }

        const date = String(vatsimDate);
        const formattedTime = `${date.substr(8, 2)}:${date.substr(10, 2)}`;
        const nextTimeStampText = `Last updated: ${formattedTime}z`;

        this.$timeStampElement.innerText = nextTimeStampText;
    }
}
