import camelCase from 'lodash-es/camelCase';
import capitalize from 'lodash-es/capitalize';
import { ComponentMetadata, METADATA_KEY_COMPONENTS } from '../typings';

export default function component(metadata?: ComponentMetadata) {
  return function (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {
    let components: any[] = [];
    if (Reflect.hasMetadata(METADATA_KEY_COMPONENTS, target)) {
      components = Reflect.getMetadata(METADATA_KEY_COMPONENTS, target);
    } else {
      Reflect.defineMetadata(METADATA_KEY_COMPONENTS, components, target);
    }
    if (!descriptor) {
      console.error('descriptor is null');
      return;
    }
    const method = descriptor.value || (descriptor as any).initializer;
    descriptor.value = function () {
      const retval = method.apply(this);
      if (metadata && metadata.name) {
        for (const key of Object.keys(metadata)) {
          Reflect.defineMetadata(key, (metadata as any)[key], retval);
        }
      } else {
        Reflect.defineMetadata('name', capitalize(camelCase(propertyKey)), retval);
      }
      return retval;
    };
    components.push(descriptor.value);
  };
}
