import { KvasDataSource } from '@core/kvas-data-source';
import type {
  JsonComposite,
  JsonPrimitive,
} from '@in-memory-json/kvas-in-memory-json-types';
import type { KvasInMemoryJsonTypeParameters } from '@in-memory-json/kvas-in-memory-json-map';
import type { KvasInMemoryJsonMap } from '@in-memory-json/kvas-in-memory-json-map';

export class KvasInMemoryJsonDataSource<
  P extends JsonPrimitive,
> extends KvasDataSource<
  KvasInMemoryJsonTypeParameters<P>,
  JsonComposite<P>,
  KvasInMemoryJsonMap<P>
> {}
