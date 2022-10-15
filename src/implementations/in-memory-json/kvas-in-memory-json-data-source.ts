import {
  KvasDataSource,
  KvasDataSourceInitializeOptions,
} from '@core/kvas-data-source';
import type {
  JsonComposite,
  JsonPrimitive,
  JsonValue,
} from '@in-memory-json/kvas-in-memory-json-types';
import type { KvasInMemoryJsonTypeParameters } from '@in-memory-json/kvas-in-memory-json-map';
import type { KvasInMemoryJsonMap } from '@in-memory-json/kvas-in-memory-json-map';
import { KvasInMemoryJsonMapOperations } from '@in-memory-json/kvas-in-memory-json-map-operations';
import { KvasDataSourceSyncContainer } from '@core/kvas-data-source-sync-container';
import { KvasDataSourceAsyncContainer } from '@core/kvas-data-source-async-container';

export type KvasInMemoryJsonDataSourceCreateOptions<P extends JsonPrimitive> = {
  operations?: KvasInMemoryJsonMapOperations<P>;
} & KvasDataSourceInitializeOptions<
  KvasInMemoryJsonTypeParameters<P>,
  KvasInMemoryJsonMap<P>,
  JsonValue<P>
>;

export class KvasInMemoryJsonDataSource<
  P extends JsonPrimitive,
> extends KvasDataSource<
  KvasInMemoryJsonTypeParameters<P>,
  KvasInMemoryJsonMap<P>,
  JsonComposite<P> | P
> {
  static createSyncDataStore<P extends JsonPrimitive>(
    options?: KvasInMemoryJsonDataSourceCreateOptions<P>,
  ) {
    const dataSource = new KvasDataSourceSyncContainer(
      new KvasInMemoryJsonDataSource<JsonPrimitive>(
        options?.operations ?? new KvasInMemoryJsonMapOperations<P>(),
      ),
    );
    dataSource.initialize(
      options && {
        ...(!options?.fromJSO ? {} : { fromJSO: options?.fromJSO }),
        ...(!options?.fromMap ? {} : { fromMap: options?.fromMap }),
      },
    );
    return dataSource;
  }

  static async createAsyncDataStore<P extends JsonPrimitive>(
    options?: KvasInMemoryJsonDataSourceCreateOptions<P>,
  ) {
    const dataSource = new KvasDataSourceAsyncContainer(
      new KvasInMemoryJsonDataSource<JsonPrimitive>(
        options?.operations ?? new KvasInMemoryJsonMapOperations<P>(),
      ),
    );
    await dataSource.initialize(
      options && {
        ...(!options?.fromJSO ? {} : { fromJSO: options?.fromJSO }),
        ...(!options?.fromMap ? {} : { fromMap: options?.fromMap }),
      },
    );
    return dataSource;
  }
}
