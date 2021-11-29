import React, { useEffect, useState } from 'react';
import { Meta, Story } from '@storybook/react';
import Sunmao, {
  GraphQLDataSourceLoader,
  SunmaoProvider,
  getMetadata,
  library,
  component,
  GraphQLParams,
  useDataSource,
} from '../src';

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
  const dataSource = useDataSource<GraphQLParams>('graphql', {
    operationName: '',
    gql: ``,
  });
  return (
    <div>
      TestDataSource:
      <br />
    </div>
  );
}

const Template: Story = () => {
  const sunmao = new Sunmao();

  sunmao.addDataSourceLoader(new GraphQLDataSourceLoader());

  return (
    <SunmaoProvider sunmao={sunmao}>
      <TestDataSource />
    </SunmaoProvider>
  );
};

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {};
