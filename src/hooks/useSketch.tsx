import React, { useEffect, useMemo, useReducer, useRef } from 'react';

import SketchProvider from '../sketch/SketchProvider';
import { IComponentDefinition } from '../typings';
import { generateUUID, useDeepCompareEffect } from '../utils';
import useComponent from './useComponent';

interface IOptions {
  id: string;
}

interface UseSketchState {
  component?: IComponentDefinition;
  props: any[];
}

export default function useSketch(id: string, injectProps: any[] = [], _?: IOptions) {
  // const key = useRef(options?.id || generateUUID());
  const component = useComponent(id);
  const state = useRef<UseSketchState>({ component, props: injectProps });

  const forceRender = useRef<React.DispatchWithoutAction>();

  // const reactComponent = useMemo(() => {
  //   return function () {
  //     const [version, trigger] = useReducer((s) => s + 1, 0);

  //     const { component, props } = state.current;

  //     useEffect(() => {
  //       // forceRender.current = trigger;
  //     }, []);

  //     return (
  //       <SketchProvider value={props} version={version}>
  //         {React.createElement(component?.component!)}
  //       </SketchProvider>
  //     );
  //   };
  // }, []);

  useEffect(() => {
    if (state.current.component === component) {
      return;
    }
    state.current.component = component;
    forceRender.current!();
  }, [component]);

  useDeepCompareEffect(() => {
    if (state.current.props === injectProps) {
      return;
    }
    state.current.props = injectProps;
    forceRender.current!();
  }, [injectProps]);

  return () => <div>123</div>;

  // const reactComponent = useMemo(() => {
  //   return function () {};
  // }, [reactComponent]);

  // useEffect(() => {
  //   if (!options?.id || options.id == key.current) {
  //     return;
  //   }
  //   key.current = options.id;
  //   forceRender();
  // }, [options?.id]);

  // useDeepCompareEffect(() => {
  //   emitter.current.emit(EVENT_SKETCH_PROPS_CHANGE, sketchProps);
  // }, [sketchProps]);

  // useEffect(() => {
  //   if (!component) {
  //     return;
  //   }
  //   const { component: Component, ...info } = component;
  //   const ReactComponent: any = createSketchReactComponent(key.current, Component, sketchProps, emitter);
  //   ReactComponent.info = info;
  //   AsanyComponent.current = ReactComponent;
  //   forceRender();
  // }, [component, key.current]);

  // return AsanyComponent.current;
}
