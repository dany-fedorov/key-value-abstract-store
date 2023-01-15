import type { KvasSyncOrPromiseResult } from '@interfaces/kvas-util-types';
import type {
  KvasMapPushResult,
  KvasMapSetKeyResult,
} from '@interfaces/IKvasMap';
import type { KvasValueType } from '@interfaces/kvas-util-types';
import type { IWKvasPrimitive } from '@interfaces/IWKvasPrimitive';
import type { IKvasWrapperMixin } from '@interfaces/IKvasWrapperMixin';
import type { IKvasMapKeyContentAgnosticMixin } from '@interfaces/IKvasMapKeyContentAgnosticMixin';

export type WKvasValueResult<KvasMapKey, KvasPrimitiveJSO, KvasMapJSO> = {
  type: KvasValueType;
  value:
    | IWKvasMap<KvasMapKey, KvasPrimitiveJSO, KvasMapJSO>
    | IWKvasPrimitive<KvasPrimitiveJSO>;
};

export type WKvasMapGetKeyResult<KvasMapKey, KvasPrimitiveJSO, KvasMapJSO> = {
  result: WKvasValueResult<KvasMapKey, KvasPrimitiveJSO, KvasMapJSO>;
};

export type WKvasMapSetKeyResult = KvasMapSetKeyResult;

export type WKvasMapPushResult<KvasMapKey> = KvasMapPushResult<KvasMapKey>;

export type WKvasValue<KvasMapKey, KvasPrimitiveJSO, KvasMapJSO> =
  | IWKvasMap<KvasMapKey, KvasPrimitiveJSO, KvasMapJSO>
  | IWKvasPrimitive<KvasPrimitiveJSO>;

export type IWKvasMap<KvasMapKey, KvasPrimitiveJSO, KvasMapJSO> =
  IKvasWrapperMixin<KvasMapJSO> &
    IKvasMapKeyContentAgnosticMixin<KvasMapKey> & {
      w_getKey(
        key: KvasMapKey,
      ): KvasSyncOrPromiseResult<
        WKvasMapGetKeyResult<KvasMapKey, KvasPrimitiveJSO, KvasMapJSO>
      >;

      w_setKey(
        key: KvasMapKey,
        value: WKvasValue<KvasMapKey, KvasPrimitiveJSO, KvasMapJSO>,
      ): KvasSyncOrPromiseResult<WKvasMapSetKeyResult>;

      w_push(
        value: WKvasValue<KvasMapKey, KvasPrimitiveJSO, KvasMapJSO>,
        key?: KvasMapKey,
      ): KvasSyncOrPromiseResult<WKvasMapPushResult<KvasMapKey>>;
    };
