import { test, expect } from '@playwright/test';
import Ajv from 'ajv';
import dotenv from 'dotenv';
import path from 'path';
import { Routes } from '../../api/endpoints/routes';
import { DataProvider } from '../../utils/DataReader';

dotenv.config();

const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;

test.describe('FakeStore Users API Tests', () => {
    test('GET - All Users @master @sanity @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_USERS}`);
        expect(response.status(), 'users request should return status 200').toBe(200);

        const users = await response.json();
        expect(Array.isArray(users), 'users response should be an array').toBe(true);
        expect(users.length, 'users response should not be empty').toBeGreaterThan(0);
        for (const user of users) {
            expect(typeof user.id, 'user id should be a number').toBe('number');
            expect(typeof user.email, 'user email should be a string').toBe('string');
            expect(typeof user.username, 'username should be a string').toBe('string');
        }
    });

    test('GET - User by ID @master @api', async ({ request }) => {
        const userId = 1;
        const route = Routes.GET_USER_BY_ID.replace('{id}', String(userId));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'user request should return status 200').toBe(200);

        const user = await response.json();
        expect(user.id, 'returned user id should match the requested id').toBe(userId);
    });

    test('GET - Users with Limit @master @api', async ({ request }) => {
        const limit = 4;
        const route = Routes.GET_USERS_WITH_LIMIT.replace('{limit}', String(limit));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'limited users request should return status 200').toBe(200);

        const users = await response.json();
        expect(Array.isArray(users), 'limited users response should be an array').toBe(true);
        expect(users.length, 'response count should match the requested limit').toBe(limit);
    });

    test('GET - Users Sorted Ascending and Descending @master @api', async ({ request }) => {
        const ascendingRoute = Routes.GET_USERS_SORTED.replace('{order}', 'asc');
        const ascendingResponse = await request.get(`${BASE_URL}${ascendingRoute}`);
        expect(ascendingResponse.status(), 'ascending users request should return status 200').toBe(200);
        const ascendingUsers = await ascendingResponse.json();
        const ascendingIds = ascendingUsers.map((user: { id: number }) => user.id);
        expect(ascendingIds, 'user ids should be in ascending order').toEqual(
            [...ascendingIds].sort((firstId: number, secondId: number) => firstId - secondId),
        );

        const descendingRoute = Routes.GET_USERS_SORTED.replace('{order}', 'desc');
        const descendingResponse = await request.get(`${BASE_URL}${descendingRoute}`);
        expect(descendingResponse.status(), 'descending users request should return status 200').toBe(200);
        const descendingUsers = await descendingResponse.json();
        const descendingIds = descendingUsers.map((user: { id: number }) => user.id);
        expect(descendingIds, 'user ids should be in descending order').toEqual(
            [...descendingIds].sort((firstId: number, secondId: number) => secondId - firstId),
        );
    });

    test('POST - Create User @master @api', async ({ request }) => {
        const userPayload = {
            email: 'playwright.api.user@example.com',
            username: 'playwright-api-user',
            password: 'playwright-api-password',
            name: { firstname: 'Playwright', lastname: 'API' },
            address: {
                city: 'Test City',
                street: 'Test Street',
                number: 123,
                zipcode: '12345',
                geolocation: { lat: '1.0', long: '2.0' },
            },
            phone: '123-456-7890',
        };
        const response = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, { data: userPayload });
        expect(response.status(), 'user creation should return status 201').toBe(201);

        const createdUser = await response.json();
        expect(typeof createdUser.id, 'created user should have an id').toBe('number');
    });

    test('PUT - Update User @master @api', async ({ request }) => {
        const userId = 1;
        const updatedUser = {
            email: 'updated.playwright.api.user@example.com',
            username: 'updated-playwright-api-user',
            password: 'updated-playwright-api-password',
            name: { firstname: 'Updated', lastname: 'API' },
            address: {
                city: 'Updated City',
                street: 'Updated Street',
                number: 456,
                zipcode: '54321',
                geolocation: { lat: '3.0', long: '4.0' },
            },
            phone: '987-654-3210',
        };
        const route = Routes.UPDATE_USER.replace('{id}', String(userId));
        const response = await request.put(`${BASE_URL}${route}`, { data: updatedUser });
        expect(response.status(), 'user update should return status 200').toBe(200);

        const responseBody = await response.json();
        expect(responseBody.email).toBe(updatedUser.email);
        expect(responseBody.username).toBe(updatedUser.username);
        expect(responseBody.name).toEqual(updatedUser.name);
    });

    test('DELETE - User @master @api', async ({ request }) => {
        const userId = 1;
        const route = Routes.DELETE_USER.replace('{id}', String(userId));
        const response = await request.delete(`${BASE_URL}${route}`);
        expect(response.status(), 'user deletion should return status 200').toBe(200);

        const deletedUser = await response.json();
        expect(deletedUser.id, 'deleted user response should include its id').toBe(userId);
    });

    test('GET - User Response Schema @master @api', async ({ request }) => {
        const route = Routes.GET_USER_BY_ID.replace('{id}', '1');
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'user schema request should return status 200').toBe(200);

        const user = await response.json();
        const schema = DataProvider.readJson(path.resolve(process.cwd(), 'api/schemas/user_api_schema.json'));
        const validator = new Ajv().compile(schema);
        const isValid = validator(user);
        expect(isValid, `user response schema mismatch: ${new Ajv().errorsText(validator.errors)}`).toBeTruthy();
    });
});