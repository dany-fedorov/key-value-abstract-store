import { KvasInMemoryJsonDataSource } from '@in-memory-json/kvas-in-memory-json-data-source';

it('should push to object selecting key automatically', () => {
  const ds = KvasInMemoryJsonDataSource.createSyncDataSource();
  const path = ['b', 'c'];
  ds.setJSO(path, {});
  const value = 'the-value';
  const { key: key1 } = ds.push(path, value);
  const { key: key2 } = ds.push(path, value + 2);
  const { key: key3 } = ds.push(path, value + 3);
  expect({ key1, key2, key3 }).toMatchInlineSnapshot(`
    Object {
      "key1": "0",
      "key2": "1",
      "key3": "2",
    }
  `);
  expect(ds.getJSO(path)).toMatchInlineSnapshot(`
    Object {
      "prop": Object {
        "path": Array [
          "b",
          "c",
        ],
        "type": "map",
        "value": Object {
          "0": "the-value",
          "1": "the-value2",
          "2": "the-value3",
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
            "b": Object {
              "c": Object {
                "0": "the-value",
                "1": "the-value2",
                "2": "the-value3",
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
