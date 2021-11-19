import React, { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

import { EventEmitter } from 'events';

import ReactComponentProvider from '../sketch/ReactComponentProvider';
import { IBlockCoreData, IComponentDefinition } from '../typings';
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

type ExternalProps = {
  children?: React.ReactNode;
  [key: string]: any;
};

function createReactComponentComponent(
  id: string | undefined,
  state: React.RefObject<UseReactComponentState>,
  emitter: EventEmitter
): React.ComponentType {
  return function (externalProps: ExternalProps) {
    const { children, ...passthroughProps } = externalProps;
    const [version, forceRender] = useReducer((s) => s + 1, 0);
    const cache = useRef<any>(externalProps || {});

    const { component, props } = state.current!;

    useEffect(() => {
      emitter.addListener(EVENT_REACT_COMPONENT_PROPS_CHANGE, forceRender);
      return () => {
        emitter.removeListener(EVENT_REACT_COMPONENT_PROPS_CHANGE, forceRender);
      };
    }, []);

    useEffect(() => {
      for (const key of Object.keys(externalProps)) {
        if (cache.current[key] !== externalProps[key]) {
          forceRender();
          return;
        }
      }
      return () => {
        cache.current = externalProps;
      };
    }, [externalProps]);

    return (
      <ReactComponentProvider id={id} value={props} version={version}>
        {component && React.createElement(component.component, passthroughProps, children)}
      </ReactComponentProvider>
    );
  };
}

export default function useReactComponent(id: string, injectProps: IBlockCoreData[] = [], options?: IOptions) {
  const component = useComponent(id);
  const emitter = useMemo<EventEmitter>(() => new EventEmitter(), []);
  const state = useRef<UseReactComponentState>({ component, props: injectProps });
  const reactComponent = useRef<React.ComponentType>(createReactComponentComponent(options?.id, state, emitter));

  const forceRender = useCallback(() => {
    emitter.emit(EVENT_REACT_COMPONENT_PROPS_CHANGE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.current.component === component) {
      return;
    }
    state.current.component = component;
    forceRender();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
