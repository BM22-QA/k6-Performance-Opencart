
import { check } from 'k6';
import { Trend } from 'k6/metrics';

import { HomePage } from '../pages/home.page.js';
import { SearchPage } from '../pages/search.page.js';
import { ProductDetailsPage } from '../pages/product_details.page.js';
import { CartPage } from '../pages/cart.page.js';

const addToCartJourneyDuration = new Trend(
    'browser_add_to_cart_journey_duration',
    true
);

export async function executeAddToCartJourney(
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

        // Step 1: Open homepage
        await homePage.open(baseUrl);

        const searchVisible =
            await homePage.isSearchInputVisible();

        check(searchVisible, {
            'Homepage search field is visible': value => value === true
        });

        if (!searchVisible) return;

        // Step 2: Search product
        await homePage.searchProduct(product.productName);

        const productPresent =
            await searchPage.isProductPresent(product.productName);

        check(productPresent, {
            'Product is displayed in search results': value => value === true
        });

        if (!productPresent) return;

        // Step 3: Open product details
        await searchPage.openProduct(product.productId);

        await productDetailsPage.waitForProductDetails();

        const actualProductName =
            await productDetailsPage.getProductName();

        check(actualProductName, {
            'Correct product details are displayed': value =>
                value !== null &&
                value.trim().includes(product.productName)
        });

        // Step 4: Set product quantity
        await productDetailsPage.setQuantity(product.quantity);

        // Step 5: Add product to cart
        await productDetailsPage.addToCart();

        await productDetailsPage.waitForAddToCartSuccess();

        const successMessage =
            await productDetailsPage.getSuccessMessage();

        check(successMessage, {
            'Add to Cart success notification is displayed': value =>
                value !== null &&
                value.includes(product.productName)
        });

        // Step 6: Open shopping cart
        await cartPage.open(baseUrl);

        await cartPage.waitForCartPage();

        // Step 7: Validate cart product
        const cartText = await cartPage.getCartText();

        check(cartText, {
            'Shopping cart contains expected product': value =>
                value !== null &&
                value.includes(product.productName)
        });

        // Step 8: Validate quantity
        const quantityVisible =
            await cartPage.isQuantityFieldVisible();

        check(quantityVisible, {
            'Cart quantity field is visible': value => value === true
        });

        if (quantityVisible) {
            const actualQuantity =
                await cartPage.getProductQuantity();

            check(actualQuantity, {
                'Cart quantity matches requested quantity': value =>
                    value === String(product.quantity)
            });
        }

        // Step 9: Validate cart URL
        const currentUrl = await cartPage.getCurrentUrl();

        check(currentUrl, {
            'Shopping cart route is displayed': url =>
                url.includes('route=checkout/cart')
        });

    } finally {
        addToCartJourneyDuration.add(
            Date.now() - startTime,
            { journey: 'search_to_cart' }
        );
    }
}
