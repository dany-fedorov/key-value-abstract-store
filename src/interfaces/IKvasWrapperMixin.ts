import type { KvasSyncOrPromiseResult } from '@interfaces/kvas-util-types';

export type IKvasWrapperMixin<T> = {
  unpack(): KvasSyncOrPromiseResult<T>;
};
