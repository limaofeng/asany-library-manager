import React, { useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  EqualityFn,
  ISketchState,
  ISketchStoreContext,
  Selector,
  SketchAction,
  SketchProviderProps,
  SubscribeCallback,
} from '../typings';

import reducers from './reducer';

export const SketchContext = React.createContext<ISketchStoreContext>([] as any);

function useStore(): ISketchStoreContext {
  const [state, dispatch] = useReducer<React.ReducerWithoutAction<ISketchState>>(reducers as any, {
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
    console.log('listeners subscribe:', listeners.length);
    return handleUnsubscribe(callback);
  }, []);
  // TODO 后期需要优化，解决由于 hover 导致的频繁触发
  const handleDispatchSubscribe = useCallback(() => {
    console.log('listeners:', listeners.length);
    for (const listener of listeners) {
      listener();
    }
  }, []);
  const initStore = {
    getState: () => state,
    dispatch,
    subscribe: handleSubscribe,
  };
  const [store] = useState(initStore);
  useEffect(() => {
    store.getState = () => state;
    handleDispatchSubscribe();
  }, [state]);
  return store;
}

export function useDispatch() {
  const store = useContext<ISketchStoreContext>(SketchContext);
  return store.dispatch;
}

const defaultEqualityFn = (a: any, b: any) => a === b;

export function useSelector<Selected>(
  selector: Selector<Selected>,
  equalityFn: EqualityFn<Selected> = defaultEqualityFn
) {
  const store = useContext<ISketchStoreContext>(SketchContext);
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

export default function SketchProvider(props: SketchProviderProps) {
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
  return useMemo(() => <SketchContext.Provider value={store}>{children}</SketchContext.Provider>, [version]);
}
