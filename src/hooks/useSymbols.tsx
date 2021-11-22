import { useEffect, useReducer, useRef } from 'react';

import type Sunmao from '../Sunmao';
import {
  ComponentDragObject,
  ComponentGroup,
  ComponentSelector,
  IComponentDefinition,
  IComponentDragObject,
} from '../typings';
import { generateUUID } from '../utils';

import useComponent from './useComponent';

import { useSunmao } from '.';

const COMPONENT = 'component';

function buildComponentDragObject(item: IComponentDragObject) {
  if (typeof item.selector === 'string') {
    return {
      ...item,
      selector: (component: IComponentDefinition) => {
        return !!component.tags && component.tags.some((tag) => tag.startsWith(item.selector as string));
      },
    };
  }
  return { ...item };
}

const buildCreateDragObject = (type: string) => (component: IComponentDefinition): ComponentDragObject => {
  return {
    id: generateUUID(),
    component: component.id,
    name: component.name,
    type,
  };
};

function defaultComponentSorter({ boost: a = 0 }: IComponentDefinition, { boost: b = 0 }: IComponentDefinition) {
  return a - b;
}

function buildComponentGroup(item: IComponentDragObject, sunmao: Sunmao): ComponentGroup {
  return {
    title: item.title,
    type: item.type || COMPONENT,
    createDragObject: item.object || buildCreateDragObject(item.type || COMPONENT),
    components: sunmao.getComponents(item.selector as ComponentSelector).sort(item.sorter || defaultComponentSorter),
  };
}

/**
 * 获取 组件 对应的 symbols
 * @param id 组件ID
 */
function useSymbols(id: string): ComponentGroup[] {
  const sunmao = useSunmao();
  const component = useComponent(id);

  const [, forceRender] = useReducer((s) => s + 1, 0);
  // 存储上一次selector的返回值。
  const latestState = useRef<ComponentGroup[]>([]);

  useEffect(() => {
    if (component == null) {
      return;
    }
    const updateState = () => {
      latestState.current = (component.symbols || [])
        .map(buildComponentDragObject)
        .map((item) => buildComponentGroup(item, sunmao));
      forceRender();
    };
    updateState();
    return sunmao.subscribe(updateState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [component]);

  return latestState.current;
}

export default useSymbols;
