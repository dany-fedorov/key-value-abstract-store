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
} from '../interfaces/kvas-util-types';
import { KvasValueType } from '../interfaces/kvas-util-types';
import { KvasError } from '@core/kvas-errors';

// export type KvasMapOperationsToObjectResult<JSO> = {
//   jso: JSO;
// };
export type KvasMapOperationsToObjectResult<JSO> = JSO;

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
  path: KvasPath<KTP['Key']>,
  sliceLast: boolean,
  defaultForKeyInside: KTP['Key'] | undefined,
  cb: (m: KM) => T,
): T {
  if (path.length === 0) {
    return cb(map);
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const { lastFoundMapProp } = ops.queryPath(map, path).sync();
  if (
    lastFoundMapProp.path.length ===
    (!sliceLast ? path.length : path.length - 1)
  ) {
    return cb(lastFoundMapProp.value);
  }
  const pathToCreateMapsIn = path.slice(
    lastFoundMapProp.path.length,
    !sliceLast ? path.length : path.length - 1,
  );
  let curMap: KM = lastFoundMapProp.value;
  for (let i = 0; i < pathToCreateMapsIn.length; i++) {
    const pathSegment = pathToCreateMapsIn[i];
    const nextPathSegment = path[lastFoundMapProp.path.length + i + 1];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const newMap = ops
      .createMap({
        forHostKey: pathSegment,
        forKeyInside:
          nextPathSegment !== undefined ? nextPathSegment : defaultForKeyInside,
      })
      .sync();
    (
      curMap.setKey(pathSegment, newMap) as KvasSyncResult<KvasMapSetKeyResult>
    ).sync();
    curMap = newMap;
  }
  return cb(curMap);
}

async function inPathAsync<
  KTP extends KvasTypeParameters,
  KM extends KvasMap<KTP>,
  JSO,
  T,
>(
  ops: KvasMapOperations<KTP, KM, JSO>,
  map: KM,
  path: KvasPath<KTP['Key']>,
  sliceLast: boolean,
  defaultForKeyInside: KTP['Key'] | undefined,
  cb: (m: KM) => Promise<T>,
): Promise<T> {
  if (path.length === 0) {
    return cb(map);
  }
  const { lastFoundMapProp } = await ops.queryPath(map, path).promise();
  if (
    lastFoundMapProp.path.length ===
    (!sliceLast ? path.length : path.length - 1)
  ) {
    return cb(lastFoundMapProp.value);
  }
  const pathToCreateMapsIn = path.slice(
    lastFoundMapProp.path.length,
    !sliceLast ? path.length : path.length - 1,
  );
  let curMap: KM = lastFoundMapProp.value;
  for (let i = 0; i < pathToCreateMapsIn.length; i++) {
    const pathSegment = pathToCreateMapsIn[i];
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
  }
  return cb(curMap);
}

type KvasMapOperationsQueryPathState<
  KTP extends KvasTypeParameters,
  KM extends KvasMap<KTP>,
> = {
  lastFoundPropPath: KvasPathWritable<KTP['Key']>;
  lastFoundPropValue: KM | KTP['PrimitiveValue'];
  lastFoundPropType: KvasValueType;
  lastFoundPropMapPath: KvasPathWritable<KTP['Key']>;
  lastFoundPropMapValue: KM;
  curPath: KvasPathWritable<KTP['Key']>;
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
    path: KvasPath<KTP['Key']>,
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
        // @ts-expect-error
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
    path: KvasPath<KTP['Key']>,
  ): KvasSyncOrPromiseResult<KvasMapOperationsDeleteResult> {
    const sync = () => {
      if (path.length === 0) {
        return {
          found: false,
        };
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const { prop, lastFoundMapProp } = this.queryPath(map, path).sync();
      if (prop === undefined) {
        return {
          found: false,
        };
      }
      if (lastFoundMapProp.path.length === prop.path.length) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const { prop } = this.queryPath(
          map,
          path.slice(0, path.length - 1),
        ).sync();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return prop.value.deleteKey(path[path.length - 1] as KTP['Key']).sync();
      } else if (lastFoundMapProp.path.length === prop.path.length - 1) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return lastFoundMapProp.value
          .deleteKey(path[path.length - 1] as KTP['Key'])
          .sync();
      } else {
        throw new Error('deleteInPath::Should never happen');
      }
    };
    const promise = async () => {
      if (path.length === 0) {
        return {
          found: false,
        };
      }
      const { prop, lastFoundMapProp } = await this.queryPath(
        map,
        path,
      ).promise();
      if (prop === undefined) {
        return {
          found: false,
        };
      }
      return await lastFoundMapProp.value
        .deleteKey(path[path.length - 1] as KTP['Key'])
        .promise();
    };
    return {
      sync,
      promise,
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
        value: new Proxy(prop.value as KM, {
          get(target: KM, p: string): any {
            if (p === 'toJSO' && self.toJSO) {
              return self.toJSO.bind(self, target);
            } else {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
              return target[p];
            }
          },
        }),
        /*Object.assign(
          prop.value as KM,
          !self.toJSO
            ? {}
            : {
                toJSO(): KvasSyncOrPromiseResult<
                  KvasMapOperationsToObjectResult<JSO>
                > {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error
                  return self.toJSO(this);
                },
              },
        )*/
      };
    } else {
      return prop;
    }
  }

  getInPath(
    map: KM,
    path: KvasPath<KTP['Key']>,
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const { prop } = this.queryPath(map, path).sync();
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
    const promise = async () => {
      if (path.length === 0) {
        return {
          prop: this.mapInPropToEMap({
            value: map,
            path,
            type: KvasValueType.MAP,
          }),
        };
      }
      const { prop } = await this.queryPath(map, path).promise();
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
      promise,
    };
  }

  setInPath(
    map: KM,
    path: KvasPath<KTP['Key']>,
    value: KTP['PrimitiveValue'] | KM,
  ): KvasSyncOrPromiseResult<KvasMapOperationsSetResult> {
    const sync = () => {
      if (path.length === 0) {
        throw new KvasError('Cannot set in []');
      }
      inPathSync(this, map, path, true, undefined, (m: KM) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return m.setKey(path[path.length - 1], value).sync();
      });
      return {};
    };
    const promise = async () => {
      if (path.length === 0) {
        throw new KvasError('Cannot set in []');
      }
      await inPathAsync(this, map, path, true, undefined, (m: KM) => {
        return m.setKey(path[path.length - 1], value).promise();
      });
      return {};
    };
    return {
      sync,
      promise,
    };
  }

  getJSOInPath(
    map: KM,
    path: KvasPath<KTP['Key']>,
  ): KvasSyncOrPromiseResult<
    KvasMapOperationsGetJSOInPathResult<KTP, JSO, KM>
  > {
    const sync = () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const { prop } = this.getInPath(map, path).sync();
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const newVal = this.toJSO(prop.value).sync();
      return {
        prop: {
          ...prop,
          value: newVal,
        },
      };
    };
    const promise = async () => {
      const { prop } = await this.getInPath(map, path).promise();
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
      const newVal = await this.toJSO(prop.value).promise();
      return {
        prop: {
          ...prop,
          value: newVal,
        },
      };
    };
    return {
      sync,
      promise,
    };
  }

  setJSOInPath(
    map: KM,
    path: KvasPath<KTP['Key']>,
    jso: JSO,
  ): KvasSyncOrPromiseResult<KvasMapOperationsSetJSOInPathResult> {
    const sync = () => {
      if (!this.fromJSO) {
        throw new KvasError('Cannot fromJSO');
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const kvasMapOrPrimitive = this.fromJSO(jso).sync().value;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      return this.setInPath(map, path, kvasMapOrPrimitive).sync();
    };
    const promise = async () => {
      if (!this.fromJSO) {
        throw new KvasError('Cannot fromJSO');
      }
      const kvasMapOrPrimitive = (await this.fromJSO(jso).promise()).value;
      return await this.setInPath(map, path, kvasMapOrPrimitive).promise();
    };
    return {
      sync,
      promise,
    };
  }

  pushInPath(
    map: KM,
    path: KvasPath<KTP['Key']>,
    value: KTP['PrimitiveValue'] | KM,
  ): KvasSyncOrPromiseResult<KvasMapOperationsPushInPathResult<KTP>> {
    const sync = () => {
      return inPathSync(this, map, path, false, 0, (m: KM) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const { key } = m.push(value).sync();
        return { key };
      });
    };
    const promise = () => {
      return inPathAsync(this, map, path, false, 0, async (m: KM) => {
        const { key } = await m.push(value).promise();
        return { key };
      });
    };
    return {
      sync,
      promise,
    };
  }

  pushJSOInPath(
    map: KM,
    path: KvasPath<KTP['Key']>,
    jso: JSO,
  ): KvasSyncOrPromiseResult<KvasMapOperationsPushJSOInPathResult<KTP>> {
    const sync = () => {
      if (!this.fromJSO) {
        throw new KvasError('Cannot fromJSO');
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const kvasMapOrPrimitive = this.fromJSO(jso).sync().value;
      return (
        this.pushInPath(map, path, kvasMapOrPrimitive) as KvasSyncResult<
          KvasMapOperationsPushInPathResult<KTP>
        >
      ).sync();
    };
    const promise = async () => {
      if (!this.fromJSO) {
        throw new KvasError('Cannot fromJSO');
      }
      const kvasMapOrPrimitive = (await this.fromJSO(jso).promise()).value;
      return await this.pushInPath(map, path, kvasMapOrPrimitive).promise();
    };
    return {
      sync,
      promise,
    };
  }

  abstract fromJSO(
    jso: JSO,
    ...rest: any[]
  ): KvasSyncOrPromiseResult<KvasMapOperationsFromJsResult<KTP, KM>>;

  abstract toJSO(
    kvasMap: KM | KTP['PrimitiveValue'],
  ): KvasSyncOrPromiseResult<KvasMapOperationsToObjectResult<JSO>>;
}
