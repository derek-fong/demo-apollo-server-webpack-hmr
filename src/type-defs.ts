import { gql } from 'apollo-server';

export default gql`
  type Query {
    """
    Test message.
    """
    testMessage: String!
  }
`;
