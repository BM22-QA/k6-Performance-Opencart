
import { SharedArray } from 'k6/data';

import {
    assertWorkloadExecutionAllowed
} from '../../config/env.config.js';

import {
    workload
} from '../../config/workload.config.js';

import {
    executeShoppingJourney
} from '../../src/flows/shopping.flow.js';

// Validate the selected API profile and environment permissions.
assertWorkloadExecutionAllowed(workload.testType, 'api');

const products = new SharedArray('products', function () {
    return JSON.parse(open('../../data/products.json'));
});

if (products.length === 0) {
    throw new Error('No product data available.');
}

export const options = {

    scenarios: {

        shopping_journey: {
            ...workload.scenario
        }

    },

    thresholds: {

        http_req_failed: ['rate<0.01'],

        checks: ['rate>0.99']

    }

};

export default function () {

    const product = products[__ITER % products.length];

    executeShoppingJourney(product);

}
