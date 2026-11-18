
export class ProductDetailsPage {
    constructor(page) {
        this.page = page;

        this.productHeading = page.locator('#content h1');
        this.quantityInput = page.locator('#input-quantity');
        this.addToCartButton = page.locator('#button-cart');
        this.successAlert = page.locator('.alert.alert-success');
    }

    async waitForProductDetails() {
        await this.productHeading.waitFor({
            state: 'visible',
            timeout: 10000
        });
    }

    async getProductName() {
        return await this.productHeading.textContent();
    }

    async isProductHeadingVisible() {
        return await this.productHeading.isVisible();
    }

    async setQuantity(quantity) {
        await this.quantityInput.fill(String(quantity));
    }

    async addToCart() {
        await this.addToCartButton.click();
    }

    async waitForAddToCartSuccess() {
        await this.successAlert.waitFor({
            state: 'visible',
            timeout: 15000
        });
    }

    async getSuccessMessage() {
        return await this.successAlert.textContent();
    }

    async getCurrentUrl() {
        return this.page.url();
    }

    async isAddToCartButtonVisible() {
        return await this.addToCartButton.isVisible();
    }

    async isAddToCartButtonEnabled() {
        return await this.addToCartButton.isEnabled();
    }

}
