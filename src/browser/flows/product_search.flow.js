
import { check } from 'k6';
import { Trend } from 'k6/metrics';

import { HomePage } from '../pages/home.page.js';
import { SearchPage } from '../pages/search.page.js';

const productSearchDuration = new Trend(
    'browser_product_search_duration',
    true
);

export async function executeProductSearch(
    page,
    baseUrl,
    productName
) {

    const startTime = Date.now();

    try {

        const homePage = new HomePage(page);
        const searchPage = new SearchPage(page);

        // Step 1: Open homepage
        await homePage.open(baseUrl);

        // Step 2: Validate search field
        const searchVisible =
            await homePage.isSearchInputVisible();

        check(searchVisible, {
            'Homepage search field is visible': value =>
                value === true
        });

        if (!searchVisible) {
            return;
        }

        // Step 3: Search for product
        await homePage.searchProduct(productName);

        // Step 4: Validate search results
        const productPresent =
            await searchPage.isProductPresent(productName);

        check(productPresent, {
            'Product exists in search results': value =>
                value === true
        });

        const currentUrl =
            await searchPage.getCurrentUrl();

        check(currentUrl, {
            'Search route is displayed': url =>
                url.includes('route=product/search')
        });

    } finally {

        productSearchDuration.add(
            Date.now() - startTime,
            {
                journey: 'product_search'
            }
        );

    }
}
