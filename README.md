# Microservices Project

Please see addational documentation.md

## Overview

This project consists of two independent microservices that communicate asynchronously using **RabbitMQ**. The services fetch and process data from the **Cardano blockchain** using the **Blockfrost API**. By decoupling them, we ensure scalability, resilience, and fault tolerance.

### Microservices

1. **Balance Service** – Fetches token balances for a given Cardano wallet.
2. **Token Metadata Service** – Retrieves metadata details for specific Cardano tokens.

### Communication Method

- Services communicate using **RabbitMQ message queues** to ensure they remain loosely coupled.
- Messages are published and consumed asynchronously to handle temporary failures gracefully.

## Setup Instructions

### Prerequisites

Ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (16+ recommended)
- [Docker](https://www.docker.com/) (for containerized deployment)
- [RabbitMQ](https://www.rabbitmq.com/) (can be run via Docker)

### 1. Clone the Repository

```sh
git clone https://github.com/yourusername/microservices-project.git
cd microservices-project
```

### 2. Set Up Environment Variables

Create a **.env** file in the root of the project and add the following:

```env
PORT=5002
BALANCE_PORT=5002
TOKEN_PORT=5003
BLOCKFROST_NETWORK=preprod  # Use "mainnet" or "testnet" if applicable
BLOCKFROST_API_KEY=your_blockfrost_api_key
RABBITMQ_URL=amqp://localhost  # Update if using a remote RabbitMQ instance
```

### 3. Install Dependencies

Run the following command to install project dependencies:

```sh
npm install
```

### 4. Start RabbitMQ

#### Option 1: Run RabbitMQ with Docker

```sh
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management
```

- Management UI available at: [http://localhost:15672](http://localhost:15672)
- Default Login: `guest` / `guest`

#### Option 2: Use a Local RabbitMQ Installation

Follow the official [RabbitMQ Installation Guide](https://www.rabbitmq.com/download.html) for your OS.

### 5. Start the Microservices

Each service runs independently. Open two terminal windows and run:

#### Start Token Metadata Service

```sh
npm run dev:token
```

#### Start Balance Service

```sh
npm run dev:balance
```

You can also run both services together:

#### Start All Services

```sh
npm run dev
```

### 6. Running Tests

Both **unit tests** and **integration tests** are included to validate functionality and communication between services.

#### Run All Tests

```sh
npm test
```

#### Run Unit Tests

```sh
npm run test:balance
npm run test:token
```

#### Run Integration Tests

```sh
npm run test:connection
npm run test:integration
```

### 7. API Endpoints

Current setup prefix = `/api/cardano`

| Service         | Endpoint                      | Description                                |
| --------------- | ----------------------------- | ------------------------------------------ |
| Balance Service | `GET /api/cardano/balance/:walletAddress` | Fetches token balances for a given wallet. |
| Token Service   | `GET /api/cardano/tokens/:assetId`        | Retrieves metadata for a specific token.   |

### 8. Deployment Considerations

- **Use Docker** to deploy services in isolated environments.
- **Configure RabbitMQ** via environment variables.
- **Implement logging and monitoring** to track message queue failures.

---
