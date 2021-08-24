import { EventEmitter } from 'events';
import React, { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

import ReactComponentProvider from '../sketch/ReactComponentProvider';
import { IComponentDefinition } from '../typings';
import { useDeepCompareEffect } from '../utils';
import useComponent from './useComponent';

const EVENT_REACT_COMPONENT_PROPS_CHANGE = 'EVENT_REACT_COMPONENT_PROPS_CHANGE';

interface IOptions {
  id: string;
}

interface UseReactComponentState {
  component?: IComponentDefinition;
  props: any[];
}

function createReactComponentComponent(state: React.RefObject<UseReactComponentState>, emitter: EventEmitter) {
  return function () {
    const [version, forceRender] = useReducer((s) => s + 1, 0);

    const { component, props } = state.current!;

    useEffect(() => {
      emitter.addListener(EVENT_REACT_COMPONENT_PROPS_CHANGE, forceRender);
      return () => {
        emitter.removeListener(EVENT_REACT_COMPONENT_PROPS_CHANGE, forceRender);
      };
    }, []);

    return (
      <ReactComponentProvider value={props} version={version}>
        {React.createElement(component?.component!)}
      </ReactComponentProvider>
    );
  };
}

export default function useReactComponent(id: string, injectProps: any[] = [], _?: IOptions) {
  const component = useComponent(id);
  const emitter = useMemo<EventEmitter>(() => new EventEmitter(), []);
  const state = useRef<UseReactComponentState>({ component, props: injectProps });
  const reactComponent = useRef(createReactComponentComponent(state, emitter));

  const forceRender = useCallback(() => {
    emitter.emit(EVENT_REACT_COMPONENT_PROPS_CHANGE);
  }, []);

  useEffect(() => {
    if (state.current.component === component) {
      return;
    }
    state.current.component = component;
    forceRender();
  }, [component]);

  useDeepCompareEffect(() => {
    if (state.current.props === injectProps) {
      return;
    }
    state.current.props = injectProps;
    forceRender();
  }, [injectProps]);

  return reactComponent.current;
}
