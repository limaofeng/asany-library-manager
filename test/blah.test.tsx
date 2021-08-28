import React from 'react';

import * as ReactDOM from 'react-dom';

import { Default as Basis } from '../stories/Basis.stories';

describe('Thing', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Basis />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
