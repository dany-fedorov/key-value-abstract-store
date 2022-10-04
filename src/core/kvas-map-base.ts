import type {
  KvasPath,
  KvasSyncOrPromiseResult,
  KvasTypeParameters,
  KvasValueType,
} from './kvas-types';

export type KvasProp<KM extends KvasMapBase<KvasTypeParameters>> = {
  path: KvasPath<KvasTypeParametersFromKvasMap<KM>>;
  type: KvasValueType | undefined;
  value: KvasPrimitiveValueFromKvasMap<KM> | KM | undefined;
};

export type KvasMapGetKeyResult<KM extends KvasMapBase<KvasTypeParameters>> =
  Pick<KvasProp<KM>, 'value' | 'type'>;

export type KvasMapSetKeyResult = {
  [key: string]: never;
};

export type KvasMapDeleteKeyResult = {
  found?: boolean;
};

export type KvasTypeParametersFromKvasMap<
  KM extends KvasMapBase<KvasTypeParameters>,
> = {
  Key: Parameters<KM['setKey']>[0];
  PrimitiveValue: Parameters<KM['setKey']>[1];
};

export type KvasKeyFromKvasMap<KM extends KvasMapBase<KvasTypeParameters>> =
  KvasTypeParametersFromKvasMap<KM>['Key'];

export type KvasPrimitiveValueFromKvasMap<
  KM extends KvasMapBase<KvasTypeParameters>,
> = KvasTypeParametersFromKvasMap<KM>['Key'];

export abstract class KvasMapBase<KTP extends KvasTypeParameters> {
  abstract getKey(
    key: KTP['Key'],
  ): KvasSyncOrPromiseResult<KvasMapGetKeyResult<this>>;

  abstract setKey(
    key: KTP['Key'],
    value: KTP['PrimitiveValue'] | KvasMapBase<KTP>,
  ): KvasSyncOrPromiseResult<KvasMapSetKeyResult>;

  abstract deleteKey(
    key: KTP['Key'],
  ): KvasSyncOrPromiseResult<KvasMapDeleteKeyResult>;
}
