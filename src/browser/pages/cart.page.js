
export class CartPage {
    constructor(page) {
        this.page = page;

        this.cartContent = page.locator('#content');
        this.quantityInput = page.locator(
            'input[name^="quantity["]'
        );
    }

    async open(baseUrl) {
        await this.page.goto(
            `${baseUrl}/index.php?route=checkout/cart`
        );
    }

    async waitForCartPage() {
        await this.cartContent.waitFor({
            state: 'visible',
            timeout: 10000
        });
    }

    async getCartText() {
        return await this.cartContent.textContent();
    }


    async getProductQuantity() {
        return await this.quantityInput.first().inputValue();
    }


    async isQuantityFieldVisible() {
        return await this.quantityInput.first().isVisible();
    }

    async getCurrentUrl() {
        return this.page.url();
    }
}
