import type { KvasSyncOrPromiseResult } from '@interfaces/kvas-util-types';

export type KvasMapListKeysResult<KvasMapKey> = {
  keys: KvasMapKey[];
};

export type KvasMapDeleteKeyResult = {
  wasDeleted: boolean;
};

export type IKvasMapContentAgnosticMixin<KvasMapKey> = {
  deleteKey(key: KvasMapKey): KvasSyncOrPromiseResult<KvasMapDeleteKeyResult>;

  listKeys(): KvasSyncOrPromiseResult<KvasMapListKeysResult<KvasMapKey>>;
};
