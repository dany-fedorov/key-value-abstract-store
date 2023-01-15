import type { KvasValueType, KvasSyncOrPromiseResult } from './kvas-util-types';
import type { IKvasMapKeyContentAgnosticMixin } from '@interfaces/IKvasMapKeyContentAgnosticMixin';

export type KvasValueResult<KvasPrimitiveJSO, KvasMapJSO> = {
  type: KvasValueType;
  value: KvasMapJSO | KvasPrimitiveJSO;
};

export type KvasMapGetKeyResult<KvasPrimitiveJSO, KvasMapJSO> = {
  result: KvasValueResult<KvasPrimitiveJSO, KvasMapJSO>;
};

export type KvasMapSetKeyResult = {
  wasSet: boolean;
};

export type KvasMapPushResult<KvasMapKey> = {
  key: KvasMapKey;
};

export type IKvasMap<KvasMapKey, KvasPrimitiveJSO, KvasMapJSO> =
  IKvasMapKeyContentAgnosticMixin<KvasMapKey> & {
    getKey(
      key: KvasMapKey,
    ): KvasSyncOrPromiseResult<
      KvasMapGetKeyResult<KvasPrimitiveJSO, KvasMapJSO>
    >;

    setKey(
      key: KvasMapKey,
      value: KvasMapKey | KvasPrimitiveJSO,
    ): KvasSyncOrPromiseResult<KvasMapSetKeyResult>;

    push(
      value: KvasMapKey | KvasPrimitiveJSO,
      key?: KvasMapKey,
    ): KvasSyncOrPromiseResult<KvasMapPushResult<KvasMapKey>>;
  };
