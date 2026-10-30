import { test, expect } from '../../fixtures/pageFixtures';
import { Helper } from '../../utils/helper';
import { RandomDataUtil } from '../../utils/dataGenerator';

test('End-to-End Shopping Flow @master @end-to-end @web', async ({
    homePage,
    registerPage,
    loginPage,
    accountPage,
    logoutPage,
    searchResultsPage,
    productPage,
    shoppingCartPage,
}) => {
    const productDetails = Helper.getProductDetails();
    const email = RandomDataUtil.getEmail().replace('@', `+${Date.now()}@`);
    const password = RandomDataUtil.getPassword(12);
    const firstName = RandomDataUtil.getFirstName();
    const lastName = RandomDataUtil.getLastName();
    const telephone = RandomDataUtil.getPhoneNumber();

    await test.step('1) Register a new customer', async () => {
        await homePage.openRegisterPage();
        await registerPage.register(firstName, lastName, email, telephone, password);
        expect(await registerPage.isRegistrationSuccessful()).toBeTruthy();
        await registerPage.continueToAccount();
        expect(await accountPage.isDashboardVisible()).toBeTruthy();
    });

    await test.step('2) Log out and log back in', async () => {
        await homePage.openLogoutPage();
        expect(await logoutPage.isLogoutSuccessful()).toBeTruthy();
        await logoutPage.continueToStore();
        await homePage.openLoginPage();
        await loginPage.login(email, password);
        expect(await accountPage.isDashboardVisible()).toBeTruthy();
    });

    await test.step('3) Search for the known MacBook product', async () => {
        await homePage.searchProduct(productDetails.productName);
        expect(await searchResultsPage.isProductVisible(productDetails.productName)).toBeTruthy();
        await searchResultsPage.openProduct(productDetails.productName);
        expect(await productPage.isProductVisible(productDetails.productName)).toBeTruthy();
        expect(await productPage.getDisplayedPrice()).toBe(productDetails.totalPrice);
    });

    await test.step('4) Add the product to the shopping cart', async () => {
        await productPage.addToCart(productDetails.productQuantity);
        expect(await productPage.isProductAddedToCart()).toBeTruthy();
    });

    await test.step('5) Verify the cart product, quantity, and totals', async () => {
        await homePage.openShoppingCart();
        expect(await shoppingCartPage.isProductVisible(productDetails.productName)).toBeTruthy();
        expect(await shoppingCartPage.getQuantity(productDetails.productName)).toBe(productDetails.productQuantity);
        expect(await shoppingCartPage.getUnitPrice(productDetails.productName)).toBe(productDetails.totalPrice);
        expect(await shoppingCartPage.getProductTotal(productDetails.productName)).toBe(productDetails.totalPrice);
        expect(Helper.convertPriceToNumber(await shoppingCartPage.getGrandTotal())).toBe(
            Helper.convertPriceToNumber(productDetails.totalPrice),
        );
    });

    console.log('OpenCart shopping journey completed successfully.');
});