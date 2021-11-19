import { useCallback, useEffect, useReducer, useRef } from 'react';

import { EqualityFn, IComponentDefinition, defaultEqualityFn } from '../typings';

import useSunmao from './useSunmao';

const useComponent = (name: string, equalityFn: EqualityFn<any> = defaultEqualityFn) => {
  const sunmao = useSunmao();
  const [, forceRender] = useReducer((s) => s + 1, 0);
  const latestSelectedState = useRef<IComponentDefinition>();
  const selectedState = sunmao.getComponent(name);
  const checkForUpdates = useCallback(() => {
    const newSelectedState = sunmao.getComponent(name);
    if (equalityFn(newSelectedState!, latestSelectedState.current!)) {
      return;
    }
    latestSelectedState.current = newSelectedState;
    forceRender();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => sunmao.subscribe(checkForUpdates), []);
  return selectedState;
};

export default useComponent;
