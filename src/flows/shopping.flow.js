
import { check, group } from 'k6';
import { Trend } from 'k6/metrics';

import {
    searchProducts,
    getProductDetails
} from '../services/product.service.js';

import {
    addProductToCart,
    getCartInfo
} from '../services/cart.service.js';

// Custom metric to measure complete business transaction duration.
const shoppingJourneyDuration = new Trend(
    'shopping_journey_duration',
    true
);

function verify(value, checks, step) {
    if (!check(value, checks)) {
        throw new Error(
            `OpenCart shopping journey validation failed at ${step}.`
        );
    }
}

export function executeShoppingJourney(product) {

    const startTime = Date.now();

    try {

        group('OpenCart Shopping Journey', function () {

            // STEP 1: Search product
            group('01 - Product Search', function () {

                const response = searchProducts(product.searchTerm);

                verify(response, {
                    'Product search returns HTTP 200': (res) =>
                        res.status === 200,

                    'Product is present in search results': (res) =>
                        res.body &&
                        res.body.includes(product.productName)
                }, 'product search');

            });

            // STEP 2: Product details
            group('02 - Product Details', function () {

                const response = getProductDetails(product.productId);

                verify(response, {
                    'Product details return HTTP 200': (res) =>
                        res.status === 200,

                    'Product name is present': (res) =>
                        res.body &&
                        res.body.includes(product.productName)
                }, 'product details');

            });

            // STEP 3: Add to cart
            group('03 - Add to Cart', function () {

                const response = addProductToCart(
                    product.productId,
                    product.quantity
                );

                let validJson = false;

                try {
                    JSON.parse(response.body);
                    validJson = true;
                } catch (error) {
                    validJson = false;
                }

                verify(response, {
                    'Add to cart returns HTTP 200': (res) =>
                        res.status === 200,

                    'Add to cart response is valid JSON': () =>
                        validJson
                }, 'add to cart');

            });

            // STEP 4: Verify cart
            group('04 - Cart Verification', function () {

                const response = getCartInfo();

                verify(response, {
                    'Cart information returns HTTP 200': (res) =>
                        res.status === 200,

                    'Cart contains selected product': (res) =>
                        res.body &&
                        res.body.includes(product.productName)
                }, 'cart verification');

            });

        });

    } finally {

        // Record total business transaction duration.
        shoppingJourneyDuration.add(
            Date.now() - startTime,
            {
                journey: 'product_search_to_cart'
            }
        );

    }

}
