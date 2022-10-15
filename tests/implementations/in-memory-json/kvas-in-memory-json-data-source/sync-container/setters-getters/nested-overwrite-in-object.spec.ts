import { KvasInMemoryJsonDataSource } from '@in-memory-json/kvas-in-memory-json-data-source';

it('should overwrite nested value creating necessary objects', () => {
  const ds = KvasInMemoryJsonDataSource.createSyncDataStore();
  const path = ['field1', 'field2', 'field3'] as const;
  const value1 = 'the-value-1';
  const value2 = 'the-value-2';
  ds.setJSO([path[0], path[1]], value1);
  expect(ds.getJSO([path[0], path[1]])).toMatchInlineSnapshot(`
    Object {
      "prop": Object {
        "path": Array [
          "field1",
          "field2",
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
          "field1",
          "field2",
        ],
        "type": "map",
        "value": Object {
          "field3": "the-value-2",
        },
      },
    }
  `);
  expect(ds.getJSO(path)).toMatchInlineSnapshot(`
    Object {
      "prop": Object {
        "path": Array [
          "field1",
          "field2",
          "field3",
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
          "host": Object {
            "field1": Object {
              "field2": Object {
                "field3": "the-value-2",
              },
            },
          },
          "icfg": Object {
            "getValueType": [Function],
            "options": Object {
              "ignoreIncompatibleHostAndKey": false,
            },
          },
          "mapType": "object",
        },
      },
    }
  `);
});
