// src/test-connection.ts

// to run npx ts-node src/test-connection.ts


import { BalanceService } from './services/balanceService';
import { TokenService } from './services/tokenService';

async function testConnection() {
  try {
    console.log('Starting RabbitMQ connection test...');

    // Initialize services
    const balanceService = new BalanceService();
    const tokenService = new TokenService();

    // Connect both services
    console.log('Initializing services...');
    await Promise.all([
      balanceService.init(),
      tokenService.init()
    ]);
    console.log('Services initialized successfully');

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
    console.log('Balance message sent');

    // Test message from Token to Balance service
    console.log('\nSending Token -> Balance message...');
    await tokenService.updateTokens(testAddress, testTokens);
    console.log('Token message sent');

    // Keep the process running longer to ensure messages are processed
    console.log('\nWaiting for messages to be processed...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    console.log('\nTest completed!');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testConnection().catch(console.error);