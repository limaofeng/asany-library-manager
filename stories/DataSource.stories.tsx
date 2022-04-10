import React, { useEffect, useState } from 'react';
import { Meta, Story } from '@storybook/react';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import Sunmao, {
  GraphQLDataSourceLoader,
  SunmaoProvider,
  getMetadata,
  library,
  component,
  useDataSource,
  GraphQLDatasetConfig,
} from '../src';
import useDataSet from '../src/hooks/useDataSet';

const client = new ApolloClient({
  uri: 'http://localhost:8080/graphql',
  cache: new InMemoryCache(),
});

const meta: Meta = {
  title: 'DataSource',
  // component: ,
  argTypes: {
    children: {
      control: {
        type: 'text',
      },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

function TestDataSource() {
  const { loading, data } = useDataSet<GraphQLDatasetConfig>('local', {
    gql: `query articleChannels($parent: ID) {
      channels: articleChannels(filter: { parent: $parent, descendant: true }) {
        id
        name
        parent {
          id
        }
        path
      }
    }    
    `,
  });

  console.log(loading, data);

  return (
    <div>
      TestDataSource:
      <br />
    </div>
  );
}

const Template: Story = () => {
  const sunmao = new Sunmao();

  sunmao.addDataSourceLoader(new GraphQLDataSourceLoader(client));

  return (
    <ApolloProvider client={client}>
      <SunmaoProvider sunmao={sunmao}>
        <TestDataSource />
      </SunmaoProvider>
    </ApolloProvider>
  );
};

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {};
