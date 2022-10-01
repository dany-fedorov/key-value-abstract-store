import type {
  KvasKeyFromKvasMap,
  KvasMap,
  KvasMapDeleteKeyResult,
  KvasMapGetKeyResult,
  KvasMapQueryResult,
  KvasMapSetKeyResult,
  KvasMapToObjectResult,
  KvasPath,
  KvasSyncOrPromiseResult,
  KvasSyncResult,
  KvasErrorConstructor,
  KvasSyncAndPromiseResult,
} from './key-value-abstract-store.interface';
import {
  KvasDataSource,
  KvasError,
  KvasValueType,
} from './key-value-abstract-store.interface';

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

export type KvasInMemoryJsonKey = string | number;

export type KvasInMemoryJsonTypeParameters<P extends JsonPrimitive> = {
  Key: KvasInMemoryJsonKey;
  PrimitiveValue: P;
};

type JsonObject<P extends JsonPrimitive> = { [x: string]: JsonValue<P> };
type JsonArray<P extends JsonPrimitive> = Array<JsonValue<P>>;
type JsonPrimitive = string | number | boolean | null;
type JsonValue<P extends JsonPrimitive> = P | JsonObject<P> | JsonArray<P>;

type KvasInMemoryJsonHost<P extends JsonPrimitive> =
  | JsonObject<P>
  | JsonArray<P>;

type KvasInMemoryJsonMapOptions = {
  ignoreIncompatibleHostAndKey?: boolean;
};

type KvasInMemoryJsonMapInstanceConfigInput<P extends JsonPrimitive> = {
  getValueType: (x: unknown) => KvasValueType | undefined;
  host?: KvasInMemoryJsonHost<P>;
  options?: KvasInMemoryJsonMapOptions;
};

const KVAS_IN_MEMORY_JSON_MAP_DEFAULT_OPTIONS = {
  ignoreIncompatibleHostAndKey: false,
};

export function isKeyCompatibleWithHost<P extends JsonPrimitive>(
  host: JsonValue<P>,
  key: KvasInMemoryJsonKey,
): boolean {
  return (
    (typeof key === 'number' && Array.isArray(host)) ||
    (typeof key === 'string' && !Array.isArray(host))
  );
}

type KvasInMemoryJsonMapInstanceConfigMixin<P extends JsonPrimitive> = {
  readonly instanceConfig: Required<KvasInMemoryJsonMapInstanceConfigInput<P>>;
};

export class KvasInMemoryJsonError extends KvasError {
  constructor(...args: ConstructorParameters<KvasErrorConstructor>) {
    super(...args);
  }
}

export class KvasInMemoryJsonHostAndKeyAreIncompatibleError extends KvasInMemoryJsonError {
  constructor(host: unknown, key: unknown) {
    super(
      `Host and key incompatible: ${jsonStringifySafe(
        key,
      )} in ${jsonStringifySafe(host)}`,
    );
  }
}

export class KvasInMemoryJsonMap<P extends JsonPrimitive>
  implements
    KvasMap<KvasInMemoryJsonTypeParameters<P>>,
    KvasInMemoryJsonMapInstanceConfigMixin<P>
{
  readonly instanceConfig: KvasInMemoryJsonMapInstanceConfigMixin<P>['instanceConfig'];

  constructor(instanceConfig: KvasInMemoryJsonMapInstanceConfigInput<P>) {
    this.instanceConfig = {
      ...instanceConfig,
      host: instanceConfig.host || {},
      options: {
        ...KVAS_IN_MEMORY_JSON_MAP_DEFAULT_OPTIONS,
        ...(instanceConfig.options || {}),
      },
    };
  }

  deleteKey(
    key: KvasInMemoryJsonTypeParameters<P>['Key'],
  ): KvasSyncAndPromiseResult<KvasMapDeleteKeyResult> {
    const sync: () => KvasMapDeleteKeyResult = () => {
      const { host, options } = this.instanceConfig;
      if (
        !isKeyCompatibleWithHost(host, key) &&
        !options.ignoreIncompatibleHostAndKey
      ) {
        throw new KvasInMemoryJsonHostAndKeyAreIncompatibleError(host, key);
      }
      const found = Object.prototype.hasOwnProperty.call(host, key);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      delete host[key];
      return { found };
    };
    return {
      sync,
      promise: () => Promise.resolve(sync()),
    };
  }

  getKey(
    key: KvasInMemoryJsonTypeParameters<P>['Key'],
  ): KvasSyncAndPromiseResult<KvasMapGetKeyResult<KvasInMemoryJsonMap<P>>> {
    const sync: () => KvasMapGetKeyResult<KvasInMemoryJsonMap<P>> = () => {
      const { host, options } = this.instanceConfig;
      if (
        !isKeyCompatibleWithHost(host, key) &&
        !options.ignoreIncompatibleHostAndKey
      ) {
        throw new KvasInMemoryJsonHostAndKeyAreIncompatibleError(host, key);
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const value = host[key];
      const type = this.instanceConfig.getValueType(value);
      return { value, type };
    };
    return {
      sync,
      promise: () => Promise.resolve(sync()),
    };
  }

  setKey(
    key: KvasInMemoryJsonTypeParameters<P>['Key'],
    value: KvasInMemoryJsonTypeParameters<P>['PrimitiveValue'],
  ): KvasSyncOrPromiseResult<KvasMapSetKeyResult> {
    const sync: () => KvasMapSetKeyResult = () => {
      const { host, options } = this.instanceConfig;
      if (
        !isKeyCompatibleWithHost(host, key) &&
        !options.ignoreIncompatibleHostAndKey
      ) {
        throw new KvasInMemoryJsonHostAndKeyAreIncompatibleError(host, key);
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      this.host[key] = value;
      return {};
    };
    return {
      sync,
      promise: () => Promise.resolve(sync()),
    };
  }

  query(
    path: KvasPath<KvasInMemoryJsonTypeParameters<P>>,
  ): KvasSyncAndPromiseResult<KvasMapQueryResult<KvasInMemoryJsonMap<P>>> {
    const sync: () => KvasMapQueryResult<KvasInMemoryJsonMap<P>> = () => {
      if (path.length === 0) {
        const prop = {
          type: KvasValueType.MAP,
          path,
          value: this,
        };
        return {
          prop,
          lastFoundProp: prop,
          lastFoundMapProp: { ...prop, type: KvasValueType.MAP }, // For TypeScript
        };
      }
      let lastFoundPropPath: KvasPath<KvasInMemoryJsonTypeParameters<P>> = [];
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let lastFoundPropValue: KvasInMemoryJsonMap<P> | P = this;
      let lastFoundPropType: KvasValueType = KvasValueType.MAP;
      let lastFoundPropMapPath: KvasPath<KvasInMemoryJsonTypeParameters<P>> =
        [];
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let lastFoundPropMapValue: KvasInMemoryJsonMap<P> = this;
      const curPath: KvasPath<KvasInMemoryJsonTypeParameters<P>> = [];
      for (let i = 0; i < path.length; i++) {
        const pathSegment: KvasInMemoryJsonTypeParameters<P>['Key'] = path[
          i
        ] as KvasInMemoryJsonTypeParameters<P>['Key'];
        curPath.push(pathSegment);
        const { value, type } = lastFoundPropMapValue
          .getKey(pathSegment)
          .sync();
        const isPrimitive = type === KvasValueType.PRIMITIVE;
        const isMap = type === KvasValueType.MAP;
        const isLast = i === path.length - 1;
        if (isPrimitive && isLast) {
          const prop = {
            value,
            type,
            path,
          };
          return {
            prop,
            lastFoundProp: prop,
            lastFoundMapProp: {
              type: KvasValueType.MAP,
              value: lastFoundPropMapValue,
              path: lastFoundPropMapPath,
            },
          };
        } else if (isPrimitive && !isLast) {
          return {
            prop: undefined,
            lastFoundProp: {
              type: KvasValueType.PRIMITIVE,
              value,
              path: curPath,
            },
            lastFoundMapProp: {
              type: KvasValueType.MAP,
              value: lastFoundPropMapValue,
              path: lastFoundPropMapPath,
            },
          };
        } else if (isMap && isLast) {
          const prop = {
            value: value as KvasInMemoryJsonMap<P>,
            type: KvasValueType.MAP,
            path,
          };
          return {
            prop,
            lastFoundProp: prop,
            lastFoundMapProp: { ...prop, type: KvasValueType.MAP }, // For TypeScript
          };
        } else if (isMap && !isLast) {
          lastFoundPropMapValue = value as KvasInMemoryJsonMap<P>;
          lastFoundPropMapPath = curPath.slice();
          lastFoundPropValue = value as KvasInMemoryJsonMap<P>;
          lastFoundPropType = type;
          lastFoundPropPath = curPath.slice();
        } else {
          return {
            prop: undefined,
            lastFoundProp: {
              type: lastFoundPropType,
              value: lastFoundPropValue,
              path: lastFoundPropPath,
            },
            lastFoundMapProp: {
              type: KvasValueType.MAP,
              value: lastFoundPropMapValue,
              path: lastFoundPropMapPath,
            },
          };
        }
      }
      throw new Error('For TypeScript');
    };

    return {
      sync,
      // TODO
      promise: () => Promise.resolve(sync()),
    };
  }

  toObject(): KvasSyncResult<KvasMapToObjectResult> {
    const sync = () => {
      return JSON.parse(jsonStringifySafe(this.instanceConfig.host));
    };
    return {
      sync,
      promise: () => Promise.resolve(sync()),
    };
  }
}

export function getValueTypeForKvasInMemoryJsonDefault(
  x: unknown,
): KvasValueType | undefined {
  if (typeof x === 'object' && x !== null && x instanceof KvasInMemoryJsonMap) {
    return KvasValueType.MAP;
  } else if (['boolean', 'string', 'number'].includes(typeof x) || x === null) {
    return KvasValueType.PRIMITIVE;
  } else {
    return undefined;
  }
}

type KvasInMemoryJsonDataStoreConfigInput = {
  getValueType?: (x: unknown) => KvasValueType | undefined;
};

type KvasInMemoryJsonDataStoreConfigMixin = {
  readonly instanceConfig: Required<KvasInMemoryJsonDataStoreConfigInput>;
};

export class KvasInMemoryJsonMapOperations<P extends JsonPrimitive>
  extends KvasDataSource<KvasInMemoryJsonMap<P>>
  implements KvasInMemoryJsonDataStoreConfigMixin
{
  readonly instanceConfig: Required<KvasInMemoryJsonDataStoreConfigInput>;
  private readonly root: KvasInMemoryJsonMap<P>;

  constructor(instanceConfig?: KvasInMemoryJsonDataStoreConfigInput) {
    super();
    this.instanceConfig = {
      ...(instanceConfig || {}),
      getValueType:
        instanceConfig?.getValueType || getValueTypeForKvasInMemoryJsonDefault,
    };
    this.root = this.createMap().sync();
  }

  createMap(
    forKey?: KvasKeyFromKvasMap<KvasInMemoryJsonMap<P>>,
    options?: KvasInMemoryJsonMapOptions,
  ): KvasSyncResult<KvasInMemoryJsonMap<P>> {
    const sync = () => {
      const optionsBase = {
        ...(options || {}),
        getValueType: this.instanceConfig.getValueType,
      };
      if (typeof forKey === 'number') {
        return new KvasInMemoryJsonMap<P>({
          ...optionsBase,
          host: [],
        });
      } else {
        return new KvasInMemoryJsonMap<P>({
          ...optionsBase,
          host: {},
        });
      }
    };
    return {
      sync,
      promise: () => Promise.resolve(sync()),
    };
  }

  initialize(): KvasSyncResult<KvasInMemoryJsonMap<P>> {
    const sync = () => {
      return this.root;
    };
    return {
      sync,
      promise: () => Promise.resolve(sync()),
    };
  }

  getRootMap(): KvasSyncResult<KvasInMemoryJsonMap<P>> {
    const sync = () => {
      return this.root;
    };
    return {
      sync,
      promise: () => Promise.resolve(sync()),
    };
  }
}
