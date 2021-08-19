import React, { ComponentType, forwardRef, memo, useReducer, useRef } from 'react';

import { copyMetadata, useDeepCompareEffect } from '../utils';
import useComponent from './useComponent';

const NotFound: any = React.forwardRef((_, _ref: any) => <></>);

NotFound.info = {
  name: 'notFound',
  props: [],
  configuration: () => <div>Not Found</div>,
};

function useReactComponent(id: string, defaultProps?: any) {
  const component = useComponent(id);
  const ReactComponent = useRef<ComponentType<any>>(NotFound);
  const [, forceRender] = useReducer((s) => s + 1, 0);
  useDeepCompareEffect(() => {
    if (!component) {
      ReactComponent.current = NotFound;
      return forceRender();
    }
    const { component: Component } = component;
    const RComponent: any = memo(
      forwardRef((props: any, ref) => {
        return <Component {...defaultProps} {...props} ref={ref} />;
      })
    );
    copyMetadata(component, RComponent);
    ReactComponent.current = RComponent;
    forceRender();
  }, [component, defaultProps]);
  return ReactComponent.current;
}

export default useReactComponent;
