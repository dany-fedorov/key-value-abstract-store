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

export type KvasMapDeleteKeyResult = {
  found?: boolean;
};

// export type KvasTypeParametersFromKvasMap<
//   KM extends KvasMap<KvasTypeParameters>,
// > = {
//   Key: Parameters<KM['setKey']>[0];
//   PrimitiveValue: Exclude<Parameters<KM['setKey']>[1], KM>;
// };

// export type KvasKeyFromKvasMap<KM extends KvasMap<KvasTypeParameters>> =
//   KvasTypeParametersFromKvasMap<KM>['Key'];
//
// export type KvasPrimitiveValueFromKvasMap<
//   KM extends KvasMap<KvasTypeParameters>,
// > = KvasTypeParametersFromKvasMap<KM>['PrimitiveValue'];

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

  listEntries(): KvasSyncOrPromiseResult<KvasMapEntry<KTP>[]> {
    const sync = () => {
      const keys = this.listKeys().sync?.();
      if (!keys) {
        throw new KvasError('listKeys is not implemented');
      }
      return keys.map((k) => ({
        key: k,
        value: this.getKey(k).sync?.(),
      }));
    };
    return {
      sync,
      // TODO
      promise: () => Promise.resolve(sync()),
    };
  }
}

export type KvasEMapMixin<JSO> = {
  toJsObject?(): KvasSyncOrPromiseResult<KvasMapOperationsToObjectResult<JSO>>;
};

export type KvasEMap<KTP extends KvasTypeParameters, JSO> = KvasMap<KTP> &
  KvasEMapMixin<JSO>;
