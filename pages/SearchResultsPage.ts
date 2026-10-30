import { Page } from '@playwright/test';

export class SearchResultsPage {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async isProductVisible(productName: string): Promise<boolean> {
        return this.page.getByRole('link', { name: productName, exact: true }).last().isVisible();
    }

    async openProduct(productName: string): Promise<void> {
        await this.page.getByRole('link', { name: productName, exact: true }).last().click();
    }
}