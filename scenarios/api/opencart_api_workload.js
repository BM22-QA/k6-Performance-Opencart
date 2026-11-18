
import { SharedArray } from 'k6/data';
import { sleep } from 'k6';

import {apiWorkload, apiProfileName} from '../../config/workloads/api.workload.js';

import { getApiThresholds} from '../../config/thresholds.config.js';

import {assertWorkloadExecutionAllowed} from '../../config/env.config.js';

import {executeApiProductSearch} from '../../src/flows/api_product_search.flow.js';

// Load test data once during initialization.
const products = new SharedArray('products', function () {
    return JSON.parse(open('../../data/products.json'));
});

if (products.length === 0) {
    throw new Error('No products found in data/products.json');
}

// Validate permissions before executing any workload.
assertWorkloadExecutionAllowed(apiProfileName, 'api');

export const options = {
    scenarios: {
        api_product_search: {
            ...apiWorkload,

            exec: 'apiProductSearch',

            tags: {
                test_layer: 'api',
                workload_profile: apiProfileName
            }
        }
    },

    thresholds: getApiThresholds(apiProfileName)
};

export function apiProductSearch() {
    const product = products[__ITER % products.length];

    executeApiProductSearch(product);

    // Simulate a small think time for the closed VU-based baseline profile.
    // Arrival-rate profiles control iteration starts independently.
    if (apiWorkload.executor === 'constant-vus') {
        sleep(1);
    }
}
