import type { JsonPrimitive } from './kvas-in-memory-json-types';
import { KvasMapOperations } from '../../core/kvas-map-operations';
import type { CreateMapOptions } from '../../core/kvas-map-operations';
import type {
  KvasInMemoryJsonMapHost,
  KvasInMemoryJsonMapInstanceConfigInput,
} from './kvas-in-memory-json-map-base';
import { KvasInMemoryJsonMapBase } from './kvas-in-memory-json-map-base';
import type { KvasSyncOrPromiseResult } from '../../core/kvas-types';

export class KvasInMemoryJsonMapOperations<
  P extends JsonPrimitive,
  JSM = KvasInMemoryJsonMapHost<P>,
> extends KvasMapOperations<KvasInMemoryJsonMapBase<P>, JSM> {
  createMap(
    options?: CreateMapOptions<KvasInMemoryJsonMapBase<P>>,
    inMemoryJsonMapInstanceConfig?: KvasInMemoryJsonMapInstanceConfigInput<P>,
  ): KvasSyncOrPromiseResult<KvasInMemoryJsonMapBase<P>> {
    const sync = () => {
      if (typeof options?.forKey === 'number') {
        return new KvasInMemoryJsonMapBase<P>({
          ...(inMemoryJsonMapInstanceConfig || {}),
          host: [],
        });
      } else {
        return new KvasInMemoryJsonMapBase<P>({
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
