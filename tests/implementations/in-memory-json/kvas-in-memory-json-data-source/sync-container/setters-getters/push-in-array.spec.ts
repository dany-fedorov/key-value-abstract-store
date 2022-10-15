import { KvasInMemoryJsonDataSource } from '@in-memory-json/kvas-in-memory-json-data-source';

it('should push to object selecting key automatically', () => {
  const ds = KvasInMemoryJsonDataSource.createSyncDataStore();
  const path = ['b', 'c'];
  const value = 'the-value';
  const { key: key1 } = ds.push(path, value);
  const { key: key2 } = ds.push(path, value + 2);
  const { key: key3 } = ds.push(path, value + 3);
  expect({ key1, key2, key3 }).toMatchSnapshot();
  expect(ds.getJSO(path)).toMatchSnapshot();
  expect(ds).toMatchSnapshot();
});
