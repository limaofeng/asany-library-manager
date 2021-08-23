import isEqual from 'lodash-es/isEqual';
import { useEffect, useRef } from 'react';

export function generateUUID() {
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c: any) =>
    (c ^ (crypto.getRandomValues(new Uint32Array(1))[0] & (15 >> (c / 4)))).toString(16)
  );
}

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

export function useDeepCompareEffect(effect: React.EffectCallback, dependencies?: Object) {
  useEffect(effect, useDeepCompareMemoize(dependencies));
}

export function getMetadata(target: any) {
  return Reflect.getMetadataKeys(target).reduce((obj, key) => {
    obj[key] = Reflect.getMetadata(key, target);
    return obj;
  }, {});
}

export function copyMetadata(from: any, to: any) {
  for (const key of Reflect.getMetadataKeys(from)) {
    Reflect.getMetadata(key, from);
    Reflect.defineMetadata(key, Reflect.getMetadata(key, from), to);
  }
}

export const sleep = (time: number) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(0);
    }, time);
  });
