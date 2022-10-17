import { KvasInMemoryJsonDataSource } from '@in-memory-json/kvas-in-memory-json-data-source';

it('should init defaulting to empty object', () => {
  const ds = KvasInMemoryJsonDataSource.createSyncDataSource();
  const m = ds.get([]);
  expect(m).toMatchInlineSnapshot(`
    Object {
      "prop": Object {
        "path": Array [],
        "type": "map",
        "value": KvasInMemoryJsonMap {
          "host": Object {},
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
