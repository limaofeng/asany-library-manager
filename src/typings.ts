import React, { ComponentType, DependencyList, FC } from 'react';

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

export type IFieldType =
  | 'String'
  | 'Text'
  | 'Integer'
  | 'Float'
  | 'Boolean'
  | 'Date'
  | 'DateTime'
  | 'JSON'
  | 'Asset'
  | 'Enum';

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

export interface IField {
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
  type: IFieldType;
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
  fields: IField[];
}

export interface ComponentDragObject {
  /**
   * ID
   */
  id: string;
  /**
   * Drag Type
   */
  type: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 组件
   */
  component: string;
}

export type ComponentGroup = {
  title: string;
  type: string;
  createDragObject: CreateDragObjectFunc;
  components: IComponentDefinition[];
};

export type CreateDragObjectFunc = (component: IComponentDefinition) => ComponentDragObject;

export type IComponentDragObject = {
  title: string;
  type?: string;
  sorter?: ComponentSorter;
  selector: string | ComponentSelector;
  object?: CreateDragObjectFunc;
};

export interface IComponentDefinition {
  /**
   * 名称
   */
  name: string;
  /**
   * 组件标题
   */
  title?: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 图标
   */
  icon?: string;
  /**
   * 封面图
   */
  cover?: string;
  /**
   * 组件
   */
  component: ComponentType;
  /**
   *  组件标签
   */
  tags?: string[];
  /**
   * 权重
   */
  boost?: number;
  /**
   * 可以使用的子组件 (用于拖拽支持)
   */
  symbols?: IComponentDragObject[];
  /**
   * 配置属性定义
   */
  props?: IField[];
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
   * 封面图
   */
  cover?: string;
  /**
   * 组件标题
   */
  title?: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 组件标签
   */
  tags?: string[];
  /**
   * 可以使用的子组件 (用于拖拽支持)
   */
  symbols?: IComponentDragObject[];
}

export const METADATA_KEY_COMPONENTS = '_COMPONENTS';

type UnsubscribeFunc = () => void;

type SubscribeFunc = (callback: SubscribeCallback) => UnsubscribeFunc;

export type ReactComponentActionType =
  /**
   * 注册区块
   */
  | 'RegistrationBlock'
  /**
   * 卸载区块
   */
  | 'UninstallBlock'
  /**
   * 更新 Block 数据
   */
  | 'UpdateBlockProps'
  /**
   * 更新 Block 数据
   */
  | 'UpdateAllBlockProps'
  /**
   * 更新 Block 定制器
   */
  | 'UpdateBlockCustomizer';

export interface ReactComponentAction {
  type: ReactComponentActionType;
  payload?: any;
}

export type DispatchWithoutAction = (action: ReactComponentAction) => void;

export type UpdateFunc<T> = (props: T | string, value?: any) => void;

export interface IFieldGroup {
  id: string;
  name?: string;
  visible?: boolean | VisibleFunc;
  layout?: 'Inline' | 'Stacked';
}

export interface ITabPane {
  name: string;
  visible?: boolean | VisibleFunc;
  groups: string[] | IFieldGroup[];
  customizer?: ICustomizer;
}

export interface ICustomizer {
  /**
   * ？还未想好怎么表述
   */
  frame?: boolean;
  /**
   * 选项卡
   */
  tabs?: ITabPane[];
  /**
   * 字段分组设置
   */
  groups?: IFieldGroup[];
  /**
   * 配置字段
   */
  fields: IField[];
}

export interface IBlockData<T = any> {
  id: string;
  key: string;
  icon: string;
  title: string;
  props?: T;
  update: UpdateFunc<T>;
  component: string;
  customizer?: ICustomizer;
  version?: number;
}

export interface IReactComponentState {
  blocks: IBlockData[];
}

export type IReactComponentStoreContext = {
  id: string;
  getBlock: (key: string) => IBlockData | undefined;
  getState: () => IReactComponentState;
  subscribe: SubscribeFunc;
  dispatch: DispatchWithoutAction;
};

export interface ReactComponentProviderProps {
  id?: string;
  children: React.ReactNode;
  value: IBlockData<any>[];
  version?: number;
}

export interface IComponentBlockData {
  key: string;
  props: any;
}

export interface IBlockState {
  version: number;
  definition: IComponentDefinition;
  blocks: IBlockData<any>[];
}

export type IBlockCoreData = {
  key: string;
  icon: string;
  title: string;
  component: string;
  props: any;
};

export interface IUpdateBlockData {
  key: string;
  props: any;
}

export type Selector<Selected> = (state: IReactComponentState) => Selected;
export type EqualityFn<Selected> = (theNew: Selected, latest: Selected) => boolean;

export interface IBlockDataProps {
  [key: string]: any;
}

export interface IBlockOptions<T> {
  key: string;
  icon: string;
  title: string;
  props?: T;
  customizer?: ICustomizer;
}

export interface IBlockProviderProps<P> {
  ref?: any;
  clickable?: boolean;
  tag?: string | ComponentType<P>;
  deps?: DependencyList | undefined;
  children: React.ReactNode;
}

export type DivProvider = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export interface IUseBlockState<T, P = DivProvider> extends IBlockData<T> {
  onClick: (e?: React.MouseEvent) => void;
  update: UpdateFunc<T>;
  props: T;
  Provider: React.ComponentType<IBlockProviderProps<P> & P>;
}

export type IUseBlock<T, P = DivProvider> = IUseBlockState<T, P>;

export type UseBlockCache<T, P> = {
  id: string;
  key: string;
  options: IBlockOptions<T>;
  result: IUseBlock<T, P>;
};

export type DataSourceResult<R> = {
  loading?: boolean;
  data?: R;
  error?: any;
};

export interface DataSourceLoader<P = any> {
  type: string;
  load<T>(param: P): Promise<DataSourceResult<T>>;
}

export const defaultEqualityFn = (a: any, b: any) => a === b;
