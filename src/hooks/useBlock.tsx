import classnames from 'classnames';
import { isEqual } from 'lodash-es';
import React, { useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';

import { ReactComponentContext, useDispatch } from '../sketch/ReactComponentProvider';
import {
  IBlockDataProps,
  IBlockOptions,
  IBlockProviderProps,
  IUseBlock,
  DivProvider,
  IReactComponentStoreContext,
} from '../typings';
import { sleep } from '../utils';

// import { OnResize, OnResizeEnd, OnResizeStart } from 'react-moveable';

// import BlockObserver from '../components/Observer';
// import { father } from '../typings';
// import { dispatchWindowResize, sleep } from '../utils';
// import useSelector from './useSelector';

// import { IComponentProperty } from '../../library-manager/typings';
// import type { IBlockData, IBlockDataProps, IBlockOptions, IComponentProperty, ICustomizer } from '../typings';
// import { BlockActionType, WorkspaceActionType } from '../reducers/actions';
// import { MoveableOptions } from 'moveable';
export interface IBlockContext {
  parentBlockKey: string;
}

export const BlockContext = React.createContext<IBlockContext>({
  parentBlockKey: 'root',
});

// TODO 会导致不能刷新 / 或者频繁刷新
function buildBlockProvider(blockKey: string, cache: React.RefObject<UseBlockCache<any>>): React.ComponentType<any> {
  const keys = blockKey.split('/');
  const lastKey = keys[keys.length - 1];
  return React.forwardRef(
    (
      { tag, clickable, children, onClick: handleClick, deps, ...props }: IBlockProviderProps<any> & DivProvider,
      ref
    ) => {
      const context = useRef({ parentBlockKey: blockKey });
      const [{ onClick }, blockRef] = cache.current!.result;
      return useMemo(() => {
        return (
          <BlockContext.Provider value={context.current}>
            {React.createElement(
              tag || 'div',
              {
                ...props,
                onClick: handleClick || onClick,
                className: classnames(`block-provider`, props.className),
                'data-block-key': lastKey,
                ref: ref ? blockRef(ref) : blockRef,
              },
              children
            )}
          </BlockContext.Provider>
        );
      }, deps);
    }
  );
}

// function initialize(fields: IComponentProperty[], props: any = {}) {
//   for (const field of fields) {
//     const { init } = field.hooks || {};
//     if (!init) {
//       continue;
//     }
//     props[field.name] = init(props[field.name]);
//   }
//   return props;
// }

// interface BlockListenerOptions {
//   resizable: boolean;
//   draggable: boolean;
//   // client: ApolloClient<any>;
//   onChange: UpdateFunc<any>;
// }

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

type UseBlockCache<T> = {
  key: string;
  options: IBlockOptions<T>;
  result: IUseBlock<T>;
};

export default function useBlock<P = DivProvider, T extends IBlockDataProps = any>(
  options: IBlockOptions<T>
): IUseBlock<T, P> {
  // 初始化状态 - 向 Sketch 注册之后标示为 true
  // const editor = useEditor();
  const store = useContext<IReactComponentStoreContext>(ReactComponentContext);
  // const initialized = useRef(false);
  // const emitter = useRef<EventEmitter>(new EventEmitter());
  // 创建 ref 用于生成定位框指向元素的位置
  const block = useRef<HTMLDivElement>();
  // 获取 block 的 key 即原来的 parentBlockKey + key
  const { key } = useBlockContext(options.key);
  const cache = useRef<UseBlockCache<T>>({ key, options, result: [] as any });
  const latestProps = useRef<any>(options.props);
  // 使用生成的 key 组合新的 data 数据
  // const dataRef = useRef<IBlockOptions<T>>({ ...options, key });
  // const data = dataRef.current;
  // 创建 BlockProvider，组合 useBlockContext 使用
  const Provider = useMemo(() => buildBlockProvider(key, cache), []);
  // 通过 customizer.fields 及 data.props 生成配置默认数据
  // const props = useRef<any>(initialize(data.customizer?.fields || [], { ...data.props }));
  // 是否显示选框
  const isMoveable = useRef<boolean>(false);
  // const handleScenaClick = useSelector((state) => state.ui.scena.onClick);

  const dispatch = useDispatch();

  // const client = useApolloClient();
  const [version, forceRender] = useReducer((s) => s + 1, 0);
  const disabled = false; // TODO: useSelector((state) => state.mode === 'VIEW' || !state.features.block);
  // const values = useSelector((state) => state.blocks.find(({ key: itemKey }) => itemKey === data.key)?.props || data.props, isEqual);

  const handleChange = useCallback((props: T | string, value: string) => {
    const { key } = cache.current;
    // if (!initialized.current) {
    //   return;
    // }
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

  // const handleMouseEnter = useCallback(() => {
  //   dispatch({
  //     type: 'PushBlock',
  //     payload: { key: data.key },
  //   });
  // }, []);

  // const handleMouseLeave = useCallback(() => {
  //   dispatch({
  //     type: 'PopBlock',
  //     payload: { key: data.key },
  //   });
  // }, []);

  // const handleMouseDown = useCallback((e: MouseEvent) => {
  //   const className = (e.target as any).className;
  //   if (!className || typeof className !== 'string') {
  //     isMoveable.current = false;
  //   } else {
  //     isMoveable.current = className.includes('moveable-control');
  //   }
  // }, []);

  const handleClick = useCallback(
    (e?: React.MouseEvent) => {
      if (disabled) {
        return;
      }
      e && e.stopPropagation();
      if (isMoveable.current) {
        return;
      }
      // TODO 如果为 moveable 事件，不触发 SelectedBlock 逻辑
      if (e && (e.target as any).className.includes && (e.target as any).className.includes('moveable-control')) {
        return;
      }
      // TODO: dispatch
      // handleScenaClick &&
      //   handleScenaClick(editor, {
      //     ...data,
      //     onClick: handleClick,
      //     update: handleChange,
      //     props: props.current,
      //     Provider: Provider.current,
      //   });
      // dispatch({ type: WorkspaceActionType.SelectedBlock, payload: data });
    },
    [
      /*handleScenaClick, disabled*/
    ]
  );

  // 向 workspace 中注册当前 block
  useEffect(() => {
    const { key, options } = cache.current;
    dispatch({
      type: 'RegistrationBlock',
      payload: {
        ...options,
        customizer: options.customizer || { fields: [] },
        element: block,
        update: handleChange,
        click: handleClick,
        key,
      },
    });
    return () => {
      dispatch({
        type: 'UninstallBlock',
        payload: { key },
      });
    };
  }, []);

  // 为了解决，resize 时，选框与 click 事件冲突的问题。
  // TODO 处理鼠标移入/移出时的选框
  // const buildMouseEffect = useCallback(() => {
  //   const blockRef = block.current!;
  //   if (!blockRef || disabled) {
  //     return;
  //   }
  //   blockRef.addEventListener('mouseenter', handleMouseEnter);
  //   blockRef.addEventListener('mouseleave', handleMouseLeave);
  //   blockRef.addEventListener('mousedown', handleMouseDown);
  // }, []);
  // const unbuildMouseEffect = useCallback(() => {
  //   const blockRef = block.current!;
  //   if (!blockRef || disabled) {
  //     return;
  //   }
  //   blockRef.removeEventListener('mouseenter', handleMouseEnter);
  //   blockRef.removeEventListener('mouseleave', handleMouseLeave);
  //   blockRef.removeEventListener('mousedown', handleMouseDown);
  // }, []);

  // useEffect(() => {
  //   buildMouseEffect();
  //   return unbuildMouseEffect;
  // }, [block.current, disabled]);

  const loadBlockRef = useCallback(async (ref: any) => {
    if (!ref) {
      return;
    }
    if (ref.hasOwnProperty('current')) {
      if (!ref.current) {
        await sleep(100);
        await loadBlockRef(ref);
        return;
      }
      if (block.current == ref.current) {
        return;
      }
      block.current = ref.current;
    } else {
      block.current = ref;
    }
  }, []);

  // 将 ref 包装为单独的函数
  const refCallback = useCallback((ref: any) => {
    loadBlockRef(ref);
    return ref;
  }, []);

  // 通过 data.customizer 为 block 添加监听处理 hook 逻辑
  // useEffect(() => {
  //   buildListeners(observer.current, data.customizer!, props.current, forceRender, {
  //     // client,
  //     onChange: handleChange,
  //     resizable: false, //!!data.options?.resizable,
  //     draggable: false, //!!data.options?.draggable,
  //   });
  //   observer.current.observe(values);
  //   forceRender();
  // }, []);

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

  // 触发监听
  // observer.current.observe(values);

  // 值改变时，触发一次 resize 操作
  // useEffect(() => {
  //   dispatchWindowResize();
  //   dataRef.current.props = values;
  // }, [values, version]);

  // const { height, width, top, left } = useHTMLElementResize(block as any);
  // useEffect(() => {
  //   setTimeout(dispatchWindowResize, 60);
  // }, [[height, width, top, left].join('-')]);

  // const handleResizeStart = useCallback((e: OnResizeStart) => {
  //   const onResizeStart = dataRef.current.options?.onResizeStart;
  //   onResizeStart && onResizeStart(e);
  // }, []);
  // const handleResize = useCallback((e: OnResize) => {
  //   const onResize = dataRef.current.options?.onResize;
  //   onResize && onResize(e);
  // }, []);
  // const handleResizeStop = useCallback((e: OnResizeEnd) => {
  //   const onResizeStop = dataRef.current.options?.onResizeStop;
  //   onResizeStop && onResizeStop(e);
  // }, []);

  // useEffect(() => {
  //   emitter.current.on('resize.start', handleResizeStart);
  //   emitter.current.on('resize.resizing', handleResize);
  //   emitter.current.on('resize.stop', handleResizeStop);
  //   return () => {
  //     emitter.current.off('resize.start', handleResizeStart);
  //     emitter.current.off('resize.resizing', handleResize);
  //     emitter.current.off('resize.stop', handleResizeStop);
  //   };
  // }, []);

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
    const unsubscribe = store.subscribe(checkForUpdates);
    return unsubscribe;
  }, []);

  return (cache.current.result = [
    {
      ...cache.current.options,
      key,
      onClick: handleClick,
      update: handleChange,
      props: latestProps.current,
      Provider,
      version,
    },
    refCallback,
  ]);
}
