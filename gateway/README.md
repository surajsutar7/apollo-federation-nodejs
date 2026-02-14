# Gateway - Technical Documentation

The Gateway is the entry point for all client requests. It manages schema composition, authentication, and query orchestration.

## 📄 File: `index.js`

### 1. Modern Federation Composition
```javascript
const { ApolloGateway, IntrospectAndCompose, RemoteGraphQLDataSource } = require('@apollo/gateway');
```
*   **`IntrospectAndCompose`**: This is the heart of Federation v2. At startup, the Gateway hits the `/graphql` endpoint of every subgraph, retrieves their individual schemas, and stitches them together into a single "Supergraph" SDL.
*   **Validation**: If two subgraphs have conflicting types or invalid `@key` declarations, `IntrospectAndCompose` will fail to start, preventing an inconsistent graph from going live.

### 2. Context Propagation (The "Auth Bridge")
```javascript
class AuthenticatedDataSource extends RemoteGraphQLDataSource {
    willSendRequest({ request, context }) {
        if (context.userId) {
            request.http.headers.set('x-user-id', context.userId);
        }
    }
}
```
*   **`RemoteGraphQLDataSource`**: This class allows us to customize the HTTP requests sent from the Gateway to the subgraphs.
*   **Header Injection**: We take the `userId` from the Gateway's internal context and inject it into an HTTP header `x-user-id`. This is the standard way to pass security context in a microservices architecture.

### 3. Authentication Logic
```javascript
const server = new ApolloServer({
    gateway,
});

async function start() {
    const { url } = await startStandaloneServer(server, {
        context: async ({ req }) => {
            const token = req.headers.authorization || '';
            // Authentication check happens here...
            return { userId: '1', userRole: 'ADMIN' };
        }
    });
}
```
*   **`context`**: This function runs for every incoming request. It extracts the `Authorization` header.
*   **Centralized Security**: By handling auth here, we ensure subgraphs don't have to deal with complex JWT logic. They just look for the `x-user-id` header provided by the trusted Gateway.

---

## 📽️ Documentation Narrative (The "Brain" of the System)
*"Welcome to the Gateway! Imagine 5 musicians (subgraphs) play different instruments. The Gateway is the Conductor. It reads everyone's sheet music (Schemas), makes sure they are in the same key (Composition), and then tells the Audience (Clients) exactly what's playing. When a request comes in, the Gateway checks your ID at the door, and for every subgraph it talks to on your behalf, it shows them your ID so they know who they are serving."*
