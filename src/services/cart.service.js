
import {
    get,
    post
} from '../clients/http.client.js';

// Add a product to the shopping cart.
export function addProductToCart(productId, quantity = 1) {

    const body =
        `product_id=${encodeURIComponent(productId)}` +
        `&quantity=${encodeURIComponent(quantity)}`;

    return post(
        '/index.php?route=checkout/cart/add',
        body,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            tags: {
                name: 'cart_add'
            }
        }
    );
}

// Retrieve current shopping cart information.
export function getCartInfo() {

    return get(
        '/index.php?route=common/cart/info',
        {
            tags: {
                name: 'cart_info'
            }
        }
    );
}
