
import { browser } from 'k6/browser';

import {
    baseUrl,
    assertExecutionAllowed
} from '../../config/env.config.js';

import {
    executeProductSearch
} from '../../src/browser/flows/product_search.flow.js';

assertExecutionAllowed();

export const options = {

    scenarios: {

        product_search_browser: {

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

        await executeProductSearch(
            page,
            baseUrl,
            'MacBook'
        );

    } finally {

        await page.close();

    }

}
