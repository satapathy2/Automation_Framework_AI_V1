import { Locator, Page } from '@playwright/test';

export class ShoppingCartPage {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private getProductRow(productName: string): Locator {
        return this.page.getByRole('row').filter({ hasText: productName });
    }

    async isProductVisible(productName: string): Promise<boolean> {
        return this.getProductRow(productName).isVisible();
    }

    async getQuantity(productName: string): Promise<string> {
        return this.getProductRow(productName).getByRole('cell').nth(3).getByRole('textbox').inputValue();
    }

    async getUnitPrice(productName: string): Promise<string> {
        return (await this.getProductRow(productName).getByRole('cell').nth(4).textContent())?.trim() ?? '';
    }

    async getProductTotal(productName: string): Promise<string> {
        return (await this.getProductRow(productName).getByRole('cell').nth(5).textContent())?.trim() ?? '';
    }

    async getGrandTotal(): Promise<string> {
        const totalRow = this.page.getByRole('row').filter({
            has: this.page.getByText('Total:', { exact: true }),
        });
        return (await totalRow.getByRole('cell').nth(1).textContent())?.trim() ?? '';
    }
}