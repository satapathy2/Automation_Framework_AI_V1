import { test, expect } from '@playwright/test';
import Ajv from 'ajv';
import dotenv from 'dotenv';
import path from 'path';
import { Routes } from '../../api/endpoints/routes';
import { DataProvider } from '../../utils/DataReader';

dotenv.config();

const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;

test.describe('FakeStore Authentication and Products API Tests', () => {
    test('POST - Successful Login @master @sanity @api', async ({ request }) => {
        const userRoute = Routes.GET_USER_BY_ID.replace('{id}', '1');
        const userResponse = await request.get(`${BASE_URL}${userRoute}`);
        expect(userResponse.status(), 'seeded user request should return status 200').toBe(200);
        const user = await userResponse.json();

        const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
            data: {
                username: user.username,
                password: user.password,
            },
        });

        expect(response.status(), 'valid credentials should return status 201').toBe(201);

        const responseBody = await response.json();
        expect(typeof responseBody.token, 'login should return a token string').toBe('string');
        expect(responseBody.token.length, 'login token should not be empty').toBeGreaterThan(0);
    });

    test('POST - Invalid Login @master @api', async ({ request }) => {
        const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
            data: {
                username: 'invalid-user-for-api-test',
                password: 'invalid-password-for-api-test',
            },
        });

        expect(response.status(), 'invalid credentials should return status 401').toBe(401);
        expect(await response.text(), 'invalid login should return the documented error').toBe(
            'username or password is incorrect',
        );
    });

    test('GET - All Products @master @sanity @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_PRODUCTS}`);
        expect(response.status(), 'products request should return status 200').toBe(200);

        const products = await response.json();
        expect(Array.isArray(products), 'products response should be an array').toBe(true);
        expect(products.length, 'products response should not be empty').toBeGreaterThan(0);

        for (const product of products) {
            expect(typeof product.id, 'product id should be a number').toBe('number');
            expect(typeof product.title, 'product title should be a string').toBe('string');
            expect(typeof product.price, 'product price should be a number').toBe('number');
            expect(typeof product.category, 'product category should be a string').toBe('string');
            expect(typeof product.image, 'product image should be a string').toBe('string');
        }
    });

    test('GET - Product by ID @master @api', async ({ request }) => {
        const productId = 1;
        const route = Routes.GET_PRODUCT_BY_ID.replace('{id}', String(productId));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'product request should return status 200').toBe(200);

        const product = await response.json();
        expect(product.id, 'returned product id should match the requested id').toBe(productId);
        expect(typeof product.title, 'product title should be a string').toBe('string');
        expect(typeof product.price, 'product price should be a number').toBe('number');
        expect(typeof product.category, 'product category should be a string').toBe('string');
        expect(typeof product.image, 'product image should be a string').toBe('string');
    });

    test('GET - Products with Limit @master @api', async ({ request }) => {
        const limit = 5;
        const route = Routes.GET_PRODUCTS_WITH_LIMIT.replace('{limit}', String(limit));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'limited products request should return status 200').toBe(200);

        const products = await response.json();
        expect(Array.isArray(products), 'limited products response should be an array').toBe(true);
        expect(products.length, 'response count should match the requested limit').toBe(limit);
    });

    test('GET - Products Sorted Ascending @master @api', async ({ request }) => {
        const route = Routes.GET_PRODUCTS_SORTED.replace('{order}', 'asc');
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'ascending products request should return status 200').toBe(200);

        const products = await response.json();
        const productIds = products.map((product: { id: number }) => product.id);
        expect(productIds, 'product ids should be in ascending order').toEqual(
            [...productIds].sort((firstId: number, secondId: number) => firstId - secondId),
        );
    });

    test('GET - Products Sorted Descending @master @api', async ({ request }) => {
        const route = Routes.GET_PRODUCTS_SORTED.replace('{order}', 'desc');
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'descending products request should return status 200').toBe(200);

        const products = await response.json();
        const productIds = products.map((product: { id: number }) => product.id);
        expect(productIds, 'product ids should be in descending order').toEqual(
            [...productIds].sort((firstId: number, secondId: number) => secondId - firstId),
        );
    });

    test('GET - All Product Categories @master @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CATEGORIES}`);
        expect(response.status(), 'categories request should return status 200').toBe(200);

        const categories = await response.json();
        expect(Array.isArray(categories), 'categories response should be an array').toBe(true);
        expect(categories.length, 'categories response should not be empty').toBeGreaterThan(0);
    });

    test('GET - Products by Category @master @api', async ({ request }) => {
        const category = 'electronics';
        const route = Routes.GET_PRODUCTS_BY_CATEGORY.replace('{category}', category);
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'category products request should return status 200').toBe(200);

        const products = await response.json();
        expect(Array.isArray(products), 'category products response should be an array').toBe(true);
        for (const product of products) {
            expect(product.category, 'every product should match the requested category').toBe(category);
        }
    });

    test('POST - Create Product @master @api', async ({ request }) => {
        const productPayload = {
            title: 'Playwright API Product',
            price: 199.99,
            description: 'Product created by the Playwright API test.',
            image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png',
            category: 'electronics',
        };
        const response = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, { data: productPayload });
        expect(response.status(), 'product creation should return status 201').toBe(201);

        const createdProduct = await response.json();
        expect(typeof createdProduct.id, 'created product should have an id').toBe('number');
        expect(createdProduct.title).toBe(productPayload.title);
        expect(createdProduct.price).toBe(productPayload.price);
        expect(createdProduct.description).toBe(productPayload.description);
        expect(createdProduct.image).toBe(productPayload.image);
        expect(createdProduct.category).toBe(productPayload.category);
    });

    test('PUT - Update Product @master @api', async ({ request }) => {
        const productId = 1;
        const updatedProduct = {
            title: 'Updated Playwright API Product',
            price: 249.99,
            description: 'Updated by the Playwright API test.',
            image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png',
            category: 'electronics',
        };
        const route = Routes.UPDATE_PRODUCT.replace('{id}', String(productId));
        const response = await request.put(`${BASE_URL}${route}`, { data: updatedProduct });
        expect(response.status(), 'product update should return status 200').toBe(200);

        const responseBody = await response.json();
        expect(responseBody.id, 'updated product id should match the requested id').toBe(productId);
        expect(responseBody.title).toBe(updatedProduct.title);
        expect(responseBody.price).toBe(updatedProduct.price);
        expect(responseBody.description).toBe(updatedProduct.description);
        expect(responseBody.category).toBe(updatedProduct.category);
    });

    test('DELETE - Product @master @api', async ({ request }) => {
        const productId = 1;
        const route = Routes.DELETE_PRODUCT.replace('{id}', String(productId));
        const response = await request.delete(`${BASE_URL}${route}`);
        expect(response.status(), 'product deletion should return status 200').toBe(200);

        const deletedProduct = await response.json();
        expect(deletedProduct.id, 'deleted product response should include its id').toBe(productId);
    });

    test('GET - Product Response Schema @master @api', async ({ request }) => {
        const route = Routes.GET_PRODUCT_BY_ID.replace('{id}', '1');
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'product schema request should return status 200').toBe(200);

        const product = await response.json();
        const schema = DataProvider.readJson(path.resolve(process.cwd(), 'api/schemas/product_api_schema.json'));
        const validator = new Ajv().compile(schema);
        const isValid = validator(product);
        expect(isValid, `product response schema mismatch: ${new Ajv().errorsText(validator.errors)}`).toBeTruthy();
    });
});