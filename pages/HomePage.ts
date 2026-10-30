import { Page } from '@playwright/test';

export class HomePage {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async openRegisterPage(): Promise<void> {
        await this.page.getByRole('navigation').first().getByRole('link', { name: /My Account/ }).click();
        await this.page.getByRole('link', { name: 'Register', exact: true }).click();
    }

    async openLoginPage(): Promise<void> {
        await this.page.getByRole('navigation').first().getByRole('link', { name: /My Account/ }).click();
        await this.page.getByRole('link', { name: 'Login', exact: true }).click();
    }

    async openLogoutPage(): Promise<void> {
        await this.page.getByRole('navigation').first().getByRole('link', { name: /My Account/ }).click();
        await this.page.getByRole('navigation').first().getByRole('link', { name: 'Logout', exact: true }).click();
    }

    async searchProduct(productName: string): Promise<void> {
        const searchField = this.page.getByRole('textbox', { name: 'Search' });
        await searchField.fill(productName);
        await searchField.press('Enter');
    }

    async openShoppingCart(): Promise<void> {
        await this.page.getByRole('link', { name: /Shopping Cart/ }).click();
    }
}