import type {
  KvasKeyFromKvasMap,
  KvasMapBase,
  KvasMapDeleteKeyResult,
  KvasMapGetKeyResult,
  KvasMapSetKeyResult,
  KvasPrimitiveValueFromKvasMap,
  KvasProp,
  KvasTypeParametersFromKvasMap,
} from './kvas-map-base';
import type {
  KvasPath,
  KvasSyncOrPromiseResult,
  KvasSyncResult,
  KvasTypeParameters,
} from './kvas-types';
import { KvasValueType } from './kvas-types';
import { KvasErrors } from './kvas-errors';

export type KvasMapOperationsToObjectResult<JSM> = {
  object: JSM;
};

export type KvasMapOperationsGetResult<
  KM extends KvasMapBase<KvasTypeParameters>,
> = {
  prop: KvasProp<KM>;
};

export type KvasMapOperationsSetResult = KvasMapSetKeyResult;

export type KvasMapOperationsDeleteResult = KvasMapDeleteKeyResult;

export type CreateMapOptions<KM extends KvasMapBase<KvasTypeParameters>> = {
  forKey?: KvasKeyFromKvasMap<KM>;
  asDataSourceRoot?: boolean;
};

export type KvasMapOperationsQueryResult<
  KM extends KvasMapBase<KvasTypeParameters>,
> = {
  prop: KvasProp<KM> | undefined;
  lastFoundProp: KvasProp<KM>;
  lastFoundMapProp: {
    path: KvasProp<KM>['path'];
    type: KvasValueType.MAP;
    value: KM;
  };
};

/**
 * Optional abstract methods
 */
export interface KvasMapOperations<
  KM extends KvasMapBase<KvasTypeParameters>,
  JSM = unknown,
> {
  fromJs?(jsMap: JSM): KvasSyncOrPromiseResult<KM>;

  toJs?(
    kvasMap: KM,
  ): KvasSyncOrPromiseResult<KvasMapOperationsToObjectResult<JSM>>;
}

export abstract class KvasMapOperations<
  KM extends KvasMapBase<KvasTypeParameters>,
  JSM = unknown,
> {
  abstract createMap(
    options?: CreateMapOptions<KM>,
  ): KvasSyncOrPromiseResult<KM>;

  queryPath(
    map: KM,
    path: KvasPath<KvasTypeParametersFromKvasMap<KM>>,
  ): KvasSyncOrPromiseResult<KvasMapOperationsQueryResult<KM>> {
    const sync: () => KvasMapOperationsQueryResult<KM> = () => {
      if (path.length === 0) {
        const prop = {
          type: KvasValueType.MAP,
          path,
          value: map,
        };
        return {
          prop,
          lastFoundProp: prop,
          lastFoundMapProp: { ...prop, type: KvasValueType.MAP }, // For TypeScript
        };
      }
      let lastFoundPropPath: KvasPath<KvasTypeParametersFromKvasMap<KM>> = [];
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let lastFoundPropValue: KM | KvasPrimitiveValueFromKvasMap<KM> = map;
      let lastFoundPropType: KvasValueType = KvasValueType.MAP;
      let lastFoundPropMapPath: KvasPath<KvasTypeParametersFromKvasMap<KM>> =
        [];
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let lastFoundPropMapValue: KM = map;
      const curPath: KvasPath<KvasTypeParametersFromKvasMap<KM>> = [];
      for (let i = 0; i < path.length; i++) {
        const pathSegment = path[i] as KvasTypeParametersFromKvasMap<KM>['Key'];
        curPath.push(pathSegment);
        const { value, type } = (
          lastFoundPropMapValue.getKey(pathSegment) as KvasSyncResult<
            KvasMapGetKeyResult<KM>
          >
        ).sync();
        const isPrimitive = type === KvasValueType.PRIMITIVE;
        const isMap = type === KvasValueType.MAP;
        const isLast = i === path.length - 1;
        if (isPrimitive && isLast) {
          const prop = {
            value,
            type,
            path,
          };
          return {
            prop,
            lastFoundProp: prop,
            lastFoundMapProp: {
              type: KvasValueType.MAP,
              value: lastFoundPropMapValue,
              path: lastFoundPropMapPath,
            },
          };
        } else if (isPrimitive && !isLast) {
          return {
            prop: undefined,
            lastFoundProp: {
              type: KvasValueType.PRIMITIVE,
              value,
              path: curPath,
            },
            lastFoundMapProp: {
              type: KvasValueType.MAP,
              value: lastFoundPropMapValue,
              path: lastFoundPropMapPath,
            },
          };
        } else if (isMap && isLast) {
          const prop = {
            value: value as KM,
            type: KvasValueType.MAP,
            path,
          };
          return {
            prop,
            lastFoundProp: prop,
            lastFoundMapProp: { ...prop, type: KvasValueType.MAP }, // For TypeScript
          };
        } else if (isMap && !isLast) {
          lastFoundPropMapValue = value as KM;
          lastFoundPropMapPath = curPath.slice();
          lastFoundPropValue = value as KM;
          lastFoundPropType = type;
          lastFoundPropPath = curPath.slice();
        } else {
          return {
            prop: undefined,
            lastFoundProp: {
              type: lastFoundPropType,
              value: lastFoundPropValue,
              path: lastFoundPropPath,
            },
            lastFoundMapProp: {
              type: KvasValueType.MAP,
              value: lastFoundPropMapValue,
              path: lastFoundPropMapPath,
            },
          };
        }
      }
      throw new Error('For TypeScript');
    };

    return {
      sync,
      // TODO
      promise: () => Promise.resolve(sync()),
    };
  }

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
      const { prop, lastFoundMapProp } = (
        this.queryPath(map, path) as KvasSyncResult<
          KvasMapOperationsQueryResult<KM>
        >
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
      const { prop } = (
        this.queryPath(map, path) as KvasSyncResult<
          KvasMapOperationsQueryResult<
            KvasMapBase<KvasTypeParametersFromKvasMap<KM>>
          >
        >
      ).sync();
      return prop
        ? { prop }
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
        throw new KvasErrors('Cannot set in []');
      }
      const { lastFoundMapProp } = (
        this.queryPath(map, path) as KvasSyncResult<
          KvasMapOperationsQueryResult<
            KvasMapBase<KvasTypeParametersFromKvasMap<KM>>
          >
        >
      ).sync();
      if (lastFoundMapProp.path.length === path.length - 1) {
        lastFoundMapProp.value.setKey(path.at(-1), value);
        return {};
      }
      const pathToCreateMapsIn = path.slice(
        lastFoundMapProp.path.length,
        path.length - 1,
      );
      let curMap: KvasMapBase<KvasTypeParametersFromKvasMap<KM>> =
        lastFoundMapProp.value;
      pathToCreateMapsIn.forEach((pathSegment) => {
        const newMap = (
          this.createMap({ forKey: pathSegment }) as KvasSyncResult<KM>
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
