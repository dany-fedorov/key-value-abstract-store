import type { KvasEMap, KvasMap } from '@core/kvas-map';
import type {
  KvasMapOperationsDeleteResult,
  KvasMapOperationsGetResult,
  KvasMapOperationsSetResult,
  KvasMapOperations,
  KvasMapOperationsGetJsObjectInPathResult,
  KvasMapOperationsSetJsObjectInPathResult,
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

export type KvasDataSourceConfig<KTP extends KvasTypeParameters> = {
  operations: KvasMapOperations<KTP>;
};

export type KvasDataSourceGetJsObjectResult<
  KTP extends KvasTypeParameters,
  JSO = unknown,
> = KvasMapOperationsGetJsObjectInPathResult<KTP, JSO>;

export type KvasDataSourceSetJsObjectResult =
  KvasMapOperationsSetJsObjectInPathResult;

export type KvasDataSourceInitializeOptions<
  KTP extends KvasTypeParameters,
  JSO,
> = Pick<CreateMapOptions<KTP, JSO>, 'fromMap' | 'fromJsObject'>;

export class KvasDataSource<
  KTP extends KvasTypeParameters,
  JSO = unknown,
  KM = KvasMap<KTP>,
> {
  protected readonly config: KvasDataSourceConfig<KTP>;
  rootMap: KM | null = null;

  constructor(config: KvasDataSourceConfig<KTP>) {
    this.config = config;
  }

  initialize(
    options?: KvasDataSourceInitializeOptions<KTP, JSO>,
  ): KvasSyncOrPromiseResult<void> {
    const sync = () => {
      this.rootMap = (
        this.config.operations.createMap({
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
    const { operations } = this.config;
    return operations.getInPath(this.rootMap as unknown as KvasMap<KTP>, path);
  }

  set(
    path: KvasPath<KTP>,
    value: KTP['PrimitiveValue'] | KM,
  ): KvasSyncOrPromiseResult<KvasDataSourceSetResult> {
    this.checkIsInitialized();
    const { operations } = this.config;
    return operations.setInPath(
      this.rootMap as unknown as KvasMap<KTP>,
      path,
      value,
    );
  }

  delete(
    path: KvasPath<KTP>,
  ): KvasSyncOrPromiseResult<KvasDataSourceDeleteResult> {
    this.checkIsInitialized();
    const { operations } = this.config;
    return operations.deleteInPath(
      this.rootMap as unknown as KvasMap<KTP>,
      path,
    );
  }

  getJsObject(
    path: KvasPath<KTP>,
  ): KvasSyncOrPromiseResult<KvasDataSourceGetJsObjectResult<KTP>> {
    this.checkIsInitialized();
    const { operations } = this.config;
    return operations.getJsObjectInPath(
      this.rootMap as unknown as KvasMap<KTP>,
      path,
    );
  }

  setJsObject(
    path: KvasPath<KTP>,
    jsObject: JSO,
  ): KvasSyncOrPromiseResult<KvasDataSourceSetJsObjectResult> {
    this.checkIsInitialized();
    const { operations } = this.config;
    return operations.setJsObjectInPath(
      this.rootMap as unknown as KvasMap<KTP>,
      path,
      jsObject,
    );
  }
}
