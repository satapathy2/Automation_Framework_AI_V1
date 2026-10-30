import { Page } from '@playwright/test';

export class RegisterPage {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async register(
        firstName: string,
        lastName: string,
        email: string,
        telephone: string,
        password: string,
    ): Promise<void> {
        await this.page.getByRole('textbox', { name: /First Name/ }).fill(firstName);
        await this.page.getByRole('textbox', { name: /Last Name/ }).fill(lastName);
        await this.page.getByRole('textbox', { name: /E-Mail/ }).fill(email);
        await this.page.getByRole('textbox', { name: /Telephone/ }).fill(telephone);
        await this.page.getByRole('textbox', { name: /^\* Password$/ }).fill(password);
        await this.page.getByRole('textbox', { name: /Password Confirm/ }).fill(password);
        await this.page.getByRole('checkbox').check();
        await this.page.getByRole('button', { name: 'Continue', exact: true }).click();
    }

    async isRegistrationSuccessful(): Promise<boolean> {
        return this.page.getByRole('heading', { name: 'Your Account Has Been Created!', exact: true }).isVisible();
    }

    async continueToAccount(): Promise<void> {
        await this.page.getByRole('link', { name: 'Continue', exact: true }).click();
    }
}