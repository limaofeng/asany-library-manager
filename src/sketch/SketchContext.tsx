import React, { useMemo } from 'react';

import { EventEmitter } from 'events';

import {
  EqualityFn,
  IBlockCoreData,
  IBlockData,
  IReactComponentStoreContext,
  IUpdateBlockData,
  Selector,
  defaultEqualityFn,
} from '../typings';

import { useInternalSelector } from './utils';

type ReactComponentData = {
  id: string;
  store: IReactComponentStoreContext;
};

type EventCallback = (...params: any) => void;

type SketchEventName =
  | 'block-click'
  | 'block-mouse-enter'
  | 'block-mouse-leave'
  | 'add-component'
  | 'remove-component'
  | 'update-component';

export class Sketch {
  private emitter = new EventEmitter();
  private _components = new Map<string, ReactComponentData>();

  add(data: ReactComponentData) {
    this._components.set(data.id, data);
    this.trigger('add-component');
    return () => this.remove(data.id);
  }

  remove(id: string) {
    this._components.delete(id);
    this.trigger('remove-component');
  }

  get components() {
    return Array.from(this._components.values());
  }

  on(eventName: SketchEventName, callback: EventCallback) {
    this.emitter.on(eventName, callback);
    return () => {
      this.emitter.off(eventName, callback);
    };
  }

  trigger(eventName: SketchEventName, ...params: any) {
    this.emitter.emit(eventName, ...params);
  }

  getBlock(key: string): IBlockData | undefined {
    const [id, blkey] = key.split(':');
    const component = this._components.get(id);
    return component?.store.getState().blocks.find((item) => item.key === blkey);
  }

  getComponent(key: string): ReactComponentData | undefined {
    const [id] = key.split(':');
    return this._components.get(id);
  }

  updateComponent(id: string, data: IUpdateBlockData[]) {
    const component = this._components.get(id);
    if (!component) {
      return console.warn('component is null!');
    }
    const { dispatch } = component.store;
    dispatch({
      type: 'UpdateAllBlockProps',
      payload: data,
    });
    this.trigger('update-component');
  }

  updateBlock(id: string, props: any) {
    const [comid, blkey] = id.split(':');
    const component = this._components.get(comid);
    if (!component) {
      return console.warn('component is null!');
    }
    const { dispatch } = component.store;
    dispatch({
      type: 'UpdateBlockProps',
      payload: { key: blkey, props },
    });
    this.trigger('update-component');
  }

  getComponentData(id: string): IBlockCoreData[] {
    const component = this._components.get(id);
    if (!component) {
      throw new Error('component is null!');
    }
    return component.store.getState().blocks.map(({ key, title, icon, component, props }) => ({
      key,
      icon,
      title,
      props,
      component,
      parentKey: key.includes('/') ? key.substring(0, key.lastIndexOf('/')) : undefined,
    }));
  }

  useSelector<Selected>(
    id: string,
    selector: Selector<Selected>,
    equalityFn: EqualityFn<Selected> = defaultEqualityFn
  ) {
    const zhis = this;
    return useInternalSelector(zhis, id, selector, equalityFn);
  }
}

export const SketchContext = React.createContext<Sketch>(new Sketch());

interface SketchProviderProps {
  children: React.ReactNode;
}

export const SketchProvider = (props: SketchProviderProps) => {
  const { children } = props;
  const sketch = useMemo(() => new Sketch(), []);
  return <SketchContext.Provider value={sketch}>{children}</SketchContext.Provider>;
};
