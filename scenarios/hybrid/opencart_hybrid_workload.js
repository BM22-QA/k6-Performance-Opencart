
import { browser } from 'k6/browser';
import { SharedArray } from 'k6/data';
import { sleep } from 'k6';

import {
    baseUrl,
    assertHybridExecutionAllowed
} from '../../config/env.config.js';

import {
    getHybridThresholds
} from '../../config/thresholds.config.js';

import {
    apiWorkload,
    apiProfileName
} from '../../config/workloads/api.workload.js';

import {
    browserWorkload,
    browserProfileName
} from '../../config/workloads/browser.workload.js';

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

// Load shared product data once during initialization.
const products = new SharedArray('products', function () {
    return JSON.parse(open('../../data/products.json'));
});

if (products.length === 0) {
    throw new Error('No products found in data/products.json');
}

// Start both scenarios together by default.
// Set BROWSER_START_TIME to stagger the browser workload if required.
const browserStartTime = __ENV.BROWSER_START_TIME || '0s';

// Validate both profiles and the environment permissions.
assertHybridExecutionAllowed(apiProfileName, browserProfileName);

export const options = {
    scenarios: {

        // Scenario 1: Backend HTTP workload
        api_product_search: {
            ...apiWorkload,

            exec: 'apiProductSearch',

            startTime: '0s',

            tags: {
                test_layer: 'api',
                workload_profile: apiProfileName
            }
        },

        // Scenario 2: Real Chromium browser workload
        browser_shopping_journey: {
            ...browserWorkload,

            exec: 'browserShoppingJourney',

            startTime: browserStartTime,

            options: {
                browser: {
                    type: 'chromium'
                }
            },

            tags: {
                test_layer: 'browser',
                workload_profile: browserProfileName
            }
        }
    },

    thresholds: getHybridThresholds(
    apiProfileName,
    browserProfileName
)
};

// API workload function
export function apiProductSearch() {

    const product = products[__ITER % products.length];

    executeApiProductSearch(product);

    // Think time for closed-model constant-VU workload.
    // Do not add this delay to arrival-rate executors.
    if (apiWorkload.executor === 'constant-vus') {
        sleep(1);
    }
}

// Browser workload function
export async function browserShoppingJourney() {

    const product = products[__ITER % products.length];

    const context = await browser.newContext({
        viewport: {
            width: 1366,
            height: 768
        }
    });

    let page;

    try {

        page = await context.newPage();

        attachBrowserMonitoring(page);

        await executeShoppingJourney(
            page,
            baseUrl,
            product
        );

        // Simulate a small user think time between journeys.
        sleep(2);

    } catch (error) {

        console.error(
            `Browser journey failed. ` +
            `Profile: ${browserProfileName}, ` +
            `VU: ${__VU}, ` +
            `Iteration: ${__ITER}, ` +
            `Error: ${error.message}`
        );

        if (page) {
            await captureFailureScreenshot(
                page,
                'hybrid-browser'
            );
        }

        throw error;

    } finally {

        // Close the context and all associated pages.
        await context.close();
    }
}
