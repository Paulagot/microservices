// src/test-integration.ts

import axios from 'axios';
import type { AxiosError } from 'axios';
import { BalanceService } from './services/balanceService';
import { TokenService } from './services/tokenService';
import type { ApiResponse, BlockfrostAsset, TokenData } from './types/cardanoTypes';

const API_BASE_URL = 'http://localhost:5002/api/cardano';

async function testMultiTokenIntegration() {
  try {
    console.log('Starting multi-token integration test...');

    // Initialize message queue services
    const balanceService = new BalanceService();
    const tokenService = new TokenService();

    await Promise.all([
      balanceService.init(),
      tokenService.init()
    ]);
    console.log('Message queue services initialized\n');

    // Test wallet address with multiple tokens
    const testAddress = 'addr_test1vz09v9yfxguvlp0zsnrpa3tdtm7el8xufp3m5lsm7qxzclgmzkket';
    
    // Test the balance endpoint
    console.log('Testing balance endpoint...');
    try {
      const balanceResponse = await axios.get<ApiResponse<BlockfrostAsset[]>>(
        `${API_BASE_URL}/balance/${testAddress}`
      );
      
      if (balanceResponse.data.success && balanceResponse.data.data) {
        const assets = balanceResponse.data.data;
        console.log(`Found ${assets.length} assets in wallet:`);
        console.log('Balance endpoint response:', JSON.stringify(assets, null, 2));
        
        // Send balance update through message queue
        await balanceService.updateBalance(testAddress, assets);
        console.log('Balance update sent to message queue\n');
        
        // Get metadata for each non-ADA token
        const nonAdaAssets = assets.filter(asset => asset.unit !== 'lovelace');
        console.log(`Processing ${nonAdaAssets.length} non-ADA tokens...\n`);
        
        const tokenPromises = nonAdaAssets.map(async (asset) => {
          try {
            const tokenResponse = await axios.get<ApiResponse<{ symbol: string; name: string; image: string }>>(
              `${API_BASE_URL}/tokens/${asset.unit}`
            );
            
            if (tokenResponse.data.success && tokenResponse.data.data) {
              return {
                symbol: tokenResponse.data.data.symbol,
                name: tokenResponse.data.data.name,
                balance: asset.quantity,
                icon: tokenResponse.data.data.image
              };
            }
          } catch (error) {
            const axiosError = error as AxiosError<ApiResponse<null>>;
            console.error(`Error fetching metadata for token ${asset.unit}:`, 
              axiosError.response?.data || axiosError.message);
          }
          return null;
        });

        const tokenDataArray = (await Promise.all(tokenPromises)).filter((token): token is TokenData => token !== null);
        
        if (tokenDataArray.length > 0) {
          console.log('Token metadata collected for all assets:', 
            JSON.stringify(tokenDataArray, null, 2));
          
          // Send token update through message queue
          await tokenService.updateTokens(testAddress, tokenDataArray);
          console.log('Token updates sent to message queue\n');
        }
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      console.error('Balance endpoint error:', axiosError.response?.data || axiosError.message);
    }

    // Wait for messages to be processed
    console.log('Waiting for message processing...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('\nIntegration test completed!');
    process.exit(0);
  } catch (error) {
    console.error('Integration test failed:', error);
    process.exit(1);
  }
}

testMultiTokenIntegration().catch(console.error);