const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { gql } = require('graphql-tag');
const { readFileSync } = require('fs');
const path = require('path');

const typeDefs = gql(readFileSync(path.join(__dirname, 'schema.graphql'), 'utf8'));

const users = [
    { id: '1', username: 'alice', email: 'alice@example.com', role: 'ADMIN' },
    { id: '2', username: 'bob', email: 'bob@example.com', role: 'USER' },
];

const resolvers = {
    Query: {
        me: (parent, args, context) => {
            return users.find(u => u.id === context.userId);
        },
        user: (parent, { id }) => users.find(u => u.id === id),
    },
    User: {
        __resolveReference(user) {
            return users.find(u => u.id === user.id);
        }
    }
};

const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
});

async function start() {
    const { url } = await startStandaloneServer(server, {
        listen: { port: 4001 },
        context: async ({ req }) => {
            const userId = req.headers['x-user-id'];
            return { userId };
        },
    });
    console.log(`🚀 Users subgraph ready at ${url}`);
}

start();
