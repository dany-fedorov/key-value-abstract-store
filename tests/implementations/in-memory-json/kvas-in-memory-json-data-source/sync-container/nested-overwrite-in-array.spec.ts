import { KvasInMemoryJsonDataSource } from '@in-memory-json/kvas-in-memory-json-data-source';

it('should overwrite nested value creating necessary arrays', () => {
  const ds = KvasInMemoryJsonDataSource.createSyncDataSource({
    fromJSO: [],
  });
  const path = [0, 1, 2] as const;
  const value1 = 'the-value-1';
  const value2 = 'the-value-2';
  ds.setJSO([path[0], path[1]], value1);
  expect(ds.getJSO([path[0], path[1]])).toMatchInlineSnapshot(`
    Object {
      "prop": Object {
        "path": Array [
          0,
          1,
        ],
        "type": "primitive",
        "value": "the-value-1",
      },
    }
  `);
  ds.setJSO([path[0], path[1], path[2]], value2);
  expect(ds.getJSO([path[0], path[1]])).toMatchInlineSnapshot(`
    Object {
      "prop": Object {
        "path": Array [
          0,
          1,
        ],
        "type": "map",
        "value": Array [
          ,
          ,
          "the-value-2",
        ],
      },
    }
  `);
  expect(ds.getJSO(path)).toMatchInlineSnapshot(`
    Object {
      "prop": Object {
        "path": Array [
          0,
          1,
          2,
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
            Array [
              ,
              Array [
                ,
                ,
                "the-value-2",
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
