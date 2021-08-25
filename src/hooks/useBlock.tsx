import classnames from 'classnames';
import { isEqual } from 'lodash-es';
import React, { useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useSketch } from '../sketch';

import { ReactComponentContext, useDispatch } from '../sketch/ReactComponentProvider';
import {
  IBlockDataProps,
  IBlockOptions,
  IBlockProviderProps,
  IUseBlock,
  DivProvider,
  IReactComponentStoreContext,
} from '../typings';

export interface IBlockContext {
  parentBlockKey?: string;
}

export const BlockContext = React.createContext<IBlockContext>({});

// TODO 会导致不能刷新 / 或者频繁刷新
function buildBlockProvider(
  blockKey: string,
  cache: React.RefObject<UseBlockCache<any, any>>
): React.ComponentType<any> {
  return React.forwardRef(
    (
      { tag, clickable, children, onClick: handleClick, deps, ...props }: IBlockProviderProps<any> & DivProvider,
      ref
    ) => {
      const context = useRef({ parentBlockKey: blockKey });
      const {
        id,
        result: { onClick },
      } = cache.current!;
      return useMemo(() => {
        return (
          <BlockContext.Provider value={context.current}>
            {React.createElement(
              tag || 'div',
              {
                ...props,
                onClick: handleClick || onClick,
                className: classnames(`block-provider`, props.className),
                ref,
                id,
              },
              children
            )}
          </BlockContext.Provider>
        );
      }, deps);
    }
  );
}

export function useBlockContext(key: string) {
  const context = useContext(BlockContext);
  const [state] = useState(() => {
    return {
      parentBlockKey: context.parentBlockKey,
      key: context.parentBlockKey ? context.parentBlockKey + '/' + key : key,
    };
  });
  return state;
}

type UseBlockCache<T, P> = {
  id: string;
  key: string;
  options: IBlockOptions<T>;
  result: IUseBlock<T, P>;
};

export default function useBlock<P = DivProvider, T extends IBlockDataProps = any>(
  options: IBlockOptions<T>
): IUseBlock<T, P> {
  // 初始化状态 - 向 Sketch 注册之后标示为 true
  // const editor = useEditor();
  const sketch = useSketch();
  const store = useContext<IReactComponentStoreContext>(ReactComponentContext);
  // 获取 block 的 key 即原来的 parentBlockKey + key
  const { key } = useBlockContext(options.key);
  const cache = useRef<UseBlockCache<T, P>>({ id: store.id + ':' + key, key, options, result: [] as any });
  const latestProps = useRef<any>(options.props);
  // 使用生成的 key 组合新的 data 数据
  // 创建 BlockProvider，组合 useBlockContext 使用
  const Provider = useMemo(() => buildBlockProvider(key, cache), []);
  // 通过 customizer.fields 及 data.props 生成配置默认数据

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
          key: key,
          props,
        },
      });
    }
  }, []);

  const handleClick = useCallback((e?: React.MouseEvent) => {
    const { id } = cache.current;
    e && e.stopPropagation();
    sketch.trigger('block-click', id);
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
  }, []);

  const handleMouseEnter = useCallback(() => {
    const { id } = cache.current;
    sketch.trigger('block-mouse-enter', id);
  }, []);

  const handleMouseLeave = useCallback(() => {
    const { id } = cache.current;
    sketch.trigger('block-mouse-leave', id);
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
  }, []);

  // useEffect(() => {
  //   if (!data.customizer?.dynamic) {
  //     return;
  //   }
  //   data.customizer = origin.customizer;
  //   if (!disabled) {
  //     dispatch({
  //       type: 'UpdateBlockCustomizer',
  //       payload: data,
  //     });
  //   }
  //   buildListeners(observer.current, data.customizer!, props.current, forceRender, {
  //     // client,
  //     onChange: handleChange,
  //     resizable: !!data.options?.resizable,
  //     draggable: !!data.options?.draggable,
  //   });
  //   // TODO: 可能会存在 318 行类似的 BUG
  // }, [origin.customizer]);

  // 值改变时，触发一次 resize 操作
  // useEffect(() => {
  //   dispatchWindowResize();
  //   dataRef.current.props = values;
  // }, [values, version]);

  // const { height, width, top, left } = useHTMLElementResize(block as any);
  // useEffect(() => {
  //   setTimeout(dispatchWindowResize, 60);
  // }, [[height, width, top, left].join('-')]);

  const checkForUpdates = useCallback(() => {
    const { key } = cache.current;
    const newProps = store.getState().blocks.find(({ key: itemKey }) => itemKey === key)?.props || latestProps.current;
    if (isEqual(newProps, latestProps.current!)) {
      return;
    }
    latestProps.current = newProps;
    forceRender();
  }, []);

  useEffect(() => {
    return store.subscribe(checkForUpdates);
  }, []);

  cache.current.result = useMemo(
    () => ({
      ...cache.current.options,
      id: cache.current.id,
      onClick: handleClick,
      update: handleChange,
      props: latestProps.current,
      Provider,
      version,
      key,
    }),
    [latestProps.current, version]
  );

  return cache.current.result;
}
