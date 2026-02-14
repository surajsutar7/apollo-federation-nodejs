const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { gql } = require('graphql-tag');
const { readFileSync } = require('fs');
const path = require('path');

const typeDefs = gql(readFileSync(path.join(__dirname, 'schema.graphql'), 'utf8'));

const products = [
    { id: 'p1', name: 'Laptop', description: 'High-end gaming laptop', price: 1500.0 },
    { id: 'p2', name: 'Smartphone', description: 'Latest model with 5G', price: 800.0 },
    { id: 'p3', name: 'Headphones', description: 'Noise cancelling', price: 200.0 },
];

const resolvers = {
    Query: {
        products: () => products,
        product: (parent, { id }) => products.find(p => p.id === id),
    },
    Product: {
        __resolveReference(product) {
            return products.find(p => p.id === product.id);
        }
    }
};

const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
});

async function start() {
    const { url } = await startStandaloneServer(server, {
        listen: { port: 4002 },
    });
    console.log(`🚀 Products subgraph ready at ${url}`);
}

start();
