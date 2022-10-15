import type {
  KvasDataSourceDeleteResult,
  KvasDataSourceGetJSOResult,
  KvasDataSourceGetResult,
  KvasDataSourceInitializeOptions,
  KvasDataSourceSetJSOResult,
  KvasDataSourceSetResult,
  KvasDataSource,
  KvasDataSourcePushResult,
  KvasDataSourcePushJSOResult,
} from '@core/kvas-data-source';
import type {
  KvasPath,
  KvasSyncOrPromiseResult,
  KvasTypeParameters,
} from '@core/kvas-types';
import type { KvasEMap } from '@core/kvas-map';
import type { KvasMap } from '@core/kvas-map';

type AllSync<T extends object> = {
  [K in keyof T]: T[K] extends (
    ...args: any
  ) => KvasSyncOrPromiseResult<infer R>
    ? (...args: any) => R
    : T[K];
};

export class KvasDataSourceSyncContainer<
  KTP extends KvasTypeParameters,
  KM extends KvasMap<KTP>,
  JSO,
> implements AllSync<KvasDataSource<KTP, KM, JSO>>
{
  constructor(private readonly dataSource: KvasDataSource<KTP, KM, JSO>) {}

  initialize(options?: KvasDataSourceInitializeOptions<KTP, KM, JSO>): void {
    return this.dataSource.initialize(options)?.sync?.();
  }

  isInitialized(): boolean {
    return this.dataSource.isInitialized();
  }

  get(path: KvasPath<KTP>): KvasDataSourceGetResult<KTP, KvasEMap<KM, JSO>> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return this.dataSource.get(path)?.sync?.();
  }

  set(
    path: KvasPath<KTP>,
    value: KTP['PrimitiveValue'] | KM,
  ): KvasDataSourceSetResult {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return this.dataSource.set(path, value)?.sync?.();
  }

  delete(path: KvasPath<KTP>): KvasDataSourceDeleteResult {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return this.dataSource.delete(path)?.sync?.();
  }

  getJSO(path: KvasPath<KTP>): KvasDataSourceGetJSOResult<KTP, KM, JSO> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return this.dataSource.getJSO(path)?.sync?.();
  }

  setJSO(path: KvasPath<KTP>, jso: JSO): KvasDataSourceSetJSOResult {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return this.dataSource.setJSO(path, jso)?.sync?.();
  }

  push(
    path: KvasPath<KTP>,
    value: KTP['PrimitiveValue'] | KM,
  ): KvasDataSourcePushResult<KTP> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return this.dataSource.push(path, value)?.sync?.();
  }

  pushJSO(path: KvasPath<KTP>, jso: JSO): KvasDataSourcePushJSOResult<KTP> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return this.dataSource.pushJSO(path, jso)?.sync?.();
  }
}
