// src/test-connection.ts

// to run npx ts-node src/test-connection.ts
// src/test-connection.ts

import { BalanceService } from './services/balanceService';
import { TokenService } from './services/tokenService';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BALANCE_PORT = process.env.BALANCE_PORT || 5002;
const TOKEN_PORT = process.env.TOKEN_PORT || 5003;


async function testMessageQueue() {
  try {
    console.log('\nStarting RabbitMQ connection test...');

    // Initialize services
    const balanceService = new BalanceService();
    const tokenService = new TokenService();

    // Connect both services
    console.log('Initializing services...');
    await Promise.all([
      balanceService.init(),
      tokenService.init()
    ]);
    console.log('✅ Services initialized successfully');

    // Test data
    const testAddress = 'addr1test123';
    const testBalance = [{
      unit: 'lovelace',
      quantity: '1000000'
    }];
    const testTokens = [{
      symbol: 'TEST',
      name: 'Test Token',
      balance: '100',
      icon: 'test-icon'
    }];

    console.log('\nSending test messages...');
    console.log('Test address:', testAddress);
    console.log('Test balance:', JSON.stringify(testBalance, null, 2));
    console.log('Test tokens:', JSON.stringify(testTokens, null, 2));

    // Test message from Balance to Token service
    console.log('\nSending Balance -> Token message...');
    await balanceService.updateBalance(testAddress, testBalance);
    console.log('✅ Balance message sent');

    // Test message from Token to Balance service
    console.log('\nSending Token -> Balance message...');
    await tokenService.updateTokens(testAddress, testTokens);
    console.log('✅ Token message sent');

    // Wait for message processing
    console.log('\nWaiting for messages to be processed...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    return true;
  } catch (error) {
    console.error('❌ Message Queue test failed:', error);
    return false;
  }
}

async function runAllTests() {
  try {
       //  test the message queue
    const mqTestResult = await testMessageQueue();

    console.log('\n=== Test Summary ===');
    if (mqTestResult) {
      console.log('✅ Message Queue: Passed');
    } else {
      console.log('❌ Message Queue: Failed');
    }

    console.log('\nTest completed!');
    process.exit(mqTestResult ? 0 : 1);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Run all tests
runAllTests().catch(console.error);