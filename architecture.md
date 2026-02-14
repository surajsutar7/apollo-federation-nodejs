# Apollo Federation POC: Production-Ready Architecture

This document outlines the design, considerations, and implementation plan for a production-ready Apollo Federation v2 setup using Node.js and GraphQL.

## 1. System Architecture

We will implement a Gateway and 5 specialized subgraphs to demonstrate a decoupled microservices architecture.

### Subgraphs
1.  **Users Service**: Manages accounts, profiles, and authentication (JWT).
2.  **Products Service**: Manages the product catalog and details.
3.  **Inventory Service**: Tracks stock levels for products.
4.  **Orders Service**: Handles customer orders, linking Users and Products.
5.  **Reviews Service**: Manages product reviews by users.

### The Gateway
The Gateway acts as the single entry point. It handles:
- **Schema Composition**: Combining subgraphs into a single Supergraph.
- **Authentication**: Validating JWTs at the edge.
- **Request Routing**: Forwarding operations to appropriate subgraphs with user context.

---

## 2. Key Considerations for Production

### Authentication & Authorization
- **Authentication at the Edge**: The Gateway verifies tokens. This prevents unauthenticated traffic from reaching internal services.
- **Context Propagation**: The Gateway passes `x-user-id` and `x-user-role` headers to subgraphs.
- **Subgraph Authorization**: Each subgraph is responsible for its own business logic authorization (e.g., "Can this user delete this review?").

### Reliability & Scalability
- **Managed Federation vs. Local Composition**: For production, Apollo GraphOS (Managed Federation) is recommended for schema registry. For this POC, we will use **Local Composition** with `introspect-and-compose` for simplicity.
- **Error Handling**: Use Apollo's formatError to avoid leaking internal stack traces.
- **Caching**: Implement query result caching at the gateway and field-level caching in subgraphs.

### Observability
- **Distributed Tracing**: Essential for Federation to see how a query hops across services.
- **Health Checks**: Each subgraph should expose a `/health` endpoint.

---

## 3. Implementation Suggestions

- **Language**: TypeScript (strongly recommended for production to ensure type safety across schemas).
- **Communication**: Use `HTTP` for Federated queries. For inter-service communication outside GraphQL (e.g., event-driven updates), use RabbitMQ or Kafka.
- **Database**: Each subgraph should have its own database (Database-per-service pattern) to ensure loose coupling.

## 4. How to Run the POC

### Prerequisites
- Node.js v20+
- `npm`

### Installation
```bash
npm install
```

### Running Locally
To start all 5 subgraphs and the Gateway concurrently:
```bash
npm run dev
```
The Gateway will be available at `http://localhost:4000`. You can use the **Apollo Sandbox** there to explore the schema.

### Testing Authentication
The POC includes a simulated JWT authentication mechanism in the Gateway.
- Use `Authorization: Bearer user-1-token` to act as Alice (ADMIN).
- Use `Authorization: Bearer user-2-token` to act as Bob (USER).

### Real-time Testing
We use `jest` and `cross-fetch` for integration testing. These tests verify that the Gateway can correctly orchestrate queries across all 5 subgraphs.

**To run tests:**
1. Ensure the services are running (`npm run dev`).
2. In a new terminal, run:
```bash
npm test
```

---

## 5. Suggestions for Further Implementation

1. **Schema Registry**: Use Apollo GraphOS for schema managed federation.
2. **Database Integration**: Replace the in-memory arrays with PostgreSQL (for relational data like Orders/Users) and MongoDB (for nested data like Reviews).
3. **CI/CD**: Add a step in your pipeline to run `rover subgraph check` to prevent breaking changes in the supergraph.
4. **Rate Limiting**: Implement rate limiting at the Gateway level to protect subgraphs.
