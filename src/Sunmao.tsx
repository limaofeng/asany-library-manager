import { ComponentType } from 'react';

import {
  ComponentSelector,
  ComponentTreeNode,
  DataSourceLoader,
  IComponentDefinition,
  ILibraryDefinition,
  ITemplate,
  SubscribeCallback,
} from './typings';

type AggregationLibrary = {
  [key: string]: ComponentType<any>;
};

function initTag(tag: string, rootTags: any[], component: any) {
  tag.split('/').forEach((key, index, array) => {
    let subTag = rootTags.find(({ id }) => id === key);
    if (!subTag) {
      rootTags.push((subTag = { id: key, value: key, label: key, children: [] }));
    }
    rootTags = subTag.children;
    if (array.length === index + 1) {
      rootTags.push({
        ...component,
        value: component.name,
        label: component.title || component.name,
      });
    }
  });
}

class Sunmao {
  private libraries: ILibraryDefinition[] = [];
  private listeners: SubscribeCallback[] = [];
  private templates = new Map<string, ITemplate>();
  private components = new Map<string, IComponentDefinition>();
  private dataSourceLoaders = new Map<string, DataSourceLoader<any>>();
  private library: AggregationLibrary = {};
  private tags: any[] = [];

  addComponents(components: IComponentDefinition[]) {
    this.library = components.reduce((x, item) => {
      return this.updateComponent(item, false, false, x);
    }, this.library);
    this.dispatchSubscribe();
  }

  addDataSourceLoader(loader: DataSourceLoader) {
    this.dataSourceLoaders.set(loader.type, loader);
    this.dispatchSubscribe();
  }

  getDataSourceLoader(type: string) {
    return this.dataSourceLoaders.get(type);
  }

  /**
   * 添加 / 更新 组件
   * @param component 组件
   * @param repeatable 可重复
   * @param dispatch 触发监听
   * @param library 组件聚合对象
   */
  updateComponent(
    component: IComponentDefinition,
    dispatch: boolean = false,
    repeatable: boolean = true,
    library: AggregationLibrary = this.library
  ): AggregationLibrary {
    if (!component.component) {
      console.error('组件[', component.name, ']未设置组件', component);
      return library;
    }
    let root: any = library;
    component.name.split('.').forEach((key, index, arry) => {
      if (arry.length === index + 1) {
        if (root[key]) {
          console.error('组件[', component.name, ']重复');
          if (!repeatable) {
            root = root[key];
            return;
          }
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
        initTag(tag, rootTags, component);
        initTag(tag, (component.library as ILibraryDefinition).tags, component);
      }
    }
    this.components.set(component.name, component);
    dispatch && this.dispatchSubscribe();
    return library;
  }

  addLibrary(...librarys: ILibraryDefinition[]) {
    librarys.forEach((library) => {
      this.libraries.push(library);
      this.addComponents(library.components);
    });
  }

  addComponent(component: IComponentDefinition): void {
    this.updateComponent(component, false, true, this.library);
  }

  addTemplate(template: ITemplate) {
    this.templates.set(template.id, template);
  }

  getLibrary(name: string): ILibraryDefinition | undefined {
    return this.libraries.find((data) => data.name === name);
  }

  getLibraries(): ILibraryDefinition[] {
    return this.libraries;
  }

  getComponent(name: string): IComponentDefinition | undefined {
    return this.components.get(name);
  }

  getComponents(selector: ComponentSelector): IComponentDefinition[] {
    return Array.from(this.components.values()).filter(selector);
  }

  getTreeDate(tag?: string | string[] | ComponentSelector): ComponentTreeNode[] {
    if (!tag || !tag.length) {
      return this.tags;
    }
    if (typeof tag === 'function') {
      const components = this.getComponents(tag);
      console.warn('getTreeDate selector 未实现', components);
      return [];
    }
    if (tag instanceof Array) {
      return tag.reduce((l: ComponentTreeNode[], r: string) => {
        l.push(...this.getTreeDate(r));
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

  subscribe = (callback: SubscribeCallback) => {
    this.listeners.push(callback.bind(this));
    return this.unsubscribe(callback);
  };
}

export default Sunmao;
