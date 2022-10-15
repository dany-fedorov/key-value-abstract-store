import { KvasInMemoryJsonDataSource } from '@in-memory-json/kvas-in-memory-json-data-source';

it('should set nested value creating necessary objects', () => {
  const ds = KvasInMemoryJsonDataSource.createSyncDataStore();
  const path = ['field1', 'field2', 'field3'] as const;
  const value = 'the-value';
  ds.setJSO(path, value);
  expect(ds.getJSO(path)).toMatchSnapshot();
  expect(ds.getJSO([path[0]])).toMatchSnapshot();
  expect(ds).toMatchSnapshot();
});
