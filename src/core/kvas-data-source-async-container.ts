import type {
  KvasDataSourceDeleteResult,
  KvasDataSourceGetJSOResult,
  KvasDataSourceGetResult,
  KvasDataSourceInitializeOptions,
  KvasDataSourceSetJSOResult,
  KvasDataSourceSetResult,
  KvasDataSource,
} from '@core/kvas-data-source';
import type {
  KvasPath,
  KvasSyncOrPromiseResult,
  KvasTypeParameters,
} from '@core/kvas-types';
import type { KvasEMap } from '@core/kvas-map';

type AllAsync<T extends object> = {
  [K in keyof T]: T[K] extends (
    ...args: any
  ) => KvasSyncOrPromiseResult<infer R>
    ? (...args: any) => Promise<R>
    : T[K];
};

export class KvasDataSourceAsyncContainer<
  KTP extends KvasTypeParameters,
  JSO,
  KM,
> implements AllAsync<KvasDataSource<KTP, JSO, KM>>
{
  constructor(private readonly dataSource: KvasDataSource<KTP, JSO, KM>) {}

  initialize(
    options?: KvasDataSourceInitializeOptions<KTP, JSO>,
  ): Promise<void> {
    return this.dataSource.initialize(options)?.promise?.();
  }

  isInitialized(): boolean {
    return this.dataSource.isInitialized();
  }

  get(
    path: KvasPath<KTP>,
  ): Promise<KvasDataSourceGetResult<KTP, KvasEMap<KTP, JSO>>> {
    return this.dataSource.get(path)?.promise?.();
  }

  set(
    path: KvasPath<KTP>,
    value: KTP['PrimitiveValue'] | KM,
  ): Promise<KvasDataSourceSetResult> {
    return this.dataSource.set(path, value)?.promise?.();
  }

  delete(path: KvasPath<KTP>): Promise<KvasDataSourceDeleteResult> {
    return this.dataSource.delete(path)?.promise?.();
  }

  getJSO(path: KvasPath<KTP>): Promise<KvasDataSourceGetJSOResult<KTP>> {
    return this.dataSource.getJSO(path)?.promise?.();
  }

  setJSO(path: KvasPath<KTP>, jso: JSO): Promise<KvasDataSourceSetJSOResult> {
    return this.dataSource.setJSO(path, jso)?.promise?.();
  }
}
