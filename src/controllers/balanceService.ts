// controllers/balanceService.ts

import type { Request, Response } from "express";
import type { 
  BlockfrostAddressInfo,  // Type definition for expected response from Blockfrost API
  ApiResponse  // Type definition for API responses
} from "../types/cardanoTypes";
import axios from "axios";
import dotenv from "dotenv";

// Load environment variables from .env file (API keys, configs, etc.)
dotenv.config();

// Retrieve Blockfrost API key from environment variables
const BLOCKFROST_API_KEY = process.env.BLOCKFROST_API_KEY || "";

// Base URL for Blockfrost API (Cardano testnet)
const BLOCKFROST_BASE_URL = "https://cardano-preprod.blockfrost.io/api/v0";

// Create a pre-configured Axios instance for making API requests to Blockfrost
export const axiosInstance = axios.create({
  baseURL: BLOCKFROST_BASE_URL,
  headers: {
    'project_id': BLOCKFROST_API_KEY // API key for authentication
  }
});

/**
 * Controller function to fetch the balance of a given Cardano wallet address.
 * 
 * @param req - Express request object containing `walletAddress` as a route parameter
 * @param res - Express response object to send the result
 */
export const getBalance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Extract wallet address from request parameters
    const { walletAddress } = req.params;
    
    // Validate that a wallet address was provided
    if (!walletAddress) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Wallet address is required"
      };
      res.status(400).json(response);
      return;
    }

    console.log("Fetching balance for address:", walletAddress);

    // Call the Blockfrost API to get wallet balance details
    const { data: addressInfo } = await axiosInstance.get<BlockfrostAddressInfo>(
      `/addresses/${walletAddress}`
    );
    
    console.log("Address Info from Blockfrost:", addressInfo);

    // Extract and format response data
    const response: ApiResponse<BlockfrostAddressInfo['amount']> = {
      success: true,
      data: addressInfo.amount // Contains the balance in Lovelace and other assets
    };
    
    // Send a successful response with the wallet balance
    res.status(200).json(response);
  } catch (error: unknown) {
    // Handle API errors specifically related to Axios
    if (axios.isAxiosError(error)) {
      console.error("Error fetching balance:", error.response?.data || error.message);
      const response: ApiResponse<null> = {
        success: false,
        error: error.response?.data?.message || "Failed to fetch wallet balance"
      };
      res.status(error.response?.status || 500).json(response);
    } else {
      // Handle unexpected errors
      console.error("Unexpected error:", error);
      const response: ApiResponse<null> = {
        success: false,
        error: "Failed to fetch wallet balance"
      };
      res.status(500).json(response);
    }
  }
};
