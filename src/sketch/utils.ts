import { useCallback, useEffect, useReducer, useRef, useState } from 'react';

import { EqualityFn, IReactComponentStoreContext, Selector, defaultEqualityFn } from '../typings';

import type { Sketch } from './SketchContext';

export function useInternalStoreSelector<Selected>(
  store: IReactComponentStoreContext,
  selector: Selector<Selected>,
  equalityFn: EqualityFn<Selected> = defaultEqualityFn
) {
  const [, forceRender] = useReducer((s) => s + 1, 0);
  const latestSelectedState = useRef<Selected>();
  const selectedState = selector(store.getState());
  const checkForUpdates = useCallback(function () {
    const newSelectedState = selector(store.getState());
    if (equalityFn(newSelectedState, latestSelectedState.current!)) {
      return;
    }
    latestSelectedState.current = newSelectedState;
    forceRender();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => store.subscribe(checkForUpdates), []);
  return selectedState;
}

export function useInternalSelector<Selected>(
  sketch: Sketch,
  id: string,
  selector: Selector<Selected>,
  equalityFn: EqualityFn<Selected> = defaultEqualityFn
) {
  const [store, setStore] = useState<IReactComponentStoreContext>();

  useEffect(() => {
    const component = sketch.getComponent(id);
    if (!!component) {
      setStore(component.store);
      return;
    }
    return sketch.on('add-component', () => {
      const component = sketch.getComponent(id);
      if (!component) {
        return;
      }
      setStore(component.store);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const temp = useRef<any>({});
  temp.current = store ? store.getState() : ({} as any);

  const [, forceRender] = useReducer((s) => s + 1, 0);
  const latestSelectedState = useRef<Selected>();
  const selectedState = selector(temp.current);
  const checkForUpdates = useCallback(function () {
    const newSelectedState = selector(temp.current);
    if (equalityFn(newSelectedState, latestSelectedState.current!)) {
      return;
    }
    latestSelectedState.current = newSelectedState;
    forceRender();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!store) {
      return;
    }
    store.subscribe(checkForUpdates);
  }, [checkForUpdates, store]);
  return selectedState;
}
