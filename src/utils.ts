import { isEqual } from 'lodash';
import { useEffect, useRef } from 'react';

function deepCompareEquals(a: any, b: any) {
  return isEqual(a, b);
}

function useDeepCompareMemoize(value: any) {
  const ref = useRef();
  if (!deepCompareEquals(value, ref.current)) {
    ref.current = value;
  }

  return ref.current;
}

export function useDeepCompareEffect(
  effect: React.EffectCallback,
  dependencies?: Object
) {
  useEffect(effect, useDeepCompareMemoize(dependencies));
}
