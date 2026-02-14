const fetch = require('cross-fetch');

const GATEWAY_URL = 'http://localhost:4000';

describe('Gateway Integration Tests', () => {
    it('should fetch data from all subgraphs in a single query', async () => {
        const query = `
      query GetDetails {
        me {
          username
          orders {
            id
            total
            items {
              name
              inStock
              inventoryCount
              reviews {
                body
                rating
              }
            }
          }
        }
      }
    `;

        const response = await fetch(GATEWAY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer user-1-token'
            },
            body: JSON.stringify({ query })
        });

        const body = await response.json();

        expect(body.data).toBeDefined();
        expect(body.data.me.username).toBe('alice');
        expect(body.data.me.orders[0].items[0].name).toBeDefined();
        expect(body.data.me.orders[0].items[0].inStock).toBeDefined();
    });

    it('should handle unauthorized requests', async () => {
        const query = `
      query GetMe {
        me {
          username
        }
      }
    `;

        const response = await fetch(GATEWAY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // No authorization header
            },
            body: JSON.stringify({ query })
        });

        const body = await response.json();
        // In our current implementation, me will be null if no userId in context
        expect(body.data.me).toBeNull();
    });
});
