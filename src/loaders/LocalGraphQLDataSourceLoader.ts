import { ApolloClient, gql } from '@apollo/client';

import { DataSet } from '../typings';
import { GraphQLDatasetConfig } from '../typings';
import { DataSource } from '../typings';
import { DataSourceLoader } from '../typings';

class LocalGraphQLDataSourceLoader implements DataSourceLoader<any> {
  type: string = 'local';
  private client: ApolloClient<any>;
  constructor(client: ApolloClient<any>) {
    this.client = client;
  }

  load(): DataSource {
    return {
      dataset: async (options: GraphQLDatasetConfig | any): Promise<DataSet<any>> => {
        const { gql: gqlStr, variables } = options;
        const { data, loading } = await this.client!.query({
          query: gql(gqlStr),
          variables,
          fetchPolicy: 'no-cache',
        });
        return { data: data, loading };
      },
    };
  }
}

export default LocalGraphQLDataSourceLoader;
