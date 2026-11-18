
import { browser } from 'k6/browser';
import { SharedArray } from 'k6/data';

import {
    baseUrl,
    assertExecutionAllowed
} from '../../config/env.config.js';

import {
    executeAddToCartJourney
} from '../../src/browser/flows/add_to_cart.flow.js';

// Load product data once during initialization
const products = new SharedArray('products', function () {
    return JSON.parse(open('../../data/products.json'));
});

assertExecutionAllowed();

export const options = {
    scenarios: {
        add_to_cart_browser: {
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

    try {
        await executeAddToCartJourney(
            page,
            baseUrl,
            products[0]
        );
    } finally {
        await page.close();
    }
}
