
import { check, group } from 'k6';
import { searchProducts } from '../services/product.service.js';

export function executeApiProductSearch(product) {
    let response;

    group('API - Product Search', function () {
        response = searchProducts(product.searchTerm);

        check(response, {
            'API search returns HTTP 200': res =>
                res.status === 200,

            'API search returns expected product': res =>
                res.body !== null &&
                res.body.includes(product.productName),

            'API search response is not empty': res =>
                res.body !== null &&
                res.body.length > 0
        });
    });

    return response;
}
