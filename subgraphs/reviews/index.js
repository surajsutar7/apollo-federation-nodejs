const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { gql } = require('graphql-tag');
const { readFileSync } = require('fs');
const path = require('path');

const typeDefs = gql(readFileSync(path.join(__dirname, 'schema.graphql'), 'utf8'));

const reviews = [
    { id: 'r1', body: 'Great laptop!', authorId: '1', productId: 'p1', rating: 5 },
    { id: 'r2', body: 'Awesome phone!', authorId: '2', productId: 'p2', rating: 4 },
];

const resolvers = {
    Review: {
        author(review) {
            return { __typename: 'User', id: review.authorId };
        },
        product(review) {
            return { __typename: 'Product', id: review.productId };
        }
    },
    User: {
        reviews(user) {
            return reviews.filter(r => r.authorId === user.id);
        }
    },
    Product: {
        reviews(product) {
            return reviews.filter(r => r.productId === product.id);
        }
    }
};

const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
});

async function start() {
    const { url } = await startStandaloneServer(server, {
        listen: { port: 4005 },
    });
    console.log(`🚀 Reviews subgraph ready at ${url}`);
}

start();
