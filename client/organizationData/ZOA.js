export const ZOA = {
    organizationName: 'Oakland ARTCC',
    keyAirports: ['KSFO', 'KSJC', 'KSMF', 'KOAK'],
    airportGroups: {
        NCT: ['KSFO', 'KSJC', 'KSMF', 'KOAK'],
        get ZOA() {
            return [...this.NCT];
        }
    },
    facilities: {
        center: {
            airspaceExclusionFacilities: [],
            facilityName: 'Oakland Center',
            defaultSectorConfiguration: {
                1: 1
            },
            sectors: {
                1: [
                    {
                        altitudes: [0, Infinity],
                        notes: 'excludes ZAK',
                        coordinates: [
                            [35.71972222, -119.9175833],
                            [35.75, -120.1166667],
                            [35.71666667, -120.2320833],
                            [35.69944444, -120.28825],
                            [35.5, -120.3333333],
                            [35.40277778, -120.5277778],
                            [35.40277778, -120.7083333],
                            [35.53333333, -120.85],
                            [35.37166667, -121.2373333],
                            [34.5, -123.25],
                            [34.91666667, -123.5333333],
                            [34.94166667, -123.55],
                            [35.46666667, -123.875],
                            [35.53333333, -123.9138889],
                            [36, -124.2],
                            [35.85138889, -124.6916667],
                            [35.75, -125.025],
                            [35.75333333, -125.0666667],
                            [35.73333333, -125.0833333],
                            [35.5, -125.8333333],
                            [35.59027778, -125.9348611],
                            [35.605, -125.9333056],
                            [35.60416667, -125.9509167],
                            [35.70833333, -126.075],
                            [35.74166667, -126.075],
                            [35.74166667, -126.1083333],
                            [36.45916667, -126.9296111],
                            [36.46472222, -126.9246667],
                            [36.46694444, -126.9333333],
                            [37.50055556, -127],
                            [37.50722222, -126.9916667],
                            [37.51194444, -127],
                            [37.84305556, -127],
                            [37.84861111, -126.9916667],
                            [37.85416667, -127],
                            [38.12527778, -127],
                            [38.13083333, -126.9916667],
                            [38.13638889, -127],
                            [38.46055556, -127],
                            [38.46638889, -126.9916667],
                            [38.47194444, -127],
                            [39.05805556, -127],
                            [39.06361111, -126.9916667],
                            [39.06916667, -127],
                            [39.225, -127],
                            [40, -127],
                            [40.00638889, -126.9916667],
                            [40.01194444, -127],
                            [40.14583333, -127],
                            [40.15138889, -126.9916667],
                            [40.15694444, -127],
                            [40.29333333, -127],
                            [40.29888889, -126.9916667],
                            [40.30444444, -127],
                            [40.61972222, -127],
                            [40.62527778, -126.9916667],
                            [40.63083333, -127],
                            [40.83333333, -127],
                            [40.98333333, -126.9],
                            [40.97222222, -126.875],
                            [40.46666667, -125.8333333],
                            [40.21666667, -125.3333333],
                            [40.21666667, -124.6666667],
                            [40.21666667, -123.8333333],
                            [40.3875, -123.5333333],
                            [41.33333333, -123.5333333],
                            [41.33333333, -122.7444444],
                            [41.33333333, -122.4166667],
                            [41.29166667, -122.275],
                            [41.21666667, -122],
                            [41.18277778, -121.8833333],
                            [41, -121.25],
                            [41, -121.1333333],
                            [41, -121.02375],
                            [41, -121],
                            [41.00027778, -120.8299167],
                            [41, -119.5],
                            [40.12111111, -117.7323889],
                            [39.93333333, -117.3666667],
                            [39.41666667, -117.3333333],
                            [39.20694444, -117.325],
                            [38.96888889, -117.3076944],
                            [38.77777778, -117.2916667],
                            [38.41305556, -117.2814722],
                            [38.29583333, -117.2780833],
                            [38.29555556, -117.3718889],
                            [37.88416667, -117.6336389],
                            [37.5, -117.5009167],
                            [37.2, -117.3333333],
                            [37.2, -118],
                            [37.15, -118],
                            [37.03333333, -118.3333333],
                            [37.2, -118.4333333],
                            [37.2, -118.58425],
                            [37.08055556, -118.5833333],
                            [36.7625, -118.5833333],
                            [36.57083333, -118.5833333],
                            [36.13333333, -118.5833333],
                            [36.13333333, -119],
                            [36.13333333, -119.0388889],
                            [36.13333333, -119.1666667],
                            [36.075, -119.2083333],
                            [35.82777778, -119.3722222],
                            [35.64527778, -119.4904167],
                            [35.66083333, -119.5765278],
                            [35.68444444, -119.7129444]
                        ]
                    }
                ]
            }
        }
    }
};