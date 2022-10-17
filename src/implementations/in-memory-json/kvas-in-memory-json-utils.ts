// import type {
//   JsonComposite,
//   JsonCompositeKey,
//   JsonCompositeUnconstrained,
//   JsonPrimitive,
// } from '@in-memory-json/kvas-in-memory-json-types';
// import type {
//   KvasInMemoryJsonKey,
//   KvasInMemoryJsonMapDataHost,
// } from '@in-memory-json/kvas-in-memory-json-map';
// import {
//   __REWRITE_OBJECT_DEFAULT_ROOT_KEY__,
//   rewriteObject,
// } from 'configurable-tree-traversal/tools/rewrite-object';
// import { KvasInMemoryJsonMap } from '@in-memory-json/kvas-in-memory-json-map';
// import { PRIMITIVE_TYPEOF_TYPES } from 'configurable-tree-traversal/traversable-tree-implementations/traversable-object-tree/lib/constants';

const replacerFunc = () => {
  const visited = new WeakSet();
  return (_key: unknown, value: unknown) => {
    if (typeof value === 'object' && value !== null) {
      if (visited.has(value)) {
        return;
      }
      visited.add(value);
    }
    return value;
  };
};

export const jsonStringifySafe = (
  obj: unknown,
  indent?: string | number,
): string => {
  return JSON.stringify(obj, replacerFunc(), indent);
};

/*export function dataObjectToKvasInMemoryJsonMapRecur<P extends JsonPrimitive>(
  dataObject: JsonComposite<P>,
): KvasInMemoryJsonMapDataHost<P> {
  const { outputObject } = rewriteObject<
    JsonComposite<P>,
    KvasInMemoryJsonKey,
    P | JsonComposite<P>,
    KvasInMemoryJsonMapDataHost<P>,
    keyof KvasInMemoryJsonMap<P>,
    KvasInMemoryJsonMap<P>
  >(dataObject, {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    assembleObject: (processedChildren, { key }) => {
      // console.log('assembleObject', key, processedChildren);
      if (key === __REWRITE_OBJECT_DEFAULT_ROOT_KEY__) {
        // console.log('???');
        return Object.fromEntries(
          processedChildren.map((ch) => [ch.key, ch.value]),
        );
      }
      // console.log('+++');
      const m = new KvasInMemoryJsonMap<P>({
        data: {},
      });
      // console.log('+++1');
      processedChildren.forEach((ch) => {
        m.setKey(ch.key, ch.value).sync?.();
      });
      // console.log({ m });
      return m;
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    assembleArray: (processedChildren, { key }) => {
      // console.log('assembleArray', key, processedChildren);
      if (key === __REWRITE_OBJECT_DEFAULT_ROOT_KEY__) {
        return processedChildren.map((ch) => ch.value);
      }
      const m = new KvasInMemoryJsonMap<P>({
        data: [],
      });
      processedChildren.forEach((ch) => {
        m.setKey(ch.key, ch.value).sync?.();
      });
      return m;
    },
  });
  // console.log({ outputObject });
  return outputObject;
}

export function kvasInMemoryJsonMapToDataObjectRecur<P extends JsonPrimitive>(
  kvasMap: KvasInMemoryJsonMap<P>,
): JsonComposite<P> {
  const { outputObject } = rewriteObject<
    KvasInMemoryJsonMap<P>,
    JsonCompositeKey,
    P | JsonCompositeUnconstrained<P>,
    JsonComposite<P>,
    JsonCompositeKey,
    P | JsonComposite<P>
  >(kvasMap, {
    getRootPropertyFromInputObject: (inputObj) => {
      // console.log('getRootPropertyFromInputObject', { inputObj });
      return {
        key: __REWRITE_OBJECT_DEFAULT_ROOT_KEY__,
        value: inputObj.host,
      };
    },
    getChildrenOfProperty: ({ key: _key, value }) => {
      // console.log('getChildrenOfProperty', _key, value);
      if (PRIMITIVE_TYPEOF_TYPES.includes(typeof value)) {
        return [];
      } else {
        return Object.entries(value as JsonCompositeUnconstrained<P>).map(
          ([k, value]) => {
            const key = Array.isArray(value) ? Number(k) : k;
            if (value instanceof KvasInMemoryJsonMap) {
              return { key, value: value.host };
            } else {
              return { key, value };
            }
          },
        );
      }
    },
  });
  return outputObject;
}*/
