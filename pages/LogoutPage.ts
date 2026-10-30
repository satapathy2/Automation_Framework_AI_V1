import { Page } from '@playwright/test';

export class LogoutPage {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async isLogoutSuccessful(): Promise<boolean> {
        return this.page.getByRole('heading', { name: 'Account Logout', exact: true }).isVisible();
    }

    async continueToStore(): Promise<void> {
        await this.page.getByRole('link', { name: 'Continue', exact: true }).click();
    }
}