const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { gql } = require('graphql-tag');
const { readFileSync } = require('fs');
const path = require('path');

const typeDefs = gql(readFileSync(path.join(__dirname, 'schema.graphql'), 'utf8'));

const inventories = [
    { productId: 'p1', count: 10 },
    { productId: 'p2', count: 0 },
    { productId: 'p3', count: 50 },
];

const resolvers = {
    Product: {
        inStock(product) {
            const inv = inventories.find(i => i.productId === product.id);
            return inv ? inv.count > 0 : false;
        },
        inventoryCount(product) {
            const inv = inventories.find(i => i.productId === product.id);
            return inv ? inv.count : 0;
        }
    }
};

const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
});

async function start() {
    const { url } = await startStandaloneServer(server, {
        listen: { port: 4003 },
    });
    console.log(`🚀 Inventory subgraph ready at ${url}`);
}

start();
