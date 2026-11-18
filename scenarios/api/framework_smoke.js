
import { check } from 'k6';

import { get } from '../../src/clients/http.client.js';

import {
    env,
    assertExecutionAllowed
} from '../../config/env.config.js';

// Check whether this execution is permitted.
assertExecutionAllowed();

export const options = {
    vus: 1,
    iterations: 1,

    thresholds: {
        http_req_failed: ['rate<0.01'],
        checks: ['rate>0.90']
    }
};

export default function () {

    console.log(`Environment: ${env.name}`);

    const response = get(
        '/index.php?route=product/search&search=MacBook',
        {
            tags: {
                name: 'product_search'
            }
        }
    );

    check(response, {

        'HTTP status is 200': (res) =>
            res.status === 200,

        'Response content type is HTML': (res) =>
            (res.headers['Content-Type'] || '')
                .toLowerCase()
                .includes('text/html'),

        'Response contains MacBook': (res) =>
            res.body && res.body.includes('MacBook')

    });

}
