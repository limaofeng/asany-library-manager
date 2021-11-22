import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';

import { ComponentMetadata, METADATA_KEY_COMPONENTS } from '../typings';

export default function component(metadata?: ComponentMetadata) {
  return function (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {
    let components: any[] = [];
    if (Reflect.hasMetadata(METADATA_KEY_COMPONENTS, target)) {
      components = Reflect.getMetadata(METADATA_KEY_COMPONENTS, target);
    } else {
      Reflect.defineMetadata(METADATA_KEY_COMPONENTS, components, target);
    }
    let method: () => any;
    if (descriptor) {
      method = descriptor.value || (descriptor as any).initializer;
    } else {
      method = function (this: any) {
        return this[propertyKey];
      };
    }
    const getValue = function (this: any) {
      const retval = method.apply(this);
      if (metadata) {
        for (const key of Object.keys(metadata)) {
          Reflect.defineMetadata(key, (metadata as any)[key], retval);
        }
      }
      if (!metadata?.name) {
        Reflect.defineMetadata('name', upperFirst(camelCase(propertyKey)), retval);
      }
      return retval;
    };
    if (descriptor) {
      descriptor.value = getValue;
    }
    components.push(getValue);
  };
}
