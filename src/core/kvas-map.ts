import type {
  KvasPath,
  KvasSyncOrPromiseResult,
  KvasTypeParameters,
  KvasValueType,
} from '@core/kvas-types';
import { KvasError } from '@core/kvas-errors';
import type { KvasMapOperationsToObjectResult } from '@core/kvas-map-operations';

export type KvasProp<KTP extends KvasTypeParameters, KM = KvasMap<KTP>> = {
  path: KvasPath<KTP>;
  type: KvasValueType | undefined;
  value: KTP['PrimitiveValue'] | KM | undefined;
};

export type KvasMapGetKeyResult<
  KTP extends KvasTypeParameters,
  KM = KvasMap<KTP>,
> = {
  type: KvasValueType | undefined;
  value: KTP['PrimitiveValue'] | KM | undefined;
};

export type KvasMapSetKeyResult = {
  [key: string]: never;
};

export type KvasMapPushResult<KTP extends KvasTypeParameters> = {
  key: KTP['Key'];
};

export type KvasMapDeleteKeyResult = {
  found?: boolean;
};

export type KvasMapEntry<KTP extends KvasTypeParameters> = {
  key: KTP['Key'];
  value: KTP['PrimitiveValue'] | KvasMap<KTP>;
};

export abstract class KvasMap<KTP extends KvasTypeParameters> {
  abstract getKey(
    key: KTP['Key'],
  ): KvasSyncOrPromiseResult<KvasMapGetKeyResult<KTP>>;

  abstract setKey(
    key: KTP['Key'],
    value: KTP['PrimitiveValue'] | KvasMap<KTP>,
  ): KvasSyncOrPromiseResult<KvasMapSetKeyResult>;

  abstract deleteKey(
    key: KTP['Key'],
  ): KvasSyncOrPromiseResult<KvasMapDeleteKeyResult>;

  abstract listKeys(): KvasSyncOrPromiseResult<KTP['Key'][]>;

  abstract push(
    value: KTP['PrimitiveValue'] | KvasMap<KTP>,
    key?: KTP['Key'],
  ): KvasSyncOrPromiseResult<KvasMapPushResult<KTP>>;

  listEntries(): KvasSyncOrPromiseResult<KvasMapEntry<KTP>[]> {
    const returnFromKeys = (keys: KTP['Key'][]) => {
      if (!keys) {
        throw new KvasError('listKeys is not implemented');
      }
      return keys.map((k) => ({
        key: k,
        value: this.getKey(k).sync?.(),
      }));
    };
    const sync = () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const keys = this.listKeys().sync();
      return returnFromKeys(keys);
    };
    const promise = async () => {
      const keys = await this.listKeys().promise();
      return returnFromKeys(keys);
    };
    return {
      sync,
      promise,
    };
  }
}

export type KvasEMapMixin<JSO> = {
  toJSO?(): KvasSyncOrPromiseResult<KvasMapOperationsToObjectResult<JSO>>;
};

export type KvasEMap<KM extends KvasMap<any>, JSO> = KM & KvasEMapMixin<JSO>;
