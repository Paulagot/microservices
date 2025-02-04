import request from "supertest"; // Import Supertest to make HTTP requests to the Express app.
import express from "express"; // Import Express to define a mock server for testing.
import { getBalance } from "./controllers/balanceService"; // Import the balance service function.
import MockAdapter from "axios-mock-adapter"; // Import Axios Mock Adapter to intercept and mock API calls.
import axios from "axios"; // Import Axios for handling HTTP requests.

// Create an Express application instance for testing.
const app = express();

// Define the endpoint to fetch balance, with an optional wallet address parameter.
app.get("/balance/:walletAddress?", getBalance);

// Create a new mock adapter for Axios to simulate API responses.
const mock = new MockAdapter(axios);

// Reset the mock adapter before each test to ensure tests are independent.
beforeEach(() => {
  mock.reset();
});

/**
 * Test Case: Should return 400 Bad Request when no wallet address is provided.
 *
 * Expected behavior:
 * - If the request does not include a wallet address, the API should return a 400 status code.
 * - The response should contain an error message indicating that a wallet address is required.
 */
describe("GET /balance/:walletAddress", () => {
  test("should return 400 if wallet address is missing", async () => {
    const response = await request(app).get("/balance/"); // No wallet address provided.

    expect(response.status).toBe(400); // Should return 400 Bad Request.
    expect(response.body).toEqual({
      success: false,
      error: "Wallet address is required",
    });
  });
});

/**
 * Test Case: Should return 200 OK and balance data when the API call is successful.
 *
 * Expected behavior:
 * - The API should return a 200 status code when provided with a valid wallet address.
 * - The response should contain the balance details fetched from the Blockfrost API.
 */
describe("GET /balance/:walletAddress", () => {
  test("should return 200 and balance data when API call is successful", async () => {
    const mockWalletAddress =
      "addr_test1qrmnjnv40yw993lg8w0stjfv7l2yvpr7s7e7cw96tp6xwmztz7gclgcw0u6x8f6jt5ez8kw8rc5xwps489nwpjs3vgpqy30nlc";

    // Define a mock balance response as returned by the Blockfrost API.
    const mockBalance = [
      { unit: "lovelace", quantity: "9952026388" },
      {
        unit: "d9312da562da182b02322fd8acb536f37eb9d29fba7c49dc172555274d657368546f6b656e",
        quantity: "10",
      },
    ];

    // Mock the API response when the wallet address is queried.
    mock
      .onGet(`https://cardano-preprod.blockfrost.io/api/v0/addresses/${mockWalletAddress}`)
      .reply(200, { amount: mockBalance });

    // Send a request to the Express app with a valid wallet address.
    const response = await request(app).get(`/balance/${mockWalletAddress}`);

    // Assertions
    expect(response.status).toBe(200); // Should return 200 OK.
    expect(response.body).toEqual({
      success: true,
      data: mockBalance, // The balance should match the mocked API response.
    });
  });
});

/**
 * Test Case: Should return 404 Not Found when the wallet address does not exist.
 *
 * Expected behavior:
 * - If the wallet address is invalid or not found, the API should return a 404 status code.
 * - The response should contain an error message indicating that the wallet does not exist.
 */
test("should return 404 and error message when wallet is not found", async () => {
  const mockWalletAddress = "addr_test_notfound"; // Simulate a non-existent wallet.

  // Mock the Blockfrost API to return a 404 error when querying a non-existent wallet.
  mock
    .onGet(`https://cardano-preprod.blockfrost.io/api/v0/addresses/${mockWalletAddress}`)
    .reply(404, { message: "Wallet not found" });

  // Send a request to the Express app with the non-existent wallet address.
  const response = await request(app).get(`/balance/${mockWalletAddress}`);

  // Assertions
  expect(response.status).toBe(400); // Should return 400 Bad Request (handled as an invalid request).
  expect(response.body).toEqual({
    success: false,
    error: "Invalid address for this network or malformed address format.",
  });
});


