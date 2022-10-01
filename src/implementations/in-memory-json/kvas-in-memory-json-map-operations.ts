import type {
  JsonArray,
  JsonObject,
  JsonPrimitive,
  JsonValue,
} from './kvas-in-memory-json-types';
import {
  KvasMapOperations,
  KvasMapOperationsToObjectResult,
} from '../../abstract/kvas-map-operations';
import type { CreateMapOptions } from '../../abstract/kvas-map-operations';
import type {
  KvasInMemoryJsonMapHost,
  KvasInMemoryJsonMapInstanceConfigInput,
} from './kvas-in-memory-json-map';
import { KvasInMemoryJsonMap } from './kvas-in-memory-json-map';
import type { KvasSyncOrPromiseResult } from '../../abstract/kvas-types';

export class KvasInMemoryJsonMapOperations<
  P extends JsonPrimitive,
  JSM = KvasInMemoryJsonMapHost<P>,
> extends KvasMapOperations<KvasInMemoryJsonMap<P>, JSM> {
  createMap(
    options?: CreateMapOptions<KvasInMemoryJsonMap<P>>,
    inMemoryJsonMapInstanceConfig?: KvasInMemoryJsonMapInstanceConfigInput<P>,
  ): KvasSyncOrPromiseResult<KvasInMemoryJsonMap<P>> {
    const sync = () => {
      if (typeof options?.forKey === 'number') {
        return new KvasInMemoryJsonMap<P>({
          ...(inMemoryJsonMapInstanceConfig || {}),
          host: [],
        });
      } else {
        return new KvasInMemoryJsonMap<P>({
          ...(inMemoryJsonMapInstanceConfig || {}),
          host: {},
        });
      }
    };
    return {
      sync,
      promise: () => Promise.resolve(sync()),
    };
  }

  // toJs(
  //   kvasMap: KvasInMemoryJsonMap<P>,
  // ): KvasSyncOrPromiseResult<KvasMapOperationsToObjectResult<JSM>> {
  //   const sync = () => {
  //
  //   }
  //   return {
  //     sync,
  //     promise: () => Promise.resolve(sync()),
  //   };
  // }
}
