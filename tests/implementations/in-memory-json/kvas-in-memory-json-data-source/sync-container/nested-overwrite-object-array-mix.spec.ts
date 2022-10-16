import { KvasInMemoryJsonDataSource } from '@in-memory-json/kvas-in-memory-json-data-source';

it('should overwrite nested value creating necessary objects and arrays', () => {
  const ds = KvasInMemoryJsonDataSource.createSyncDataStore({
    fromJSO: [],
  });
  const path = [0, 'a', 1, 'b'] as const;
  const value1 = 'the-value-1';
  const value2 = 'the-value-2';
  ds.setJSO([path[0], path[1]], value1);
  expect(ds.getJSO([path[0], path[1]])).toMatchInlineSnapshot(`
    Object {
      "prop": Object {
        "path": Array [
          0,
          "a",
        ],
        "type": "primitive",
        "value": "the-value-1",
      },
    }
  `);
  ds.setJSO(path, value2);
  expect(ds.getJSO([path[0], path[1]])).toMatchInlineSnapshot(`
    Object {
      "prop": Object {
        "path": Array [
          0,
          "a",
        ],
        "type": "map",
        "value": Array [
          ,
          Object {
            "b": "the-value-2",
          },
        ],
      },
    }
  `);
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
        "value": "the-value-2",
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
                  "b": "the-value-2",
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
