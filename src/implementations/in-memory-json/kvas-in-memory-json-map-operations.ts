// import { kvasInMemoryJsonMapToDataObjectRecur } from './kvas-in-memory-json-utils';

import type {
  JsonComposite,
  JsonPrimitive,
} from '@in-memory-json/kvas-in-memory-json-types';
import {
  CreateMapOptions,
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

export class KvasInMemoryJsonMapOperations<
  P extends JsonPrimitive,
> extends KvasMapOperations<
  KvasInMemoryJsonTypeParameters<P>,
  JsonComposite<P>
> {
  createMap(
    options?: CreateMapOptions<
      KvasInMemoryJsonTypeParameters<P>,
      JsonComposite<P>,
      KvasInMemoryJsonMap<P>
    > &
      KvasInMemoryJsonMapOptions,
    inMemoryJsonMapInstanceConfig?: KvasInMemoryJsonMapInstanceConfigInput<P>,
  ): KvasSyncOrPromiseResult<KvasInMemoryJsonMap<P>> {
    const sync = () => {
      const map =
        options?.fromMap ||
        (options?.fromJsObject &&
          (
            this.fromJsObject(options?.fromJsObject, {
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
          ).sync().map);
      const typeofKey = typeof options?.forKey;
      if (typeofKey === 'number') {
        const m = new KvasInMemoryJsonMap<P>({
          ...(inMemoryJsonMapInstanceConfig || {}),
          data: [],
        });
        if (map) {
          KvasInMemoryJsonMap.isMapTypeCompatibleWithKeyType(
            map.mapType,
            typeofKey,
          );
          m.host = map.host;
        }
        return m;
      } else if (typeofKey === 'string') {
        const m = new KvasInMemoryJsonMap<P>({
          ...(inMemoryJsonMapInstanceConfig || {}),
          data: {},
        });
        if (map) {
          KvasInMemoryJsonMap.isMapTypeCompatibleWithKeyType(
            map.mapType,
            typeofKey,
          );
          m.host = map.host;
        }
        return m;
      } else if (!map) {
        return new KvasInMemoryJsonMap<P>({
          ...(inMemoryJsonMapInstanceConfig || {}),
          data: {},
        });
      }
      return map;
    };
    return {
      sync,
      promise: () => Promise.resolve(sync()),
    };
  }

  override toJsObject(
    kvasMap: KvasInMemoryJsonMap<P>,
  ): KvasSyncOrPromiseResult<
    KvasMapOperationsToObjectResult<JsonComposite<P>>
  > {
    const sync = () => {
      // return { object: kvasInMemoryJsonMapToDataObjectRecur(kvasMap) };
      return { object: kvasMap.host };
    };
    return {
      sync,
      promise: () => Promise.resolve(sync()),
    };
  }

  override fromJsObject(
    jsObject: JsonComposite<P>,
    options: KvasInMemoryJsonMapOptions,
  ): KvasSyncOrPromiseResult<
    KvasMapOperationsFromJsResult<
      KvasInMemoryJsonTypeParameters<P>,
      KvasInMemoryJsonMap<P>
    >
  > {
    const sync = () => {
      // console.log('fromJsObject', jsObject);
      const map = new KvasInMemoryJsonMap({ data: jsObject, options });
      // console.log('fromJsObject', map);
      return { map };
    };
    return {
      sync,
      promise: () => Promise.resolve(sync()),
    };
  }
}
