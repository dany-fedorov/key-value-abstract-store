import type {
  IKvasMap,
  KvasMapGetKeyResult,
  KvasMapPushResult,
  KvasMapSetKeyResult,
} from '@interfaces/IKvasMap';
import type {
  IWKvasMap,
  WKvasMapGetKeyResult,
  WKvasMapPushResult,
  WKvasMapSetKeyResult,
  WKvasValue,
} from '@interfaces/IWKvasMap';
import type { KvasSyncOrPromiseResult } from '@interfaces/kvas-util-types';
import type {
  KvasMapDeleteKeyResult,
  KvasMapListKeysResult,
} from '@interfaces/IKvasMapContentAgnosticMixin';

export abstract class WKvasMap<KvasMapKey, KvasPrimitiveJSO, KvasMapJSO>
  implements IWKvasMap<KvasMapKey, KvasPrimitiveJSO, KvasMapJSO>
{
  abstract w_getKey(
    key: KvasMapKey,
  ): KvasSyncOrPromiseResult<
    WKvasMapGetKeyResult<KvasMapKey, KvasPrimitiveJSO, KvasMapJSO>
  >;

  abstract w_setKey(
    key: KvasMapKey,
    value: WKvasValue<KvasMapKey, KvasPrimitiveJSO, KvasMapJSO>,
  ): KvasSyncOrPromiseResult<WKvasMapSetKeyResult>;

  abstract w_push(
    value: WKvasValue<KvasMapKey, KvasPrimitiveJSO, KvasMapJSO>,
    key: KvasMapKey,
  ): KvasSyncOrPromiseResult<WKvasMapPushResult<KvasMapKey>>;

  abstract deleteKey(
    key: KvasMapKey,
  ): KvasSyncOrPromiseResult<KvasMapDeleteKeyResult>;

  abstract listKeys(): KvasSyncOrPromiseResult<
    KvasMapListKeysResult<KvasMapKey>
  >;

  abstract unpack(): KvasSyncOrPromiseResult<KvasMapJSO>;
}
