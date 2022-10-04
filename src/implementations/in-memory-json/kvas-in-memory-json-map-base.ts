import type {
  KvasMapBase,
  KvasMapDeleteKeyResult,
  KvasMapGetKeyResult,
  KvasMapSetKeyResult,
} from '../../core/kvas-map-base';
import type { KvasSyncOrPromiseResult } from '../../core/kvas-types';
import { KvasValueType } from '../../core/kvas-types';
import type { KvasErrorConstructor } from '../../core/kvas-errors';
import { KvasErrors } from '../../core/kvas-errors';
import type {
  JsonArray,
  JsonObject,
  JsonPrimitive,
  JsonValue,
} from './kvas-in-memory-json-types';
import { jsonStringifySafe } from './kvas-in-memory-json-utils';

export type KvasInMemoryJsonKey = string | number;

export type KvasInMemoryJsonTypeParameters<P extends JsonPrimitive> = {
  Key: KvasInMemoryJsonKey;
  PrimitiveValue: P;
};

export type KvasInMemoryJsonMapHost<P extends JsonPrimitive> =
  | JsonObject<P>
  | JsonArray<P>;

export type KvasInMemoryJsonMapOptions = {
  ignoreIncompatibleHostAndKey?: boolean;
};

export type KvasInMemoryJsonMapInstanceConfigInput<P extends JsonPrimitive> = {
  getValueType?: (x: unknown) => KvasValueType | undefined;
  host?: KvasInMemoryJsonMapHost<P>;
  options?: KvasInMemoryJsonMapOptions;
};

export const KVAS_IN_MEMORY_JSON_MAP_DEFAULT_OPTIONS = {
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

export type KvasInMemoryJsonMapInstanceConfigMixin<P extends JsonPrimitive> = {
  readonly instanceConfig: Required<KvasInMemoryJsonMapInstanceConfigInput<P>>;
};

export class KvasInMemoryJsonError extends KvasErrors {
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

export function getValueTypeForKvasInMemoryJsonDefault(
  x: unknown,
): KvasValueType | undefined {
  if (
    typeof x === 'object' &&
    x !== null &&
    x instanceof KvasInMemoryJsonMapBase
  ) {
    return KvasValueType.MAP;
  } else if (['boolean', 'string', 'number'].includes(typeof x) || x === null) {
    return KvasValueType.PRIMITIVE;
  } else {
    return undefined;
  }
}

export class KvasInMemoryJsonMapBase<P extends JsonPrimitive>
  implements KvasMapBase<KvasInMemoryJsonTypeParameters<P>>
{
  readonly instanceConfig: KvasInMemoryJsonMapInstanceConfigMixin<P>['instanceConfig'];

  constructor(instanceConfig?: KvasInMemoryJsonMapInstanceConfigInput<P>) {
    this.instanceConfig = {
      ...(instanceConfig || {}),
      getValueType:
        instanceConfig?.getValueType || getValueTypeForKvasInMemoryJsonDefault,
      host: instanceConfig?.host || {},
      options: {
        ...KVAS_IN_MEMORY_JSON_MAP_DEFAULT_OPTIONS,
        ...(instanceConfig?.options || {}),
      },
    };
  }

  getHost(): KvasSyncOrPromiseResult<KvasInMemoryJsonMapHost<P>> {
    const sync = () => {
      return this.instanceConfig.host;
    };
    return {
      sync,
      promise: () => Promise.resolve(sync()),
    };
  }

  deleteKey(
    key: KvasInMemoryJsonTypeParameters<P>['Key'],
  ): KvasSyncOrPromiseResult<KvasMapDeleteKeyResult> {
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
  ): KvasSyncOrPromiseResult<KvasMapGetKeyResult<this>> {
    const sync: () => KvasMapGetKeyResult<KvasInMemoryJsonMapBase<P>> = () => {
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
    value:
      | KvasInMemoryJsonTypeParameters<P>['PrimitiveValue']
      | KvasMapBase<KvasInMemoryJsonTypeParameters<P>>,
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
}
