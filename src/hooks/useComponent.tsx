import { useEffect, useReducer, useRef } from 'react';
import { IComponentDefinition } from '../typings';
import useSunmao from './useSunmao';

export type EqualityFn = (a: IComponentDefinition, b: IComponentDefinition) => boolean;
const defaultEqualityFn = (a: any, b: any) => a === b;

const useComponent = (name: string, equalityFn: EqualityFn = defaultEqualityFn) => {
  const sunmao = useSunmao();
  const [, forceRender] = useReducer((s) => s + 1, 0);
  const latestSelectedState = useRef<IComponentDefinition>();
  const selectedState = sunmao.getComponent(name);
  const checkForUpdates = () => {
    const newSelectedState = sunmao.getComponent(name);
    if (equalityFn(newSelectedState!, latestSelectedState.current!)) {
      return;
    }
    latestSelectedState.current = newSelectedState;
    forceRender();
  };
  useEffect(() => sunmao.subscribe(checkForUpdates), [name]);
  return selectedState;
};

export default useComponent;
