export type JsonObject<P extends JsonPrimitive> = { [x: string]: JsonValue<P> };
export type JsonArray<P extends JsonPrimitive> = Array<JsonValue<P>>;
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue<P extends JsonPrimitive> =
  | P
  | JsonObject<P>
  | JsonArray<P>;
