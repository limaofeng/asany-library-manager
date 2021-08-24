import React, { useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useSketch } from './SketchContext';
import {
  EqualityFn,
  IReactComponentState,
  IReactComponentStoreContext,
  Selector,
  ReactComponentProviderProps,
  SubscribeCallback,
} from '../typings';

import reducers from './reducer';
import { generateUUID } from '../utils';

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

const defaultEqualityFn = (a: any, b: any) => a === b;

export function useSelector<Selected>(
  selector: Selector<Selected>,
  equalityFn: EqualityFn<Selected> = defaultEqualityFn
) {
  const store = useContext<IReactComponentStoreContext>(ReactComponentContext);
  const [, forceRender] = useReducer((s) => s + 1, 0);
  const latestSelectedState = useRef<Selected>();
  const selectedState = selector(store.getState());
  function checkForUpdates() {
    const newSelectedState = selector(store.getState());
    if (equalityFn(newSelectedState, latestSelectedState.current!)) {
      console.log('equalityFn', newSelectedState, latestSelectedState.current!);
      return;
    }
    latestSelectedState.current = newSelectedState;
    forceRender();
  }
  useEffect(() => {
    const unsubscribe = store.subscribe(checkForUpdates);
    return unsubscribe;
  }, []);

  return selectedState;
}

export default function ReactComponentProvider(props: ReactComponentProviderProps) {
  const { children, version, value } = props;
  const store = useStore();
  //   const { data } = value || {};
  //   const { dispatch } = store;
  //   useEffect(() => {
  //     dispatch({ type: ActionType.Init });
  //   }, []);
  useEffect(() => {
    if (!value) {
      return;
    }
    /*     dispatch({ type: ActionType.ChangeCase, payload: value });
    const reducers = getReducers(store.getState(), value.type);
    dispatch({
      type: ActionType.ChangeStateByPlugin,
      payload: { reducers, project: value },
    }); */
  }, [value]);
  //   useDeepCompareEffect(() => {
  //     if (!value) {
  //       return;
  //     }
  //     /*if (value.type == 'application') {
  //         const data: IApplicationData = value.data as any;
  //         dispatch({ type: ActionType.SetRoutes, payload: data.routes });
  //       } else */
  //     if (value.type == 'component') {
  //       const data: IComponentData = value.data as any;
  //       dispatch({ type: ActionType.UpdateBlockMoreProps, payload: data.props });
  //     }
  //   }, [data]);
  return useMemo(() => <ReactComponentContext.Provider value={store}>{children}</ReactComponentContext.Provider>, [
    version,
  ]);
}
