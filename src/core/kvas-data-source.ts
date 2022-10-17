import type { KvasEMap, KvasMap } from '@core/kvas-map';
import type {
  KvasMapOperationsDeleteResult,
  KvasMapOperationsGetResult,
  KvasMapOperationsSetResult,
  KvasMapOperations,
  KvasMapOperationsGetJSOInPathResult,
  KvasMapOperationsSetJSOInPathResult,
  KvasMapOperationsCreateMapOptions,
  KvasMapOperationsPushInPathResult,
  KvasMapOperationsPushJSOInPathResult,
} from '@core/kvas-map-operations';
import type {
  KvasPath,
  KvasSyncOrPromiseResult,
  KvasTypeParameters,
} from '@core/kvas-types';
import { KvasError } from '@core/kvas-errors';

export type KvasDataSourceGetResult<
  KTP extends KvasTypeParameters,
  KM extends KvasMap<KTP>,
> = KvasMapOperationsGetResult<KTP, KM>;
export type KvasDataSourceSetResult = KvasMapOperationsSetResult;
export type KvasDataSourceDeleteResult = KvasMapOperationsDeleteResult;

export type KvasDataSourceGetJSOResult<
  KTP extends KvasTypeParameters,
  KM extends KvasMap<KTP>,
  JSO,
> = KvasMapOperationsGetJSOInPathResult<KTP, JSO, KM>;

export type KvasDataSourceSetJSOResult = KvasMapOperationsSetJSOInPathResult;
export type KvasDataSourcePushResult<KTP extends KvasTypeParameters> =
  KvasMapOperationsPushInPathResult<KTP>;
export type KvasDataSourcePushJSOResult<KTP extends KvasTypeParameters> =
  KvasMapOperationsPushJSOInPathResult<KTP>;

export type KvasDataSourceInitializeOptions<
  KTP extends KvasTypeParameters,
  KM extends KvasMap<KTP>,
  JSO,
> = Pick<
  KvasMapOperationsCreateMapOptions<KTP, JSO, KM>,
  'fromMap' | 'fromJSO'
>;

export class KvasDataSource<
  KTP extends KvasTypeParameters,
  KM extends KvasMap<KTP>,
  JSO,
> {
  private rootMap: KM | null = null;

  constructor(private readonly operations: KvasMapOperations<KTP, KM, JSO>) {}

  initialize(
    options?: KvasDataSourceInitializeOptions<KTP, KM, JSO>,
  ): KvasSyncOrPromiseResult<void> {
    const createMap = () =>
      this.operations.createMap({
        asDataSourceRoot: true,
        ...(options || {}),
      });
    const sync = () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      this.rootMap = createMap().sync();
    };
    const promise = async () => {
      this.rootMap = await createMap().promise();
    };
    return {
      sync,
      promise,
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
  ): KvasSyncOrPromiseResult<KvasDataSourceGetResult<KTP, KvasEMap<KM, JSO>>> {
    this.checkIsInitialized();
    return this.operations.getInPath(this.rootMap as KM, path);
  }

  set(
    path: KvasPath<KTP>,
    value: KTP['PrimitiveValue'] | KM,
  ): KvasSyncOrPromiseResult<KvasDataSourceSetResult> {
    this.checkIsInitialized();
    return this.operations.setInPath(this.rootMap as KM, path, value);
  }

  delete(
    path: KvasPath<KTP>,
  ): KvasSyncOrPromiseResult<KvasDataSourceDeleteResult> {
    this.checkIsInitialized();
    return this.operations.deleteInPath(this.rootMap as KM, path);
  }

  getJSO(
    path: KvasPath<KTP>,
  ): KvasSyncOrPromiseResult<KvasDataSourceGetJSOResult<KTP, KM, JSO>> {
    this.checkIsInitialized();
    return this.operations.getJSOInPath(this.rootMap as KM, path);
  }

  setJSO(
    path: KvasPath<KTP>,
    jso: JSO,
  ): KvasSyncOrPromiseResult<KvasDataSourceSetJSOResult> {
    this.checkIsInitialized();
    return this.operations.setJSOInPath(this.rootMap as KM, path, jso);
  }

  push(
    path: KvasPath<KTP>,
    value: KTP['PrimitiveValue'] | KM,
  ): KvasSyncOrPromiseResult<KvasDataSourcePushResult<KTP>> {
    this.checkIsInitialized();
    return this.operations.pushInPath(this.rootMap as KM, path, value);
  }

  pushJSO(
    path: KvasPath<KTP>,
    jso: JSO,
  ): KvasSyncOrPromiseResult<KvasDataSourcePushJSOResult<KTP>> {
    this.checkIsInitialized();
    return this.operations.pushJSOInPath(this.rootMap as KM, path, jso);
  }
}
