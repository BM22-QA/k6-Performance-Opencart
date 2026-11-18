
import { browser } from 'k6/browser';
import { SharedArray } from 'k6/data';

import {
    baseUrl,
    assertExecutionAllowed
} from '../../config/env.config.js';

import {
    executeProductDetailsJourney
} from '../../src/browser/flows/product_details.flow.js';

const products = new SharedArray('products', function () {
    return JSON.parse(open('../../data/products.json'));
});

if (products.length === 0) {
    throw new Error('No products found in data/products.json');
}

assertExecutionAllowed();

export const options = {
    scenarios: {
        product_details_browser: {
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
        checks: ['rate==1.0'],
        browser_product_details_journey_duration: [
            'p(95)<15000'
        ]
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
        await executeProductDetailsJourney(
            page,
            baseUrl,
            products[0]
        );
    } finally {
        await page.close();
    }
}
