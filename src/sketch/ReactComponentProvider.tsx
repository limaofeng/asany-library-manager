import React, { useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';

import isEqual from 'lodash/isEqual';

import useSketch from '../hooks/useSketch';
import {
  EqualityFn,
  IBlockData,
  IReactComponentState,
  IReactComponentStoreContext,
  ReactComponentProviderProps,
  Selector,
  SubscribeCallback,
  defaultEqualityFn,
} from '../typings';
import { generateUUID, useDeepCompareEffect } from '../utils';

import { BlockRootProvider } from './BlockContext';
import reducers from './reducer';
import { useInternalStoreSelector } from './utils';

export const ReactComponentContext = React.createContext<IReactComponentStoreContext>([] as any);

function useStore(id?: string): IReactComponentStoreContext {
  const sketch = useSketch();
  const [COMPONENT_ID] = useState(id || generateUUID());
  const [state, dispatch] = useReducer<React.ReducerWithoutAction<IReactComponentState>>(reducers as any, {
    blocks: [],
  });
  const [listeners] = useState<SubscribeCallback[]>([]);
  const handleUnsubscribe = useCallback(
    (callback: SubscribeCallback) => {
      return () => {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      };
    },
    [listeners]
  );
  const handleSubscribe = useCallback(
    (callback: SubscribeCallback) => {
      listeners.unshift(callback);
      return handleUnsubscribe(callback);
    },
    [handleUnsubscribe, listeners]
  );
  const handleDispatchSubscribe = useCallback(() => {
    for (const listener of listeners) {
      listener();
    }
  }, [listeners]);
  const [store] = useState({
    id: COMPONENT_ID,
    getBlock: (key: string) => {
      const state = store.getState();
      return state.blocks.find((item) => item.key === key);
    },
    getState: () => state,
    dispatch,
    subscribe: handleSubscribe,
  });
  useEffect(() => {
    store.getState = () => state;
    handleDispatchSubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  return useInternalStoreSelector(store, selector, equalityFn);
}

function compact(data: IBlockData[]) {
  return data.map(({ key, props }) => ({ key, props }));
}

export default function ReactComponentProvider(props: ReactComponentProviderProps) {
  const { id, children, version, value } = props;
  const store = useStore(id);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
}
