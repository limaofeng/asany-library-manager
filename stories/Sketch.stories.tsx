import React from 'react';
import { Meta, Story } from '@storybook/react';
import Sunmao, {
  SunmaoProvider,
  getMetadata,
  library,
  component,
  useSketch,
  useBlock,
  ComponentPropertyType,
} from '../src';

import Showme from './Showme';
import { useEffect } from '@storybook/addons';
import { useDispatch } from '../src/sketch/SketchProvider';

const meta: Meta = {
  title: 'Sketch',
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



@library({ name: 'test', description: '测试库', namespace: 'cn.asany.ui.sunmao.test' })
class TestLibrary {
  @component()
  showme = Showme;

  @component({ name: 'Boot' })
  boot() {
    return () => <div>---boot---</div>;
  }
}

function TestSunmao() {
  const Component = useSketch('cn.asany.ui.sunmao.test.Showme');

  return (
    <div>
      useSketch:
      <br />
      <Component />
    </div>
  );
}

const Template: Story = () => {
  const sunmao = new Sunmao();

  const x = new TestLibrary();

  const components = (x as any).components;

  console.log('components', components);

  for (const com of components) {
    console.log('>>>', getMetadata(com));
  }

  sunmao.addLibrary(x as any);

  return (
    <SunmaoProvider sunmao={sunmao}>
      <TestSunmao />
    </SunmaoProvider>
  );
};

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {};
