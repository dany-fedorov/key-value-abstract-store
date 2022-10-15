import type {
  KvasEMap,
  KvasMap,
  KvasMapDeleteKeyResult,
  KvasMapGetKeyResult,
  KvasMapSetKeyResult,
  KvasProp,
} from '@core/kvas-map';
import type {
  KvasPathWritable,
  KvasPath,
  KvasSyncOrPromiseResult,
  KvasSyncResult,
  KvasTypeParameters,
} from '@core/kvas-types';
import { KvasValueType } from '@core/kvas-types';
import { KvasError } from '@core/kvas-errors';

export type KvasMapOperationsToObjectResult<JSO> = {
  jso: JSO;
};

export type KvasMapOperationsGetResult<
  KTP extends KvasTypeParameters,
  KM = KvasMap<KTP>,
> = {
  prop: KvasProp<KTP, KM>;
};

export type KvasMapOperationsSetResult = KvasMapSetKeyResult;

export type KvasMapOperationsDeleteResult = KvasMapDeleteKeyResult;

export type CreateMapOptions<
  KTP extends KvasTypeParameters,
  JSO,
  KM = KvasMap<KTP>,
> = {
  forHostKey?: KTP['Key'];
  forKeyInside?: KTP['Key'];
  asDataSourceRoot?: boolean;
  fromMap?: KM;
  fromJSO?: JSO;
};

export type KvasMapOperationsQueryResult<KTP extends KvasTypeParameters> = {
  prop: KvasProp<KTP> | undefined;
  lastFoundProp: KvasProp<KTP>;
  lastFoundMapProp: {
    path: KvasProp<KTP>['path'];
    type: KvasValueType.MAP;
    value: KvasMap<KTP>;
  };
};

export type KvasMapOperationsFromJsResult<
  KTP extends KvasTypeParameters,
  KM = KvasMap<KTP>,
> = {
  value: KM | KTP['PrimitiveValue'];
};

/**
 * Optional abstract methods
 */
export interface KvasMapOperations<
  KTP extends KvasTypeParameters,
  JSO = unknown,
> {
  fromJSO?(
    jso: JSO,
    ...rest: any[]
  ): KvasSyncOrPromiseResult<KvasMapOperationsFromJsResult<KTP>>;

  toJSO?(
    kvasMap: KvasMap<KTP> | KTP['PrimitiveValue'],
  ): KvasSyncOrPromiseResult<KvasMapOperationsToObjectResult<JSO>>;
}

export type KvasMapOperationsGetJSOInPathResult<
  KTP extends KvasTypeParameters,
  JSO,
> = {
  prop: KvasMapOperationsGetResult<KTP>['prop'] & {
    value: JSO;
  };
};

export type KvasMapOperationsSetJSOInPathResult = KvasMapOperationsSetResult;

export abstract class KvasMapOperations<
  KTP extends KvasTypeParameters,
  JSO = unknown,
> {
  abstract createMap(
    options?: CreateMapOptions<KTP, JSO>,
  ): KvasSyncOrPromiseResult<KvasMap<KTP>>;

  queryPath(
    map: KvasMap<KTP>,
    path: KvasPath<KTP>,
  ): KvasSyncOrPromiseResult<KvasMapOperationsQueryResult<KTP>> {
    const sync: () => KvasMapOperationsQueryResult<KTP> = () => {
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
      let lastFoundPropPath: KvasPathWritable<KTP> = [];
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let lastFoundPropValue: KvasMap<KTP> | KTP['PrimitiveValue'] = map;
      let lastFoundPropType: KvasValueType = KvasValueType.MAP;
      let lastFoundPropMapPath: KvasPathWritable<KTP> = [];
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let lastFoundPropMapValue: KvasMap<KTP> = map;
      const curPath: KvasPathWritable<KTP> = [];
      for (let i = 0; i < path.length; i++) {
        const pathSegment = path[i] as KTP['Key'];
        curPath.push(pathSegment);
        const { value, type } = (
          lastFoundPropMapValue.getKey(pathSegment) as KvasSyncResult<
            KvasMapGetKeyResult<KTP>
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
            value: value as KvasMap<KTP>,
            type: KvasValueType.MAP,
            path,
          };
          return {
            prop,
            lastFoundProp: prop,
            lastFoundMapProp: { ...prop, type: KvasValueType.MAP }, // For TypeScript
          };
        } else if (isMap && !isLast) {
          lastFoundPropMapValue = value as KvasMap<KTP>;
          lastFoundPropMapPath = curPath.slice();
          lastFoundPropValue = value as KvasMap<KTP>;
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
    map: KvasMap<KTP>,
    path: KvasPath<KTP>,
  ): KvasSyncOrPromiseResult<KvasMapOperationsDeleteResult> {
    const sync = () => {
      if (path.length === 0) {
        return {
          found: false,
        };
      }
      const { prop, lastFoundMapProp } = (
        this.queryPath(map, path) as KvasSyncResult<
          KvasMapOperationsQueryResult<KTP>
        >
      ).sync();
      if (prop === undefined) {
        return {
          found: false,
        };
      }
      return (
        lastFoundMapProp.value.deleteKey(
          path[path.length - 1] as KTP['Key'],
        ) as KvasSyncResult<KvasMapDeleteKeyResult>
      ).sync();
    };
    return {
      sync,
      // TODO
      promise: () => Promise.resolve(sync()),
    };
  }

  private mapInPropToEMap(
    prop: KvasProp<KTP>,
  ): KvasProp<KTP, KvasEMap<KTP, JSO>> {
    if (prop.type === KvasValueType.MAP) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;
      return {
        ...prop,
        value: Object.assign(
          prop.value as KvasMap<KTP>,
          !self.toJSO
            ? {}
            : {
                toJSO(): KvasSyncOrPromiseResult<
                  KvasMapOperationsToObjectResult<JSO>
                > {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  return self.toJSO(this);
                },
              },
        ),
      };
    } else {
      return prop;
    }
  }

  getInPath(
    map: KvasMap<KTP>,
    path: KvasPath<KTP>,
  ): KvasSyncOrPromiseResult<KvasMapOperationsGetResult<KTP>> {
    const sync = () => {
      if (path.length === 0) {
        return {
          prop: this.mapInPropToEMap({
            value: map,
            path,
            type: KvasValueType.MAP,
          }),
        };
      }
      const { prop } = (
        this.queryPath(map, path) as KvasSyncResult<
          KvasMapOperationsQueryResult<KTP>
        >
      ).sync();
      return prop
        ? { prop: this.mapInPropToEMap(prop) }
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
    map: KvasMap<KTP>,
    path: KvasPath<KTP>,
    value: KTP['PrimitiveValue'] | KvasMap<KTP>,
  ): KvasSyncOrPromiseResult<KvasMapOperationsSetResult> {
    const sync = () => {
      if (path.length === 0) {
        throw new KvasError('Cannot set in []');
      }
      const { lastFoundMapProp } = (
        this.queryPath(map, path) as KvasSyncResult<
          KvasMapOperationsQueryResult<KTP>
        >
      ).sync();
      if (lastFoundMapProp.path.length === path.length - 1) {
        lastFoundMapProp.value.setKey(path[path.length - 1], value)?.sync?.();
        return {};
      }
      const pathToCreateMapsIn = path.slice(
        lastFoundMapProp.path.length,
        path.length - 1,
      );
      let curMap: KvasMap<KTP> = lastFoundMapProp.value;
      pathToCreateMapsIn.forEach((pathSegment, i) => {
        const nextPathSegment = path[lastFoundMapProp.path.length + i + 1];
        const newMap = (
          this.createMap({
            forHostKey: pathSegment,
            forKeyInside: nextPathSegment,
          }) as KvasSyncResult<KvasMap<KTP>>
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
        curMap.setKey(
          path[path.length - 1],
          value,
        ) as KvasSyncResult<KvasMapSetKeyResult>
      ).sync();
      return {};
    };
    return {
      sync,
      // TODO
      promise: () => Promise.resolve(sync()),
    };
  }

  getJSOInPath(
    map: KvasMap<KTP>,
    path: KvasPath<KTP>,
  ): KvasSyncOrPromiseResult<KvasMapOperationsGetJSOInPathResult<KTP, JSO>> {
    const sync = () => {
      const { prop } = (
        this.getInPath(map, path) as KvasSyncResult<
          KvasMapOperationsGetResult<KTP>
        >
      ).sync();
      if (!this.toJSO) {
        throw new KvasError('Cannot toJSO');
      }
      if (prop.type === KvasValueType.PRIMITIVE || prop.type === undefined) {
        return {
          prop: prop as KvasMapOperationsGetJSOInPathResult<KTP, JSO>['prop'],
        };
      }
      const { jso: newVal } = (
        this.toJSO(prop.value) as KvasSyncResult<
          KvasMapOperationsToObjectResult<JSO>
        >
      ).sync();
      return {
        prop: {
          ...prop,
          value: newVal,
        },
      };
    };
    return {
      sync,
      promise: () => Promise.resolve(sync()),
    };
  }

  setJSOInPath(
    map: KvasMap<KTP>,
    path: KvasPath<KTP>,
    jso: JSO,
  ): KvasSyncOrPromiseResult<KvasMapOperationsSetJSOInPathResult> {
    const sync = () => {
      if (!this.fromJSO) {
        throw new KvasError('Cannot fromJSO');
      }
      const kvasMapOrPrimitive = this.fromJSO(jso)?.sync?.()?.value;
      return (
        this.setInPath(
          map,
          path,
          kvasMapOrPrimitive,
        ) as KvasSyncResult<KvasMapOperationsSetResult>
      ).sync();
    };
    return {
      sync,
      promise: () => Promise.resolve(sync()),
    };
  }
}
