import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';
import { executeQuery } from '../../utils/dbClient';

test('Register customer and verify Admin and database records @master @end-to-end @db @web', async ({
    homePage,
    registerPage,
    adminPage,
}) => {
    const firstName = RandomDataUtil.getFirstName();
    const lastName = RandomDataUtil.getLastName();
    const email = RandomDataUtil.getEmail().replace('@', `+${Date.now()}@`);
    const telephone = RandomDataUtil.getPhoneNumber();
    const password = RandomDataUtil.getPassword(12);
    const adminUrl = new URL(
        'admin/index.php',
        process.env.WEB_APP_URL || 'http://localhost/opencart/upload/',
    ).toString();

    await test.step('1) Register a new customer through the frontend', async () => {
        await homePage.openRegisterPage();
        await registerPage.register(firstName, lastName, email, telephone, password);
        expect(await registerPage.isRegistrationSuccessful(), 'registration should complete successfully').toBeTruthy();
    });

    await test.step('2) Find and verify the customer in the Admin Portal', async () => {
        await adminPage.login(
            adminUrl,
            process.env.ADMIN_USERNAME ?? '',
            process.env.ADMIN_PASSWORD ?? '',
        );
        await adminPage.searchCustomer(email);

        expect(await adminPage.isCustomerVisible(email), 'registered customer should appear in Admin').toBeTruthy();
        const adminCustomerName = await adminPage.getCustomerName(email);
        expect(adminCustomerName, 'Admin customer name should contain the registered first name').toContain(firstName);
        expect(adminCustomerName, 'Admin customer name should contain the registered last name').toContain(lastName);

        const adminCustomerStatus = await adminPage.getCustomerStatus(email);
        expect(adminCustomerStatus, 'Admin should display an enabled or disabled customer status').toMatch(
            /^(Enabled|Disabled)$/,
        );
    });

    await test.step('3) Verify the same customer in MySQL', async () => {
        const [customerRows] = await executeQuery('SELECT * FROM oc_customer WHERE email = ?', [email]);
        const customers = customerRows as Record<string, unknown>[];

        expect(customers, 'database query should return exactly one customer').toHaveLength(1);
        const customer = customers[0];
        expect(customer.firstname, 'database first name should match the registered value').toBe(firstName);
        expect(customer.lastname, 'database last name should match the registered value').toBe(lastName);
        expect(customer.email, 'database email should match the registered value').toBe(email);

        const expectedStatus = adminPage.getCustomerStatus(email);
        const customerStatus = (await expectedStatus) === 'Enabled' ? 1 : 0;
        expect(Number(customer.status), 'database status should match the Admin status').toBe(customerStatus);

        if ('date_added' in customer) {
            expect(customer.date_added, 'date_added should be populated when the column is available').toBeTruthy();
        }
    });
});