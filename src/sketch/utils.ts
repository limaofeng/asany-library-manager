import { useCallback, useEffect, useReducer, useRef } from 'react';
import { defaultEqualityFn, EqualityFn, IReactComponentStoreContext, Selector } from '../typings';

export function useInternalSelector<Selected>(
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
  }, []);
  useEffect(() => store.subscribe(checkForUpdates), []);
  return selectedState;
}
