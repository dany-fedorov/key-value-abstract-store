export type JsonObjectUnconstrained<P> = {
  [x: string]: JsonValueUnconstrained<P>;
};
export type JsonArrayUnconstrained<P> = Array<JsonValueUnconstrained<P>>;
export type JsonCompositeUnconstrained<P> =
  | JsonObjectUnconstrained<P>
  | JsonArrayUnconstrained<P>;
export type JsonValueUnconstrained<P> = P | JsonCompositeUnconstrained<P>;

export type JsonObject<P extends JsonPrimitive> = { [x: string]: JsonValue<P> };
export type JsonCompositeKey = string | number;
export type JsonArray<P extends JsonPrimitive> = Array<JsonValue<P>>;
export type JsonPrimitive = string | number | boolean | null;
export type JsonComposite<P extends JsonPrimitive> =
  | JsonObject<P>
  | JsonArray<P>;
export type JsonValue<P extends JsonPrimitive> = P | JsonComposite<P>;
