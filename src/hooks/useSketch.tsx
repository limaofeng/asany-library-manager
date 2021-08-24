import { EventEmitter } from 'events';
import React, { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

import SketchProvider from '../sketch/SketchProvider';
import { IComponentDefinition } from '../typings';
import { useDeepCompareEffect } from '../utils';
import useComponent from './useComponent';

const EVENT_SKETCH_PROPS_CHANGE = 'EVENT_SKETCH_PROPS_CHANGE';

interface IOptions {
  id: string;
}

interface UseSketchState {
  component?: IComponentDefinition;
  props: any[];
}

function createSketchComponent(state: React.RefObject<UseSketchState>, emitter: EventEmitter) {
  return function () {
    const [version, forceRender] = useReducer((s) => s + 1, 0);

    const { component, props } = state.current!;

    useEffect(() => {
      emitter.addListener(EVENT_SKETCH_PROPS_CHANGE, forceRender);
      return () => {
        emitter.removeListener(EVENT_SKETCH_PROPS_CHANGE, forceRender);
      };
    }, []);

    return (
      <SketchProvider value={props} version={version}>
        {React.createElement(component?.component!)}
      </SketchProvider>
    );
  };
}

export default function useSketch(id: string, injectProps: any[] = [], _?: IOptions) {
  const component = useComponent(id);
  const emitter = useMemo<EventEmitter>(() => new EventEmitter(), []);
  const state = useRef<UseSketchState>({ component, props: injectProps });
  const reactComponent = useRef(createSketchComponent(state, emitter));

  const forceRender = useCallback(() => {
    emitter.emit(EVENT_SKETCH_PROPS_CHANGE);
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
