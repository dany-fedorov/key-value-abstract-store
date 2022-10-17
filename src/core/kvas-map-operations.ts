import type {
  KvasEMap,
  KvasMap,
  KvasMapDeleteKeyResult,
  KvasMapPushResult,
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
  KM extends KvasMap<KTP>,
> = {
  prop: KvasProp<KTP, KM>;
};

export type KvasMapOperationsSetResult = KvasMapSetKeyResult;

export type KvasMapOperationsDeleteResult = KvasMapDeleteKeyResult;

export type KvasMapOperationsCreateMapOptions<
  KTP extends KvasTypeParameters,
  JSO,
  KM extends KvasMap<KTP>,
> = {
  forHostKey?: KTP['Key'];
  forKeyInside?: KTP['Key'];
  asDataSourceRoot?: boolean;
  fromMap?: KM;
  fromJSO?: JSO;
};

export type KvasMapOperationsQueryResult<
  KTP extends KvasTypeParameters,
  KM extends KvasMap<KTP>,
> = {
  prop: KvasProp<KTP> | undefined;
  lastFoundProp: KvasProp<KTP>;
  lastFoundMapProp: {
    path: KvasProp<KTP>['path'];
    type: KvasValueType.MAP;
    value: KM;
  };
};

export type KvasMapOperationsFromJsResult<
  KTP extends KvasTypeParameters,
  KM extends KvasMap<KTP>,
> = {
  value: KM | KTP['PrimitiveValue'];
};

export type KvasMapOperationsGetJSOInPathResult<
  KTP extends KvasTypeParameters,
  JSO,
  KM extends KvasMap<KTP>,
> = {
  prop: KvasMapOperationsGetResult<KTP, KM>['prop'] & {
    value: JSO;
  };
};

export type KvasMapOperationsSetJSOInPathResult = KvasMapOperationsSetResult;

export type KvasMapOperationsPushInPathResult<KTP extends KvasTypeParameters> =
  KvasMapPushResult<KTP>;
export type KvasMapOperationsPushJSOInPathResult<
  KTP extends KvasTypeParameters,
> = KvasMapOperationsPushInPathResult<KTP>;

function inPathSync<
  KTP extends KvasTypeParameters,
  KM extends KvasMap<KTP>,
  JSO,
  T,
>(
  ops: KvasMapOperations<KTP, KM, JSO>,
  map: KM,
  path: KvasPath<KTP>,
  sliceLast: boolean,
  defaultForKeyInside: KTP['Key'] | undefined,
  cb: (m: KM) => T,
): T {
  if (path.length === 0) {
    return cb(map);
  }
  const { lastFoundMapProp } = (
    ops.queryPath(map, path) as KvasSyncResult<
      KvasMapOperationsQueryResult<KTP, KM>
    >
  ).sync();
  if (
    lastFoundMapProp.path.length ===
    (!sliceLast ? path.length : path.length - 1)
  ) {
    return cb(lastFoundMapProp.value);
    // lastFoundMapProp.value.setKey(path[path.length - 1], value)?.sync?.();
  }
  const pathToCreateMapsIn = path.slice(
    lastFoundMapProp.path.length,
    !sliceLast ? path.length : path.length - 1,
  );
  // console.log('path', path);
  // console.log('pathToCreateMapsIn', pathToCreateMapsIn);
  let curMap: KM = lastFoundMapProp.value;
  pathToCreateMapsIn.forEach((pathSegment, i) => {
    const nextPathSegment = path[lastFoundMapProp.path.length + i + 1];
    const newMap = (
      ops.createMap({
        forHostKey: pathSegment,
        forKeyInside:
          nextPathSegment !== undefined ? nextPathSegment : defaultForKeyInside,
      }) as KvasSyncResult<KM>
    ).sync();
    (
      curMap.setKey(pathSegment, newMap) as KvasSyncResult<KvasMapSetKeyResult>
    ).sync();
    curMap = newMap;
  });
  return cb(curMap);
  // (
  //   curMap.setKey(
  //     path[path.length - 1],
  //     value,
  //   ) as KvasSyncResult<KvasMapSetKeyResult>
  // ).sync();
  // return {};
}

/**
 * Optional abstract methods
 */
export interface KvasMapOperations<
  KTP extends KvasTypeParameters,
  KM extends KvasMap<KTP>,
  JSO,
> {
  fromJSO?(
    jso: JSO,
    ...rest: any[]
  ): KvasSyncOrPromiseResult<KvasMapOperationsFromJsResult<KTP, KM>>;

  toJSO?(
    kvasMap: KM | KTP['PrimitiveValue'],
  ): KvasSyncOrPromiseResult<KvasMapOperationsToObjectResult<JSO>>;
}

type KvasMapOperationsQueryPathState<
  KTP extends KvasTypeParameters,
  KM extends KvasMap<KTP>,
> = {
  lastFoundPropPath: KvasPathWritable<KTP>;
  lastFoundPropValue: KM | KTP['PrimitiveValue'];
  lastFoundPropType: KvasValueType;
  lastFoundPropMapPath: KvasPathWritable<KTP>;
  lastFoundPropMapValue: KM;
  curPath: KvasPathWritable<KTP>;
};

export abstract class KvasMapOperations<
  KTP extends KvasTypeParameters,
  KM extends KvasMap<KTP>,
  JSO,
> {
  abstract createMap(
    options?: KvasMapOperationsCreateMapOptions<KTP, JSO, KM>,
  ): KvasSyncOrPromiseResult<KM>;

  queryPath(
    map: KM,
    path: KvasPath<KTP>,
  ): KvasSyncOrPromiseResult<KvasMapOperationsQueryResult<KTP, KM>> {
    const returnOnEmptyPath = (): KvasMapOperationsQueryResult<KTP, KM> => {
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
    };
    const initState = (): KvasMapOperationsQueryPathState<KTP, KM> => {
      const state: KvasMapOperationsQueryPathState<KTP, KM> = {
        lastFoundPropPath: [],
        lastFoundPropValue: map,
        lastFoundPropType: KvasValueType.MAP,
        lastFoundPropMapPath: [],
        lastFoundPropMapValue: map,
        curPath: [],
      };
      return state;
    };
    const processKey = (
      i: number,
      type: KvasValueType | undefined,
      value: KTP['PrimitiveValue'] | KM | undefined,
      state: KvasMapOperationsQueryPathState<KTP, KM>,
    ): {
      returnMe: KvasMapOperationsQueryResult<KTP, KM> | null;
    } => {
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
          returnMe: {
            prop,
            lastFoundProp: prop,
            lastFoundMapProp: {
              type: KvasValueType.MAP,
              value: state.lastFoundPropMapValue,
              path: state.lastFoundPropMapPath,
            },
          },
        };
      } else if (isPrimitive && !isLast) {
        return {
          returnMe: {
            prop: undefined,
            lastFoundProp: {
              type: KvasValueType.PRIMITIVE,
              value,
              path: state.curPath,
            },
            lastFoundMapProp: {
              type: KvasValueType.MAP,
              value: state.lastFoundPropMapValue,
              path: state.lastFoundPropMapPath,
            },
          },
        };
      } else if (isMap && isLast) {
        const prop = {
          value: value as KM,
          type: KvasValueType.MAP,
          path,
        };
        return {
          returnMe: {
            prop,
            lastFoundProp: prop,
            lastFoundMapProp: { ...prop, type: KvasValueType.MAP }, // For TypeScript
          },
        };
      } else if (isMap && !isLast) {
        state.lastFoundPropMapValue = value as KM;
        state.lastFoundPropMapPath = state.curPath.slice();
        state.lastFoundPropValue = value as KM;
        state.lastFoundPropType = type;
        state.lastFoundPropPath = state.curPath.slice();
        return {
          returnMe: null,
        };
      } else {
        return {
          returnMe: {
            prop: undefined,
            lastFoundProp: {
              type: state.lastFoundPropType,
              value: state.lastFoundPropValue,
              path: state.lastFoundPropPath,
            },
            lastFoundMapProp: {
              type: KvasValueType.MAP,
              value: state.lastFoundPropMapValue,
              path: state.lastFoundPropMapPath,
            },
          },
        };
      }
    };
    const sync: () => KvasMapOperationsQueryResult<KTP, KM> = () => {
      if (path.length === 0) {
        return returnOnEmptyPath();
      }
      const state = initState();
      for (let i = 0; i < path.length; i++) {
        const pathSegment = path[i] as KTP['Key'];
        state.curPath.push(pathSegment);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const { value, type } = state.lastFoundPropMapValue
          .getKey(pathSegment)
          .sync();
        const { returnMe } = processKey(i, type, value, state);
        if (returnMe !== null) {
          return returnMe;
        }
      }
      throw new KvasError('For TypeScript');
    };
    const promise: () => Promise<
      KvasMapOperationsQueryResult<KTP, KM>
    > = async () => {
      if (path.length === 0) {
        return returnOnEmptyPath();
      }
      const state = initState();
      for (let i = 0; i < path.length; i++) {
        const pathSegment = path[i] as KTP['Key'];
        state.curPath.push(pathSegment);
        const { value, type } = await state.lastFoundPropMapValue
          .getKey(pathSegment)
          .promise();
        const { returnMe } = processKey(i, type, value, state);
        if (returnMe !== null) {
          return returnMe;
        }
      }
      throw new KvasError('For TypeScript');
    };

    return {
      sync,
      promise,
    };
  }

  deleteInPath(
    map: KM,
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
          KvasMapOperationsQueryResult<KTP, KM>
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
  ): KvasProp<KTP, KvasEMap<KM, JSO>> {
    if (prop.type === KvasValueType.MAP) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;
      return {
        ...prop,
        value: Object.assign(
          prop.value as KM,
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
    map: KM,
    path: KvasPath<KTP>,
  ): KvasSyncOrPromiseResult<KvasMapOperationsGetResult<KTP, KM>> {
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
          KvasMapOperationsQueryResult<KTP, KM>
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
    map: KM,
    path: KvasPath<KTP>,
    value: KTP['PrimitiveValue'] | KM,
  ): KvasSyncOrPromiseResult<KvasMapOperationsSetResult> {
    const sync = () => {
      if (path.length === 0) {
        throw new KvasError('Cannot set in []');
      }
      inPathSync(this, map, path, true, undefined, (m: KM) => {
        m.setKey(path[path.length - 1], value)?.sync?.();
      });
      return {};
    };
    return {
      sync,
      // TODO
      promise: () => Promise.resolve(sync()),
    };
  }

  getJSOInPath(
    map: KM,
    path: KvasPath<KTP>,
  ): KvasSyncOrPromiseResult<
    KvasMapOperationsGetJSOInPathResult<KTP, JSO, KM>
  > {
    const sync = () => {
      const { prop } = (
        this.getInPath(map, path) as KvasSyncResult<
          KvasMapOperationsGetResult<KTP, KM>
        >
      ).sync();
      if (!this.toJSO) {
        throw new KvasError('Cannot toJSO');
      }
      if (prop.type === KvasValueType.PRIMITIVE || prop.type === undefined) {
        return {
          prop: prop as KvasMapOperationsGetJSOInPathResult<
            KTP,
            JSO,
            KM
          >['prop'],
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
    map: KM,
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
      // TODO:
      promise: () => Promise.resolve(sync()),
    };
  }

  pushInPath(
    map: KM,
    path: KvasPath<KTP>,
    value: KTP['PrimitiveValue'] | KM,
  ): KvasSyncOrPromiseResult<KvasMapOperationsPushInPathResult<KTP>> {
    const sync = () => {
      return inPathSync(this, map, path, false, 0, (m: KM) => {
        // console.log(m);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const { key } = m.push(value)?.sync?.();
        return { key };
      });
    };
    return {
      sync,
      // TODO:
      promise: () => Promise.resolve(sync()),
    };
  }

  pushJSOInPath(
    map: KM,
    path: KvasPath<KTP>,
    jso: JSO,
  ): KvasSyncOrPromiseResult<KvasMapOperationsPushJSOInPathResult<KTP>> {
    const sync = () => {
      if (!this.fromJSO) {
        throw new KvasError('Cannot fromJSO');
      }
      const kvasMapOrPrimitive = this.fromJSO(jso)?.sync?.()?.value;
      return (
        this.pushInPath(map, path, kvasMapOrPrimitive) as KvasSyncResult<
          KvasMapOperationsPushInPathResult<KTP>
        >
      ).sync();
    };
    return {
      sync,
      // TODO:
      promise: () => Promise.resolve(sync()),
    };
  }
}
