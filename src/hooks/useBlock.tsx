import React, { useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';

import isEqual from 'lodash/isEqual';

import useSketch from '../hooks/useSketch';
import { buildBlockProvider, useBlockContext } from '../sketch/BlockContext';
import { ReactComponentContext, useDispatch } from '../sketch/ReactComponentProvider';
import {
  DivProvider,
  IBlockDataProps,
  IBlockOptions,
  IReactComponentStoreContext,
  IUseBlock,
  UseBlockCache,
} from '../typings';

export default function useBlock<P = DivProvider, T extends IBlockDataProps = any>(
  options: IBlockOptions<T>
): IUseBlock<T, P> {
  const sketch = useSketch();
  const store = useContext<IReactComponentStoreContext>(ReactComponentContext);
  // 获取 block 的 key 即原来的 parentBlockKey + key
  const { key } = useBlockContext(options.key);
  const cache = useRef<UseBlockCache<T, P>>({ id: store.id + ':' + key, key, options, result: [] as any });
  const latestProps = useRef<any>(options.props);
  // 创建 BlockProvider，组合 useBlockContext 使用
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const Provider = useMemo(() => buildBlockProvider(key, cache), []);

  const dispatch = useDispatch();

  const [version, forceRender] = useReducer((s) => s + 1, 0);

  const handleChange = useCallback((props: T | string, value: string) => {
    const { key } = cache.current;
    if (value) {
      dispatch({
        type: 'UpdateBlockProps',
        payload: {
          key,
          props: { ...latestProps.current, [props as string]: value },
        },
      });
    } else {
      dispatch({
        type: 'UpdateBlockProps',
        payload: {
          key,
          props,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = useCallback((e?: React.MouseEvent) => {
    const { id } = cache.current;
    e && e.stopPropagation();
    sketch.trigger('block-click', id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 向 workspace 中注册当前 block
  useEffect(() => {
    const { id, key, options } = cache.current;
    dispatch({
      type: 'RegistrationBlock',
      payload: {
        ...options,
        customizer: options.customizer || { fields: [] },
        update: handleChange,
        click: handleClick,
        key,
        id,
      },
    });
    return () => {
      dispatch({
        type: 'UninstallBlock',
        payload: { key },
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMouseEnter = useCallback(() => {
    const { id } = cache.current;
    sketch.trigger('block-mouse-enter', id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMouseLeave = useCallback(() => {
    const { id } = cache.current;
    sketch.trigger('block-mouse-leave', id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const ele = document.getElementById(cache.current.id);
    if (!ele) {
      return console.warn('未发现' + cache.current.key + ', 对应的 HTML 元素');
    }
    ele.addEventListener('mouseenter', handleMouseEnter);
    ele.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      ele.removeEventListener('mouseenter', handleMouseEnter);
      ele.removeEventListener('mouseleave', handleMouseLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkForUpdates = useCallback(() => {
    const { key } = cache.current;
    const newProps = store.getState().blocks.find(({ key: itemKey }) => itemKey === key)?.props || latestProps.current;
    if (isEqual(newProps, latestProps.current!)) {
      return;
    }
    latestProps.current = newProps;
    forceRender();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return store.subscribe(checkForUpdates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  cache.current.result = useMemo(
    () => ({
      ...cache.current.options,
      id: cache.current.id,
      component: store.id,
      onClick: handleClick,
      update: handleChange,
      props: latestProps.current,
      Provider,
      version,
      key,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [latestProps.current, version]
  );

  return cache.current.result;
}
