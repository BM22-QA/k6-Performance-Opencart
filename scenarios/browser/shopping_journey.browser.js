
import { browser } from 'k6/browser';
import { SharedArray } from 'k6/data';

import {
    baseUrl,
    assertExecutionAllowed
} from '../../config/env.config.js';

import {
    executeShoppingJourney
} from '../../src/browser/flows/shopping_journey.flow.js';

import {
    attachBrowserMonitoring
} from '../../src/browser/utils/browser_monitor.utils.js';

import {
    captureFailureScreenshot
} from '../../src/browser/utils/browser_screenshot.utils.js';

// Load test data once during initialization
const products = new SharedArray('products', function () {
    return JSON.parse(open('../../data/products.json'));
});

assertExecutionAllowed();

export const options = {
    scenarios: {
        complete_shopping_journey: {
            executor: 'shared-iterations',
            vus: 1,
            iterations: 1,
            options: {
                browser: {
                    type: 'chromium'
                }
            }
        }
    },

    thresholds: {
        checks: ['rate==1.0']
    }
};

export default async function () {

    const page = await browser.newPage({
        viewport: {
            width: 1366,
            height: 768
        }
    });

    // Register monitoring before navigating
    attachBrowserMonitoring(page);

    try {
        await executeShoppingJourney(
            page,
            baseUrl,
            products[0]
        );

    } catch (error) {

        console.error(
            `Shopping journey failed: ${error.message}`
        );

        await captureFailureScreenshot(
            page,
            'shopping-journey'
        );

        throw error;

    } finally {

        // Always close the page to release resources
        await page.close();
    }
}
