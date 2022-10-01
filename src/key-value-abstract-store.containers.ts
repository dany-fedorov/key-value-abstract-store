import type {
  KvasDataSource,
  KvasMapOperationsDeleteResult,
  KvasMapOperationsGetResult,
  KvasMapOperationsSetResult,
  KvasKeyFromKvasMap,
  KvasMap,
  KvasSyncOrPromiseResult,
  KvasSyncResult,
  KvasTypeParameters,
} from './key-value-abstract-store.interface';

// type KvasAllSyncResults<DS extends KvasDataSource<any>> = {
//   [M in keyof DS]: DS[M] extends (
//     ...args: any[]
//   ) => KvasSyncOrPromiseResult<any>
//     ? (
//         ...args: Parameters<DS[M]>
//       ) => Awaited<ReturnType<ReturnType<DS[M]>['promise']>>
//     : never;
// };

type KvasAllPromiseResults<DS extends KvasDataSource<any>> = {
  [M in keyof DS]: DS[M] extends (
    ...args: any[]
  ) => KvasSyncOrPromiseResult<any>
    ? (...args: Parameters<DS[M]>) => ReturnType<ReturnType<DS[M]>['promise']>
    : never;
};

export class KvasSyncDataStoreContainer<
  KM extends KvasMap<KvasTypeParameters>,
> {
  /**
   * Getting "KM is not assignable to Awaited<KM>" type error, for example in "createMap"
   * I think this is the same issue as in
   * - https://github.com/microsoft/TypeScript/issues/47144
   * And it should be resolved when this fix is released
   * - https://github.com/microsoft/TypeScript/pull/50100
   */
  //implements KvasAllSyncResults<KvasDataSource<KM>>
  constructor(private readonly dataSource: KvasDataSource<KM>) {}

  createMap(forKey?: KvasKeyFromKvasMap<KM>, ...rest: unknown[]): KM {
    return (
      this.dataSource.createMap(forKey, ...rest) as KvasSyncResult<KM>
    ).sync();
  }

  initialize(): KM {
    return (this.dataSource.initialize() as KvasSyncResult<KM>).sync();
  }

  getRootMap(): KM {
    return (this.dataSource.getRootMap() as KvasSyncResult<KM>).sync();
  }

  get(
    ...args: Parameters<KvasDataSource<KM>['get']>
  ): KvasMapOperationsGetResult<KM> {
    return (
      this.dataSource.get(...args) as KvasSyncResult<
        KvasMapOperationsGetResult<KM>
      >
    ).sync();
  }

  set(
    ...args: Parameters<KvasDataSource<KM>['set']>
  ): KvasMapOperationsSetResult {
    return (
      this.dataSource.set(...args) as KvasSyncResult<KvasMapOperationsSetResult>
    ).sync();
  }

  delete(
    ...args: Parameters<KvasDataSource<KM>['delete']>
  ): KvasMapOperationsDeleteResult {
    return (
      this.dataSource.delete(
        ...args,
      ) as KvasSyncResult<KvasMapOperationsDeleteResult>
    ).sync();
  }
}

export class KvasPromiseDataStoreContainer<
  KM extends KvasMap<KvasTypeParameters>,
> implements KvasAllPromiseResults<KvasDataSource<KM>>
{
  constructor(private readonly dataSource: KvasDataSource<KM>) {}

  createMap(forKey?: KvasKeyFromKvasMap<KM>, ...rest: unknown[]): Promise<KM> {
    return (
      this.dataSource.createMap(forKey, ...rest) as KvasSyncResult<KM>
    ).promise();
  }

  initialize(): Promise<KM> {
    return (this.dataSource.initialize() as KvasSyncResult<KM>).promise();
  }

  getRootMap(): Promise<KM> {
    return (this.dataSource.getRootMap() as KvasSyncResult<KM>).promise();
  }

  get(
    ...args: Parameters<KvasDataSource<KM>['get']>
  ): Promise<KvasMapOperationsGetResult<KM>> {
    return (
      this.dataSource.get(...args) as KvasSyncResult<
        KvasMapOperationsGetResult<KM>
      >
    ).promise();
  }

  set(
    ...args: Parameters<KvasDataSource<KM>['set']>
  ): Promise<KvasMapOperationsSetResult> {
    return (
      this.dataSource.set(...args) as KvasSyncResult<KvasMapOperationsSetResult>
    ).promise();
  }

  delete(
    ...args: Parameters<KvasDataSource<KM>['delete']>
  ): Promise<KvasMapOperationsDeleteResult> {
    return (
      this.dataSource.delete(
        ...args,
      ) as KvasSyncResult<KvasMapOperationsDeleteResult>
    ).promise();
  }
}
