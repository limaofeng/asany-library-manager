import { FC } from 'react';

export interface ReactComponent {
  [key: string]: React.ReactElement | ReactComponent | any;
}

export class AbstractLibrary {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

export interface ILibraryDefinition {
  id: string;
  name: string;
  components: IComponentDefinition[];
}

export interface ITemplate {
  id: string;
  name: string;
  tags: string[];
  component: React.ReactElement<any>;
  configuration: React.ReactElement<any>;
}

export interface IComponentCascader {
  value: string;
  label: string;
  parent: string;
  component?: IComponentDefinition;
  children?: IComponentDefinition[];
}

export interface ICloudComponent extends FC<any> {
  info: IComponentDefinition;
  [key: string]: any;
}

export enum IComponentCategory {
  Page,
  Symbol,
}

export enum IComponentPlatform {
  web,
  mobile,
}

export enum ComponentPropertyType {
  JSON = 'JSON',
  Text = 'Text',
  Image = 'Image',
  Integer = 'Integer',
  Boolean = 'Boolean',
  Float = 'Float',
  String = 'String',
  Date = 'Date',
  Enum = 'Enum',
  File = 'File',
}

export type SubscribeCallback = () => void;

export type ComponentSelector = (component: IComponentDefinition) => boolean;

export type ComponentSorter = (a: IComponentDefinition, b: IComponentDefinition) => number;

export type ComponentPropertyRendererSetting = {
  component: ComponentPropertyRenderer | FC<any> | string;
  props: { [key: string]: any };
};

export type ComponentPropertyRenderer = string | FC<any> | ComponentPropertyRendererSetting | any;

export type VisibleFunc = (props: any) => boolean;

type DepType = ((state: any) => any | Promise<any>) | string[];

export interface IComponentProperty {
  // 字段名
  name: string;
  /**
   *  显示名称
   * 为空时，不在配置面板中显示
   */
  label?: string;
  /**
   * 布局
   */
  layout?: 'Inline' | 'Stacked';
  /**
   * 隐藏 Lable
   */
  hiddenLabel?: boolean;
  /**
   * 占位符
   */
  placeholder?: string;

  // 数据类型
  type: ComponentPropertyType;
  /**
   * 渲染器
   */
  renderer?: ComponentPropertyRenderer;
  /**
   * 包装器， 用于实现数组类数据
   */
  wrappers?: ComponentPropertyRenderer[];
  // 是否为多项
  multiple?: boolean;
  // 引用枚举
  enumeration?: any;
  // 默认值
  defaultValue?: any;
  // 分组
  group?: string | boolean;
  // 必填
  required?: boolean;
  // 设置值
  value?: any;
  // value 对应的 props
  valuePropName?: string;
  // 依赖
  deps?: DepType;
  /**
   * 是否可见
   */
  visible?: boolean | VisibleFunc;
  /**
   * 钩子函数
   */
  hooks?: {
    options?: PluginOptions;
    init?: any;
    /**
     * 前置拦截
     */
    before?: any;
    /**
     * 转换器
     */
    convert?: any;
    /**
     * 后置拦截
     */
    after?: any;
  };
}

interface PluginOptions {
  merge: boolean;
}

export interface ComponentTreeNode {
  id: string;
  name: string;
  children: ComponentTreeNode[];
}

export interface IGroup {
  id: string;
  name?: string;
  layout?: 'Inline' | 'Stacked';
  fields: IComponentProperty[];
}

export interface IComponentVersion {
  id: string;
  version: string;
}

export interface IComponentDefinition {
  // 组件名称
  id: string;
  name: string;
  icon?: string;
  component: any;
  // 组件标签
  tags?: string[];
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
   * 可以使用的子组件
   */
  symbols?: string[];
  /**
   * 配置属性定义
   */
  props?: IComponentProperty[];
  /**
   * 所属组件库
   */
  library?: ILibraryDefinition | string;
}

export type LibraryMetadata = {
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 支持通过配置 namespace 减少每个组件上的路径设置
   */
  namespace?: string;
  /**
   * 预留
   */
  [key: string]: any;
};

export interface ComponentMetadata {
  /**
   * 组件名称 (唯一)
   * 默认为字段名
   */
  name?: string;
  /**
   * 图标
   */
  icon?: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 组件标签
   */
  tags?: string[];
  /**
   * 预留
   */
  [key: string]: any;
}

export const METADATA_KEY_COMPONENTS = '_COMPONENTS';
