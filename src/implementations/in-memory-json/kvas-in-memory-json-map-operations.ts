import type {
  JsonComposite,
  JsonPrimitive,
  JsonValue,
} from '@in-memory-json/kvas-in-memory-json-types';
import {
  KvasMapOperationsCreateMapOptions,
  KvasMapOperations,
  KvasMapOperationsFromJsResult,
  KvasMapOperationsToObjectResult,
} from '@core/kvas-map-operations';
import type {
  KvasInMemoryJsonMapInstanceConfigInput,
  KvasInMemoryJsonMapOptions,
  KvasInMemoryJsonTypeParameters,
} from '@in-memory-json/kvas-in-memory-json-map';
import { KvasInMemoryJsonMap } from '@in-memory-json/kvas-in-memory-json-map';
import type { KvasSyncOrPromiseResult, KvasSyncResult } from '@core/kvas-types';
import { jsonStringifySafe } from '@in-memory-json/kvas-in-memory-json-utils';

export const PRIMITIVE_TYPEOF_TYPES = [
  'null',
  'undefined',
  'symbol',
  'string',
  'number',
  'boolean',
  'bigint',
];

export class KvasInMemoryJsonMapOperations<
  P extends JsonPrimitive,
> extends KvasMapOperations<
  KvasInMemoryJsonTypeParameters<P>,
  KvasInMemoryJsonMap<P>,
  JsonValue<P>
> {
  createMap(
    options?: KvasMapOperationsCreateMapOptions<
      KvasInMemoryJsonTypeParameters<P>,
      JsonComposite<P>,
      KvasInMemoryJsonMap<P>
    > &
      KvasInMemoryJsonMapOptions,
    inMemoryJsonMapInstanceConfig?: KvasInMemoryJsonMapInstanceConfigInput<P>,
  ): KvasSyncOrPromiseResult<KvasInMemoryJsonMap<P>> {
    const sync = () => {
      const value =
        (options?.fromMap ||
          (options?.fromJSO &&
            (
              this.fromJSO(options?.fromJSO, {
                ...(options?.ignoreIncompatibleHostAndKeyTypes === undefined
                  ? {}
                  : {
                      ignoreIncompatibleHostAndKeyTypes:
                        options?.ignoreIncompatibleHostAndKeyTypes,
                    }),
              }) as KvasSyncResult<
                KvasMapOperationsFromJsResult<
                  KvasInMemoryJsonTypeParameters<P>,
                  KvasInMemoryJsonMap<P>
                >
              >
            ).sync().value)) ??
        null;
      if (value !== null && !(value instanceof KvasInMemoryJsonMap)) {
        throw new Error(`Value is not a map ${jsonStringifySafe(value)}`);
      }
      const typeofKeyInside = typeof options?.forKeyInside;
      if (typeofKeyInside === 'number') {
        const m = new KvasInMemoryJsonMap<P>({
          ...(inMemoryJsonMapInstanceConfig || {}),
          data: [],
        });
        if (value) {
          KvasInMemoryJsonMap.isMapTypeCompatibleWithKeyType(
            value.mapType,
            typeofKeyInside,
          );
          m.host = value.host;
        }
        return m;
      } else if (typeofKeyInside === 'string') {
        const m = new KvasInMemoryJsonMap<P>({
          ...(inMemoryJsonMapInstanceConfig || {}),
          data: {},
        });
        if (value) {
          KvasInMemoryJsonMap.isMapTypeCompatibleWithKeyType(
            value.mapType,
            typeofKeyInside,
          );
          m.host = value.host;
        }
        return m;
      } else if (!value) {
        return new KvasInMemoryJsonMap<P>({
          ...(inMemoryJsonMapInstanceConfig || {}),
          data: {},
        });
      }
      return value;
    };
    return {
      sync,
      promise: () => Promise.resolve(sync()),
    };
  }

  override toJSO(
    kvasMap: KvasInMemoryJsonMap<P>,
  ): KvasSyncOrPromiseResult<
    KvasMapOperationsToObjectResult<JsonComposite<P>>
  > {
    const sync = () => {
      // return { object: kvasInMemoryJsonMapToDataObjectRecur(kvasMap) };
      return { jso: kvasMap.host };
    };
    return {
      sync,
      promise: () => Promise.resolve(sync()),
    };
  }

  override fromJSO(
    jso: JsonValue<P>,
    options: KvasInMemoryJsonMapOptions,
  ): KvasSyncOrPromiseResult<
    KvasMapOperationsFromJsResult<
      KvasInMemoryJsonTypeParameters<P>,
      KvasInMemoryJsonMap<P>
    >
  > {
    const sync = () => {
      // console.log('fromJSO', jso);
      if (PRIMITIVE_TYPEOF_TYPES.includes(typeof jso)) {
        return { value: jso as P };
      }
      const value = new KvasInMemoryJsonMap({
        data: jso as JsonComposite<P>,
        options,
      });
      // console.log('fromJSO', map);
      return { value: value };
    };
    return {
      sync,
      promise: () => Promise.resolve(sync()),
    };
  }
}
