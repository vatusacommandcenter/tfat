import Sector from './Sector.js';

export default class SectorCollection {
    constructor(sectorsData) {
        this._sectors = [];

        this._init(sectorsData);
    }

    _init(sectorsData) {
        for (const sectorId in sectorsData) {
            const sectorData = sectorsData[sectorId];
            const sector = new Sector(sectorId, sectorData);

            this._sectors.push(sector);
        }
    }
}

// const sectorCollection = {
//     20: new Sector(centerSectors[20]),
//     23: new Sector(centerSectors[23]),
//     46: new Sector(centerSectors[46])
// };
