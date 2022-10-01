export type KvasTypeParameters<K = unknown, PV = unknown> = {
  Key: K;
  PrimitiveValue: PV;
};

export type KvasSyncResult<T> = {
  sync: () => T;
  promise: () => Promise<T>;
};

export type KvasPromiseResult<T> = {
  sync?: never;
  promise: () => Promise<T>;
};

export type KvasSyncAndPromiseResult<T> = KvasSyncResult<T>;

export type KvasSyncOrPromiseResult<T> =
  | KvasPromiseResult<T>
  | KvasSyncResult<T>;

export type KvasPath<KTP extends KvasTypeParameters> = Array<KTP['Key']>;

export enum KvasValueType {
  PRIMITIVE = 'primitive',
  MAP = 'map',
}
