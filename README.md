# Project status

The `in-memory-json` implementation should work for main cases.

For example

```typescript
import {KvasInMemoryJsonDataSource} from '@in-memory-json/kvas-in-memory-json-data-source';
import {jsonStringifySafe} from '@in-memory-json/kvas-in-memory-json-utils';

const ds = KvasInMemoryJsonDataSource.createSyncDataSource();
ds.setJSO(['b', 0], 'value-1'); // JSO for JS Object
ds.setJSO(['b', 1, 'c'], 'value-2');
ds.setJSO(['b', 3, 'd', 'e', 1], 'value-2');
console.log(jsonStringifySafe(ds.getJSO([]).prop.value, 2));
/**
 *  {
 *    "b": [
 *      "value-1",
 *      {
 *        "c": "value-2"
 *      },
 *      null,
 *      {
 *        "d": {
 *          "e": [
 *            null,
 *            "value-2"
 *          ]
 *        }
 *      }
 *    ]
 *  }
 */
```

# TODO

- Async
- Async implementation for DynamoDB
- Async implementation for PostgreSQL
- Async implementation for file system 
