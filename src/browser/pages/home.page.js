
import { HeaderComponent } from '../components/header.component.js';

export class HomePage {
    constructor(page) {
        this.page = page;
        this.header = new HeaderComponent(page);
    }

    async open(baseUrl) {
        return await this.page.goto(baseUrl);
    }

    async isSearchInputVisible() {
        return await this.header.isSearchInputVisible();
    }

    async searchProduct(productName) {
        await this.header.searchProduct(productName);
    }
}
