
import { browser } from 'k6/browser';
import { SharedArray } from 'k6/data';

import {
    baseUrl,
    assertWorkloadExecutionAllowed
} from '../../config/env.config.js';

import {
    getBrowserThresholds
} from '../../config/thresholds.config.js';

import {
    browserWorkload,
    browserProfileName
} from '../../config/workloads/browser.workload.js';

import {
    executeShoppingJourney
} from '../../src/browser/flows/shopping_journey.flow.js';

import {
    attachBrowserMonitoring
} from '../../src/browser/utils/browser_monitor.utils.js';

import {
    captureFailureScreenshot
} from '../../src/browser/utils/browser_screenshot.utils.js';

// Load product data once during initialization.
const products = new SharedArray('products', function () {
    return JSON.parse(open('../../data/products.json'));
});

if (products.length === 0) {
    throw new Error('No products found in data/products.json');
}

// Prevent unauthorized workloads before browser execution.
assertWorkloadExecutionAllowed(browserProfileName, 'browser');

export const options = {
    scenarios: {
        browser_shopping_journey: {
            ...browserWorkload,

            exec: 'browserShoppingJourney',

            // Browser configuration belongs inside scenario options.
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

    thresholds: getBrowserThresholds(browserProfileName)
};

export async function browserShoppingJourney() {

    const product = products[__ITER % products.length];

    // Create an isolated browser context for every iteration.
    const context = await browser.newContext({
        viewport: {
            width: 1366,
            height: 768
        }
    });

    const page = await context.newPage();

    attachBrowserMonitoring(page);

    try {
        await executeShoppingJourney(page, baseUrl, product);

    } catch (error) {

        console.error(
            `Browser journey failed. ` +
            `Profile: ${browserProfileName}, ` +
            `VU: ${__VU}, Iteration: ${__ITER}, ` +
            `Error: ${error.message}`
        );

        await captureFailureScreenshot(
            page,
            `browser-${browserProfileName}`
        );

        throw error;

    } finally {

        // Close the context to clean up pages, cookies and session state.
        await context.close();
    }
}
