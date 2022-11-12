import type { KvasValueType, KvasSyncOrPromiseResult } from './kvas-util-types';
import type { IKvasMapContentAgnosticMixin } from '@interfaces/IKvasMapContentAgnosticMixin';

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

export type IKvasMap<KvasMapKey, KvasPrimitiveJSO> =
  IKvasMapContentAgnosticMixin<KvasMapKey> & {
    getKey(
      key: KvasMapKey,
    ): KvasSyncOrPromiseResult<
      KvasMapGetKeyResult<KvasMapKey, KvasPrimitiveJSO>
    >;

    setKey(
      key: KvasMapKey,
      value: KvasMapKey | KvasPrimitiveJSO,
    ): KvasSyncOrPromiseResult<KvasMapSetKeyResult>;

    push(
      value: KvasMapKey | KvasPrimitiveJSO,
      key: KvasMapKey,
    ): KvasSyncOrPromiseResult<KvasMapPushResult<KvasMapKey>>;
  };
