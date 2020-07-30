/* eslint-disable max-len */
export const DESTINATION_GROUP = {
    MIA: ['07FA', 'KFLL', 'KFXE', 'KHST', 'KHWO', 'KMIA', 'KOPF', 'KPMP', 'KTMB', 'KTNT', 'X51'],
    TPA: ['22FA', '48X', '5FD7', 'FA40', 'KBKV', 'KBOW', 'KCLW', 'KGIF', 'KLAL', 'KMCF', 'KPCM', 'KPIE', 'KSPG', 'KSRQ', 'KTPA', 'KTPF', 'KVDF', 'KVNC', 'KZPH', 'X05', 'X39', 'X49'],
    PBI: ['06FA', '64FA', '80FD', 'F45', 'FA24', 'FA69', 'FD15', 'FD30', 'FD38', 'FD88', 'FL67', 'KBCT', 'KFPR', 'KLNA', 'KPBI', 'KPHK', 'KSUA', 'KVRB', 'X10', 'X26', 'X58'],
    RSW: ['6FL3', '94FL', 'F13', 'FA37', 'FA54', 'FL59', 'KAPF', 'KFMY', 'KIMM', 'KMKY', 'KPGD', 'KRSW', 'X14', 'X36'],
    NQX: ['7FA1', 'FD51', 'KEYW', 'KNQX'],
    F11: ['21FA', '57FA', 'FA83', 'KCOF', 'KCOI', 'KISM', 'KLEE', 'KMCO', 'KMLB', 'KORL', 'KSFB', 'KTIX', 'KTTS', 'KXMR', 'X04', 'X21', 'X23', 'X55', 'X59', 'X61'],
    JAX: ['01J', '0J8', '10FA', '17FL', '28J', '2CB', '3FL0', '3J6', '42J', '6J8', '83FL', 'FA09', 'FA36', 'FA38', 'FD22', 'FD48', 'FL03', 'FL54', 'FL60', 'KCGC', 'KCRG', 'KFHB', 'KGNV', 'KHEG', 'KINF', 'KJAX', 'KNEN', 'KNIP', 'KNRB', 'KOCF', 'KSGJ', 'KVQQ', 'X35', 'X60'],
    MYGF: ['MYGF', 'MYGW'],
    DAB: ['2J8', '7FL6', 'KDAB', 'KDED', 'KEVB', 'KFIN', 'KOMN', 'KXFL', 'X50'],
    MYNN: ['MYAF', 'MYEH', 'MYER', 'MYNN'],
    MBPV: ['MBAC', 'MBGT', 'MBNC', 'MBPI', 'MBPV', 'MBSC', 'MBSY']
};
/* eslint-enable max-len */

/**
 * Interval (milliseconds) upon which the client will repeatedly request new pilot
 * data from the server
 *
 * @enum DATA_UPDATE_INTERVAL
 * @type {number} - milliseconds between subsequent requests for new data
 * @default 10000 (10 seconds)
 */
export const DATA_UPDATE_INTERVAL = 500000000;

/**
 * Interval (milliseconds) upon which the client will update the clock time
 *
 * @enum CLOCK_UDPATE_INTERVAL
 * @type {number} - milliseconds between updating the time displayed on the clock
 * @default 1000
 */
export const CLOCK_UPDATE_INTERVAL = 1000;