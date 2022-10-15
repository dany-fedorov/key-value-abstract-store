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

it('should overwrite nested value creating necessary objects', () => {
  const ds = KvasInMemoryJsonDataSource.createSyncDataStore();
  const path = ['field1', 'field2', 'field3'] as const;
  const value1 = 'the-value-1';
  const value2 = 'the-value-2';
  ds.setJSO([path[0], path[1]], value1);
  expect(ds.getJSO([path[0], path[1]])).toMatchSnapshot();
  ds.setJSO([path[0], path[1], path[2]], value2);
  expect(ds.getJSO([path[0], path[1]])).toMatchSnapshot();
  expect(ds.getJSO(path)).toMatchSnapshot();
  expect(ds).toMatchSnapshot();
});
