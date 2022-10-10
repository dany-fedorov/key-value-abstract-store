import type {
  KvasEMap,
  KvasMap,
  KvasMapDeleteKeyResult,
  KvasMapGetKeyResult,
  KvasMapSetKeyResult,
  KvasProp,
} from '@core/kvas-map';
import type {
  KvasPath,
  KvasSyncOrPromiseResult,
  KvasSyncResult,
  KvasTypeParameters,
} from '@core/kvas-types';
import { KvasValueType } from '@core/kvas-types';
import { KvasError } from '@core/kvas-errors';

export type KvasMapOperationsToObjectResult<JSO> = {
  object: JSO;
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
  forKey?: KTP['Key'];
  asDataSourceRoot?: boolean;
  fromMap?: KM;
  fromJsObject?: JSO;
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
  map: KM;
};

/**
 * Optional abstract methods
 */
export interface KvasMapOperations<
  KTP extends KvasTypeParameters,
  JSO = unknown,
> {
  fromJsObject?(
    jsObject: JSO,
    ...rest: any[]
  ): KvasSyncOrPromiseResult<KvasMapOperationsFromJsResult<KTP>>;

  toJsObject?(
    kvasMap: KvasMap<KTP> | KTP['PrimitiveValue'],
  ): KvasSyncOrPromiseResult<KvasMapOperationsToObjectResult<JSO>>;
}

export type KvasMapOperationsGetJsObjectInPathResult<
  KTP extends KvasTypeParameters,
  JSO,
> = {
  prop: KvasMapOperationsGetResult<KTP>['prop'] & {
    value: JSO;
  };
};

export type KvasMapOperationsSetJsObjectInPathResult =
  KvasMapOperationsSetResult;

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
      let lastFoundPropPath: KvasPath<KTP> = [];
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let lastFoundPropValue: KvasMap<KTP> | KTP['PrimitiveValue'] = map;
      let lastFoundPropType: KvasValueType = KvasValueType.MAP;
      let lastFoundPropMapPath: KvasPath<KTP> = [];
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let lastFoundPropMapValue: KvasMap<KTP> = map;
      const curPath: KvasPath<KTP> = [];
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
          path.at(-1) as KTP['Key'],
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
          !self.toJsObject
            ? {}
            : {
                toJsObject(): KvasSyncOrPromiseResult<
                  KvasMapOperationsToObjectResult<JSO>
                > {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  return self.toJsObject(this);
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
        lastFoundMapProp.value.setKey(path.at(-1), value);
        return {};
      }
      const pathToCreateMapsIn = path.slice(
        lastFoundMapProp.path.length,
        path.length - 1,
      );
      let curMap: KvasMap<KTP> = lastFoundMapProp.value;
      pathToCreateMapsIn.forEach((pathSegment) => {
        const newMap = (
          this.createMap({ forKey: pathSegment }) as KvasSyncResult<
            KvasMap<KTP>
          >
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

  getJsObjectInPath(
    map: KvasMap<KTP>,
    path: KvasPath<KTP>,
  ): KvasSyncOrPromiseResult<
    KvasMapOperationsGetJsObjectInPathResult<KTP, JSO>
  > {
    const sync = () => {
      const { prop } = (
        this.getInPath(map, path) as KvasSyncResult<
          KvasMapOperationsGetResult<KTP>
        >
      ).sync();
      if (!this.toJsObject) {
        throw new KvasError('Cannot toJsObject');
      }
      if (prop.type === KvasValueType.PRIMITIVE) {
        return {
          prop: prop as KvasMapOperationsGetJsObjectInPathResult<
            KTP,
            JSO
          >['prop'],
        };
      }
      const { object: newVal } = (
        this.toJsObject(prop.value) as KvasSyncResult<
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

  setJsObjectInPath(
    map: KvasMap<KTP>,
    path: KvasPath<KTP>,
    jsObject: JSO,
  ): KvasSyncOrPromiseResult<KvasMapOperationsSetJsObjectInPathResult> {
    const sync = () => {
      if (!this.fromJsObject) {
        throw new KvasError('Cannot fromJsObject');
      }
      const kvasMap = this.fromJsObject(jsObject);
      return (
        this.setInPath(
          map,
          path,
          kvasMap,
        ) as KvasSyncResult<KvasMapOperationsSetResult>
      ).sync();
    };
    return {
      sync,
      promise: () => Promise.resolve(sync()),
    };
  }
}
