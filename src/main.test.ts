import { ApolloServer, gql } from 'apollo-server';
import {
  ApolloServerTestClient,
  createTestClient,
} from 'apollo-server-testing';

import resolvers from './resolvers';
import typeDefs from './type-defs';

describe('main', (): void => {
  let apolloServerTestClient: ApolloServerTestClient;

  beforeEach((): void => {
    const testApolloServer = new ApolloServer({ resolvers, typeDefs });
    apolloServerTestClient = createTestClient(testApolloServer);
  });

  describe('Query: testMessage', (): void => {
    it('should return test message "Hello World!"', async (): Promise<void> => {
      const query = gql`
        query TestMessage {
          testMessage
        }
      `;
      const { data } = await apolloServerTestClient.query({ query });

      expect(data).toEqual({ testMessage: 'Hello World!' });
    });
  });
});
