
import { get } from '../clients/http.client.js';

export function searchProducts(searchTerm) {

    const path =
        `/index.php?route=product/search&search=${encodeURIComponent(searchTerm)}`;

    return get(path, {
        tags: {
            name: 'product_search'
        }
    });
}

export function getProductDetails(productId) {

    const path =
        `/index.php?route=product/product&product_id=${encodeURIComponent(productId)}`;

    return get(path, {
        tags: {
            name: 'product_details'
        }
    });
}
