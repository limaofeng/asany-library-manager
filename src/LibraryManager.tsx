import React, {
  ComponentType,
  forwardRef,
  FunctionComponent,
  useEffect,
  useReducer,
  useRef,
} from 'react';

import { useDeepCompareEffect } from './utils';
import {
  ComponentSelector,
  ComponentTreeNode,
  IComponent,
  IComponentCascader,
  IComponentCategory,
  IComponentPlatform,
  IComponentProperty,
  IComponentVersion,
  ILibrary,
  ITemplate,
  LibraryCategory,
} from './typings';

type SubscribeCallback = () => void;
export type EqualityFn = (a: IComponent, b: IComponent) => boolean;
const defaultEqualityFn = (a: any, b: any) => a === b;

export const NotFound: any = React.forwardRef((_, _ref: any) => <></>);
NotFound.info = {
  id: 'notFound',
  name: '',
  props: [],
  configuration: () => <></>,
};

type AggregationLibrary = {
  [key: string]: ComponentType<any>;
};

class LibraryManager {
  private libraries: ILibrary[] = [];
  private listeners: SubscribeCallback[] = [];
  private templates = new Map<string, ITemplate>();
  private components = new Map<string, IComponent>();
  private library: AggregationLibrary = {};
  private tags: any[] = [];
  private groups: any = [];

  getGroups() {
    return this.groups;
  }

  addComponents(components: IComponent[]) {
    this.library = components.reduce((x, item) => {
      return this.updateComponent(item, false, false, x);
    }, this.library);
    this.dispatchSubscribe();
  }

  /**
   * 添加 / 更新 组件
   * @param component 组件
   * @param repeatable 可重复
   * @param dispatch 触发监听
   * @param library 组件聚合对象
   */
  updateComponent(
    component: IComponent,
    dispatch: boolean = false,
    repeatable: boolean = true,
    library: AggregationLibrary = this.library
  ): AggregationLibrary {
    if (!component.component) {
      console.error('组件[', component.name, ']未设置组件', component);
      return library;
    }
    let root: any = library;
    component.id.split('.').forEach((key, index, arry) => {
      if (arry.length === index + 1) {
        if (root[key]) {
          console.error('组件[', component.name, ']重复', component.id);
          if (!repeatable) {
            root = root[key];
            return;
          }
        }
        // 计算 组织ID
        const groupId = component.id
          .split('.')
          .filter((_, index, array) => index < array.length - 1)
          .join('.');
        // 设置 组织ID
        if (groupId && groupId !== '.') {
          component.group = groupId;
          if (!this.groups.some((g: any) => g.id === groupId)) {
            this.groups.push({ id: groupId, artifacts: [component] });
          } else {
            this.groups
              .find((g: any) => g.id === groupId)
              .artifacts.push(component);
          }
        } else {
          console.warn('组件[', component.name, ']命名不规范: ', component.id);
        }
        // 将组件设置到 library 中
        root[key] = component.component;
        root[key].info = component;
        root = root[key];
      } else {
        root = !root[key] ? (root[key] = {}) : root[key];
      }
    });
    // 提取标签
    if (component.tags) {
      for (const tag of component.tags) {
        let rootTags = this.tags;
        tag.split('/').forEach((key, index, array) => {
          let subTag = rootTags.find(({ id }) => id === key);
          if (!subTag) {
            rootTags.push(
              (subTag = { id: key, value: key, label: key, children: [] })
            );
          }
          rootTags = subTag.children;
          if (array.length == index + 1) {
            rootTags.push({
              ...root.info,
              value: root.info.id,
              label: root.info.name,
            });
          }
        });
      }
    }
    this.components.set(component.id, component);
    dispatch && this.dispatchSubscribe();
    return library;
  }

  addLibrary(...librarys: ILibrary[]) {
    librarys.forEach((library) => {
      library.components.forEach((item) => {
        item.library = library;
        item.platform = item.platform || IComponentPlatform.web;
        item.category = item.category || IComponentCategory.Page;
      });
      this.libraries.push(library);
      this.addComponents(library.components);
    });
  }

  addComponent(component: IComponent): void {
    this.updateComponent(component, false, true, this.library);
  }

  addTemplate(template: ITemplate) {
    this.templates.set(template.id, template);
  }

  getLibrary(id: string): ILibrary | undefined {
    return this.libraries.find((data) => data.id === id);
  }

  getLibraries(category?: LibraryCategory): ILibrary[] {
    if (!category) {
      return this.libraries;
    }
    return this.libraries.filter((item) => item.category === category);
  }

  getComponent(id: string): IComponent | undefined {
    return this.components.get(id);
  }

  getComponents(selector: ComponentSelector): IComponent[] {
    return Array.from(this.components.values()).filter(selector);
  }

  getComponentsByTag(tag: string | string[]): IComponentCascader[] {
    if (tag instanceof Array) {
      return tag.reduce((l: IComponentCascader[], r: string) => {
        l.push(...this.getComponentsByTag(r));
        return l;
      }, []);
    }
    let subTags;
    for (const key of tag.split('/').filter((item) => !!item)) {
      subTags = (subTags || this.tags).find(({ id }) => id === key);
      if (subTags) {
        subTags = subTags.children;
      }
    }
    return subTags || [];
  }

  private unsubscribe = (callback: SubscribeCallback) => () => {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  };

  dispatchSubscribe = () => {
    for (const listener of this.listeners) {
      listener();
    }
  };

  private subscribe = (callback: SubscribeCallback) => {
    this.listeners.push(callback.bind(this));
    return this.unsubscribe(callback);
  };

  useComponent = (id: string, equalityFn: EqualityFn = defaultEqualityFn) => {
    const [, forceRender] = useReducer((s) => s + 1, 0);
    const latestSelectedState = useRef<IComponent>();
    const selectedState = this.getComponent(id);
    const checkForUpdates = () => {
      const newSelectedState = this.getComponent(id);
      if (equalityFn(newSelectedState!, latestSelectedState.current!)) {
        return;
      }
      latestSelectedState.current = newSelectedState;
      forceRender();
    };
    useEffect(() => this.subscribe(checkForUpdates), [id]);
    return selectedState;
  };

  getTreeDate(): ComponentTreeNode[] {
    return this.tags;
  }
}

const libraryManager = new LibraryManager();

interface UseComponentType extends FunctionComponent<any> {
  info: any;
}

export function useReactComponent(id: string, defaultProps?: any) {
  const component = useComponent(id);
  const ReactComponent = useRef<UseComponentType>(NotFound);
  const [, forceRender] = useReducer((s) => s + 1, 0);
  useDeepCompareEffect(() => {
    if (!component) {
      ReactComponent.current = NotFound;
      return forceRender();
    }
    const { component: Component, ...info } = component;
    const RComponent: any = forwardRef((props: any, ref) => {
      return <Component {...defaultProps} {...props} ref={ref} />;
    });
    RComponent.info = info;
    ReactComponent.current = RComponent;
    forceRender();
  }, [component, defaultProps]);
  return ReactComponent.current;
}

export const useComponent = libraryManager.useComponent;

interface ConnectInfo {
  // 组件名称
  id: string;
  name: string;
  group?: string;
  icon?: string;
  // 组件标签
  tags?: string[];
  platform?: IComponentPlatform;
  category?: IComponentCategory;
  versions?: IComponentVersion[];
  drag?: {
    size: {
      w: number;
      h: number;
    };
  };
  /**
   * 权重
   */
  boost?: number;
  /**
   * 配置属性定义
   */
  props?: IComponentProperty[];
  /**
   * 所属组件库
   */
  library?: string;
}

export function connect<T = any>(
  info: ConnectInfo,
  Component: React.ComponentType<T>
): React.ComponentType<T> {
  const library = libraryManager
    .getLibraries()
    .find((lib) => lib.id === info.library);
  if (!library) {
    libraryManager.addLibrary({
      id: info.library as string,
      name: info.library as string,
      components: [{ ...info, component: Component, library }],
    });
  } else {
    libraryManager.addComponent({ ...info, component: Component, library });
  }
  return Component as any;
}

export default libraryManager;
