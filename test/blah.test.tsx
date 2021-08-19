import React from 'react';
import * as ReactDOM from 'react-dom';
// import { Default as Thing } from '../stories/Basis.stories';

describe('Thing', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<div />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
