# Cardano Microservices Implementation Documentation

## Research Phase: Understanding Microservices and Communication Patterns

Before jumping into building the microservices, I spent some time understanding the fundamentals. Microservices architecture is all about breaking down an application into small, independent services that can be developed, deployed, and scaled separately. The key advantage here is that it allows for better maintainability, easier debugging, and the ability to scale specific parts of the system without affecting everything else.  If one service goes down, the others should not as they are independent.
One of the most important things to figure out was how these services should communicate. There are two main ways microservices talk to each other:

1.Synchronous Communication – This uses HTTP-based APIs (like REST or GraphQL). It’s straightforward but can lead to tight coupling, meaning one service depends on another always being available.

2.Asynchronous Communication – This is where services communicate via messaging systems like RabbitMQ, Kafka, or even Redis Pub/Sub. It allows services to send messages without waiting for an immediate response, making the system more resilient and scalable.

I decided to use RabbitMQ for asynchronous messaging. This way, even if one service is temporarily down, messages can still be processed when it comes back online. RabbitMQ’s message queues make it easy to handle communication between services without them needing to directly depend on each other.

For deployment, I chose Docker to containerize both microservices, making them easy to run and manage across different environments. I was able to define and run both services alongside RabbitMQ in a controlled environment, ensuring that everything worked together smoothly without having to manually configure dependencies.  Although, being honest, I don’t really understand the need for docker or something for deployment.

## Development Phase

### Architecture Overview

The project implements two microservices that interact with the Cardano blockchain:
(I selected the following two microservices as I had some code that I was working on anyway. Looking back now, I see the communication of these two microservices is not the best use case example)

1. **Balance Service**
   - Retrieves token balances for Cardano wallets
   - Endpoint: `GET /api/cardano/balance/:walletAddress`
   - Uses Blockfrost API for blockchain data access

2. **Token Metadata Service**
   - Fetches metadata for specific Cardano tokens
   - Endpoint: `GET /api/cardano/tokens/:assetId`
   - Processes token information asynchronously

### Message Queue Implementation

RabbitMQ serves as the message broker with the following configuration:

- Exchange: `cardano_exchange` (Direct Exchange)
- Queues:
  - `balance_queue`: Handles balance updates
  - `token_queue`: Manages token metadata updates
- Routing Keys:
  - `balance`: Routes to balance_queue
  - `token`: Routes to token_queue

### Key Design Decisions

1. **API Structure**
   - RESTful endpoints for direct service access
   - Consistent URL patterns using `/api/cardano` prefix
   - Structured response formats for both success and error cases

2. **Error Handling**
   - Input validation with 400 Bad Request responses
   - API error handling with appropriate status codes
   - Generic 500 errors for unexpected issues
   - Error isolation between services

3. **Configuration Management**
   - Environment variables for sensitive data
   - Separate configuration for development and production
   - Docker compatibility for deployment

## Testing Strategy

### Test Categories

1. **Unit Tests**
   - Individual service functionality
   - API endpoint validation
   - Error handling verification
   - Mock external dependencies (Blockfrost API)

2. **Integration Tests**
   - Inter-service communication
   - Message queue reliability
   - End-to-end workflows
   - Error recovery scenarios

### Test Implementation

Test suites are implemented using Jest:

```sh
# Run all tests
npm test

# Service-specific tests
npm run test:balance
npm run test:token

# Integration tests
npm run test:integration
```

### Test Coverage

Tests validate:

- API response correctness
- Message queue operations
- Error handling scenarios
- External API interactions
- System recovery capabilities

## Deployment Considerations

1. **Environment Setup**
   - Node.js 16+ required
   - Docker for containerization
   - RabbitMQ instance (local or containerized)

2. **Configuration**
   - Environment variables via .env file
   - Separate ports for each service
   - Configurable Blockfrost network settings

3. **Service Management**
   - Independent service deployment
   - Docker container orchestration
   - RabbitMQ management interface

## Challenges and Solutions

1. **Service Independence**
   - Challenge: Maintaining service autonomy
   - Solution: Asynchronous communication via RabbitMQ

2. **Error Handling**
   - Challenge: Managing service failures
   - Solution: Comprehensive error handling and message queue reliability

3. **Testing Complexity**
   - Challenge: Testing asynchronous operations
   - Solution: Combination of unit and integration tests with mock implementations

## Future Improvements

1. **Monitoring and Logging**
   - Implement comprehensive logging
   - Add performance monitoring
   - Set up alerting systems

2. **Scalability**
   - Implement load balancing
   - Add service discovery
   - Enhance message queue clustering

3. **Security**
   - Add authentication/authorization
   - Implement rate limiting
   - Enhance error handling security
