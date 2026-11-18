
export class HeaderComponent {
    constructor(page) {
        this.page = page;
        this.searchInput = page.locator('input[name="search"]');
    }

    async isSearchInputVisible() {
        return await this.searchInput.isVisible();
    }

    async searchProduct(productName) {
        await this.searchInput.fill(productName);
        await this.searchInput.press('Enter');
    }
}
