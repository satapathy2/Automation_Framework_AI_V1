import { Page } from '@playwright/test';

export class AccountPage {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async isDashboardVisible(): Promise<boolean> {
        return this.page.locator('#content').getByRole('heading', { name: 'My Account', exact: true }).isVisible();
    }
}