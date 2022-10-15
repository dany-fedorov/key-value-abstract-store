import { KvasInMemoryJsonDataSource } from '@in-memory-json/kvas-in-memory-json-data-source';

const main = () => {
  const ds = KvasInMemoryJsonDataSource.createSyncDataStore({
    fromJSO: [],
  });
  ds.setJSO([0, 1, 2], '123');
  console.log(ds.getJSO([0, 1, 1]));
  // console.log(ds.get([]).prop.value?.toJSO()?.sync?.()?.jso);
};

main();
