import { test, expect } from '@playwright/test';
import Ajv from 'ajv';
import dotenv from 'dotenv';
import path from 'path';
import { Routes } from '../../api/endpoints/routes';
import { DataProvider } from '../../utils/DataReader';

dotenv.config();

const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;

test.describe('FakeStore Carts API Tests', () => {
    test('GET - All Carts @master @sanity @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CARTS}`);
        expect(response.status(), 'carts request should return status 200').toBe(200);

        const carts = await response.json();
        expect(Array.isArray(carts), 'carts response should be an array').toBe(true);
        expect(carts.length, 'carts response should not be empty').toBeGreaterThan(0);
    });

    test('GET - Cart by ID @master @api', async ({ request }) => {
        const cartId = 1;
        const route = Routes.GET_CART_BY_ID.replace('{id}', String(cartId));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'cart request should return status 200').toBe(200);

        const cart = await response.json();
        expect(cart.id, 'returned cart id should match the requested id').toBe(cartId);
    });

    test('GET - Carts by Date Range @master @api', async ({ request }) => {
        const startDate = '2020-01-01';
        const endDate = '2020-03-31';
        const route = Routes.GET_CARTS_BY_DATE_RANGE
            .replace('{startdate}', startDate)
            .replace('{enddate}', endDate);
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'date-filtered carts request should return status 200').toBe(200);

        const carts = await response.json();
        expect(Array.isArray(carts), 'date-filtered carts response should be an array').toBe(true);
        const startTime = new Date(`${startDate}T00:00:00.000Z`).getTime();
        const endTime = new Date(`${endDate}T23:59:59.999Z`).getTime();
        for (const cart of carts) {
            const cartTime = new Date(cart.date).getTime();
            expect(cartTime, 'cart date should not be before the requested range').toBeGreaterThanOrEqual(startTime);
            expect(cartTime, 'cart date should not be after the requested range').toBeLessThanOrEqual(endTime);
        }
    });

    test('GET - Carts by User @master @api', async ({ request }) => {
        const userId = 1;
        const route = Routes.GET_USER_CART.replace('{userId}', String(userId));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'user carts request should return status 200').toBe(200);

        const carts = await response.json();
        expect(Array.isArray(carts), 'user carts response should be an array').toBe(true);
        expect(carts.length, 'user should have at least one cart').toBeGreaterThan(0);
        for (const cart of carts) {
            expect(cart.userId, 'every returned cart should belong to the requested user').toBe(userId);
        }
    });

    test('GET - Carts with Limit @master @api', async ({ request }) => {
        const limit = 3;
        const route = Routes.GET_CARTS_WITH_LIMIT.replace('{limit}', String(limit));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'limited carts request should return status 200').toBe(200);

        const carts = await response.json();
        expect(Array.isArray(carts), 'limited carts response should be an array').toBe(true);
        expect(carts.length, 'response count should match the requested limit').toBe(limit);
    });

    test('GET - Carts Sorted Ascending and Descending @master @api', async ({ request }) => {
        const ascendingRoute = Routes.GET_CARTS_SORTED.replace('{order}', 'asc');
        const ascendingResponse = await request.get(`${BASE_URL}${ascendingRoute}`);
        expect(ascendingResponse.status(), 'ascending carts request should return status 200').toBe(200);
        const ascendingCarts = await ascendingResponse.json();
        const ascendingIds = ascendingCarts.map((cart: { id: number }) => cart.id);
        expect(ascendingIds, 'cart ids should be in ascending order').toEqual(
            [...ascendingIds].sort((firstId: number, secondId: number) => firstId - secondId),
        );

        const descendingRoute = Routes.GET_CARTS_SORTED.replace('{order}', 'desc');
        const descendingResponse = await request.get(`${BASE_URL}${descendingRoute}`);
        expect(descendingResponse.status(), 'descending carts request should return status 200').toBe(200);
        const descendingCarts = await descendingResponse.json();
        const descendingIds = descendingCarts.map((cart: { id: number }) => cart.id);
        expect(descendingIds, 'cart ids should be in descending order').toEqual(
            [...descendingIds].sort((firstId: number, secondId: number) => secondId - firstId),
        );
    });

    test('POST - Create Cart @master @api', async ({ request }) => {
        const cartPayload = {
            userId: 1,
            date: '2020-03-02',
            products: [{ productId: 1, quantity: 2 }],
        };
        const response = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, { data: cartPayload });
        expect(response.status(), 'cart creation should return status 201').toBe(201);

        const createdCart = await response.json();
        expect(typeof createdCart.id, 'created cart should have an id').toBe('number');
        expect(createdCart.userId).toBe(cartPayload.userId);
        expect(createdCart.products).toEqual(cartPayload.products);
    });

    test('PUT - Update Cart @master @api', async ({ request }) => {
        const cartId = 1;
        const updatedCart = {
            userId: 1,
            date: '2020-03-02',
            products: [{ productId: 1, quantity: 5 }],
        };
        const route = Routes.UPDATE_CART.replace('{id}', String(cartId));
        const response = await request.put(`${BASE_URL}${route}`, { data: updatedCart });
        expect(response.status(), 'cart update should return status 200').toBe(200);

        const responseBody = await response.json();
        expect(responseBody.id, 'updated cart id should match the requested id').toBe(cartId);
        expect(responseBody.userId).toBe(updatedCart.userId);
        expect(responseBody.products).toEqual(updatedCart.products);
    });

    test('DELETE - Cart @master @api', async ({ request }) => {
        const cartId = 1;
        const route = Routes.DELETE_CART.replace('{id}', String(cartId));
        const response = await request.delete(`${BASE_URL}${route}`);
        expect(response.status(), 'cart deletion should return status 200').toBe(200);

        const deletedCart = await response.json();
        expect(deletedCart.id, 'deleted cart response should include its id').toBe(cartId);
    });

    test('GET - Cart Response Schema @master @api', async ({ request }) => {
        const route = Routes.GET_CART_BY_ID.replace('{id}', '1');
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'cart schema request should return status 200').toBe(200);

        const cart = await response.json();
        const schema = DataProvider.readJson(path.resolve(process.cwd(), 'api/schemas/cart_api_schema.json'));
        const validator = new Ajv().compile(schema);
        const isValid = validator(cart);
        expect(isValid, `cart response schema mismatch: ${new Ajv().errorsText(validator.errors)}`).toBeTruthy();
    });
});