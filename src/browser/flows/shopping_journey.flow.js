
import { check } from 'k6';
import { Trend } from 'k6/metrics';

import { HomePage } from '../pages/home.page.js';
import { SearchPage } from '../pages/search.page.js';
import { ProductDetailsPage } from '../pages/product_details.page.js';
import { CartPage } from '../pages/cart.page.js';

const shoppingJourneyDuration = new Trend(
    'browser_shopping_journey_duration',
    true
);

// A failed validation should stop the current journey.
function verify(value, description, predicate) {
    const passed = check(value, {
        [description]: predicate
    });

    if (!passed) {
        throw new Error(`Shopping journey validation failed: ${description}`);
    }
}

export async function executeShoppingJourney(
    page,
    baseUrl,
    product
) {
    const startTime = Date.now();

    try {
        const homePage = new HomePage(page);
        const searchPage = new SearchPage(page);
        const productDetailsPage = new ProductDetailsPage(page);
        const cartPage = new CartPage(page);

        // 1. Open homepage
        await homePage.open(baseUrl);

        const searchVisible =
            await homePage.isSearchInputVisible();

        verify(
            searchVisible,
            'Homepage search field is visible',
            value => value === true
        );

        // 2. Search product
        await homePage.searchProduct(product.productName);

        const productPresent =
            await searchPage.isProductPresent(product.productName);

        verify(
            productPresent,
            'Expected product appears in search results',
            value => value === true
        );

        // 3. Open product details
        await searchPage.openProduct(product.productId);

        await productDetailsPage.waitForProductDetails();

        const actualProductName =
            await productDetailsPage.getProductName();

        verify(
            actualProductName,
            'Product details show the expected product',
            value =>
                typeof value === 'string' &&
                value.trim() === product.productName
        );

        // 4. Check Add to Cart button
        const addToCartEnabled =
            await productDetailsPage.isAddToCartButtonEnabled();

        verify(
            addToCartEnabled,
            'Add to Cart button is enabled',
            value => value === true
        );

        // 5. Set quantity and add product
        await productDetailsPage.setQuantity(product.quantity);
        await productDetailsPage.addToCart();

        await productDetailsPage.waitForAddToCartSuccess();

        const successMessage =
            await productDetailsPage.getSuccessMessage();

        verify(
            successMessage,
            'Add to Cart success notification is displayed',
            value =>
                typeof value === 'string' &&
                value.includes(product.productName)
        );

        // 6. Open cart
        await cartPage.open(baseUrl);
        await cartPage.waitForCartPage();

        const cartText = await cartPage.getCartText();

        verify(
            cartText,
            'Shopping cart contains expected product',
            value =>
                typeof value === 'string' &&
                value.includes(product.productName)
        );

        // 7. Validate quantity
        const quantityVisible =
            await cartPage.isQuantityFieldVisible();

        verify(
            quantityVisible,
            'Cart quantity field is visible',
            value => value === true
        );

        const actualQuantity =
            await cartPage.getProductQuantity();

        verify(
            actualQuantity,
            'Cart quantity matches requested quantity',
            value => value === String(product.quantity)
        );

        // 8. Validate cart route
        const currentUrl = await cartPage.getCurrentUrl();

        verify(
            currentUrl,
            'Shopping cart route is displayed',
            url => url.includes('route=checkout/cart')
        );

    } finally {
        shoppingJourneyDuration.add(
            Date.now() - startTime,
            { journey: 'complete_shopping_journey' }
        );
    }
}
