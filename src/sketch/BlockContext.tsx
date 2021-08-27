import React, { useContext, useMemo, useRef, useState } from 'react';

import classnames from 'classnames';

import { DivProvider, IBlockProviderProps, UseBlockCache } from '../typings';

export interface IBlockContext {
  parentBlockKey?: string;
}

export const BlockContext = React.createContext<IBlockContext>({});

export type BlockRootProviderProps = {
  children: React.ReactNode;
};

export function BlockRootProvider(props: BlockRootProviderProps) {
  return <BlockContext.Provider value={{}}>{props.children}</BlockContext.Provider>;
}

// TODO 会导致不能刷新 / 或者频繁刷新
export function buildBlockProvider(
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
