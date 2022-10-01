export interface KvasErrorConstructor {
  new (message?: string): KvasError;

  readonly prototype: KvasError;
}

export class KvasError extends Error {
  constructor(...args: ConstructorParameters<ErrorConstructor>) {
    super(...args);
  }
}
