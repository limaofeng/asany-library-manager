import type { ApolloClient } from '@apollo/client';
import gql from 'graphql-tag';

import { DataSourceLoader, DataSourceResult } from '../typings';

export interface GraphQLParams {
  operationName: string;
  client?: ApolloClient<any>;
  gql: string;
  variables?: any;
}

class GraphQLDataSourceLoader implements DataSourceLoader<GraphQLParams> {
  type: string = 'graphql';

  async load<T>(param: GraphQLParams): Promise<DataSourceResult<T>> {
    const { client, gql: gqlStr, variables, operationName } = param;
    const { data, loading } = await client!.query({
      query: gql(gqlStr),
      variables,
      fetchPolicy: 'no-cache',
    });
    return { data: data[operationName], loading };
  }
}

export default GraphQLDataSourceLoader;
