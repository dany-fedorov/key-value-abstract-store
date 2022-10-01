export interface KvasErrorConstructor {
  new (message?: string): KvasErrors;

  readonly prototype: KvasErrors;
}

export class KvasErrors extends Error {
  constructor(...args: ConstructorParameters<ErrorConstructor>) {
    super(...args);
  }
}
