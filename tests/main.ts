import { KvasInMemoryJsonDataSource } from '@in-memory-json/kvas-in-memory-json-data-source';
import type { KvasEMapSync, KvasEMapSyncMixin } from '@core/kvas-map';
import { KvasInMemoryJsonMap } from '@in-memory-json/kvas-in-memory-json-map';
import type { JsonValue } from '@in-memory-json/kvas-in-memory-json-types';
import { jsonStringifySafe } from '@in-memory-json/kvas-in-memory-json-utils';

const main = () => {
  const ds = KvasInMemoryJsonDataSource.createSyncDataSource();
  ds.setJSO(['b', 0], 'value-1'); // JSO for JS Object
  ds.setJSO(['b', 1, 'c'], 'value-2');
  ds.setJSO(['b', 3, 'd', 'e', 1], 'value-2');
  const v = ds.get(['b']).prop.value;
  if (v instanceof KvasInMemoryJsonMap) {
    console.log(jsonStringifySafe((v as KvasEMapSyncMixin<JsonValue>).toJSO()));
  }
};

main();
