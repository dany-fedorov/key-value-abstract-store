import { KvasInMemoryJsonDataSource } from '@in-memory-json/kvas-in-memory-json-data-source';

it('should init defaulting to empty object', () => {
  const ds = KvasInMemoryJsonDataSource.createSyncDataStore();
  const m = ds.get([]);
  expect(m).toMatchSnapshot();
});
