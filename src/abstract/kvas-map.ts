import type {
  KvasPath,
  KvasSyncOrPromiseResult,
  KvasTypeParameters,
  KvasValueType,
} from './kvas-types';

export type KvasProp<KM extends KvasMap<KvasTypeParameters>> = {
  path: KvasPath<KvasTypeParametersFromKvasMap<KM>>;
  type: KvasValueType | undefined;
  value: KvasPrimitiveValueFromKvasMap<KM> | KM | undefined;
};

export type KvasMapGetKeyResult<KM extends KvasMap<KvasTypeParameters>> = Pick<
  KvasProp<KM>,
  'value' | 'type'
>;

export type KvasMapSetKeyResult = {
  [key: string]: never;
};

export type KvasMapDeleteKeyResult = {
  found?: boolean;
};

export type KvasTypeParametersFromKvasMap<
  KM extends KvasMap<KvasTypeParameters>,
> = {
  Key: Parameters<KM['setKey']>[0];
  PrimitiveValue: Parameters<KM['setKey']>[1];
};

export type KvasKeyFromKvasMap<KM extends KvasMap<KvasTypeParameters>> =
  KvasTypeParametersFromKvasMap<KM>['Key'];

export type KvasPrimitiveValueFromKvasMap<
  KM extends KvasMap<KvasTypeParameters>,
> = KvasTypeParametersFromKvasMap<KM>['Key'];

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
