
import { check } from 'k6';
import { Trend } from 'k6/metrics';

import { HomePage } from '../pages/home.page.js';
import { SearchPage } from '../pages/search.page.js';
import { ProductDetailsPage } from '../pages/product_details.page.js';

const productDetailsJourneyDuration = new Trend(
    'browser_product_details_journey_duration',
    true
);

export async function executeProductDetailsJourney(
    page,
    baseUrl,
    product
) {
    const startTime = Date.now();

    try {
        const homePage = new HomePage(page);
        const searchPage = new SearchPage(page);
        const productDetailsPage = new ProductDetailsPage(page);

        // Step 1: Open homepage
        await homePage.open(baseUrl);

        const searchVisible = await homePage.isSearchInputVisible();

        check(searchVisible, {
            'Homepage search field is visible': value => value === true
        });

        if (!searchVisible) {
            return;
        }

        // Step 2: Search for product
        await homePage.searchProduct(product.productName);

        const productPresent = await searchPage.isProductPresent(
            product.productName
        );

        check(productPresent, {
            'Product is displayed in search results': value => value === true
        });

        if (!productPresent) {
            return;
        }

        // Step 3: Open product details
        await searchPage.openProduct(product.productId);

        await productDetailsPage.waitForProductDetails();

        // Step 4: Validate product heading
        const headingVisible =
            await productDetailsPage.isProductHeadingVisible();

        check(headingVisible, {
            'Product details heading is visible': value => value === true
        });

        const actualProductName =
            await productDetailsPage.getProductName();

        check(actualProductName, {
            'Product name matches expected product': value =>
                value !== null &&
                value.trim().includes(product.productName)
        });

        // Step 5: Validate Add to Cart button
        const addToCartVisible =
            await productDetailsPage.isAddToCartButtonVisible();

        check(addToCartVisible, {
            'Add to Cart button is visible': value => value === true
        });

        // Step 6: Validate product details URL
        const currentUrl =
            await productDetailsPage.getCurrentUrl();

        check(currentUrl, {
            'Product details route is displayed': url =>
                url.includes('route=product/product') &&
                url.includes(`product_id=${product.productId}`)
        });

    } finally {
        productDetailsJourneyDuration.add(
            Date.now() - startTime,
            { journey: 'search_to_product_details' }
        );
    }
}
