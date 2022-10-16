import { KvasInMemoryJsonDataSource } from '@in-memory-json/kvas-in-memory-json-data-source';

it('should set nested value creating necessary objects and arrays', () => {
  const ds = KvasInMemoryJsonDataSource.createSyncDataStore({
    fromJSO: [],
  });
  const path = [0, 'a', 1, 'b'] as const;
  const value = 'the-value';
  ds.setJSO(path, value);
  expect(ds.getJSO(path)).toMatchInlineSnapshot(`
    Object {
      "prop": Object {
        "path": Array [
          0,
          "a",
          1,
          "b",
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
        "value": Object {
          "a": Array [
            ,
            Object {
              "b": "the-value",
            },
          ],
        },
      },
    }
  `);
  expect(ds).toMatchInlineSnapshot(`
    KvasDataSourceSyncContainer {
      "dataSource": KvasInMemoryJsonDataSource {
        "operations": KvasInMemoryJsonMapOperations {},
        "rootMap": KvasInMemoryJsonMap {
          "host": Array [
            Object {
              "a": Array [
                ,
                Object {
                  "b": "the-value",
                },
              ],
            },
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
