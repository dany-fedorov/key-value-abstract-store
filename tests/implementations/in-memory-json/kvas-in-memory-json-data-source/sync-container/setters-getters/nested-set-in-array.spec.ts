import { KvasInMemoryJsonDataSource } from '@in-memory-json/kvas-in-memory-json-data-source';

it('should set nested value creating necessary arrays', () => {
  const ds = KvasInMemoryJsonDataSource.createSyncDataStore({
    fromJSO: [],
  });
  const path = [0, 1, 2] as const;
  const value = 'the-value';
  ds.setJSO(path, value);
  expect(ds.getJSO(path)).toMatchSnapshot();
  expect(ds.getJSO([path[0]])).toMatchSnapshot();
  expect(ds).toMatchSnapshot();
});
