
export class SearchPage {
    constructor(page) {
        this.page = page;
        this.pageBody = page.locator('body');
    }

    async getPageText() {
        return await this.pageBody.textContent();
    }

    async isProductPresent(productName) {
        const pageText = await this.getPageText();

        return pageText !== null &&
            pageText.includes(productName);
    }

    async getCurrentUrl() {
        return this.page.url();
    }

    async openProduct(productId) {
        const productLink = this.page.locator(
            `a[href*="route=product/product"][href*="product_id=${productId}"]`
        ).first();

        await productLink.click();
    }
}
