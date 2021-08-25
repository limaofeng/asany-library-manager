import React, { useContext, useMemo } from 'react';
import {
  defaultEqualityFn,
  EqualityFn,
  IBlockCoreData,
  IBlockData,
  IReactComponentStoreContext,
  IUpdateBlockData,
  Selector,
} from '../typings';
import { EventEmitter } from 'events';
import { useInternalSelector } from './utils';

type ReactComponentData = {
  id: string;
  store: IReactComponentStoreContext;
};

type EventCallback = (...params: any) => void;

type SketchEventName = 'block-click' | 'block-mouse-enter' | 'block-mouse-leave';

class Sketch {
  private emitter = new EventEmitter();
  private components = new Map<string, ReactComponentData>();

  add(data: ReactComponentData) {
    this.components.set(data.id, data);
    return () => this.remove(data.id);
  }

  remove(id: string) {
    this.components.delete(id);
  }

  on(eventName: SketchEventName, callback: EventCallback) {
    this.emitter.on(eventName, callback);
  }

  trigger(eventName: SketchEventName, ...params: any) {
    this.emitter.emit(eventName, ...params);
  }

  getBlock(key: string): IBlockData | undefined {
    const [id, blkey] = key.split(':');
    const component = this.components.get(id);
    return component?.store.getState().blocks.find((item) => item.key == blkey);
  }

  getComponent(key: string): ReactComponentData | undefined {
    const [id] = key.split(':');
    return this.components.get(id);
  }

  updateComponent(id: string, data: IUpdateBlockData[]) {
    const component = this.components.get(id);
    if (!component) {
      return console.warn('component is null!');
    }
    const { dispatch } = component.store;
    dispatch({
      type: 'UpdateAllBlockProps',
      payload: data,
    });
  }

  updateBlock(id: string, props: any) {
    const [comid, blkey] = id.split(':');
    const component = this.components.get(comid);
    if (!component) {
      return console.warn('component is null!');
    }
    const { dispatch } = component.store;
    dispatch({
      type: 'UpdateBlockProps',
      payload: { key: blkey, props },
    });
  }

  getComponentData(id: string): IBlockCoreData[] {
    const component = this.components.get(id);
    if (!component) {
      throw 'component is null!';
    }
    return component.store.getState().blocks.map(({ key, props }) => ({ key, props }));
  }

  useSelector(id: string) {
    const com = this.getComponent(id);
    if (!com) {
      throw 'component is null!';
    }
    return function <Selected>(selector: Selector<Selected>, equalityFn: EqualityFn<Selected> = defaultEqualityFn) {
      return useInternalSelector(com.store, selector, equalityFn);
    };
  }
}

export const SketchContext = React.createContext<Sketch>(new Sketch());

interface SketchProviderProps {
  children: React.ReactNode;
}

export const useSketch = () => {
  return useContext(SketchContext);
};

export const SketchProvider = (props: SketchProviderProps) => {
  const { children } = props;
  const sketch = useMemo(() => new Sketch(), []);
  return <SketchContext.Provider value={sketch}>{children}</SketchContext.Provider>;
};
