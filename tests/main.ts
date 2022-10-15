import { KvasInMemoryJsonDataSource } from '@in-memory-json/kvas-in-memory-json-data-source';
import { jsonStringifySafe } from '@in-memory-json/kvas-in-memory-json-utils';

const main = () => {
  const ds = KvasInMemoryJsonDataSource.createSyncDataStore({
    fromJSO: [],
  });
  const path1 = [0, 'a'] as const;
  const path2 = [0, 'a', 1, 'b'] as const;
  // ds.setJSO(path1, 'v123');
  // console.log(jsonStringifySafe(ds, 2));
  ds.setJSO(path2, 'v123');
  console.log(ds.getJSO([path2[0]]));
  console.log(jsonStringifySafe(ds, 2));
  // console.log(ds.getJSO([0, 1, 1]));
  // console.log(ds.get([]).prop.value?.toJSO()?.sync?.()?.jso);
};

main();
