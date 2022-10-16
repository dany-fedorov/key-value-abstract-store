import { KvasInMemoryJsonDataSource } from '@in-memory-json/kvas-in-memory-json-data-source';

it('should set nested value creating necessary objects', () => {
  const ds = KvasInMemoryJsonDataSource.createSyncDataStore();
  const path = ['field1', 'field2', 'field3'] as const;
  const value = 'the-value';
  ds.setJSO(path, value);
  expect(ds.getJSO(path)).toMatchInlineSnapshot(`
    Object {
      "prop": Object {
        "path": Array [
          "field1",
          "field2",
          "field3",
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
          "field1",
        ],
        "type": "map",
        "value": Object {
          "field2": Object {
            "field3": "the-value",
          },
        },
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
                "field3": "the-value",
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
