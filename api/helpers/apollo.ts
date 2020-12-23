import getApolloConfig from '../../apollo/config/server';
import { ApolloClient } from 'apollo-client';

const config = getApolloConfig();
export const client = new ApolloClient(config);
