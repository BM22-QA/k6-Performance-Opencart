
function getPositiveNumber(envName, defaultValue) {
    const value = Number(__ENV[envName] || defaultValue);

    if (!Number.isFinite(value) || value <= 0) {
        throw new Error(`${envName} must be a positive number.`);
    }

    return value;
}

// Initial example targets.
// Confirm these with the application owner before treating them as SLOs.
const API_P95_MS = getPositiveNumber('API_P95_MS', 800);
const API_P99_MS = getPositiveNumber('API_P99_MS', 1500);

const BROWSER_JOURNEY_P95_MS =
    getPositiveNumber('BROWSER_JOURNEY_P95_MS', 30000);

const BROWSER_LCP_P75_MS =
    getPositiveNumber('BROWSER_LCP_P75_MS', 2500);

const BROWSER_CLS_P75 =
    getPositiveNumber('BROWSER_CLS_P75', 0.1);

// API thresholds
export function getApiThresholds(profileName) {
    const thresholds = {
        'checks{scenario:api_product_search}': [
            'rate>0.99'
        ],

        'http_req_failed{scenario:api_product_search}': [
            'rate<0.01'
        ],

        'dropped_iterations{scenario:api_product_search}': [
            'count==0'
        ]
    };

    // A single smoke iteration is not enough for meaningful percentiles.
    if (profileName !== 'smoke') {
        thresholds[
            'http_req_duration{scenario:api_product_search,name:product_search}'
        ] = [
            `p(95)<${API_P95_MS}`,
            `p(99)<${API_P99_MS}`
        ];
    }

    return thresholds;
}

// Browser thresholds
export function getBrowserThresholds(profileName) {
    const thresholds = {
        'checks{scenario:browser_shopping_journey}': [
            'rate==1.0'
        ],

        browser_http_req_failed: [
            'rate<0.01'
        ],

        'dropped_iterations{scenario:browser_shopping_journey}': [
            'count==0'
        ]
    };

    if (profileName !== 'smoke') {
        thresholds.browser_shopping_journey_duration = [
            `p(95)<${BROWSER_JOURNEY_P95_MS}`
        ];

        thresholds.browser_web_vital_lcp = [
            `p(75)<${BROWSER_LCP_P75_MS}`
        ];

        thresholds.browser_web_vital_cls = [
            `p(75)<${BROWSER_CLS_P75}`
        ];
    }

    return thresholds;
}

// Hybrid thresholds combine both independent sets.
export function getHybridThresholds(
    apiProfileName,
    browserProfileName
) {
    return {
        ...getApiThresholds(apiProfileName),
        ...getBrowserThresholds(browserProfileName)
    };
}
