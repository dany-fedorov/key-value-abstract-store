import type { KvasEMap, KvasMap } from '@core/kvas-map';
import type {
  KvasMapOperationsDeleteResult,
  KvasMapOperationsGetResult,
  KvasMapOperationsSetResult,
  KvasMapOperations,
  KvasMapOperationsGetJSOInPathResult,
  KvasMapOperationsSetJSOInPathResult,
  CreateMapOptions,
} from '@core/kvas-map-operations';
import type {
  KvasPath,
  KvasSyncOrPromiseResult,
  KvasSyncResult,
  KvasTypeParameters,
} from '@core/kvas-types';
import { KvasError } from '@core/kvas-errors';

export type KvasDataSourceGetResult<
  KTP extends KvasTypeParameters,
  KM = KvasMap<KTP>,
> = KvasMapOperationsGetResult<KTP, KM>;
export type KvasDataSourceSetResult = KvasMapOperationsSetResult;
export type KvasDataSourceDeleteResult = KvasMapOperationsDeleteResult;

export type KvasDataSourceGetJSOResult<
  KTP extends KvasTypeParameters,
  JSO = unknown,
> = KvasMapOperationsGetJSOInPathResult<KTP, JSO>;

export type KvasDataSourceSetJSOResult = KvasMapOperationsSetJSOInPathResult;

export type KvasDataSourceInitializeOptions<
  KTP extends KvasTypeParameters,
  JSO,
> = Pick<CreateMapOptions<KTP, JSO>, 'fromMap' | 'fromJSO'>;

export class KvasDataSource<
  KTP extends KvasTypeParameters,
  JSO = unknown,
  KM = KvasMap<KTP>,
> {
  private rootMap: KM | null = null;

  constructor(private readonly operations: KvasMapOperations<KTP>) {}

  initialize(
    options?: KvasDataSourceInitializeOptions<KTP, JSO>,
  ): KvasSyncOrPromiseResult<void> {
    const sync = () => {
      this.rootMap = (
        this.operations.createMap({
          asDataSourceRoot: true,
          ...(options || {}),
        }) as unknown as KvasSyncResult<KM>
      ).sync();
      // console.log({ rootMap: this.rootMap });
    };
    return {
      sync,
      // TODO
      promise: () => Promise.resolve(sync()),
    };
  }

  isInitialized(): boolean {
    return this.rootMap !== null;
  }

  private checkIsInitialized(): void {
    if (!this.isInitialized()) {
      throw new KvasError('KvasDataSource is not initialized');
    }
  }

  get(
    path: KvasPath<KTP>,
  ): KvasSyncOrPromiseResult<KvasDataSourceGetResult<KTP, KvasEMap<KTP, JSO>>> {
    this.checkIsInitialized();
    return this.operations.getInPath(
      this.rootMap as unknown as KvasMap<KTP>,
      path,
    );
  }

  set(
    path: KvasPath<KTP>,
    value: KTP['PrimitiveValue'] | KM,
  ): KvasSyncOrPromiseResult<KvasDataSourceSetResult> {
    this.checkIsInitialized();
    return this.operations.setInPath(
      this.rootMap as unknown as KvasMap<KTP>,
      path,
      value,
    );
  }

  delete(
    path: KvasPath<KTP>,
  ): KvasSyncOrPromiseResult<KvasDataSourceDeleteResult> {
    this.checkIsInitialized();
    return this.operations.deleteInPath(
      this.rootMap as unknown as KvasMap<KTP>,
      path,
    );
  }

  getJSO(
    path: KvasPath<KTP>,
  ): KvasSyncOrPromiseResult<KvasDataSourceGetJSOResult<KTP>> {
    this.checkIsInitialized();
    return this.operations.getJSOInPath(
      this.rootMap as unknown as KvasMap<KTP>,
      path,
    );
  }

  setJSO(
    path: KvasPath<KTP>,
    jso: JSO,
  ): KvasSyncOrPromiseResult<KvasDataSourceSetJSOResult> {
    this.checkIsInitialized();
    return this.operations.setJSOInPath(
      this.rootMap as unknown as KvasMap<KTP>,
      path,
      jso,
    );
  }
}
