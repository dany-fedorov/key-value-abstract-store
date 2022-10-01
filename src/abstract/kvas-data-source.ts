import type { KvasMap, KvasTypeParametersFromKvasMap } from './kvas-map';
import type {
  KvasMapOperationsDeleteResult,
  KvasMapOperationsGetResult,
  KvasMapOperationsSetResult,
  KvasMapOperations,
} from './kvas-map-operations';
import type {
  KvasPath,
  KvasSyncOrPromiseResult,
  KvasSyncResult,
  KvasTypeParameters,
} from './kvas-types';
import { KvasErrors } from './kvas-errors';

type KvasDataSourceGetResult<KM extends KvasMap<KvasTypeParameters>> =
  KvasMapOperationsGetResult<KM>;
type KvasDataSourceSetResult = KvasMapOperationsSetResult;
type KvasDataSourceDeleteResult = KvasMapOperationsDeleteResult;

type KvasDataSourceConfig<KM extends KvasMap<KvasTypeParameters>> = {
  operations: KvasMapOperations<KM>;
};

export class KvasDataSource<KM extends KvasMap<KvasTypeParameters>> {
  protected readonly config: KvasDataSourceConfig<KM>;
  rootMap: KM | null = null;

  constructor(config: KvasDataSourceConfig<KM>) {
    this.config = config;
  }

  initialize(): KvasSyncOrPromiseResult<void> {
    const sync = () => {
      this.rootMap = (
        this.config.operations.createMap({
          asDataStoreRoot: true,
        }) as KvasSyncResult<KM>
      ).sync();
    };
    return {
      sync,
      // TODO
      promise: () => Promise.resolve(sync()),
    };
  }

  private validateInitialized(): void {
    if (this.rootMap === null) {
      throw new KvasErrors('KvasDataSource is not initialized');
    }
  }

  get(
    path: KvasPath<KvasTypeParametersFromKvasMap<KM>>,
  ): KvasSyncOrPromiseResult<KvasDataSourceGetResult<KM>> {
    this.validateInitialized();
    const { operations } = this.config;
    return operations.getInPath(this.rootMap as KM, path);
  }

  set(
    path: KvasPath<KvasTypeParametersFromKvasMap<KM>>,
    value: KvasTypeParametersFromKvasMap<KM>['PrimitiveValue'] | KM,
  ): KvasSyncOrPromiseResult<KvasDataSourceSetResult> {
    this.validateInitialized();
    const { operations } = this.config;
    return operations.setInPath(this.rootMap as KM, path, value);
  }

  delete(
    path: KvasPath<KvasTypeParametersFromKvasMap<KM>>,
  ): KvasSyncOrPromiseResult<KvasDataSourceDeleteResult> {
    this.validateInitialized();
    const { operations } = this.config;
    return operations.deleteInPath(this.rootMap as KM, path);
  }
}
