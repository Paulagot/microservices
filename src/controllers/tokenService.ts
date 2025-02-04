// Desc: Controller for fetching token metadata from Blockfrost API
//controllers/tokenService.ts

import type { Request, Response } from "express";
import type { BlockfrostAssetInfo, ApiResponse } from "../types/cardanoTypes";
import axios from "axios";
import dotenv from "dotenv";

// Load environment variables from .env file (e.g., API keys)
dotenv.config();

// Retrieve Blockfrost API key from environment variables
const BLOCKFROST_API_KEY = process.env.BLOCKFROST_API_KEY || "";

// Base URL for Blockfrost API (Cardano testnet)
export const BLOCKFROST_BASE_URL = "https://cardano-preprod.blockfrost.io/api/v0";

// Create a pre-configured Axios instance for making API requests to Blockfrost
export const axiosInstance = axios.create({
  baseURL: BLOCKFROST_BASE_URL,
  headers: {
    'project_id': BLOCKFROST_API_KEY // API key for authentication
  }
});

/**
 * Utility function to convert an IPFS URL to an HTTP URL.
 * Blockfrost sometimes returns IPFS links, which must be converted
 * to be accessible via an HTTP gateway.
 * 
 * @param ipfsUrl - The IPFS URL to be converted
 * @returns The corresponding HTTP URL for accessing the file
 */
const ipfsToHttpUrl = (ipfsUrl: string): string => {
  if (ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  return ipfsUrl;
};

/**
 * Express handler to fetch token metadata from Blockfrost.
 * 
 * @param req - Express request object containing `assetId` as a route parameter
 * @param res - Express response object to send the result
 */
export const getTokenMetadata = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Extract asset ID from request parameters
    const { assetId } = req.params;

    // Validate that an asset ID was provided
    if (!assetId) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Asset ID is required"
      };
      res.status(400).json(response);
      return;
    }

    console.log("Fetching metadata for asset:", assetId);

    // Call Blockfrost API to fetch asset metadata
    const { data: assetInfo } = await axiosInstance.get<BlockfrostAssetInfo>(
      `/assets/${assetId}`
    );
    
    console.log("Asset Info from Blockfrost:", assetInfo);

    // Construct metadata response object
    const metadata = {
      name: assetInfo.onchain_metadata?.name || 
            assetInfo.metadata?.name || 
            assetInfo.asset_name || 
            "Unknown Token", // Default name if no metadata is found

      symbol: assetInfo.metadata?.ticker || 
              assetInfo.asset_name || 
              assetId.slice(0, 8), // Use asset ID as fallback symbol

      description: assetInfo.onchain_metadata?.description || 
                  assetInfo.metadata?.description || 
                  "", // Default empty description if not available

      image: assetInfo.onchain_metadata?.image ? 
             ipfsToHttpUrl(assetInfo.onchain_metadata.image) : 
             assetInfo.metadata?.logo || "", // Convert IPFS to HTTP if applicable

      assetId: assetId, // Echo the provided asset ID
      policyId: assetInfo.policy_id, // Cardano policy ID
      fingerprint: assetInfo.fingerprint, // Unique token fingerprint
      totalSupply: assetInfo.quantity, // Total token supply
      metadata: {
        onChain: assetInfo.onchain_metadata, // On-chain metadata
        offChain: assetInfo.metadata // Off-chain metadata, if available
      }
    };

    // Send a successful response with token metadata
    const response: ApiResponse<typeof metadata> = {
      success: true,
      data: metadata
    };

    res.status(200).json(response);
  } catch (error: unknown) {
    // Handle API errors specifically related to Axios
    if (axios.isAxiosError(error)) {
      console.error("Error fetching token metadata:", error.response?.data || error.message);
      const response: ApiResponse<null> = {
        success: false,
        error: error.response?.data?.message || "Failed to fetch token metadata"
      };
      res.status(error.response?.status || 500).json(response);
    } else {
      // Handle unexpected errors
      console.error("Unexpected error:", error);
      const response: ApiResponse<null> = {
        success: false,
        error: "Failed to fetch token metadata"
      };
      res.status(500).json(response);
    }
  }
};
