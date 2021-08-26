import React, { useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import useSketch from '../hooks/useSketch';
import {
  EqualityFn,
  IReactComponentState,
  IReactComponentStoreContext,
  Selector,
  ReactComponentProviderProps,
  SubscribeCallback,
  IBlockData,
  defaultEqualityFn,
} from '../typings';

import reducers from './reducer';
import { generateUUID, useDeepCompareEffect } from '../utils';
import { isEqual } from 'lodash-es';
import { useInternalSelector } from './utils';
import { BlockRootProvider } from './BlockContext';

export const ReactComponentContext = React.createContext<IReactComponentStoreContext>([] as any);

function useStore(): IReactComponentStoreContext {
  const sketch = useSketch();
  const [COMPONENT_ID] = useState(generateUUID());
  const [state, dispatch] = useReducer<React.ReducerWithoutAction<IReactComponentState>>(reducers as any, {
    blocks: [],
  });
  const [listeners] = useState<SubscribeCallback[]>([]);
  const handleUnsubscribe = (callback: SubscribeCallback) => () => {
    const index = listeners.indexOf(callback);
    console.log('listeners unsubscribe:', listeners.length);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
  const handleSubscribe = useCallback((callback: SubscribeCallback) => {
    listeners.unshift(callback);
    return handleUnsubscribe(callback);
  }, []);
  const handleDispatchSubscribe = useCallback(() => {
    for (const listener of listeners) {
      listener();
    }
  }, []);
  const initStore = {
    id: COMPONENT_ID,
    getState: () => state,
    dispatch,
    subscribe: handleSubscribe,
  };
  const [store] = useState(initStore);
  useEffect(() => {
    store.getState = () => state;
    handleDispatchSubscribe();
  }, [state]);
  useEffect(() => sketch.add({ id: COMPONENT_ID, store }), []);
  return store;
}

export function useDispatch() {
  const store = useContext<IReactComponentStoreContext>(ReactComponentContext);
  return store.dispatch;
}

export function useSelector<Selected>(
  selector: Selector<Selected>,
  equalityFn: EqualityFn<Selected> = defaultEqualityFn
) {
  const store = useContext<IReactComponentStoreContext>(ReactComponentContext);
  return useInternalSelector(store, selector, equalityFn);
}

function compact(data: IBlockData[]) {
  return data.map(({ key, props }) => ({ key, props }));
}

export default function ReactComponentProvider(props: ReactComponentProviderProps) {
  const { children, version, value } = props;
  const store = useStore();
  const { dispatch } = store;
  useDeepCompareEffect(() => {
    if (!value || isEqual(compact(value), compact(store.getState().blocks))) {
      return;
    }
    dispatch({
      type: 'UpdateAllBlockProps',
      payload: value,
    });
  }, [value]);
  return useMemo(
    () => (
      <ReactComponentContext.Provider value={store}>
        <BlockRootProvider>{children}</BlockRootProvider>
      </ReactComponentContext.Provider>
    ),
    [version]
  );
}
