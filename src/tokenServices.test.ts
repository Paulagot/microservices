import request from "supertest"; // Import Supertest for making HTTP requests to the Express app.
import MockAdapter from "axios-mock-adapter"; // Import Axios Mock Adapter to mock API responses.
import { BLOCKFROST_BASE_URL } from "../src/controllers/tokenService"; // Import the base URL for Blockfrost API.
import app from "../src/index"; // Import the Express app instance.

// Import the Axios instance used in the actual application to ensure requests are intercepted correctly.
import { axiosInstance } from "../src/controllers/tokenService";

// Create a mock adapter instance using the Axios instance to intercept and control responses.
const mock = new MockAdapter(axiosInstance);

describe("GET /tokens/:assetId", () => {
  /**
   * Reset mock history before each test to ensure test independence
   * This prevents requests from interfering with each other.
   */
  beforeEach(() => {
    mock.reset();
  });

  /**
   * Test Case: Should return 400 Bad Request when no asset ID is provided.
   * 
   * Expected behavior:
   * - If no asset ID is passed in the request, the API should return a 400 status code.
   * - The response should contain an error message indicating that an asset ID is required.
   */
  test("should return 400 if asset ID is missing", async () => {
    const response = await request(app).get("/api/cardano/tokens"); // No asset ID provided.

    expect(response.status).toBe(400); // The API should return 400 Bad Request.
    expect(response.body).toEqual({
      success: false,
      error: "Asset ID is required",
    });
  });

  /**
   * Test Case: Should return 200 OK and valid token metadata for a valid asset ID.
   * 
   * Expected behavior:
   * - The mock API should return valid metadata for a given asset ID.
   * - The response should contain the expected metadata values.
   */
  test("should return 200 and valid token metadata", async () => {
    const mockAssetId = "d9312da562da182b02322fd8acb536f37eb9d29fba7c49dc172555274d657368546f6b656e";

    // Mock the Blockfrost API response for a valid asset.
    mock.onGet(`${BLOCKFROST_BASE_URL}/assets/${mockAssetId}`).reply(200, {
      asset: mockAssetId,
      policy_id: "d9312da562da182b02322fd8acb536f37eb9d29fba7c49dc17255527",
      asset_name: "4d657368546f6b656e",
      fingerprint: "asset1uzcczdpl4n452xl4wzqs8uc3fyqnutq6xgz6kc",
      quantity: "443",
      onchain_metadata: {
        name: "Mesh Token",
        image: "ipfs://QmRzicpReutwCkM6aotuKjErFCUD213DpwPq6ByuzMJaua",
        mediaType: "image/jpg",
        description: "This NFT was minted by Mesh (https://meshjs.dev/)."
      },
      metadata: null
    });

    const response = await request(app).get(`/api/cardano/tokens/${mockAssetId}`);

    // Debugging logs for verification.
    console.log("Response status:", response.status);
    console.log("Response body:", response.body);

    expect(response.status).toBe(200); // Should return 200 OK.
  });

  /**
   * Test Case: Should return 400 Bad Request for an invalid asset ID format.
   * 
   * Expected behavior:
   * - If the asset ID format is incorrect, the API should return a 400 status code.
   * - The response should contain an error message indicating an invalid format.
   */
  test("should return 400 and no token metadata", async () => { 
    const mockAssetId = "d9312da562da182b02322fd8acb536f37eb9d29fba"; // Shortened invalid asset ID.

    // Mock Blockfrost API response for an invalid asset ID.
    mock.onGet(`${BLOCKFROST_BASE_URL}/assets/${mockAssetId}`).reply((config) => {
      console.log("✅ Mock Intercepted:", config.url); // Log to verify mock interception.
      return [
        400,
        {
          status_code: 400,
          error: "Bad Request",
          message: "Invalid or malformed asset format."
        }
      ];
    });

    const response = await request(app).get(`/api/cardano/tokens/${mockAssetId}`);

    // Debugging logs for verification.
    console.log("Response status:", response.status);
    console.log("Response body:", response.body);

    expect(response.status).toBe(400); // Should return 400 Bad Request.
    expect(response.body).toEqual({
      success: false,
      error: "Invalid or malformed asset format."
    });
  });

  /**
   * Test Case: Should handle server errors when Blockfrost is down.
   * 
   * Expected behavior:
   * - If Blockfrost is down, the API should return a 500 status code.
   * - The response should indicate an internal server error.
   */
  test("ensure blockfrost is not down", async () => {
    const mockAssetId = "d9312da562da1d29fba7c49dc172555274d657368546f6b656e";

    // Mock Blockfrost API to return a 500 Internal Server Error.
    mock.onGet(`${BLOCKFROST_BASE_URL}/assets/${mockAssetId}`).reply((config) => {
      console.log("✅ Mock Intercepted:", config.url); // Log to verify mock interception.
      return [
        500,
        {
          status_code: 500,
          error: "Internal Server Error",
          message: "Something went wrong on Blockfrost."
        }
      ];
    });

    const response = await request(app).get(`/api/cardano/tokens/${mockAssetId}`);

    expect(response.status).toBe(500); // Should return 500 Internal Server Error.
    expect(response.body).toEqual({
      success: false,
      error: "Something went wrong on Blockfrost."
    });
  });

  /**
   * Cleanup: Restore the mock adapter after all tests.
   * 
   * This ensures that no unintended requests are intercepted beyond this test suite.
   */
  afterAll(() => {
    mock.restore();
  });
});

