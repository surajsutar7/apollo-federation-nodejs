const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { gql } = require('graphql-tag');
const { readFileSync } = require('fs');
const path = require('path');

const typeDefs = gql(readFileSync(path.join(__dirname, 'schema.graphql'), 'utf8'));

const orders = [
    { id: 'o1', buyerId: '1', productIds: ['p1', 'p3'], total: 1700.0 },
    { id: 'o2', buyerId: '2', productIds: ['p2'], total: 800.0 },
];

const resolvers = {
    Query: {
        orders: () => orders,
        order: (parent, { id }) => orders.find(o => o.id === id),
    },
    Order: {
        buyer(order) {
            return { __typename: 'User', id: order.buyerId };
        },
        items(order) {
            return order.productIds.map(id => ({ __typename: 'Product', id }));
        }
    },
    User: {
        orders(user) {
            return orders.filter(o => o.buyerId === user.id);
        }
    }
};

const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
});

async function start() {
    const { url } = await startStandaloneServer(server, {
        listen: { port: 4004 },
    });
    console.log(`🚀 Orders subgraph ready at ${url}`);
}

start();
