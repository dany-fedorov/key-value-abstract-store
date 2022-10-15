import { KvasInMemoryJsonDataSource } from '@in-memory-json/kvas-in-memory-json-data-source';

it('should overwrite nested value creating necessary arrays', () => {
  const ds = KvasInMemoryJsonDataSource.createSyncDataStore({
    fromJSO: [],
  });
  const path = [0, 1, 2] as const;
  const value1 = 'the-value-1';
  const value2 = 'the-value-2';
  ds.setJSO([path[0], path[1]], value1);
  expect(ds.getJSO([path[0], path[1]])).toMatchSnapshot();
  ds.setJSO([path[0], path[1], path[2]], value2);
  expect(ds.getJSO([path[0], path[1]])).toMatchSnapshot();
  expect(ds.getJSO(path)).toMatchSnapshot();
  expect(ds).toMatchSnapshot();
});
