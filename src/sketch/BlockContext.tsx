import React, { useCallback, useContext, useMemo, useState } from 'react';

import useMergedRef from '@react-hook/merged-ref';
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

type BlockProviderProps = IBlockProviderProps<any> &
  DivProvider & {
    getId: () => string;
    blockKey?: string;
    onBlockClick: (e?: React.MouseEvent<Element, MouseEvent> | undefined) => void;
  };

const BlockProvider = React.forwardRef(function BlockProvider(props: BlockProviderProps, ref: any) {
  const { getId, onBlockClick, onClick, deps, as, blockKey, children, ...otherProps } = props;

  const handleClick = useCallback(
    (e) => {
      onBlockClick(e);
      onClick && onClick(e);
    },
    [onBlockClick, onClick]
  );

  const element = useMemo(() => {
    if (!as) {
      return 'div';
    }
    if (React.isValidElement(as)) {
      return React.forwardRef((_props: any, _ref: any): React.ReactElement => {
        const multiRef = useMergedRef(_ref, (as as any).ref);

        return React.cloneElement(as, {
          ..._props,
          className: classnames(as.props.className, _props.className),
          ref: multiRef,
        });
      });
    }
    return as;
  }, [as]);

  return useMemo(() => {
    return (
      <BlockContext.Provider value={{ parentBlockKey: blockKey }}>
        {React.createElement(
          element,
          {
            ...otherProps,
            onClick: handleClick,
            className: classnames(`block-provider`, props.className),
            ref,
            id: getId(),
          },
          children
        )}
      </BlockContext.Provider>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
});

// TODO 会导致不能刷新 / 或者频繁刷新
export function buildBlockProvider(
  blockKey: string,
  cache: React.RefObject<UseBlockCache<any, any>>
): React.ComponentType<any> {
  return React.forwardRef((props: IBlockProviderProps<any> & DivProvider, ref) => {
    const handleGetId = useCallback(() => {
      return cache.current!.id;
    }, []);

    const handleClick = useCallback((e) => {
      const {
        result: { onClick },
      } = cache.current!;
      onClick(e);
    }, []);

    return <BlockProvider getId={handleGetId} {...props} blockKey={blockKey} onBlockClick={handleClick} ref={ref} />;
  });
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
