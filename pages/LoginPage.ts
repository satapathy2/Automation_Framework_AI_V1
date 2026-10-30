import { Page } from '@playwright/test';

export class LoginPage {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async login(email: string, password: string): Promise<void> {
        await this.page.getByRole('textbox', { name: /E-Mail Address/ }).fill(email);
        await this.page.getByRole('textbox', { name: /^Password$/ }).fill(password);
        await this.page.getByRole('button', { name: 'Login', exact: true }).click();
    }
}