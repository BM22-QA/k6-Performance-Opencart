
import { browser } from 'k6/browser';
import { SharedArray } from 'k6/data';
import { sleep } from 'k6';

import {
    getHybridThresholds
} from '../../config/thresholds.config.js';

import {
    baseUrl,
    assertHybridExecutionAllowed
} from '../../config/env.config.js';

import {
    executeApiProductSearch
} from '../../src/flows/api_product_search.flow.js';

import {
    executeShoppingJourney
} from '../../src/browser/flows/shopping_journey.flow.js';

import {
    attachBrowserMonitoring
} from '../../src/browser/utils/browser_monitor.utils.js';

import {
    captureFailureScreenshot
} from '../../src/browser/utils/browser_screenshot.utils.js';

// Load product data once during initialization
const products = new SharedArray('products', function () {
    return JSON.parse(open('../../data/products.json'));
});

// Configure API workload
const apiVUs = Number(__ENV.API_VUS || 5);
const apiDuration = __ENV.API_DURATION || '1m';

if (!Number.isInteger(apiVUs) || apiVUs < 1 || apiVUs > 100) {
    throw new Error('API_VUS must be an integer between 1 and 100.');
}

const customApiWorkload =
    apiVUs > 5 ||
    apiDuration !== '1m';

// Custom or larger hybrid API workloads require explicit high-risk approval.
assertHybridExecutionAllowed(
    customApiWorkload ? 'stress' : 'baseline',
    'smoke'
);

export const options = {
    scenarios: {

        // Scenario 1: Protocol-level API workload
        api_product_search: {
            executor: 'constant-vus',
            exec: 'apiProductSearch',
            vus: apiVUs,
            duration: apiDuration,
            gracefulStop: '10s',

            tags: {
                test_layer: 'api',
                workload_type: 'protocol'
            }
        },

        // Scenario 2: Real browser customer journey
        browser_shopping_journey: {
            executor: 'shared-iterations',
            exec: 'browserShoppingJourney',
            vus: 1,
            iterations: 1,
            startTime: '10s',
            maxDuration: '2m',

            tags: {
                test_layer: 'browser',
                workload_type: 'ui'
            }
        }
    },

    thresholds: {
        ...getHybridThresholds('smoke', 'smoke'),
        checks: ['rate==1.0'],

        'http_req_failed{test_layer:api}': [
            'rate<0.01'
        ]
    }
};

// API scenario function
export function apiProductSearch() {
    const product = products[0];

    executeApiProductSearch(product);

    // Simulate a one-second pause between user actions
    sleep(1);
}

// Browser scenario function
export async function browserShoppingJourney() {
    const product = products[0];

    const page = await browser.newPage({
        viewport: {
            width: 1366,
            height: 768
        }
    });

    attachBrowserMonitoring(page);

    try {
        await executeShoppingJourney(
            page,
            baseUrl,
            product
        );

    } catch (error) {

        console.error(
            `Browser shopping journey failed: ${error.message}`
        );

        await captureFailureScreenshot(
            page,
            'hybrid-shopping-journey'
        );

        throw error;

    } finally {
        await page.close();
    }
}
