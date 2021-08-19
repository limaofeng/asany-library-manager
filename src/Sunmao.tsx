import { ComponentType } from 'react';

import {
  ComponentSelector,
  ComponentTreeNode,
  IComponentDefinition,
  IComponentCascader,
  ILibraryDefinition,
  ITemplate,
  SubscribeCallback,
} from './typings';

type AggregationLibrary = {
  [key: string]: ComponentType<any>;
};

class Sunmao {
  private libraries: ILibraryDefinition[] = [];
  private listeners: SubscribeCallback[] = [];
  private templates = new Map<string, ITemplate>();
  private components = new Map<string, IComponentDefinition>();
  private library: AggregationLibrary = {};
  private tags: any[] = [];

  addComponents(components: IComponentDefinition[]) {
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
        tag.split('/').forEach((key, index, array) => {
          let subTag = rootTags.find(({ id }) => id === key);
          if (!subTag) {
            rootTags.push((subTag = { id: key, value: key, label: key, children: [] }));
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
    this.components.set(component.name, component);
    dispatch && this.dispatchSubscribe();
    return library;
  }

  addLibrary(...librarys: ILibraryDefinition[]) {
    librarys.forEach((library) => {
      library.components.forEach((item) => {
        item.library = library;
      });
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

  subscribe = (callback: SubscribeCallback) => {
    this.listeners.push(callback.bind(this));
    return this.unsubscribe(callback);
  };

  getTreeDate(): ComponentTreeNode[] {
    return this.tags;
  }
}

export default Sunmao;
