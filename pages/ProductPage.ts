import { Page } from '@playwright/test';

export class ProductPage {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async isProductVisible(productName: string): Promise<boolean> {
        return this.page.getByRole('heading', { name: productName, exact: true }).isVisible();
    }

    async getDisplayedPrice(): Promise<string> {
        return (await this.page.getByRole('heading', { level: 2 }).textContent())?.trim() ?? '';
    }

    async addToCart(quantity: string): Promise<void> {
        await this.page.getByRole('textbox', { name: 'Qty' }).fill(quantity);
        await this.page.getByRole('button', { name: 'Add to Cart', exact: true }).click();
        await this.page.getByRole('link', { name: 'shopping cart', exact: true }).waitFor({ state: 'visible' });
    }

    async isProductAddedToCart(): Promise<boolean> {
        return this.page.getByRole('link', { name: 'shopping cart', exact: true }).isVisible();
    }
}