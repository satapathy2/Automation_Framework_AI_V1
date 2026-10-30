import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { Routes } from '../../api/endpoints/routes';

dotenv.config();

const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;

test.describe('FakeStore CRUD Workflows', () => {
    test('Product Create, Update, and Delete Workflow @master @api', async ({ request }) => {
        const productPayload = {
            title: 'Playwright CRUD Workflow Product',
            price: 149.99,
            description: 'Product for the complete CRUD workflow.',
            image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png',
            category: 'electronics',
        };

        const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, { data: productPayload });
        expect(createResponse.status(), 'product workflow create should return status 201').toBe(201);
        const createdProduct = await createResponse.json();
        expect(typeof createdProduct.id, 'created product should include an id').toBe('number');

        const updatedProductPayload = { ...productPayload, title: 'Updated Playwright CRUD Workflow Product' };
        const updateRoute = Routes.UPDATE_PRODUCT.replace('{id}', String(createdProduct.id));
        const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, { data: updatedProductPayload });
        expect(updateResponse.status(), 'product workflow update should return status 200').toBe(200);
        const updatedProduct = await updateResponse.json();
        expect(updatedProduct.id, 'updated product should preserve the created id').toBe(createdProduct.id);
        expect(updatedProduct.title).toBe(updatedProductPayload.title);

        const deleteRoute = Routes.DELETE_PRODUCT.replace('{id}', String(createdProduct.id));
        const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
        expect(deleteResponse.status(), 'product workflow delete should return status 200').toBe(200);
    });

    test('User Create, Update, and Delete Workflow @master @api', async ({ request }) => {
        const userPayload = {
            email: 'playwright.crud.user@example.com',
            username: 'playwright-crud-user',
            password: 'playwright-crud-password',
            name: { firstname: 'Playwright', lastname: 'Workflow' },
            address: {
                city: 'Workflow City',
                street: 'Workflow Street',
                number: 321,
                zipcode: '12345',
                geolocation: { lat: '5.0', long: '6.0' },
            },
            phone: '111-222-3333',
        };

        const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, { data: userPayload });
        expect(createResponse.status(), 'user workflow create should return status 201').toBe(201);
        const createdUser = await createResponse.json();
        expect(typeof createdUser.id, 'created user should include an id').toBe('number');

        const updatedUserPayload = { ...userPayload, username: 'updated-playwright-crud-user' };
        const updateRoute = Routes.UPDATE_USER.replace('{id}', String(createdUser.id));
        const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, { data: updatedUserPayload });
        expect(updateResponse.status(), 'user workflow update should return status 200').toBe(200);
        const updatedUser = await updateResponse.json();
        expect(updatedUser.username).toBe(updatedUserPayload.username);

        const deleteRoute = Routes.DELETE_USER.replace('{id}', String(createdUser.id));
        const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
        expect(deleteResponse.status(), 'user workflow delete should return status 200').toBe(200);
    });

    test('Cart Create, Update, and Delete Workflow @master @api', async ({ request }) => {
        const cartPayload = {
            userId: 1,
            date: '2020-03-02',
            products: [{ productId: 1, quantity: 2 }],
        };

        const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, { data: cartPayload });
        expect(createResponse.status(), 'cart workflow create should return status 201').toBe(201);
        const createdCart = await createResponse.json();
        expect(typeof createdCart.id, 'created cart should include an id').toBe('number');
        expect(createdCart.userId).toBe(cartPayload.userId);
        expect(createdCart.products).toEqual(cartPayload.products);

        const updatedCartPayload = {
            ...cartPayload,
            products: [{ productId: 1, quantity: 3 }],
        };
        const updateRoute = Routes.UPDATE_CART.replace('{id}', String(createdCart.id));
        const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, { data: updatedCartPayload });
        expect(updateResponse.status(), 'cart workflow update should return status 200').toBe(200);
        const updatedCart = await updateResponse.json();
        expect(updatedCart.id, 'updated cart should preserve the created id').toBe(createdCart.id);
        expect(updatedCart.products[0].quantity, 'updated cart should reflect the changed quantity').toBe(3);

        const deleteRoute = Routes.DELETE_CART.replace('{id}', String(createdCart.id));
        const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
        expect(deleteResponse.status(), 'cart workflow delete should return status 200').toBe(200);
    });
});