import type {
  JsonComposite,
  JsonCompositeUnconstrained,
  JsonPrimitive,
} from '@in-memory-json/kvas-in-memory-json-types';
import { KvasSyncOrPromiseResult, KvasValueType } from '@core/kvas-types';
import { KvasError, KvasErrorConstructor } from '@core/kvas-errors';
import { jsonStringifySafe } from '@in-memory-json/kvas-in-memory-json-utils';
import {
  KvasMap,
  KvasMapDeleteKeyResult,
  KvasMapGetKeyResult,
  KvasMapSetKeyResult,
} from '@core/kvas-map';

export type KvasInMemoryJsonKey = string | number;

export type KvasInMemoryJsonTypeParameters<P extends JsonPrimitive> = {
  Key: KvasInMemoryJsonKey;
  PrimitiveValue: P;
};

export type KvasInMemoryJsonMapDataHost<P extends JsonPrimitive> =
  JsonCompositeUnconstrained<P>;

export type KvasInMemoryJsonMapOptions = {
  ignoreIncompatibleHostAndKeyTypes?: boolean;
};

export type KvasInMemoryJsonMapInstanceConfigInput<P extends JsonPrimitive> = {
  getValueType?: (x: unknown) => KvasValueType | undefined;
  data?: JsonComposite<P>;
  options?: KvasInMemoryJsonMapOptions;
};

export const KVAS_IN_MEMORY_JSON_MAP_DEFAULT_OPTIONS = {
  ignoreIncompatibleHostAndKey: false,
};

function isMapTypeCompatibleWithKeyType(
  mapType: KvasInMemoryJsonMapType,
  typeofKey: string,
): boolean {
  return (
    (typeofKey === 'number' && mapType === KvasInMemoryJsonMapType.ARRAY) ||
    (typeofKey === 'string' && mapType === KvasInMemoryJsonMapType.OBJECT)
  );
}

export enum KvasInMemoryJsonMapType {
  OBJECT = 'object',
  ARRAY = 'array',
}

export type KvasInMemoryJsonMapInstanceConfigMixin<P extends JsonPrimitive> = {
  readonly instanceConfig: Omit<
    Required<KvasInMemoryJsonMapInstanceConfigInput<P>>,
    'data'
  >;
};

export class KvasInMemoryJsonError extends KvasError {
  constructor(...args: ConstructorParameters<KvasErrorConstructor>) {
    super(...args);
  }
}

export class KvasInMemoryJsonHostAndKeyAreIncompatibleError extends KvasInMemoryJsonError {
  constructor(mapType: KvasInMemoryJsonMapType, key: unknown) {
    super(
      `Map type and key incompatible: Key ${jsonStringifySafe(
        key,
      )} with map type ${jsonStringifySafe(mapType)}`,
    );
  }
}

export function getValueTypeForKvasInMemoryJsonDefault(
  x: unknown,
): KvasValueType | undefined {
  if (typeof x === 'object' && x !== null) {
    return KvasValueType.MAP;
  } else if (['boolean', 'string', 'number'].includes(typeof x) || x === null) {
    return KvasValueType.PRIMITIVE;
  } else {
    return undefined;
  }
}

function getDataInputMapType<P extends JsonPrimitive>(
  data: JsonComposite<P>,
): KvasInMemoryJsonMapType {
  if (data !== null && typeof data === 'object' && !Array.isArray(data)) {
    return KvasInMemoryJsonMapType.OBJECT;
  } else if (Array.isArray(data)) {
    return KvasInMemoryJsonMapType.ARRAY;
  } else {
    throw new KvasInMemoryJsonError(
      `Unexpected map type of ${jsonStringifySafe(data)}`,
    );
  }
}

export class KvasInMemoryJsonMap<P extends JsonPrimitive> extends KvasMap<
  KvasInMemoryJsonTypeParameters<P>
> {
  readonly icfg: KvasInMemoryJsonMapInstanceConfigMixin<P>['instanceConfig'];

  mapType: KvasInMemoryJsonMapType;
  host: KvasInMemoryJsonMapDataHost<P>;

  constructor(instanceConfig?: KvasInMemoryJsonMapInstanceConfigInput<P>) {
    super();
    const data = instanceConfig?.data || {};
    this.mapType = getDataInputMapType(data);
    this.icfg = {
      ...(instanceConfig || {}),
      getValueType:
        instanceConfig?.getValueType || getValueTypeForKvasInMemoryJsonDefault,
      options: {
        ...KVAS_IN_MEMORY_JSON_MAP_DEFAULT_OPTIONS,
        ...(instanceConfig?.options || {}),
      },
    };
    // this.host = dataObjectToKvasInMemoryJsonMapRecur(data);
    this.host = data instanceof KvasInMemoryJsonMap ? data.host : data;
  }

  static isMapTypeCompatibleWithKeyType = isMapTypeCompatibleWithKeyType;

  deleteKey(
    key: KvasInMemoryJsonTypeParameters<P>['Key'],
  ): KvasSyncOrPromiseResult<KvasMapDeleteKeyResult> {
    const sync: () => KvasMapDeleteKeyResult = () => {
      const { options } = this.icfg;
      if (
        !isMapTypeCompatibleWithKeyType(this.mapType, typeof key) &&
        !options.ignoreIncompatibleHostAndKeyTypes
      ) {
        throw new KvasInMemoryJsonHostAndKeyAreIncompatibleError(
          this.mapType,
          key,
        );
      }
      const found = Object.prototype.hasOwnProperty.call(this.host, key);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      delete data[key];
      return { found };
    };
    return {
      sync,
      promise: () => Promise.resolve(sync()),
    };
  }

  getKey(
    key: KvasInMemoryJsonTypeParameters<P>['Key'],
  ): KvasSyncOrPromiseResult<
    KvasMapGetKeyResult<KvasInMemoryJsonTypeParameters<P>, this>
  > {
    const sync: () => KvasMapGetKeyResult<
      KvasInMemoryJsonTypeParameters<P>,
      KvasInMemoryJsonMap<P>
    > = () => {
      const { options } = this.icfg;
      if (
        !isMapTypeCompatibleWithKeyType(this.mapType, typeof key) &&
        !options.ignoreIncompatibleHostAndKeyTypes
      ) {
        throw new KvasInMemoryJsonHostAndKeyAreIncompatibleError(
          this.mapType,
          key,
        );
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const rawValue = this.host[key];
      const type = this.icfg.getValueType(rawValue);
      let value;
      if (type === 'map') {
        value = new KvasInMemoryJsonMap({ data: rawValue });
      } else {
        value = rawValue;
      }
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
      | KvasInMemoryJsonMap<P>,
  ): KvasSyncOrPromiseResult<KvasMapSetKeyResult> {
    const sync: () => KvasMapSetKeyResult = () => {
      const { options } = this.icfg;
      if (
        !isMapTypeCompatibleWithKeyType(this.mapType, typeof key) &&
        !options.ignoreIncompatibleHostAndKeyTypes
      ) {
        throw new KvasInMemoryJsonHostAndKeyAreIncompatibleError(
          this.mapType,
          key,
        );
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

  listKeys(): KvasSyncOrPromiseResult<
    KvasInMemoryJsonTypeParameters<P>['Key'][]
  > {
    const sync = () => {
      if (this.host === null) {
        return [];
      } else if (this.mapType === KvasInMemoryJsonMapType.ARRAY) {
        return Object.keys(this.host).map((i) => Number(i));
      } else if (this.mapType === KvasInMemoryJsonMapType.OBJECT) {
        return Object.keys(this.host);
      } else {
        throw new KvasInMemoryJsonError(
          `Cannot listKeys of map type ${
            this.mapType
          } and host ${jsonStringifySafe(this.host)}`,
        );
      }
    };
    return {
      sync,
      promise: () => Promise.resolve(sync()),
    };
  }
}
