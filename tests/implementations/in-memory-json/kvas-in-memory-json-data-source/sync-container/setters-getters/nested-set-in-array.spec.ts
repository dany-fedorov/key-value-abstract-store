import { KvasInMemoryJsonDataSource } from '@in-memory-json/kvas-in-memory-json-data-source';

it('should set nested value creating necessary arrays', () => {
  const ds = KvasInMemoryJsonDataSource.createSyncDataStore({
    fromJSO: [],
  });
  const path = [0, 1, 2] as const;
  const value = 'the-value';
  ds.setJSO(path, value);
  expect(ds.getJSO(path)).toMatchInlineSnapshot(`
    Object {
      "prop": Object {
        "path": Array [
          0,
          1,
          2,
        ],
        "type": "primitive",
        "value": "the-value",
      },
    }
  `);
  expect(ds.getJSO([path[0]])).toMatchInlineSnapshot(`
    Object {
      "prop": Object {
        "path": Array [
          0,
        ],
        "type": "map",
        "value": Array [
          ,
          Array [
            ,
            ,
            "the-value",
          ],
        ],
      },
    }
  `);
  expect(ds).toMatchInlineSnapshot(`
    KvasDataSourceSyncContainer {
      "dataSource": KvasInMemoryJsonDataSource {
        "operations": KvasInMemoryJsonMapOperations {},
        "rootMap": KvasInMemoryJsonMap {
          "host": Array [
            Array [
              ,
              Array [
                ,
                ,
                "the-value",
              ],
            ],
          ],
          "icfg": Object {
            "getValueType": [Function],
            "options": Object {
              "ignoreIncompatibleHostAndKey": false,
            },
          },
          "mapType": "array",
        },
      },
    }
  `);
});
