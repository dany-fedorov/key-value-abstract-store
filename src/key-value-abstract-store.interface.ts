export type KvasTypeParameters<K = unknown, PV = unknown> = {
  Key: K;
  PrimitiveValue: PV;
};

export type KvasSyncResult<T> = {
  sync: () => T;
  promise: () => Promise<T>;
};

export type KvasPromiseResult<T> = {
  sync?: never;
  promise: () => Promise<T>;
};

export type KvasSyncAndPromiseResult<T> = KvasSyncResult<T>;

export type KvasSyncOrPromiseResult<T> =
  | KvasPromiseResult<T>
  | KvasSyncResult<T>;

export type KvasPath<KTP extends KvasTypeParameters> = Array<KTP['Key']>;

export type KvasProp<KM extends KvasMap<KvasTypeParameters>> = {
  path: KvasPath<KvasTypeParametersFromKvasMap<KM>>;
  type: KvasValueType | undefined;
  value: KvasPrimitiveValueFromKvasMap<KM> | KM | undefined;
};

export type KvasMapGetKeyResult<KM extends KvasMap<KvasTypeParameters>> = Pick<KvasProp<KM>,
  'value' | 'type'>;

export type KvasMapSetKeyResult = {
  [key: string]: never;
};

export type KvasMapDeleteKeyResult = {
  found?: boolean;
};

export type KvasTypeParametersFromKvasMap<KM extends KvasMap<KvasTypeParameters>,
  > = {
  Key: Parameters<KM['setKey']>[0];
  PrimitiveValue: Parameters<KM['setKey']>[1];
};

export type KvasKeyFromKvasMap<KM extends KvasMap<KvasTypeParameters>> =
  KvasTypeParametersFromKvasMap<KM>['Key'];
export type KvasPrimitiveValueFromKvasMap<KM extends KvasMap<KvasTypeParameters>,
  > = KvasTypeParametersFromKvasMap<KM>['Key'];

export type KvasMapQueryResult<KM extends KvasMap<KvasTypeParameters>> = {
  prop: KvasProp<KM> | undefined;
  lastFoundProp: KvasProp<KM>;
  lastFoundMapProp: {
    path: KvasProp<KM>['path'];
    type: KvasValueType.MAP;
    value: KM;
  };
};

export enum KvasValueType {
  PRIMITIVE = 'primitive',
  MAP = 'map',
}

export type KvasMapToObjectResult<TO> = {
  object: TO;
};

export type KvasMapOperationsGetResult<KM extends KvasMap<KvasTypeParameters>> =
  {
    prop: KvasProp<KM>;
  };

export type KvasMapOperationsSetResult = KvasMapSetKeyResult;

export type KvasMapOperationsDeleteResult = KvasMapDeleteKeyResult;

export interface KvasErrorConstructor {
  new(message?: string): KvasError;

  readonly prototype: KvasError;
}

export class KvasError extends Error {
  constructor(...args: ConstructorParameters<ErrorConstructor>) {
    super(...args);
  }
}

export abstract class KvasMap<KTP extends KvasTypeParameters> {
  abstract getKey(
    key: KTP['Key'],
  ): KvasSyncOrPromiseResult<KvasMapGetKeyResult<this>>;

  abstract setKey(
    key: KTP['Key'],
    value: KTP['PrimitiveValue'] | KvasMap<KTP>,
  ): KvasSyncOrPromiseResult<KvasMapSetKeyResult>;

  abstract deleteKey(
    key: KTP['Key'],
  ): KvasSyncOrPromiseResult<KvasMapDeleteKeyResult>;
}

export type CreateMapOptions<KM extends KvasMap<KvasTypeParameters>> = {
  forKey?: KvasKeyFromKvasMap<KM>;
  asDataStoreRoot?: boolean;
};

export abstract class KvasMapOperations<KM extends KvasMap<KvasTypeParameters>,
  JSM = unknown,
  > {
  abstract createMap(
    options?: CreateMapOptions<KM>,
  ): KvasSyncOrPromiseResult<KM>;

  abstract fromJs(jsMap: JSM): KvasSyncOrPromiseResult<KM>;

  abstract toJs(kvasMap: KM): KvasSyncOrPromiseResult<JSM>;

  abstract queryPath(
    map: KM,
    path: KvasPath<KvasTypeParametersFromKvasMap<KM>>,
  ): KvasSyncOrPromiseResult<KvasMapQueryResult<KM>>;

  deleteInPath(
    map: KM,
    path: KvasPath<KvasTypeParametersFromKvasMap<KM>>,
  ): KvasSyncOrPromiseResult<KvasMapOperationsDeleteResult> {
    const sync = () => {
      if (path.length === 0) {
        return {
          found: false,
        };
      }
      const {prop, lastFoundMapProp} = (
        this.queryPath(map, path) as KvasSyncResult<KvasMapQueryResult<KM>>
      ).sync();
      if (prop === undefined) {
        return {
          found: false,
        };
      }
      return (
        lastFoundMapProp.value.deleteKey(
          path.at(-1) as KvasTypeParametersFromKvasMap<KM>['Key'],
        ) as KvasSyncResult<KvasMapDeleteKeyResult>
      ).sync();
    };
    return {
      sync,
      // TODO
      promise: () => Promise.resolve(sync()),
    };
  }

  getInPath(
    map: KM,
    path: KvasPath<KvasTypeParametersFromKvasMap<KM>>,
  ): KvasSyncOrPromiseResult<KvasMapOperationsGetResult<KM>> {
    const sync = () => {
      if (path.length === 0) {
        return {
          prop: {
            value: map,
            path,
            type: KvasValueType.MAP,
          },
        };
      }
      const {prop} = (
        this.queryPath(map, path) as KvasSyncResult<KvasMapQueryResult<KvasMap<KvasTypeParametersFromKvasMap<KM>>>>
      ).sync();
      return prop
        ? {prop}
        : {
          prop: {
            path,
            value: undefined,
            type: undefined,
          },
        };
    };
    return {
      sync,
      // TODO
      promise: () => Promise.resolve(sync()),
    };
  }

  setInPath(
    map: KM,
    path: KvasPath<KvasTypeParametersFromKvasMap<KM>>,
    value: KvasTypeParametersFromKvasMap<KM>['PrimitiveValue'] | KM,
  ): KvasSyncOrPromiseResult<KvasMapOperationsSetResult> {
    const sync = () => {
      if (path.length === 0) {
        throw new KvasError('Cannot set in []');
      }
      const {lastFoundMapProp} = (
        this.queryPath(map, path) as KvasSyncResult<KvasMapQueryResult<KvasMap<KvasTypeParametersFromKvasMap<KM>>>>
      ).sync();
      if (lastFoundMapProp.path.length === path.length - 1) {
        lastFoundMapProp.value.setKey(path.at(-1), value);
        return {};
      }
      const pathToCreateMapsIn = path.slice(
        lastFoundMapProp.path.length,
        path.length - 1,
      );
      let curMap: KvasMap<KvasTypeParametersFromKvasMap<KM>> =
        lastFoundMapProp.value;
      pathToCreateMapsIn.forEach((pathSegment) => {
        const newMap = (
          this.createMap({forKey: pathSegment}) as KvasSyncResult<KM>
        ).sync();
        (
          curMap.setKey(
            pathSegment,
            newMap,
          ) as KvasSyncResult<KvasMapSetKeyResult>
        ).sync();
        curMap = newMap;
      });
      (
        curMap.setKey(path.at(-1), value) as KvasSyncResult<KvasMapSetKeyResult>
      ).sync();
      return {};
    };
    return {
      sync,
      // TODO
      promise: () => Promise.resolve(sync()),
    };
  }
}

export abstract class KvasDataStore<KM extends KvasMap<KvasTypeParameters>> {
  protected abstract readonly operations: KvasMapOperations<KM>;
  protected abstract root: KM | null = null;
  protected abstract isInitialized = false;

  abstract initialize(): KvasSyncOrPromiseResult<KM>;

  abstract get(path: )
}

/*export abstract class KvasDataSource<KM extends KvasMap<KvasTypeParameters>> {
  abstract createMap(
    forKey?: KvasKeyFromKvasMap<KM>,
    ...rest: unknown[]
  ): KvasSyncOrPromiseResult<KM>;

  abstract initialize(): KvasSyncOrPromiseResult<KM>;

  abstract getRootMap(): KvasSyncOrPromiseResult<KM>;
}*/
