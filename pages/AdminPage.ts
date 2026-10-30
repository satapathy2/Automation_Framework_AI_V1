import { Locator, Page } from '@playwright/test';

export class AdminPage {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Opens the Admin Portal and signs in with configured credentials.
     * @param adminUrl - Admin Portal URL
     * @param username - Configured administrator username
     * @param password - Configured administrator password
     */
    async login(adminUrl: string, username: string, password: string): Promise<void> {
        await this.page.goto(adminUrl);
        await this.page.getByRole('textbox', { name: 'Username' }).fill(username);
        await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
        await this.page.getByRole('button', { name: /Login/ }).click();
        const closeNotification = this.page.locator('#modal-security button.close');
        await closeNotification.waitFor({ state: 'visible' });
        await closeNotification.click();
    }

    /**
     * Opens the Customers list and filters it by email.
     * @param email - Customer email to find
     */
    async searchCustomer(email: string): Promise<void> {
        await this.page.getByRole('link', { name: /Customers/ }).click();
        await this.page.getByRole('link', { name: /Customers/ }).last().click();
        await this.page.getByPlaceholder('E-Mail').fill(email);
        await this.page.getByRole('button', { name: /Filter/ }).click();
    }

    private getCustomerRow(email: string): Locator {
        return this.page.getByRole('row').filter({ hasText: email });
    }

    /**
     * Checks whether a matching customer row is displayed.
     * @param email - Customer email to find
     * @returns Whether the customer row is visible
     */
    async isCustomerVisible(email: string): Promise<boolean> {
        return this.getCustomerRow(email).isVisible();
    }

    /**
     * Returns the customer name shown in the Admin list.
     * @param email - Customer email used to find the row
     * @returns Displayed customer name
     */
    async getCustomerName(email: string): Promise<string> {
        return (await this.getCustomerRow(email).getByRole('cell').nth(1).textContent())?.trim() ?? '';
    }

    /**
     * Returns the customer status shown in the Admin list.
     * @param email - Customer email used to find the row
     * @returns Displayed customer status
     */
    async getCustomerStatus(email: string): Promise<string> {
        return (await this.getCustomerRow(email).getByText(/^(Enabled|Disabled)$/).textContent())?.trim() ?? '';
    }
}