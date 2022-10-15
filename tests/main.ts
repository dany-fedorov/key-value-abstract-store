import { KvasInMemoryJsonDataSource } from '@in-memory-json/kvas-in-memory-json-data-source';
import { jsonStringifySafe } from '@in-memory-json/kvas-in-memory-json-utils';

const main = () => {
  const ds = KvasInMemoryJsonDataSource.createSyncDataStore({
    fromJSO: {},
  });
  const v = ds.push([], 123);
  console.log(jsonStringifySafe(ds, 2));
  // console.log(ds.get([]).prop.value?.toJSO()?.sync?.()?.jso);
};

main();
