import { CLOCK_UPDATE_INTERVAL } from './clientConstants.js';

export default class ClockView {
    constructor() {
        this._timeout = null;
        this.$clockElement = null;

        this._init();
    }

    _init() {
        this.$clockElement = document.getElementById('clock');
    }

    enable() {
        this.updateClock();

        this._timeout = setInterval(() => this.updateClock(), CLOCK_UPDATE_INTERVAL);
    }

    disable() {
        this._timeout.clearTimeout();

        this.$clockElement.innerText = 'XX:XX:XXz';
    }

    updateClock() {
        const date = new Date();
        const hr = date.getUTCHours().toString().padStart(2, '0');
        const min = date.getUTCMinutes().toString().padStart(2, '0');
        const sec = date.getUTCSeconds().toString().padStart(2, '0');
        const currentTime = `${hr}:${min}:${sec} z`;
        this.$clockElement.innerHTML = currentTime;
    }
}
