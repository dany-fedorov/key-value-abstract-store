import type { KvasSyncOrPromiseResult } from '@interfaces/kvas-util-types';

/**
 * TODO: CONTINUE:
 * - Work on API for wrapped version (methods with w_ prefix), continue here
 * - Later you can work on unwrapped APIs
 */
export type IKvasMapOperations<KvasMapKey, KvasPrimitiveJSO, KvasMapJSO> = {
  createMap(): KvasSyncOrPromiseResult<>;
};
