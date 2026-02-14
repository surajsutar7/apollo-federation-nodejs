const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { ApolloGateway, IntrospectAndCompose, RemoteGraphQLDataSource } = require('@apollo/gateway');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-very-secure-secret';

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
    willSendRequest({ request, context }) {
        // Pass the user ID and roles to the subgraphs via headers
        if (context.userId) {
            request.http.headers.set('x-user-id', context.userId);
        }
        if (context.userRole) {
            request.http.headers.set('x-user-role', context.userRole);
        }
    }
}

const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
        subgraphs: [
            { name: 'users', url: 'http://localhost:4001' },
            { name: 'products', url: 'http://localhost:4002' },
            { name: 'inventory', url: 'http://localhost:4003' },
            { name: 'orders', url: 'http://localhost:4004' },
            { name: 'reviews', url: 'http://localhost:4005' },
        ],
    }),
    buildService({ name, url }) {
        return new AuthenticatedDataSource({ url });
    },
});

const server = new ApolloServer({
    gateway,
});

async function start() {
    const { url } = await startStandaloneServer(server, {
        context: async ({ req }) => {
            const token = req.headers.authorization || '';
            if (token) {
                try {
                    // In a real app, you'd verify the JWT here
                    // For this POC, we'll simulate a valid token and decode it
                    // const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);

                    // Simulated decoding for demonstration
                    if (token === 'Bearer user-1-token') {
                        return { userId: '1', userRole: 'ADMIN' };
                    } else if (token === 'Bearer user-2-token') {
                        return { userId: '2', userRole: 'USER' };
                    }
                } catch (err) {
                    console.error('Invalid token', err);
                }
            }
            return {};
        },
        listen: { port: 4000 },
    });
    console.log(`🚀 Gateway ready at ${url}`);
}

start();
